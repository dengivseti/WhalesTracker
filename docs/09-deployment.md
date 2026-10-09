# WhalesTracker — Развёртывание с нуля (деплой-гайд)

> Документ описывает текущее поведение системы развертывания «как есть»: поведение — контракт, стек — рекомендация. Описание фактического состояния и блок «Миграционный совет: современные версии» строго разделены. Все утверждения снабжены источниками `файл:строка` (ветка `docs/rebuild-kit`). Дубли подробностей архитектуры и БД вынесены ссылками в [01-architecture.md](01-architecture.md) и [07-database.md](07-database.md).

---

## 1. Переменные окружения (полный перечень)

Это **все** переменные окружения системы: 3 читаются серверным кодом, 2 — клиентским, ещё 2 задаются только в docker-compose и кодом не читаются. Результат сверки с `grep process\.env\.` по коду приведён в §9 (верификация).

| Переменная | Дефолт в коде | Где читается | Назначение | Где задаётся в compose |
|---|---|---|---|---|
| `port` | `5000` (`app.js:11`) | `app.js:11` | Порт HTTP-сервера Express | `docker-compose.yml:21`, `docker-compose.development.yml:19` — `port=5000` |
| `mongoUri` | нет дефолта; без неё подключение падает и процесс завершается `process.exit(1)` (`app.js:26-30`) | `app.js:16` (mongoose.connect), `app.js:48` (MongoStore для сессий) | Строка подключения к MongoDB | `docker-compose.yml:22`, `docker-compose.development.yml:20` — `mongodb://mongo:27017/tracker` |
| `sessionSecret` | нет дефолта | `app.js:66` (secret для express-session) | Секрет подписи cookie-сессий админки | `docker-compose.yml:24`, `docker-compose.development.yml:22` — `secret MERN tracker session key 1993 2020` |
| `NODE_ENV` | серверным кодом не читается; в клиенте проверяется `=== 'production'` (`client/src/serviceWorker.ts:29`) | `client/src/serviceWorker.ts:29` (условие регистрации service worker) | Режим окружения | `docker-compose.yml:25` — `production`; `docker-compose.development.yml:23` — `development` |
| `PUBLIC_URL` | нет дефолта в коде; на этапе сборки CRA подставляется из окружения | `client/src/index.tsx:15` (basename BrowserRouter), `client/src/serviceWorker.ts:32`, `client/src/serviceWorker.ts:43` (URL service worker) | Базовый путь SPA | `docker-compose.yml:12`, `docker-compose.development.yml:12` — `/admin`; продублирован как `"homepage": "/admin"` в `client/package.json:40` |
| `redisUri` | — | **серверным кодом не читается вообще** | задумывалась как URI Redis, фактически мёртвая переменная: подключение захардкожено `new Redis({ host: 'redis' })` (`utils/redis.js:3`) | `docker-compose.yml:23`, `docker-compose.development.yml:21` — `redis://redis:6379` |
| `DANGEROUSLY_DISABLE_HOST_CHECK` | — | react-scripts (dev-сервер webpack), не прикладным кодом | отключает проверку Host у CRA dev-сервера | `docker-compose.development.yml:13` — `true` |

Замечания к env (как есть):

- Имена серверных переменных в нижнем регистре (`port`, `mongoUri`, `sessionSecret`) — нестандартно, но именно так их читает код (`app.js:11,16,48,66`).
- `redisUri` из compose кодом не потребляется: ioredis всегда идёт на хост `redis`, порт 6379 по умолчанию (`utils/redis.js:3`). Вне Docker-сети, где хост `redis` не резолвится, бэкенд к Redis не подключится.
- Секрет сессий `secret MERN tracker session key 1993 2020` закоммичен в репозиторий прямо в compose-файле (`docker-compose.yml:24`). **Известная проблема** — при реальном развёртывании значение нужно заменить, но в этом документе оно приводится как есть.
- В nginx-конфигах (`nginx/nginx.conf.prod`, `nginx/nginx.conf.dev`) env-переменных нет — только статические `proxy_pass` на имена сервисов (`nginx/nginx.conf.prod:5,10`; `nginx/nginx.conf.dev:5,12`).

---

## 2. Сервисы docker-compose (продакшн, `docker-compose.yml`)

Пять сервисов, все в bridge-сети `while-tracker-network` (`docker-compose.yml:75-77`), все с `restart: unless-stopped`. Имена контейнеров содержат опечатку `while-tracker-*` (`docker-compose.yml:8,17,59`) — на работу не влияет.

| Сервис | Образ/сборка | Что делает (поведение) | Наружу |
|---|---|---|---|
| `frontend` | сборка `./client` + `client/Dockerfile.prod` (`docker-compose.yml:5-7`) | Образ: `node:12.18.4-alpine3.9`, `WORKDIR /`, `npm install`, `npm run build`, `npm install -g serve` (`client/Dockerfile.prod:1-11`). Команда контейнера `serve -s build -l 3000` (`docker-compose.yml:9`) — отдаёт собранный CRA-дистрибутив из `client/build/` на порту 3000 | порт не публикуется, доступ только внутри сети через nginx `/admin` |
| `server` | сборка корневого `Dockerfile` (`docker-compose.yml:16`) | Образ: `node:12.18.4-alpine3.9`, `WORKDIR /server`, `npm install`, копирование исходников (`Dockerfile:1-9`); `.dockerignore` исключает `node_modules`, `client`, `npm-debug.log`, `data` (`.dockerignore:1-4`). Команда `npm run start` = `node app.js` (`docker-compose.yml:18`, `package.json:6`). Node-cluster: воркер на каждое CPU-ядро, SCHED_NONE, автоперезапуск умерших воркеров (`app.js:33-44`); детали middleware — [01-architecture.md §1](01-architecture.md) | порт не публикуется |
| `mongo` | образ `mongo:latest` (`docker-compose.yml:33`) | Хранит БД `tracker`; named volume `mongodata:/data/db` (`docker-compose.yml:35-36`). Схема данных — [07-database.md](07-database.md) | порт не публикуется |
| `redis` | образ `redis:6-alpine` (`docker-compose.yml:41`) | Запускается как `redis-server --save 900 1 --save 300 10 --save 60 10000 --maxmemory 124mb --maxmemory-policy allkeys-lfu` (`docker-compose.yml:45-51`); named volume `redisdata:/data` (`docker-compose.yml:43-44`); только `expose 6379` внутри сети (`docker-compose.yml:52-53`) | порт не публикуется |
| `nginx` | образ `nginx:stable-alpine` (`docker-compose.yml:58`) | Единственная точка входа трафика, см. §3 | **`80:80`** — единственная публикация наружу (`docker-compose.yml:60-61`) |

Порядок старта задаётся `depends_on`: `server` ждёт `mongo` и `redis` (`docker-compose.yml:26-28`), `nginx` ждёт `frontend` и `server` (`docker-compose.yml:64-66`). Это только порядок запуска контейнеров, не готовность приложений.

### Dev-оверлей (`docker-compose.development.yml`)

Файл-переопределение: содержит `frontend`, `server`, `redis`, `nginx`; сервис `mongo` в нём не объявлен — подразумевается запуск поверх базового файла (`docker-compose -f docker-compose.yml -f docker-compose.development.yml up`). Отличия от прода:

- `frontend`: `client/Dockerfile.dev`, команда `npm run start` (CRA dev-сервер), `stdin_open: true`, `tty: true`, env `PUBLIC_URL=/admin` + `DANGEROUSLY_DISABLE_HOST_CHECK=true`, том `./client/src:/src` для hot-reload (`docker-compose.development.yml:4-15`).
- `server`: команда `npm run server` (nodemon, `package.json:7`), `NODE_ENV=development`, том `./:/server` — живой код (`docker-compose.development.yml:16-25`).
- `redis`: те же параметры, но порт **публикуется наружу** `6379:6379` (`docker-compose.development.yml:38-39`).
- `nginx`: переопределяется только том конфига на `nginx.conf.dev` (`docker-compose.development.yml:40-42`).

**Известная проблема**: том `./client/src:/src` монтируется в `/src`, тогда как `WORKDIR` клиентского `Dockerfile.dev` — `/` и код копируется туда (`client/Dockerfile.dev:1-7`) — hot-reload не гарантирован. Также без Docker доступен вариант `npm run dev` из корня — concurrently поднимает nodemon-бэкенд и CRA-клиент (`package.json:8-10`).

---

## 3. nginx: маршруты, прокси, статика

Конфиг монтируется как `/etc/nginx/conf.d/nginx.conf` (`docker-compose.yml:62-63`); прод — `nginx/nginx.conf.prod`, dev — `nginx/nginx.conf.dev`. Оба идентичны по смыслу; в dev добавлены websocket-заголовки `Upgrade`/`Connection "upgrade"` для hot-reload (`nginx/nginx.conf.dev:6-8`).

Маршрутизация (по `nginx/nginx.conf.prod`):

- `location /admin` → `proxy_pass http://frontend:3000` (`nginx/nginx.conf.prod:4-7`); `rewrite ^/admin/(.*)$ /$1 break` срезает префикс `/admin`: SPA собран с `homepage: "/admin"` (`client/package.json:40`) и `PUBLIC_URL=/admin`, т.е. ассеты запрашиваются по путям `/admin/...`, а в контейнер `frontend` запрос приходит уже без префикса.
- `location /` → `proxy_pass http://server:5000` — всё остальное уходит на Node-бэкенд: трекинг-редиректы, постбэки `/postback` (`app.js:60`), API `/api/...` (`app.js:76-79`) (`nginx/nginx.conf.prod:9-15`). Проставляются заголовки `Host`, `X-Forwarded-For`, `X-Real-IP`, `X-Client-IP` (`nginx/nginx.conf.prod:11-14`) — трекер определяет IP посетителя именно по ним (request-ip, express-useragent в зависимостях, `package.json:28,32`).
- nginx **не раздаёт статику сам** — только проксирование. Статику SPA отдаёт контейнер `frontend` (serve); Express дополнительно раздаёт каталог `public/` (`app.js:50`) — самого каталога `public/` в репозитории нет.
- TLS не терминируется: только `listen 80` (`nginx/nginx.conf.prod:2`). HTTPS при необходимости — внешним балансировщиком перед nginx.

---

## 4. Инициализация MongoDB и Redis при первом старте

### 4.1. MongoDB

Миграций и сид-скриптов нет. Коллекции создаются mongoose-моделями автоматически при первом сохранении; БД — `tracker` (из `mongoUri`, `docker-compose.yml:22`). Состав коллекций и схема — [07-database.md §1](07-database.md). Коллекция `sessions` создаётся автоматически connect-mongodb-session (`app.js:46-49`).

### 4.2. Redis и настройки

Подключение — хост `redis`, дефолтный порт (`utils/redis.js:3`). При старте каждого воркера `getStartValueSettings()` (`app.js:21`) заполняет Redis и MongoDB:

- Словарь дефолтов `objSetting` (`utils/settings.utils.js:6-21`): `postbackKey` (генерируется `shortid.generate().toLowerCase()`), `clearDayStatistic: '30'`, `theme: 'light'`, `language: 'English'`, `trash: 'url'`, `trashUrl: 'http://example.com'`, `logLimitClick: '150'`, `logLimitAmount: '50'`, `getKey: 'q'`, `protect: '0'`, `sendTelegram: '0'`, `telegramBotToken: ''`, `telegramChatId: ''`, `clearRemote: '30'` — ровно 14 ключей, enum задан в `models/Setting.js:3-17`.
- Логика (`utils/settings.utils.js:23-43`): читаются все `Setting` из Mongo; `readArrays()` грузит чёрные списки в Redis; далее для каждого ключа — если значение есть в Mongo, оно кладётся в Redis; иначе в Redis кладётся дефолт **и сохраняется в Mongo** (`utils/settings.utils.js:30-42`). Оговорка: в Mongo сохраняются только **непустые** дефолты — guard `if (objSetting[key])` (`utils/settings.utils.js:35-40`); пустые дефолты (`telegramBotToken`, `telegramChatId`) в Mongo не попадают — остаются только в Redis и воспроизводятся в нём при каждом старте.
- Чёрные списки (`utils/arrayRedis.utils.js`): `dist/ips.dat` → список `blackIps` с нормализацией CIDR (`utils/arrayRedis.utils.js:18-25`), `dist/signature.dat` → `blackSignatures` (`:27-34`), `dist/remote.dat` → `listUrl` (`:36-43`); грузятся при старте в `readArrays()` (`:79-83`) и лениво при пустом ключе в `getArray()` (`:53-77`). Если файла нет — `readFiles` создаёт пустой и возвращает `[]` (`utils/readFiles.utils.js:3-13`). Запись списков обратно в файлы — через `utils/writeFiles.utils.js` при сохранении из админки (`routes/settings.route.js:114-125`).

Роль Redis — кэш настроек, кэш списков и накопитель статистики между сбросами в Mongo ([07-database.md](07-database.md)).

### 4.3. «Первый вход = создание админа»

`POST /api/auth/login` (роут подключён в `app.js:78`; валидация `authValidator`, `routes/auth.route.js:15`):

- Ищется пользователь по `username` (`routes/auth.route.js:22`). Если **не найден** — проверяется, существует ли хоть один пользователь (`User.findOne()`, `routes/auth.route.js:24`): существует → отказ `400 'Incorrect data'` (`:25-27`); БД пуста → пароль хэшируется bcrypt (cost 12) и создаётся первый пользователь-админ (`:28-30`).
- Если найден — обычная проверка пароля bcrypt (`:31-36`).
- При успехе: `req.session.user`, `req.session.isAuthenticated`, ответ `201 {id, message:'ok'}` (`:37-44`). Сессия — express-session + MongoStore, cookie на 24 часа (`app.js:64-74`). Выход — `GET /api/auth/logout` с уничтожением сессии (`routes/auth.route.js:9-13`).

**Практическое следствие:** после первого старта нужно немедленно залогиниться в `/admin` с желаемыми username/password — они станут credentials администратора; второй набор через логин создать невозможно.

---

## 5. Порядок запуска и проверка живости

Последовательность запуска бэкенда внутри `server` (`app.js`):

1. Мастер-процесс cluster форкает воркер на каждое ядро CPU (`app.js:33-38`); умершие воркеры перезапускаются (`:40-44`).
2. В воркере: `start()` → `mongoose.connect(process.env.mongoUri)` (`app.js:16-20`) → `getStartValueSettings()` (`:21`, см. §4.2) → `app.listen(PORT)` (`:22-25`). Порядок строгий: **Mongo connect → init settings → listen**. При ошибке подключения — лог `Server error` и `process.exit(1)` (`:26-30`).
3. Redis при старте не «ждут»: ioredis переподключается сам; запросы к Redis до готовности обрабатываются try/catch в утилитах (`utils/arrayRedis.utils.js:45-51,74-76`).

Чек-лист развёртывания с нуля:

1. Установить Docker и docker-compose.
2. `docker-compose up -d --build` — соберутся `server` (корневой `Dockerfile`) и `frontend` (`client/Dockerfile.prod`), поднимутся `mongo:latest`, `redis:6-alpine`, `nginx:stable-alpine` (порядок — через `depends_on`, `docker-compose.yml:26-28,64-66`).
3. Убедиться, что хост Redis доступен по имени `redis` (захардкожено, `utils/redis.js:3`) — внутри compose-сети это так.
4. Открыть `http://<host>/admin` и **сразу** выполнить первый логин (§4.3).
5. Посмотреть сгенерированный `postbackKey` в настройках админки (`utils/settings.utils.js:7`); при необходимости заменить `sessionSecret` (`docker-compose.yml:24`).

Проверка живости (как есть, без дополнительных эндпоинтов):

- Логи: `docker logs while-tracker-server` — при успешном старте каждый воркер печатает `Server started on port 5000...` (`app.js:22-24`); при ошибке Mongo — `Server error <message>` (`app.js:28`).
- Наружу отвечает только nginx на порту 80 (`docker-compose.yml:60-61`): `GET http://<host>/admin` должен отдать SPA (через `frontend:3000`), `GET http://<host>/` — попасть на бэкенд (`nginx/nginx.conf.prod:4-15`).
- Отдельного health-check эндпоинта в коде нет — живость определяется по перечисленным сигналам.

**Известная проблема (порты/публикация)**: единственный опубликованный порт прод-конфигурации — 80; dev-оверлей дополнительно публикует `6379:6379` Redis наружу без аутентификации (`docker-compose.development.yml:38-39`).

---

## 6. Бэкапирование

Минимальный бэкап: `mongodump` (все коллекции, кроме `sessions`) + каталог `dist/` из контейнера `server` + `docker-compose.yml` с актуальными секретами.

**MongoDB** (том `mongodata`, `docker-compose.yml:35-36`; БД `tracker`). Критичные коллекции — состав и назначение см. [07-database.md §1](07-database.md); особенно: `users` (единственный способ восстановления доступа), `settings` (включая `postbackKey`), `streams`/`offers`/`groups` (бизнес-конфигурация), `statistics` (самый большой объём, можно исключать из «конфигурационного» бэкапа). Команда: `docker exec mongo mongodump -d tracker -o /backup`; восстановление — `mongorestore`.

**Файлы списков** (внутри контейнера `server`, путь `<корень>/dist/`): `dist/ips.dat`, `dist/signature.dat`, `dist/remote.dat` (`utils/arrayRedis.utils.js:20,29,38`). Это единственный персистентный источник списков — Redis лишь кэш и восстанавливается из них при старте (`utils/arrayRedis.utils.js:79-83`). **Известная проблема**: named volume для `dist/` в compose не объявлен — при пересоздании контейнера `server` файлы теряются (в образ попадают пустыми, т.к. создаются только при первом запуске, `utils/readFiles.utils.js:8-10`), поэтому их обязательно включать в бэкап.

**Redis** (том `redisdata`, `docker-compose.yml:43-44`): RDB-снапшоты `--save 900 1 / 300 10 / 60 10000` (`docker-compose.yml:45-51`). При `allkeys-lfu` и наличии Mongo/файловых источников Redis можно не бэкапить — настройки и списки восстанавливаются при старте (§4.2). Исключение — несохранённая статистика, буферизуемая в Redis между сбросами в Mongo.

---

## 7. Миграционный совет: современные версии

> Этот блок — рекомендация для повторения с нуля, не описание текущего кода. Всё, что выше, — «как есть».

- **Базовые образы Node `12.18.4-alpine3.9`** (`Dockerfile:1`, `client/Dockerfile.prod:1`, `client/Dockerfile.dev:1`) — известная проблема: Node 12 снят с поддержки (EOL 2022), образы не получают патчей безопасности. Для нового развёртывания — актуальный LTS (на момент документа — Node 22), Alpine-тег текущей версии.
- **`mongo:latest`** (`docker-compose.yml:33`) — известная проблема: плавающий тег, при пересоздании возможен мажорный скачок с несовместимым форматом данных. Закрепить конкретную мажорную версию (например, 7.x) и обновлять осознанно.
- **`redis:6-alpine`** (`docker-compose.yml:41`) — закреплён, но ветка 6 nearing EOL; рекомендация — текущая стабильная (7.x) при повторении.
- **`nginx:stable-alpine`** (`docker-compose.yml:58`) — приемлемо, но лучше закрепить точную версию тегом.
- **`mongoose ^5.9.7`** (`package.json`) — известная проблема: mongoose 5 не поддерживает MongoDB 5+; при новой реализации — mongoose 8.x.
- **`redis ^3.1.1` и `ioredis ^4.19.0`** (`package.json`) — дублирующие клиенты; в новой реализации оставить один актуальный (node-redis v5 или ioredis v5) и вынести хост/порт в env (сейчас `utils/redis.js:3` — хардкод `host: 'redis'`).
- **Секрет в репозитории**: `sessionSecret` задан литералом в `docker-compose.yml:24` — в новой реализации вынести в `.env`/секрет-менеджер и никогда не коммитить.
- **Мёртвая переменная `redisUri`** (§1) — либо удалить, либо действительно читать её в коде вместо хардкода хоста.
- **Отсутствие health-checks** — добавить HEALTHCHECK в compose и/или `/healthz` эндпоинт, чтобы `depends_on` с `condition: service_healthy` действительно ждал готовности Mongo.
- **Том для `dist/`** — объявить volume или перенести чёрные списки в Mongo, чтобы файлы не терялись при пересоздании контейнера (см. §6).
- **TLS** — терминировать HTTPS перед nginx (внешний балансировщик/прокси) или добавить сертификаты в nginx-контейнер.

---

## 8. Источники

Код репозитория (ветка `docs/rebuild-kit`): `app.js`, `Dockerfile`, `client/Dockerfile.prod`, `client/Dockerfile.dev`, `.dockerignore`, `docker-compose.yml`, `docker-compose.development.yml`, `nginx/nginx.conf.prod`, `nginx/nginx.conf.dev`, `package.json`, `client/package.json`, `client/src/index.tsx`, `client/src/serviceWorker.ts`, `utils/redis.js`, `utils/settings.utils.js`, `utils/arrayRedis.utils.js`, `utils/readFiles.utils.js`, `utils/writeFiles.utils.js`, `routes/auth.route.js`, `routes/settings.route.js`, `models/Setting.js`. Смежные документы: [01-architecture.md](01-architecture.md), [07-database.md](07-database.md).
