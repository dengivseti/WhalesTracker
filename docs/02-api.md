# WhalesTracker — Справочник API

> Все HTTP-методы бэкенда: пути, параметры, валидация, ответы, побочные эффекты. Ссылки — файл:строки. См. также: [архитектура](01-architecture.md), [домен и трекер](03-domain-tracker.md).

# WhalesTracker — полный обзор HTTP API (задача B)

Стек: Express + Mongoose (MongoDB), Redis (ioredis), express-session с MongoStore, express-validator, helmet (частично), cluster-форки по числу CPU. Точка монтирования: `app.js:60-79`.

## 1. Порядок монтирования и глобальные middleware

Маршруты подключаются в `app.js` в таком порядке (порядок критичен):

| # | Middleware / router | Где |
|---|---|---|
| 1 | `express.static('public')` | app.js:50 |
| 2 | helmet: dnsPrefetchControl, expectCt, hidePoweredBy, ieNoOpen, noSniff, referrerPolicy, xssFilter (frameguard закомментирован) | app.js:51-58 |
| 3 | `useragent.express()` (заполняет `req.useragent`) | app.js:59 |
| 4 | `router.postback` → **префикс `/postback`** | app.js:60 |
| 5 | `router.tracker` → **префикс `/`** | app.js:61 |
| 6 | `express.json({extended:true})` | app.js:63 |
| 7 | session (MongoStore, collection `sessions`) | app.js:64-75 |
| 8 | `router.create` → **префикс `/api/edit`** | app.js:76 |
| 9 | `router.settings` → **префикс `/api/settings`** | app.js:77 |
| 10 | `router.auth` → **префикс `/api/auth`** | app.js:78 |
| 11 | `router.info` → **префикс `/api/info`** | app.js:79 |
| 12 | `errorHandler` (финальный) | app.js:80 |

Ключевые следствия:
- Трекер (`/`) и `/postback` идут **до** `express.json` и session — у них нет `req.session` и парсинга тела; это осознанно для публичных GET-редиректов, но делает невозможным любое тело-зависимое поведение (app.js:60-63).
- `errorHandler` объявлен как `(req, res) => res.status(404).json('Page not found')` — **это не error-middleware** (нет 4-го аргумента `next`), поэтому он работает как обычный терминирующий middleware 404 для несовпавших путей (middleware/error.middleware.js:1-3). Все `catch (e)` в роутах сами возвращают 500 — реальные ошибки никогда не доходят до этого хендлера.
- Аутентификация — сессия в MongoDB: `req.session.isAuthenticated` (middleware/auth.middleware.js:1-5). Выдаётся в `POST /api/auth/login` (routes/auth.route.js:39-41).

## 2. Счётчик по grep

`grep -E "router\.(get|post|put|delete|use)" routes/` даёт **27 совпадений в 6 файлах**:
- postback.route.js — 2 (routes/postback.route.js:7,15)
- auth.route.js — 2 (routes/auth.route.js:9,15)
- tracker.route.js — 2 (routes/tracker.route.js:22,30)
- settings.route.js — 5 (routes/settings.route.js:21,42,58,87,137)
- create.route.js — 12 (routes/create.route.js:16,24,49,58,74,85,98,109,156,173)
- info.route.js — 4 (routes/info.route.js:26,38,50,213)

`router.use` не используется ни разу. Итог: **26 реальных эндпоинтов** (один — заглушка `GET /postback/`).

## 3. Форматы ответов (сквозные)

- Успех: `res.json(...)` (200), иногда 201 (login, stream/create). Тела разнородны: `{status:'OK'}` (routes/create.route.js:54,93,105), `{status:'ok'}` (routes/postback.route.js:24), `{message:'ok', id}` (routes/auth.route.js:47), сырые документы Mongo, агрегаты.
- Ошибки валидации: **422** `{message: errors.array()[0].msg}` — только первая ошибка (routes/auth.route.js:17-19, routes/create.route.js:28-30, routes/settings.route.js:63-65).
- Ошибки сервера: **500** `json('Something went wrong')` (строкой, не объектом) в tracker/postback; `{message:'Something went wrong'}` в settings/create/info; в двух местах к 500 добавляется объект ошибки `e` (routes/create.route.js:46-48, 72-74) — утечка стека/ошибки наружу.
- 404 (несовпавший путь): `json('Page not found')` (middleware/error.middleware.js:2).
- Неавторизовано: **401** `{message:'Not Authenticated!'}` (middleware/auth.middleware.js:3).

## 4. Эндпоинты по файлам

### 4.1 routes/auth.route.js (префикс `/api/auth`)

**GET /api/auth/logout** (routes/auth.route.js:9-13)
- Auth: нет (logout доступен любому; сессии нет — `destroy` на undefined не падает, просто колбэк).
- Параметры: нет.
- Действие: `req.session.destroy()`, затем **redirect `/`** (HTML-редирект на трекер, а не JSON — несимметрично с REST).
- Модели: без r/w. Побочные эффекты: удаление сессии в Mongo (sessions collection, app.js:67-71).

**POST /api/auth/login** (routes/auth.route.js:15-48)
- Auth: нет.
- Body: `username` (обяз., alphanumeric, 3–56), `password` (обяз., 6–56, alphanumeric) — валидатор `authValidator` (utils/validators.utils.js:3-21).
- Логика: ищет `User.findOne({username})`; если пользователя нет и в БД нет **ни одного** пользователя — регистрирует первого (bcrypt cost 12, routes/auth.route.js:24-29); иначе сверяет пароль (routes/auth.route.js:31-37). При успехе ставит `req.session.user/_isAuthenticated`, `session.save`, ответ **201** `{id, message:'ok'}` (routes/auth.route.js:38-47).
- Модели: User (r/w). Побочные эффекты: запись сессии в Mongo.

### 4.2 routes/postback.route.js (префикс `/postback`, без auth, до session)

**GET /postback/** (routes/postback.route.js:7-11) — заглушка: всегда **500** `'Something went wrong'`. Назначение не ясно (вероятно, health/заглушка).

**GET /postback/:id** (routes/postback.route.js:15-28)
- Auth: секрет вместо auth — `:id` должен равняться настройке `postbackKey` (Redis/Mongo, utils/settings.utils.js:44-55), сравнение обычное `===` (не timing-safe).
- Query: `subid` (обяз.), `payout` (обяз., приводится к `+payout` без валидации NaN).
- Действие: `Statistic.where({subid}).updateOne({amount: +payout})` (routes/postback.route.js:20-22).
- Модели: Statistic (w). Успех: `{status:'ok'}`; иначе 500 строкой.
- Дефект: `updateOne` без фильтра по группе/дате меняет **все** записи с данным subid; отсутствие subid/payout даёт 500 вместо 4xx.

### 4.3 routes/tracker.route.js (префикс `/`, без auth, без json/session)

**GET /** (routes/tracker.route.js:22-27) — «мусорный» редирект: если настройка `trash === 'notFound'` — редирект через `redirect('404', trashUrl)` (tracker/redirect), иначе `res.redirect(trashUrl)` (routes/tracker.route.js:13-19). Модели: только чтение настроек.

**GET /:id** (routes/tracker.route.js:30-137) — основной клик-трекер.
- Path: `id` = `group.name` (не Mongo `_id`).
- Логика: `Group.findOne({name}).populate('streams')` (routes/tracker.route.js:34-38); не найдена или `!isActive` → trash-редирект (39-44). `userInfo(req)` — сбор ip/geo/device/UA (tracker/userInfo). Уникальность: при `group.checkUnic && timeUnic>0` ищет `Statistic.find({ip, date>=subHours(time, timeUnic)})` — проверка **по ip глобально**, без привязки к группе (routes/tracker.route.js:54-63). Стримы сортируются по `position`, первый «прошедший фильтры» (`stream(user, stream)`) даёт URL (`getUrl` с typeRedirect/code/subid/query/count) и редирект (routes/tracker.route.js:70-103); иначе фолбэк на group-level redirect (105-113).
- Логирование: если `group.useLog && stream.useLog` (или только group.useLog для фолбэка) — `new Statistic({...}).save()` с TTL-полем `expireAt = addDays(now, clearDayStatistic)` (routes/tracker.route.js:83-101, 115-133; TTL-индекс предполагается в схеме — models/Statistic.js).
- Модели: Group (r), Stream (r), Statistic (w). Redis: чтение настроек и чёрных списков через getSetting/arrayRedis. Ответ: HTTP-редирект (302/мета — в tracker/redirect).

### 4.4 routes/create.route.js (префикс `/api/edit`, везде `auth`)

**GET /api/edit/dashboard** (routes/create.route.js:16-22) — заглушка, отвечает строкой `'TEST GET'`. Модели: нет.

**POST /api/edit/offers/edit** (routes/create.route.js:24-48), валидатор `addOffer` (utils/validators.utils.js:150-176): `name` 3–25, `type` exists, `offers.*.url` isURL, `offers.*.percent` int 0–100.
- Body c `_id` → `Offer.updateOne({name,type,offers})`, ответ — эхо req.body (routes/create.route.js:31-36); без `_id` → `new Offer({...req.body}).save()`, ответ — сырой результат save (включая internals) (routes/create.route.js:37-40). Модель Offer (r/w).

**DELETE /api/edit/offers/:id/** (routes/create.route.js:49-54) — `Offer.deleteOne({_id: params.id})`; `{status:'OK'}`. Некорректный id → 500 (каст не проверяется).

**POST /api/edit/group/create** (routes/create.route.js:58-72), валидатор `addGroup` (utils/validators.utils.js:102-148): `label` 3–15, `name` 3–20 (оба isAlphanumeric), `typeRedirect` exists, `checkUnic/timeUnic/useLog/isActive` boolean/numeric. Создаёт `Group`, ответ — результат save.

**GET /api/edit/group/:id** (routes/create.route.js:74-83) — `Group.findById(id).populate('streams')`. Group (r).

**DELETE /api/edit/group/:id/:idstream** (routes/create.route.js:85-92) — удаляет стрим из группы: `group.removeStream(idStream)` (models/Group.js:31-37) + `Stream.deleteOne`. Небезопасно: `findById` без null-check → 500 при плохом id.

**DELETE /api/edit/group/:id** (routes/create.route.js:98-104) — `Stream.deleteMany({_id:{$in: group.streams}})` + `Group.deleteOne`. Стримы удаляются, но **Statististic по группе не чистится**; объявленный `removeAllStreams` (models/Group.js:39-43) не используется.

**POST /api/edit/group/:id** (routes/create.route.js:109-153), валидатор `editGroup` (utils/validators.utils.js:23-68) — вложенный `group.*`. Обновляет Group (поля label/name/typeRedirect/checkUnic/timeUnic/code/useLog/isActive) и **bulkWrite** по массиву `streams` (position/name/typeRedirect/code/useLog/isActive/relation/isBot/filters). Ответ `{status:'OK'}`. Замечание: `code` группы/стримов не валидируется; валидируется только `group.*`, поля стримов — нет.

**POST /api/edit/stream/create** (routes/create.route.js:156-170), валидатор `addStream` (utils/validators.utils.js:117-145): `name` 3–15, `position` numeric, `typeRedirect` exists, relation/useLog/isActive/isBot boolean. Body: `igGroup` (id группы, вырезается из документа), остальные — поля Stream. Создаёт Stream, затем `Group.findById(igGroup).addToStream(id)` (models/Group.js:18-28). Ответ **201** с документом.

**POST /api/edit/filters/create** (routes/create.route.js:173-181) — без валидатора. Body: `igStream`, `filters` (произвольный массив). `Stream.findById(igStream).updateFilters(filters)` (models/Stream.js:26-30), ответ — эхо req.body. Полностью невалидируемый write.

### 4.5 routes/settings.route.js (префикс `/api/settings`, везде `auth`)

**GET /api/settings/info** (routes/settings.route.js:21-40) — `Setting.find()` → плоская карта `general[key]=value`, плюс длины Redis-списков `intBlackIp/intBlackSignature/intRemoteUrl` (`redis.llen`, utils/arrayRedis.utils.js:44-51). Только чтение (Mongo r, Redis r).

**GET /api/settings/info/list?type=...** (routes/settings.route.js:42-56) — query `type` ∈ {blackIps, blackSignatures, listUrl} (routes/settings.route.js:15). `getArray(type)`: Redis lrange, при пустоте — перечитывает файл `dist/ips.dat|signature.dat|remote.dat` и заливает в Redis (utils/arrayRedis.utils.js:54-84). Ответ `{type, data:[...]}`. Побочные эффекты: ленивое восстановление Redis из файлов.

**POST /api/settings/edit/general** (routes/settings.route.js:58-85), валидатор `editSetting` (utils/validators.utils.js:70-100): `postbackKey` 5–20, `clearDayStatistic` int 1–30, `trash` exists, `logLimitClick` int (min в тексте 5, реально `min:1` — расхождение), `logLimitAmount` int 5–5000, `getKey` 1–20.
- Для каждого ключа body: `setSetting` (Redis SET) + `Setting.updateOne` (routes/settings.route.js:68-72). Если `clearDayStatistic` уменьшился — `Statistic.deleteMany({date < startOfDay(now - N дней)})` (routes/settings.route.js:74-81). Ответ `{status:'OK'}`. Секрет `postbackKey` и `trashUrl` обновляются тем же механизмом; `trashUrl` в валидаторе отсутствует (обновится без валидации, если прислать).

**POST /api/settings/edit/list** (routes/settings.route.js:87-133) — без валидатора. Body: `action` ∈ clear|edit|add|delete, `typeList` (тот же набор), `data` (массив строк; для edit/add/delete). Логика: собрать новый список из Redis-версии, для blackIps — нормализация через `clearIp` (routes/settings.route.js:111-114), `setArray` в Redis (RPUSH/DEL, utils/arrayRedis.utils.js:7-17), затем **перезапись файла** `dist/ips.dat|remote.dat|signature.dat` (routes/settings.route.js:115-129, utils/writeFiles.utils.js). Ответ — счётчики трёх списков. Дефект: `action:'clear'` даёт `newList=[]` → блок `if (newList && newList.length)` пропускает нормализацию, но `setArray` с пустым массивом **не удаляет ключ** (условие `arr.length>0`, utils/arrayRedis.utils.js:9-11) и файл перезаписывается пустым при живом Redis-списке — рассинхрон. Также `default` ветка свитча файлов молча трактует неизвестный typeList как signature.dat.

**POST /api/settings/statistics/clear** (routes/settings.route.js:137-143) — **мертвый эндпоинт**: тело только `// TODO`, ответа нет (зависший запрос; `next` не вызывается, res не завершается). Плюс опечатка в пути: `'statistics/clear'` без ведущего `/` (Express обычно прощает, итоговый путь `/api/settings/statistics/clear`).

### 4.6 routes/info.route.js (префикс `/api/info`, везде `auth`)

**GET /api/info/groups** (routes/info.route.js:26-36) — `Group.find().populate('streams')`; пустой результат невозможен как null в Mongo (`find` даёт `[]`), ветка `if(!groups)` мертва. Group r, Stream r (populate).

**GET /api/info/offers** (routes/info.route.js:38-48) — `Offer.find()`. Offer r.

**GET /api/info/stats/dashboard** (routes/info.route.js:50-211) — query: `type` (обяз.: `day` — почасовая статистика за сегодня+вчера, иначе понедельная по дням, weekStartsOn:1); `groups|streams|country` (необяз., списки через `|`); `ignoreBot` (необяз.). Фильтр `date: {$gte: startOf(prev), $lt: endOf(current)}` (routes/info.route.js:96-98). Полный `Statistic.find(...).populate(stream{name}).populate(group{name}).lean()` — **вся выборка в память**, агрегация в JS (routes/info.route.js:104-114). Ответ `{stats:[{value,hits,uniques,sales,amount,hits_last,uniques_last,sales_last,amount_last}], last_click, last_amount}`; лимиты last_click/last_amount — из настроек `logLimitClick/logLimitAmount` (routes/info.route.js:121-127). Статист 500: если `type` отсутствует, делается `res.status(500).json(...)` **без return** — выполнение продолжается и после ответа (routes/info.route.js:54-56) — потенциальный «Cannot set headers after sent».

**GET /api/info/stats** (routes/info.route.js:213-281) — query: `startDate` (`yyyy-MM-dd`, через date-fns parse), `endDate` (parseISO, endOfDay), `type` ∈ day|country|query|device (checkType, routes/info.route.js:9-21; default маппится на device), `groups|streams|country` (через `|`). `Statistic.find(...).lean()`, группировка в JS → `{stats:[{hits,uniques,sales,amount,value}]}`. Те же дефекты: отсутствующие query → 500 без return (routes/info.route.js:222-226); отсутствие реальных диапазонов/валидации дат; `keyword` не выбирается в projection при type=query, но берётся в checkType — проекция `date group stream keyword device country unique isBot amount` включает keyword, ок; city не выбирается.

## 5. Валидаторы (utils/validators.utils.js)

| Имя | Поля и правила | Используется |
|---|---|---|
| authValidator (:3-21) | username alphanumeric 3–56; password 6–56 alphanumeric | auth.route.js:15 |
| editGroup (:23-68) | group.label 3–20, group.name 3–20, group.typeRedirect exists, group.checkUnic bool, group.timeUnic numeric (+ошибочный isLength({min:1,max:720}) на строке — isLength считает длину строки, а не значение), group.useLog bool, group.isActive bool | create.route.js:109 |
| editSetting (:70-100) | postbackKey 5–20; clearDayStatistic isNumeric+isInt 1–30; trash exists; logLimitClick isNumeric+isInt 1–1500; logLimitAmount isNumeric+isInt 5–5000; getKey 1–20 | settings.route.js:58 |
| addGroup (:102-148) | label 3–15; name 3–20; typeRedirect exists; checkUnic bool; timeUnic numeric + isLength 1–720 (та же ошибка); useLog/isActive bool | create.route.js:58 |
| addStream (:117-145) | name 3–15; position numeric; typeRedirect exists; relation/useLog/isActive/isBot bool | create.route.js:156 |
| addOffer (:150-176) | name 3–25; type exists; offers.*.url isURL; offers.*.percent int 0–100 | create.route.js:24 |

Не покрыты валидацией: `/filters/create`, `/settings/edit/list`, path-параметры `:id` (Mongo ObjectId нигде не проверяется), `postback` query, `stats*` query.

## 6. Сводная таблица эндпоинтов

| # | Метод | Полный путь | Auth | Валидатор | Модели r/w | Успех | Прим. |
|---|---|---|---|---|---|---|---|
| 1 | GET | /api/auth/logout | нет | — | — | 302 → / | routes/auth.route.js:9 |
| 2 | POST | /api/auth/login | нет | authValidator | User r/w (+первый юзер) | 201 {id,message} | routes/auth.route.js:15 |
| 3 | GET | /postback/ | нет | — | — | 500-заглушка | routes/postback.route.js:7 |
| 4 | GET | /postback/:id | секрет postbackKey | — | Statistic w | {status:'ok'} | routes/postback.route.js:15 |
| 5 | GET | / | нет | — | Setting r | redirect trashUrl | routes/tracker.route.js:22 |
| 6 | GET | /:id | нет | — | Group r, Stream r, Statistic w | redirect | клик-трекер, routes/tracker.route.js:30 |
| 7 | GET | /api/edit/dashboard | auth | — | — | 'TEST GET' | routes/create.route.js:16 |
| 8 | POST | /api/edit/offers/edit | auth | addOffer | Offer r/w | эхо/документ | upsert-стиль, routes/create.route.js:24 |
| 9 | DELETE | /api/edit/offers/:id/ | auth | — | Offer w | {status:'OK'} | routes/create.route.js:49 |
| 10 | POST | /api/edit/group/create | auth | addGroup | Group w | документ | routes/create.route.js:58 |
| 11 | GET | /api/edit/group/:id | auth | — | Group r | документ+streams | routes/create.route.js:74 |
| 12 | DELETE | /api/edit/group/:id/:idstream | auth | — | Group w, Stream w | {status:'OK'} | routes/create.route.js:85 |
| 13 | DELETE | /api/edit/group/:id | auth | — | Stream w, Group w | {status:'OK'} | routes/create.route.js:98 |
| 14 | POST | /api/edit/group/:id | auth | editGroup | Group w, Stream bulkWrite w | {status:'OK'} | routes/create.route.js:109 |
| 15 | POST | /api/edit/stream/create | auth | addStream | Stream w, Group w | 201 документ | routes/create.route.js:156 |
| 16 | POST | /api/edit/filters/create | auth | — (нет!) | Stream w | эхо body | routes/create.route.js:173 |
| 17 | GET | /api/settings/info | auth | — | Setting r, Redis r | {general,int*} | routes/settings.route.js:21 |
| 18 | GET | /api/settings/info/list | auth | — | Redis r (+файлы) | {type,data} | routes/settings.route.js:42 |
| 19 | POST | /api/settings/edit/general | auth | editSetting | Setting w, Statistic w, Redis w | {status:'OK'} | routes/settings.route.js:58 |
| 20 | POST | /api/settings/edit/list | auth | — (нет!) | Redis w, файлы dist/*.dat w | счётчики | routes/settings.route.js:87 |
| 21 | POST | /api/settings/statistics/clear | auth | — | — | нет ответа (TODO) | routes/settings.route.js:137 |
| 22 | GET | /api/info/groups | auth | — | Group r | [Group] | routes/info.route.js:26 |
| 23 | GET | /api/info/offers | auth | — | Offer r | [Offer] | routes/info.route.js:38 |
| 24 | GET | /api/info/stats/dashboard | auth | — | Statistic r, Setting r | {stats,last_click,last_amount} | routes/info.route.js:50 |
| 25 | GET | /api/info/stats | auth | — | Statistic r | {stats} | routes/info.route.js:213 |

PUT-эндпоинтов нет вовсе (все правки — POST).

## 7. Дефекты для рерайта

1. **«Первый пользователь = владелец»**: регистрация происходит при первом login, если таблица users пуста (routes/auth.route.js:22-29) — риск занятия аккаунта первым запросом; нет отдельного эндпоинта регистрации.
2. **`errorHandler` не является error-middleware** (нет 4-го параметра) — все необработанные исключения внутри async-хендлеров без собственного try/catch упали бы процесс/дефолтный хендлер Express; фактически каждая ошибка обрабатывается 500-строкой/объектом вручную (middleware/error.middleware.js:1-3).
3. **500 с объектом ошибки клиенту** — утечка internals: routes/create.route.js:46-48, 72-74.
4. **500 вместо 4xx повсеместно** при невалидных входных (path-параметры, query) — нет проверки ObjectId и обязательных query с корректным статусом; в info.route.js:54-56 и 222-226 отсутствует `return` после `res.status(500)` → риск «headers already sent».
5. **`POST /api/settings/statistics/clear` не отвечает** (TODO, нет res/next) — клиент зависает (routes/settings.route.js:137-143); путь без `/` в начале.
6. **Невалидируемые write-эндпоинты**: `/api/edit/filters/create` (произвольные filters, routes/create.route.js:173-181) и `/api/settings/edit/list` (произвольные массивы строк уходят и в Redis, и в файлы, routes/settings.route.js:87-133).
7. **Рассинхрон Redis/файлы при очистке списка**: `setArray` не удаляет ключ при пустом массиве (utils/arrayRedis.utils.js:7-17), а файл пишется пустым (routes/settings.route.js:115-129) — после clear Redis продолжит отдавать старый список при рестарте-заливке.
8. **Postback**: сравнение секрета `===` (не timing-safe), отсутствие проверки NaN у payout, обновление всех записей с subid без ограничения по дате/группе, 500 при отсутствующих query (routes/postback.route.js:15-28).
9. **Уникальность клика по ip глобально**, без учёта группы/стрима (routes/tracker.route.js:54-63) — межгрупповые ложные не-уники.
10. **Статистика считается в памяти** (`.lean()` + JS-агрегация) вместо Mongo aggregation (routes/info.route.js:104-114, 240-262) — не масштабируется; плюс сортировка всей выборки.
11. **`isLength({min:1,max:720})` на числовом `timeUnic`** — проверяется длина строкового представления, а не значение; сообщение «Min 1 hour. Max 720 hour» не обеспечивается (utils/validators.utils.js:49-53, 129-134); следует `isInt({min:1,max:720})`.
12. **Расхождение текста и правила** для logLimitClick: текст «Min 5», правило `min:1` (utils/validators.utils.js:84-90).
13. **`trashUrl` не валидируется и не входит в editSetting**, но обновляется через edit/general без проверок (routes/settings.route.js:66-72).
14. **REST-несимметрия**: logout через GET с редиректом на `/` (routes/auth.route.js:9-13); PUT не используется; DELETE с хвостовым слэшем `/offers/:id/`.
15. **Трекер и postback до `express.json`/session** (app.js:60-63) — у них нет тела и сессии; при рерайте нужно явно зафиксировать, что это публичные GET.
16. **Мертвый код**: `GET /postback/` и `GET /api/edit/dashboard` — заглушки; `removeAllStreams` (models/Group.js:39-43) не используется; `delSetting` (utils/settings.utils.js:57-59) не используется.
17. **Без rate-limit и CSRF** для login и `/api/*`; helmet без CSP/frameguard (закомментирован, app.js:53).
18. **Redis-хост захардкожен** `'redis'` (utils/redis.js:3), порт не задан — конфигурируемость отсутствует.
19. **Инконсистентные тела ответов** (строка vs `{message}` vs `{status}`) и статусов (201 только в двух местах) — см. §3.
20. **session-logout без проверки авторизации** и отсутствие инвалидации всех вкладок; session store — Mongo (app.js:67-71) без TTL-настройки в видимом коде (настройки store не показаны в app.js:64-75 — назначение опций не ясно из-за обрезки вывода).
