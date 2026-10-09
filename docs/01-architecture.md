# WhalesTracker — Архитектура системы

> Документ описывает текущее состояние кода (ветка `docs/system-documentation`, базис `3df483e`). Все ссылки — файл:строки в этом коммите. Назначение: источник правды для рерайта.

## Отчёт исследования: бэкенд-ядро

Repo: `/Users/dmitrij/Documents/programs/WhalesTracker`. Express/MERN-приложение «traffic tracker» (`package.json:2-5`). Ниже каждое утверждение снабжено ссылкой `файл:строка`.

---

## 1. Цепочка middleware и роутов (app.js)

Точка входа — `app.js`. Используется Node.js **cluster**: мастер-процесс форкает воркер на каждое CPU (`app.js:33-38`), политика планирования `SCHED_NONE` (`app.js:36`), умершие воркеры перезапускаются (`app.js:40-44`). Вся настройка Express — в ветке `else` (воркер, `app.js:45-81`).

Порядок подключения (для входящих запросов):

1. `express.static('public')` — статика (`app.js:50`).
2. Helmet-модули: `dnsPrefetchControl`, `expectCt` (frameguard закомментирован, `app.js:53`), `hidePoweredBy`, `ieNoOpen`, `noSniff`, `referrerPolicy`, `xssFilter` (`app.js:51-58`).
3. `express-useragent` — парсинг User-Agent в `req.useragent` (`app.js:59`).
4. **`/postback` → `routes/postback.route.js`** (`app.js:60`) — подключён ДО `express.json`, т.е. без парсинга JSON-тела.
5. **`/` → `routes/tracker.route.js`** (`app.js:61`) — трекер-редиректы, тоже до `express.json` (GET-трафик).
6. `express.json({ extended: true })` (`app.js:63`).
7. `express-session` с хранилищем MongoStore (см. §2) (`app.js:64-74`).
8. **`/api/edit` → `routes/create.route.js`** (`app.js:76`).
9. **`/api/settings` → `routes/settings.route.js`** (`app.js:77`).
10. **`/api/auth` → `routes/auth.route.js`** (`app.js:78`).
11. **`/api/info` → `routes/info.route.js`** (`app.js:79`).
12. `errorHandler` — финальный middleware (`app.js:80`), содержимое см. §4.

Запуск: сначала `mongoose.connect(process.env.mongoUri)` (`app.js:16-20`), затем `getStartValueSettings()` — инициализация настроек/Redis-массивов (`app.js:21`, `utils/settings.utils.js:25-45`), затем `app.listen(PORT)` (`app.js:22-25`). Порт: `process.env.port || 5000` (`app.js:11`). При ошибке соединения — `process.exit(1)` (`app.js:26-30`).

Маршруты (файлы): `routes/auth.route.js`, `routes/create.route.js`, `routes/info.route.js`, `routes/postback.route.js`, `routes/settings.route.js`, `routes/tracker.route.js`. Логика трекинга — в каталоге `tracker/` (`filters.js`, `redirect.js`, `stream.js`, `userInfo.js` — задача B, здесь не разбирались детально).

## 2. Аутентификация / сессии

- Сессии: `express-session`, `secret = process.env.sessionSecret`, `resave:false`, `saveUninitialized:false`, cookie `maxAge = 24 часа` (`1000*60*60*24`) (`app.js:64-74`).
- Хранилище сессий: `connect-mongodb-session`, коллекция `sessions` в той же MongoDB (`app.js:46-49`).
- Логин: `POST /api/auth/login` (`routes/auth.route.js:12`). Валидация `authValidator` (`routes/auth.route.js:12`; правила: username — alphanumeric 3–56, password — alphanumeric 6–56, `utils/validators.utils.js:5-19`). Ответ 422 при ошибках валидации (`routes/auth.route.js:15-17`).
- **Первый пользователь создаётся автоматически**: если в БД нет пользователя с таким username и в БД вообще нет ни одного пользователя, введённые credentials хэшируются (bcrypt, cost 12) и сохраняются как новый пользователь (`routes/auth.route.js:21-28`). Если пользователь существует — сравнение пароля bcrypt (`routes/auth.route.js:30-34`). При несовпадении — 400 «Incorrect data» (`routes/auth.route.js:31-33`). Это классический «регистрация первого админа логином».
- При успехе: `req.session.user = user._id`, `req.session.isAuthenticated = true`, `session.save`, ответ 201 (`routes/auth.route.js:36-44`).
- Логаут: `GET /api/auth/logout` — `req.session.destroy` + redirect `/` (`routes/auth.route.js:6-10`).
- Проверка доступа: `middleware/auth.middleware.js` — при отсутствии `req.session.isAuthenticated` отвечает 401 `{message:'Not Authenticated!'}` (`middleware/auth.middleware.js:1-4`). Подключён в `routes/create.route.js:3`, `routes/info.route.js:3`, `routes/settings.route.js:5`. Не подключён в postback и tracker-роутах (публичные).
- Ролей/разграничения прав нет — единственный флаг `isAuthenticated`.

### middleware/

- `auth.middleware.js` — auth-guard, 6 строк (см. выше).
- `common.middleware.js` — **пустой файл (0 строк)**; назначение не ясно.
- `error.middleware.js` — catch-all/финальный обработчик, см. §4.

## 3. Роль Redis (ключи, TTL)

Клиент: `ioredis`, подключение `new Redis({ host: 'redis' })` — хост захардкожен, без порта/пароля (`utils/redis.js:1-4`). `redisUri` из env в коде не используется (задаётся в compose, см. §5; назначение не ясно — вероятно, задел).

Redis используется как **кэш настроек и списков**, TTL нигде не устанавливается (нет вызовов `expire`/`set` с EX в `utils/`):

- **Настройки (строковые ключи)** —读写 через `utils/settings.utils.js`:
  - ключи (значения по умолчанию, `utils/settings.utils.js:9-24`): `postbackKey` (random shortid), `clearDayStatistic`='30', `theme`, `language`, `trash`='url', `trashUrl`='http://example.com', `logLimitClick`='150', `logLimitAmount`='50', `getKey`='q', `protect`='0', `sendTelegram`='0', `telegramBotToken`, `telegramChatId`, `clearRemote`='30'.
  - при старте `getStartValueSettings()` читает настройки из MongoDB (модель `Setting`), недостающие записывает и в Redis (`redis.set`), и обратно в Mongo (`utils/settings.utils.js:25-45`).
  - `getSetting(key)` — Redis → Mongo → значение по умолчанию, с дозаписью в Redis (`utils/settings.utils.js:47-58`); `setSetting`/`delSetting` — `SET`/`DEL` (`utils/settings.utils.js:60-65`).
- **Списки (Redis list)** — `utils/arrayRedis.utils.js`:
  - `blackIps` — из файла `dist/ips.dat`, после чистки через `utils/ip.utils.js` (`utils/arrayRedis.utils.js:18-24`);
  - `blackSignatures` — из `dist/signature.dat` (`utils/arrayRedis.utils.js:26-32`);
  - `listUrl` — из `dist/remote.dat` (`utils/arrayRedis.utils.js:34-40`).
  - `setArray` — `MULTI`: `DEL` + серия `RPUSH` (`utils/arrayRedis.utils.js:8-16`); `getArray` — `LRANGE 0 -1`, при пустом списке — перечитывание из файла (`utils/arrayRedis.utils.js:42-66`); `getCountArray` — `LLEN` (`utils/arrayRedis.utils.js:69-75`); `readArrays()` — перезагрузка всех трёх (`utils/arrayRedis.utils.js:77-81`).
- TTL в Redis не задан; время жизни есть у **MongoDB**-документов `Remote` (кэш remote-редиректов): поле `expireAt = now + clearRemote дней` (`utils/url.utils.js:41-53`) — TTL-индекс, предположительно в модели `Remote.js` (не проверял внутри модели — файл в зоне задачи B).

## 4. Обработка ошибок

- `middleware/error.middleware.js` (весь, 3 строки): `module.exports = (req, res) => res.status(404).json('Page not found')` (`middleware/error.middleware.js:1-3`). Это **не** типовой error-handler (сигнатура без `next`/4 аргументов) — фактически «404 на всё, что дошло до конца цепочки». Ошибки асинхронных роутов им не ловятся (нет 4-аргументной сигнатуры); назначение как обработчика исключений не ясно / работает только как fallback-404.
- В роутах — локальные `try/catch` с прямым ответом: например, логин 422/400/500 (`routes/auth.route.js:14-17,31-33,45-47`).
- Фатальные ошибки старта: лог + `process.exit(1)` (`app.js:26-30`).
- `arrayRedis.utils` глушит ошибки Redis, возвращая `[]`/`0` (`utils/arrayRedis.utils.js:69-66,82-83`); `readFiles`/`writeFiles` при ошибке перезаписывают файл пустым (`utils/readFiles.utils.js:6-11`, `utils/writeFiles.utils.js:6-12`).

## 5. Переменные окружения

Используются в коде (`app.js`): `port` (`app.js:11`), `mongoUri` (`app.js:16,48`), `sessionSecret` (`app.js:66`).

Задаются в docker-compose (оба файла, прод и dev):

| Переменная | Значение | Где |
|---|---|---|
| `port` | `5000` | docker-compose.yml:24; docker-compose.development.yml:15 |
| `mongoUri` | `mongodb://mongo:27017/tracker` | docker-compose.yml:25; docker-compose.development.yml:16 |
| `redisUri` | `redis://redis:6379` | docker-compose.yml:26; docker-compose.development.yml:17 (в коде не читается — назначение не ясно) |
| `sessionSecret` | `secret MERN tracker session key 1993 2020` (захардкожен в репо!) | docker-compose.yml:27; docker-compose.development.yml:18 |
| `NODE_ENV` | `production` / `development` | docker-compose.yml:28; docker-compose.development.yml:19 |

Клиентская часть (frontend-сервис): `PUBLIC_URL=/admin` в проде и dev (docker-compose.yml:12; docker-compose.development.yml:11), в dev также `DANGEROUSLY_DISABLE_HOST_CHECK=true` (docker-compose.development.yml:12).

Файлы данных (не env, но конфигурация по умолчанию): `dist/ips.dat`, `dist/signature.dat`, `dist/remote.dat` (`utils/arrayRedis.utils.js:19-21,27-29,35-37`).

## 6. Docker / nginx (dev + prod), порты

### Dockerfile (backend, prod-образ)
`node:12.18.4-alpine3.9` (устаревшая база), `WORKDIR /server`, `npm install`, копирование исходников (`Dockerfile:1-9`). CMD берётся из package.json (`npm start`, `package.json:6-10`).

### docker-compose.yml (prod, версия 3.3)
Сеть `while-tracker-network` (bridge) (docker-compose.yml:74-76), volumes `mongodata`, `redisdata` (docker-compose.yml:71-73).
- `frontend` — build `client/Dockerfile.prod`, `serve -s build -l 3000`, порт 3000 внутри сети (docker-compose.yml:5-14).
- `server` — build `./`, `npm run start`, порт 5000, `depends_on mongo, redis` (docker-compose.yml:15-29).
- `mongo` — `mongo:latest`, volume (docker-compose.yml:30-37).
- `redis` — `redis:6-alpine`, с политиками сохранения `--save 900 1 / 300 10 / 60 10000`, `--maxmemory 124mb`, `--maxmemory-policy allkeys-lfu`, только `expose 6379` (не публикуется) (docker-compose.yml:38-53).
- `nginx` — `nginx:stable-alpine`, **единственный опубликованный порт `80:80`**, монтирует `nginx/nginx.conf.prod` (docker-compose.yml:54-65).

### docker-compose.development.yml (dev)
Переопределяет базовый compose (без `version`/сетей — extend-style): frontend с Dockerfile.dev и hot-mount `./client/src:/src` (docker-compose.development.yml:4-14), server с `nodemon` и hot-mount `./:/server` (docker-compose.development.yml:15-21), redis **публикует `6379:6379` наружу** (docker-compose.development.yml:22-32), nginx монтирует `nginx.conf.dev` (docker-compose.development.yml:33-35). Порт 80 nginx наследуется из прод-файла (назначение/способ запуска — `docker-compose -f ... -f ...`, в README не проверено).

### nginx
Оба конфига: `listen 80 default_server`; `location /admin → proxy_pass http://frontend:3000` с `rewrite ^/admin/(.*)$ /$1 break`; `location / → proxy_pass http://server:5000` с заголовками `Host`, `X-Forwarded-For`, `X-Real-IP`, `X-Client-IP` (nginx/nginx.conf.dev:1-20; nginx/nginx.conf.prod:1-17). Отличие dev: проксирование WebSocket-заголовков `Upgrade`/`Connection: upgrade` для `/admin` (nginx/nginx.conf.dev:6-8). Заголовок `X-Client-IP` согласуется с использованием `request-ip`/`geoip-lite` в зависимостях (`package.json:25,29`).

### Локальный запуск без Docker
`npm run dev` — concurrently server (nodemon) + client (package.json:6-13).

## 7. Структура репозитория (по предложению на директорию)

- `app.js` — точка входа: cluster, Express, подключение роутов/middleware (`app.js:1-82`).
- `package.json` / `package-lock.json` — зависимости и скрипты MERN-приложения (`package.json:1-57`).
- `Dockerfile` — прод-образ backend (`Dockerfile:1-9`).
- `docker-compose.yml` — прод-стек: frontend, server, mongo, redis, nginx (docker-compose.yml:1-76).
- `docker-compose.development.yml` — dev-переопределения с hot-reload (docker-compose.development.yml:1-41).
- `nginx/` — конфиги реверс-прокси: `nginx.conf.dev` (20 строк), `nginx.conf.prod` (17 строк).
- `middleware/` — `auth.middleware.js` (401-guard), `common.middleware.js` (пустой — назначение не ясно), `error.middleware.js` (финальный 404).
- `routes/` — HTTP-маршруты: `auth.route.js` (логин/логаут, 50 строк), `create.route.js` (CRUD кампаний, `/api/edit`, 184 строки), `info.route.js` (статистика/инфо, `/api/info`, 283 строки), `postback.route.js` (приём postback, 33 строки), `settings.route.js` (`/api/settings`, 145 строк), `tracker.route.js` (публичный трекер-редирект на `/`, 138 строк).
- `tracker/` — бизнес-логика трекинга: `filters.js`, `redirect.js`, `stream.js`, `userInfo.js` (детальный разбор — задача B).
- `utils/` — `redis.js` (клиент ioredis), `settings.utils.js` (настройки Mongo↔Redis), `arrayRedis.utils.js` (чёрные списки/URL в Redis-списках), `ip.utils.js` (чистка IP-списков, CIDR), `url.utils.js` (ротация/выбор URL офферов и remote, подстановка `[subid]`), `validators.utils.js` (express-validator схемы), `generateText.js` (генерация псевдослучайного текста/HTML — назначение не ясно, вероятно фейер-контент), `readFiles.utils.js`/`writeFiles.utils.js` (чтение/запись .dat-файлов, CRLF).
- `models/` — Mongoose-модели: `User.js`, `Group.js`, `Stream.js`, `Offer.js`, `Statistic.js`, `Setting.js`, `Remote.js` (содержимое — задача B).
- `client/` — React-фронтенд (админка по пути `/admin`), со своими Dockerfile.dev/.prod (задача C).
- `docs/` — документация (не входит в задачу A).
- `README.md`, `whale.svg` — описание и логотип.

### Замечания (факты, без рекомендаций)
- `sessionSecret` захардкожен в compose-файлах в репо (docker-compose.yml:27; docker-compose.development.yml:18).
- `redisUri` env задаётся, но клиент Redis использует хардкод `host: 'redis'` (utils/redis.js:3).
- База образа `node:12.18.4-alpine3.9` и `mongo:latest` (Dockerfile:1; docker-compose.yml:31) — pinning отсутствует у mongo.
- `common.middleware.js` пуст; `error.middleware.js` не является полноценным обработчиком ошибок Express.
