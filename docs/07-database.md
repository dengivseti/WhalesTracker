# WhalesTracker — Структура данных: MongoDB и Redis

> Полная схема хранилищ текущей реализации. База: ветка `docs/system-documentation`, коммит-базис `3df483e`. Поля моделей детально — в [03-domain-tracker.md](03-domain-tracker.md); здесь — консолидированная структура БД, все индексы и их назначение, плюс структура Redis и дисковых файлов.

## 1. MongoDB

Подключение: `mongoose.connect(process.env.mongoUri)` (app.js:16-20); в compose — `mongodb://mongo:27017/tracker` (docker-compose.yml:22), т.е. **одна БД `tracker`**. Образ `mongo:latest`, том `mongo-data` (docker-compose.yml:31-38).

### 1.1 Коллекции

| Коллекция | Модель | Назначение | Примерный рост |
|---|---|---|---|
| `groups` | Group | Кампания: slug, тип редиректа фолбэка, флаги уникальности/логирования, массив ссылок на стримы | статичный справочник |
| `streams` | Stream | Поток: порядок, тип редиректа, `code`, relation (AND/OR), `isBot`, фильтры | статичный справочник |
| `offers` | Offer | Оффер: набор URL с весами и схемой ротации (split/evely/rotator) | статичный справочник |
| `remotes` | Remote | Кэш remote-редиректов «ключевое слово → URL» с TTL | растёт с числом уникальных query |
| `settings` | Setting | Key-value настройки (enum из 14 ключей) | 14 записей |
| `users` | User | Единственный пользователь (username+bcrypt-хеш) | 1 запись |
| `statistics` | Statistic | Лог кликов; конверсии дописываются постбеком в `amount` | **основной рост** — 1 запись на логируемый клик |
| `sessions` | (connect-mongodb-session) | Cookie-сессии админки (app.js:46-49) | по числу активных сессий |

### 1.2 Поля коллекций (сводно)

Детальные таблицы полей — [03-domain-tracker.md §1](03-domain-tracker.md). Кратко:

- **groups**: `label`, `name` (slug в URL трекера), `typeRedirect` (default `httpRedirect`), `code`, `checkUnic` (bool), `timeUnic` (часы, default 24), `useLog`, `isActive`, `date`, `streams[]` (ObjectId → streams).
- **streams**: `position`, `name`, `clicksHit`/`clicksUnic`/`clicksBot` (счётчики, не инкрементируются), `typeRedirect`, `code`, `useLog`, `isActive`, `date`, `relation` (true=AND), `isBot`, `filters[]` — **бессхемный** массив `{name, action, position}` (models/Stream.js:20).
- **offers**: `date`, `name`, `type` (split|evely|rotator), `offers[]` — вложенные `{url, percent}`.
- **remotes**: `query`, `url`, `date`, `expireAt`.
- **settings**: `key` (enum, maxlength 50), `value` (String, maxlength 100) — все значения хранятся строками.
- **users**: `username`, `password` (bcrypt, cost 12 — хеширование в auth.route.js:29, не в схеме).
- **statistics**: `date`, `expireAt`, `group` (ref), `stream` (ref, отсутствует в записях фолбэка группы), `out`, `keyword`, `redirect`, `device`, `country`, `city`, `language`, `unique`, `isBot`, `ip`, `referer`, `useragent`, `amount` (default 0), `subid`.

### 1.3 Индексы (полный перечень из схем)

| Коллекция | Индекс | Определение | Назначение |
|---|---|---|---|
| `groups` | **unique** на `name` | `name: {unique: true}` (models/Group.js:5) | slug группы в URL трекера уникален; lookup в `GET /:id` — `Group.findOne({name})` (tracker.route.js:35) |
| `offers` | `date: 1` | `schema.index({date: 1})` (models/Offer.js:14) | сортировка/очистка по дате |
| `remotes` | **unique** на `query` | `query: {unique: true}` (models/Remote.js:4) | точечный lookup ключевого слова в remote-редиректе (url.utils.js:34) |
| `remotes` | **TTL** `expireAt: 1, expireAfterSeconds: 0` | models/Remote.js:12 | автоудаление привязок query→URL; `expireAt` = now + `clearRemote` дней (default 30) |
| `settings` | **unique** на `key` | models/Setting.js:24 | ключ-значение |
| `statistics` | **TTL** `expireAt: 1, expireAfterSeconds: 0` | models/Statistic.js:26 | автоочистка лога кликов; `expireAt` = now + `clearDayStatistic` дней (default 30, tracker.route.js:90-94) |
| `statistics` | `date: 1` | models/Statistic.js:27 | запросы статистики по периоду (`Statistic.find({date: {$gte...}})`, info.route.js:99-105, 242-245) и проверка уникальности по IP+времени (tracker.route.js:46-55) |
| `users` | **unique** на `username` | models/User.js:4 | логин |

**Индексов, которых нет, но запросы требуют** (риск для рерайта):
- `statistics.subid` — постбек делает `Statistic.where({subid}).updateOne(...)` (postback.route.js:19-21) **без индекса** — полный скан при каждой конверсии;
- `statistics.ip` (+date) — проверка уникальности `find({ip, date: {$gte...}})` без индекса;
- `statistics.group`/`stream` — populate в агрегациях дашборда/статистики;
- `sessions` — store создаёт коллекцию без явных индексов (используется `_id` = sid).

### 1.4 TTL-очистка vs настройка «Clear statistics days»

Двойной механизм (models/Setting.js, settings.route.js:71-80, tracker.route.js:90-94): записи получают `expireAt` при создании; кроме того, уменьшение `clearDayStatistic` в настройках запускает разовый `Statistic.deleteMany({date: {$lt: now - N дней}})`. Увеличение настройки **не продлевает** `expireAt` уже созданных записей.

## 2. Redis

Клиент ioredis, хост захардкожен `'redis'` (utils/redis.js:3); конфиг контейнера: LFU, maxmemory 124 МБ, персистентность RDB (docker-compose.yml:45-51). TTL (EXPIRE) **не используется нигде**.

| Ключ | Тип | Содержимое | Пишется | Читается |
|---|---|---|---|---|
| `postbackKey`, `clearDayStatistic`, `theme`, `language`, `trash`, `trashUrl`, `logLimitClick`, `logLimitAmount`, `getKey`, `protect`, `sendTelegram`, `telegramBotToken`, `telegramChatId`, `clearRemote` | string | Кэш настроек из Mongo `settings`; чтение Redis → Mongo → default (settings.utils.js:45-57) | старт (`getStartValueSettings`, в каждом cluster-воркере), `setSetting` | трекер, постбек, статистика, настройки |
| `blackIps` | list | Чёрные IP/CIDR; источник — файл `dist/ips.dat` (arrayRedis.utils.js:18-25) | старт, `/api/settings/edit/list` | фильтр `useListBlackIps` (filters.js:123-126) |
| `blackSignatures` | list | Сигнатуры ботов; файл `dist/signature.dat` | аналогично | фильтр `useListBotSignatures` (filters.js:110-121) |
| `listUrl` | list | Пул URL для remote-редиректов; файл `dist/remote.dat` | аналогично | `getUrlRemote` (url.utils.js:30-56) |

Механика списков: запись — MULTI `del`+`rpush` (arrayRedis.utils.js:6-16); чтение — `lrange` с fallback на перечитывание файла и восстановлением Redis (arrayRedis.utils.js:53-77); счётчик — `llen`. Модификация через API синхронно пишет и в Redis, и в `.dat`-файл (settings.route.js:110-122) — т.е. файл является durable-копией, Redis — рабочей.

Сессии в Redis **не хранятся** (только MongoDB).

## 3. Дисковые файлы данных

`dist/ips.dat`, `dist/signature.dat`, `dist/remote.dat` — строки, разделённые `\r\n` (readFiles.utils.js:3-13, writeFiles.utils.js:3-14); в git не входят (.gitignore:3-7).

## 4. Бэкенд — карта документации

Вся backend-часть покрыта тремя документами:

| Аспект | Документ |
|---|---|
| Точка входа, middleware-цепочка, cluster, сессии, auth-механика, env, Docker/nginx | [01-architecture.md](01-architecture.md) |
| Все 25 HTTP-эндпоинтов с валидацией и ответами | [02-api.md](02-api.md) |
| Модели (детальные таблицы полей), алгоритм трекера, фильтры, редиректы, постбеки, статистика | [03-domain-tracker.md](03-domain-tracker.md) |
