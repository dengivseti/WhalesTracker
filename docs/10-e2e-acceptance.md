# WhalesTracker — E2E-сценарии и критерии приёмки повторения

> Канонические сквозные сценарии для проверки повторения системы с нуля. Принцип: **поведение — контракт** — статусы, заголовки и структуры JSON воспроизводятся дословно.
>
> ⚠️ **Все HTTP-примеры ниже не верифицированы живым прогоном (схема из кода).** Docker-контур не поднимался (решение контроллера): каждый запрос/ответ реконструирован из кода сервера и промаркирован источником `файл:строка`. Плейсхолдеры (`<sessionId>`, `<mongoId>`, даты, `Content-Length`, `ETag`) в живом прогоне получат реальные значения; состав полей и статусы — контракт.
>
> См. также: [справочник API](02-api.md) (эндпоинты, валидаторы, статусы), [домен и движок трекера](03-domain-tracker.md) (модели, фильтры, типы редиректов), [UI-спецификация](08-ui-spec.md) (экранная обвязка тех же сценариев), [сверка внешней документации](06-docs-vs-code.md). Дублирование против 02/03/08 заменено ссылками.

## 1. Договорённости сценариев

- Базовый URL: `http://localhost:5000` — `process.env.port || 5000` (app.js:11).
- Все `/api/*`-запросы (кроме логина) требуют cookie сессии, полученную на шаге логина: `Cookie: connect.sid=s%3A<sessionId>.<signature>` (app.js:64-75; middleware/auth.middleware.js:3).
- Сессия: MongoStore, коллекция `sessions`, cookie живёт 24 часа (app.js:66-75).
- Трекер `GET /{slug}` и постбек `GET /postback/...` подключены **до** `express.json` и session — это публичные GET без тела и сессии (app.js:60-63).
- Каждый ответ проходит helmet-набор заголовков (app.js:51-58): `X-DNS-Prefetch-Control: off`, `Expect-CT: max-age=0`, `X-Download-Options: noopen`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-XSS-Protection: 1; mode=block`; `X-Powered-By` скрыт (hidePoweredBy).
- Часть известных дефектов оригинала сознательно используется сценарием (авторегистрация первого пользователя). Полный список дефектов, которые при повторении воспроизводить **не нужно**, — §5.

## 2. Главный E2E-путь (happy path)

Последовательность: логин (авторегистрация владельца) → создание группы → создание offer → создание потока в группе → фильтры потока → клик по трекер-ссылке `/{groupName}?q={keyword}` → постбек от партнёрки → данные в статистике.

### Шаг 1. Первый логин (авторегистрация владельца)

При пустой коллекции `users` первый `POST /api/auth/login` **создаёт** пользователя (bcrypt cost 12); иначе — сверка пароля (routes/auth.route.js:22-35). Валидатор: `username` alphanumeric 3–56, `password` alphanumeric 6–56 (utils/validators.utils.js:3-18).

```bash
curl -i -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"secret1"}'
```

```http
POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{"username":"admin","password":"secret1"}
```

Ответ (не верифицировано живым прогоном, схема из кода — routes/auth.route.js:37-43):

```http
HTTP/1.1 201 Created
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 72
ETag: W/"<hash>"
Set-Cookie: connect.sid=s%3A<sessionId>.<signature>; Path=/; Expires=<now+24h>; HttpOnly
Connection: keep-alive

{"id":"<userMongoId>","message":"ok"}
```

Дальнейшие шаги используют `connect.sid` из `Set-Cookie`.

### Шаг 2. Создание группы

`POST /api/edit/group/create`, middleware `auth` + валидатор `addGroup` (routes/create.route.js:58): `label` alphanumeric 3–15, `name` alphanumeric 3–20 (`name` — уникальный slug будущей трекер-ссылки), `typeRedirect` exists, `checkUnic`/`useLog`/`isActive` boolean, `timeUnic` numeric (utils/validators.utils.js:86-107). Ответ — сырой результат `save()` (routes/create.route.js:64-66). Схема документа — models/Group.js:3-18; подробности полей — [03-domain-tracker.md §1.1](03-domain-tracker.md).

```bash
curl -i -s -X POST http://localhost:5000/api/edit/group/create \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>' \
  -d '{"label":"TestGroup","name":"testgroup","typeRedirect":"httpRedirect","code":"http://example.com/group-fallback","checkUnic":false,"timeUnic":24,"useLog":true,"isActive":true}'
```

Ответ (не верифицировано живым прогоном, схема из кода — models/Group.js:3-18):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 253
ETag: W/"<hash>"
Connection: keep-alive

{"_id":"<groupMongoId>","label":"TestGroup","name":"testgroup","typeRedirect":"httpRedirect","code":"http://example.com/group-fallback","checkUnic":false,"timeUnic":24,"useLog":true,"isActive":true,"date":"<ISO-date>","streams":[]}
```

Сценарий сознательно ставит `checkUnic:false`, чтобы не зависеть от глобальной по-IP уникальности (известная проблема №9, §5).

### Шаг 3. Создание offer

`POST /api/edit/offers/edit`, валидатор `addOffer` (routes/create.route.js:24; utils/validators.utils.js:160-179). Без `_id` — создание, ответ — результат `save()`; с `_id` — updateOne и эхо тела (routes/create.route.js:30-41). Тип `split` распределяет URL по весам `percent` (utils/url.utils.js:7-18) — см. [03-domain-tracker.md](03-domain-tracker.md).

```bash
curl -i -s -X POST http://localhost:5000/api/edit/offers/edit \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>' \
  -d '{"name":"MainOffer","type":"split","offers":[{"url":"http://partner.example.com/offer1?cid=[subid]","percent":70},{"url":"http://partner.example.com/offer2?cid=[subid]","percent":30}]}'
```

Ответ (не верифицировано живым прогоном, схема из кода — models/Offer.js:3-13):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 372
ETag: W/"<hash>"
Connection: keep-alive

{"_id":"<offerMongoId>","date":"<ISO-date>","name":"MainOffer","type":"split","offers":[{"_id":"<subdocId1>","url":"http://partner.example.com/offer1?cid=[subid]","percent":70},{"_id":"<subdocId2>","url":"http://partner.example.com/offer2?cid=[subid]","percent":30}]}
```

### Шаг 4. Создание потока (stream) в группе

`POST /api/edit/stream/create`, валидатор `addStream` (routes/create.route.js:156; utils/validators.utils.js:109-127). Поле `igGroup` вырезается из документа и используется как id группы: `Group.findById(igGroup).addToStream(streamId)` (routes/create.route.js:162-166; models/Group.js:20-28). Ответ — **201** с документом потока (routes/create.route.js:167). Схема — models/Stream.js:3-21.

```bash
curl -i -s -X POST http://localhost:5000/api/edit/stream/create \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>' \
  -d '{"igGroup":"<groupMongoId>","position":1,"name":"MobileStream","typeRedirect":"httpRedirect","code":"http://partner.example.com/landing?cid=[subid]","relation":false,"useLog":true,"isActive":true,"isBot":false}'
```

Ответ (не верифицировано живым прогоном, схема из кода — models/Stream.js:3-21):

```http
HTTP/1.1 201 Created
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 331
ETag: W/"<hash>"
Connection: keep-alive

{"_id":"<streamMongoId>","position":1,"name":"MobileStream","clicksHit":0,"clicksUnic":0,"clicksBot":0,"typeRedirect":"httpRedirect","code":"http://partner.example.com/landing?cid=[subid]","useLog":true,"isActive":true,"date":"<ISO-date>","relation":false,"isBot":false,"filters":[]}
```

### Шаг 5. Фильтры потока

`POST /api/edit/filters/create` — **без валидатора** (routes/create.route.js:173-181; известная проблема №6, §5). Тело `{ igStream, filters }`, элементы `{ name, action, position }`; фильтры сортируются по `position` при клике (tracker/stream.js:10). Поддерживаемые имена фильтров и семантика — [03-domain-tracker.md](03-domain-tracker.md) (tracker/filters.js:128-163).

```bash
curl -i -s -X POST http://localhost:5000/api/edit/filters/create \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>' \
  -d '{"igStream":"<streamMongoId>","filters":[{"name":"device","action":["mobile"],"position":1},{"name":"countries","action":["RU"],"position":2}]}'
```

Ответ (не верифицировано живым прогоном, схема из кода — routes/create.route.js:178, эхо `req.body`):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 143
ETag: W/"<hash>"
Connection: keep-alive

{"igStream":"<streamMongoId>","filters":[{"name":"device","action":["mobile"],"position":1},{"name":"countries","action":["RU"],"position":2}]}
```

### Шаг 6. Клик по трекер-ссылке `GET /{groupName}?q={keyword}`

Формат: `/{Group.name}?{getKey}={keyword}` — `:id` это slug `Group.name`, **не** `_id`; имя GET-параметра задаётся настройкой `getKey`, по умолчанию `q` (routes/tracker.route.js:30-37; utils/settings.utils.js:15; tracker/userInfo.js:41). Из заголовков запроса извлекаются `User-Agent` (device/browser/os), `Accept-Language`, `Referer`/`Referrer`, IP клиента (+ geoip страна/город) — tracker/userInfo.js:5-31. Алгоритм выбора потока: сортировка по `position` → первый активный поток, прошедший фильтры (`relation=true` — все, `false` — любой; пустой массив `filters` → поток не подходит) → `getUrl(...)` с подстановкой макроса `[subid]` → редирект (routes/tracker.route.js:56-73; tracker/stream.js:6-28; utils/url.utils.js:103). При `useLog` клик пишется в `Statistic` с TTL-полем `expireAt` (routes/tracker.route.js:74-98).

```bash
curl -i -s 'http://localhost:5000/testgroup?q=buy+iphone' \
  -H 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' \
  -H 'Accept-Language: ru-RU,ru;q=0.9' \
  -H 'Referer: https://google.com/'
```

Ответ для потока `httpRedirect` (не верифицировано живым прогоном, схема из кода — tracker/redirect.js:11-12 `res.redirect(url)`; `subid = shortid.generate().toLowerCase()` — routes/tracker.route.js:59; `[subid]` заменён — utils/url.utils.js:103):

```http
HTTP/1.1 302 Found
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Location: http://partner.example.com/landing?cid=kjgh3456fh
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 71
Connection: keep-alive

Found. Redirecting to http://partner.example.com/landing?cid=kjgh3456fh
```

Значение `kjgh3456fh` — пример сгенерированного subid; оно же попадает в `Statistic.subid` и нужно для постбека (шаг 8). Поведение остальных `typeRedirect` (jsRedirect, metaRefresh, offer, remote, show* и статусы 400/403/404/500) — таблица в [03-domain-tracker.md](03-domain-tracker.md); источник — tracker/redirect.js:10-239.

### Шаг 7. Получение postbackKey

Сгенерированный при первом старте `postbackKey` (utils/settings.utils.js:7) виден через `GET /api/settings/info` (routes/settings.route.js:21-40) — возвращает плоскую карту `general[key]=value` и длины Redis-списков.

```bash
curl -i -s http://localhost:5000/api/settings/info \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>'
```

Ответ (не верифицировано живым прогоном, схема из кода — routes/settings.route.js:21-40; дефолты — utils/settings.utils.js:6-21):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 412
ETag: W/"<hash>"
Connection: keep-alive

{"general":{"postbackKey":"abc123def","clearDayStatistic":"30","theme":"light","language":"English","trash":"url","trashUrl":"http://example.com","logLimitClick":"150","logLimitAmount":"50","getKey":"q","protect":"0","sendTelegram":"0","telegramBotToken":"","telegramChatId":"","clearRemote":"30"},"intBlackIp":0,"intBlackSignature":0,"intRemoteUrl":0}
```

(`abc123def` — пример значения; в живом прогоне — фактический `shortid().toLowerCase()`.)

### Шаг 8. Постбек от партнёрки

`GET /postback/{postbackKey}?subid={subid}&payout={payout}` (routes/postback.route.js:15). Сравнение ключа обычным `===`; обязательны оба query; действие — `Statistic.where({subid}).updateOne({ amount: +payout })`, т.е. обновляются **все** записи с этим subid (routes/postback.route.js:18-24; известная проблема №8, §5).

```bash
curl -i -s 'http://localhost:5000/postback/abc123def?subid=kjgh3456fh&payout=12.5'
```

Ответ (не верифицировано живым прогоном, схема из кода — routes/postback.route.js:25):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 16
ETag: W/"<hash>"
Connection: keep-alive

{"status":"ok"}
```

### Шаг 9. Данные в статистике (dashboard)

Клики пишутся при `useLog` (routes/tracker.route.js:74-98), payout дописывается постбеком (routes/postback.route.js:22-24). `GET /api/info/stats/dashboard?type=day` — почасовая агрегация сегодня+вчера, вся выборка в память (routes/info.route.js:50-207; известная проблема №10, §5).

```bash
curl -i -s 'http://localhost:5000/api/info/stats/dashboard?type=day' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>'
```

Ответ (не верифицировано живым прогоном, схема из кода — routes/info.route.js:145-207; элемент `stats` создаётся для каждого часа 0–23 со счётчиками; клик в 14:xx, после постбека `amount=12.5`; `last_click`/`last_amount` лимитируются настройками `logLimitClick`/`logLimitAmount` — routes/info.route.js:107-114):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 2144
ETag: W/"<hash>"
Connection: keep-alive

{"stats":[
  {"value":0,"hits":0,"uniques":0,"sales":0,"amount":0,"hits_last":0,"uniques_last":0,"sales_last":0,"amount_last":0},
  {"value":1,"hits":0,"uniques":0,"sales":0,"amount":0,"hits_last":0,"uniques_last":0,"sales_last":0,"amount_last":0},
  "… элементы для часов 2–13 с нулевыми счётчиками (та же структура) …",
  {"value":14,"hits":1,"uniques":1,"sales":1,"amount":12.5,"hits_last":0,"uniques_last":0,"sales_last":0,"amount_last":0},
  "… элементы для часов 15–23 с нулевыми счётчиками (та же структура) …"
],"last_click":[
  {"date":"09/10/2026, 02:14:35","group":"TestGroup","stream":"MobileStream","device":"mobile","country":"RU","city":"Moscow","ip":"203.0.113.5","useragent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) …","unique":true,"isBot":false,"out":"http://partner.example.com/landing?cid=kjgh3456f"}
],"last_amount":[
  {"date":"09/10/2026, 02:14:35","group":"TestGroup","stream":"MobileStream","device":"mobile","country":"RU","city":"Moscow","ip":"203.0.113.5","amount":12.5,"useragent":"Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) …"}
]}
```

Формат `date` — `dd/MM/yyyy, hh:mm:ss` (routes/info.route.js:116-120); `useragent` усечён до 500 символов, `out` — до 50 (routes/info.route.js:129-130). Элементы с нулевым `amount` в `last_amount` не попадают (routes/info.route.js:107-109).

### Шаг 10. Агрегированная статистика за период

`GET /api/info/stats?startDate=yyyy-MM-dd&endDate=yyyy-MM-dd&type=day|country|query|device` — группировка в JS, ответ `{stats:[...]}` (routes/info.route.js:213-277).

```bash
curl -i -s 'http://localhost:5000/api/info/stats?startDate=2026-10-09&endDate=2026-10-09&type=query' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>'
```

Ответ (не верифицировано живым прогоном, схема из кода — routes/info.route.js:253-277):

```http
HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
Expect-CT: max-age=0
X-Download-Options: noopen
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 92
ETag: W/"<hash>"
Connection: keep-alive

{"stats":[{"hits":1,"uniques":1,"sales":1,"amount":12.5,"value":"buy iphone"}]}
```

Вспомогательные проверки созданного: `GET /api/info/groups` (routes/info.route.js:26), `GET /api/info/offers` (routes/info.route.js:38), `GET /api/edit/group/:id` (routes/create.route.js:74) — полные схемы в [02-api.md §4](02-api.md).

## 3. Негативные сценарии

Все примеры — не верифицировано живым прогоном (схема из кода). Заголовки helmet/Content-Type как в §2, ниже для краткости опущены только они.

### 3.1 Неверный логин

```bash
curl -i -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"wrongpw"}'
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8

{"message":"Incorrect data"}
```

(routes/auth.route.js:32-35.)

### 3.2 Валидационная ошибка логина

```bash
curl -i -s -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"abc"}'
```

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json; charset=utf-8

{"message":"Password must have length min 6 max 56 characters"}
```

(routes/auth.route.js:18-20; utils/validators.utils.js:11-18 — возвращается **только первая** ошибка.)

### 3.3 Валидационная ошибка создания группы

```bash
curl -i -s -X POST http://localhost:5000/api/edit/group/create \
  -H 'Content-Type: application/json' \
  -H 'Cookie: connect.sid=s%3A<sessionId>.<signature>' \
  -d '{"label":"ab","name":"testgroup2","typeRedirect":"httpRedirect","code":"http://example.com","checkUnic":false,"timeUnic":24,"useLog":true,"isActive":true}'
```

```http
HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json; charset=utf-8

{"message":"Label group must be alphanumeric string length min 3 max 15 characters"}
```

(routes/create.route.js:60-63; utils/validators.utils.js:87-92.)

### 3.4 Клик по несуществующей группе → trash

```bash
curl -i -s 'http://localhost:5000/nosuchgroup?q=x'
```

```http
HTTP/1.1 302 Found
Location: http://example.com
Vary: Accept
Content-Type: text/plain; charset=utf-8

Found. Redirecting to http://example.com
```

(routes/tracker.route.js:35-43 → trash-редирект; `trashUrl` default `http://example.com` — utils/settings.utils.js:12. При настройке `trash === 'notFound'` вместо этого отдаётся HTML-страница 404 с `Location` — routes/tracker.route.js:14-20. Клик по **неактивной** группе ведёт себя так же — routes/tracker.route.js:41-43.)

### 3.5 Неавторизованный доступ к API

```bash
curl -i -s http://localhost:5000/api/info/groups
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"message":"Not Authenticated!"}
```

(middleware/auth.middleware.js:3.)

### 3.6 Несуществующий путь

```bash
curl -i -s http://localhost:5000/api/nope
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json; charset=utf-8

"Page not found"
```

(middleware/error.middleware.js:2 — строка, не объект.)

### 3.7 Постбек с неверным ключом

```bash
curl -i -s 'http://localhost:5000/postback/wrongkey?subid=kjgh3456fh&payout=12.5'
```

```http
HTTP/1.1 500 Internal Server Error
Content-Type: application/json; charset=utf-8

"Something went wrong"
```

(routes/postback.route.js:27 — строка, не объект; то же при отсутствии `subid` или `payout`. Статус 500 вместо 4xx — известная проблема №8, §5.)

### 3.8 Поток без подходящих фильтров → фолбэк на группу

Если у потока пустой массив `filters` — он **никогда** не выбирается (tracker/stream.js:6-9); если фильтры не прошли — берётся следующий поток по `position`, а при исчерании — редирект по настройкам группы `typeRedirect`/`code` с логом при `group.useLog` (routes/tracker.route.js:103-132). Для группы из §2, шаг 2 (`code: http://example.com/group-fallback`), клик с десктопным UA (фильтр `device: mobile` не пройден):

```http
HTTP/1.1 302 Found
Location: http://example.com/group-fallback
Vary: Accept
Content-Type: text/plain; charset=utf-8

Found. Redirecting to http://example.com/group-fallback
```

(не верифицировано живым прогоном; routes/tracker.route.js:103-132; utils/url.utils.js:103.)

## 4. Чек-лист приёмки: повторение успешно, если…

Каждый пункт проверяем командой из §2/§3 (или эквивалентной). «Дословно» означает совпадение строки/структуры с примером.

**Аутентификация**
1. Логин на пустой БД возвращает `201` с телом `{"id":"<mongoId>","message":"ok"}` и `Set-Cookie: connect.sid=…; Path=/; …; HttpOnly` (§2, шаг 1).
2. Повторный логин с верным паролем — `201`; с неверным — `400 {"message":"Incorrect data"}` (§3.1).
3. `password` короче 6 символов — `422` с дословным `"Password must have length min 6 max 56 characters"` (§3.2).
4. Любой `/api/*`-запрос без cookie сессии — `401 {"message":"Not Authenticated!"}` (§3.5).

**Группа / offer / поток / фильтры**
5. `POST /api/edit/group/create` возвращает `200` и документ со всеми полями схемы Group (`_id`, `label`, `name`, `typeRedirect`, `code`, `checkUnic`, `timeUnic`, `useLog`, `isActive`, `date`, `streams: []`) (§2, шаг 2).
6. `label` из 2 символов — `422` с дословным `"Label group must be alphanumeric string length min 3 max 15 characters"` (§3.3).
7. `POST /api/edit/offers/edit` без `_id` возвращает `200` и документ Offer с вложенными `offers[]._id/url/percent` (§2, шаг 3).
8. `POST /api/edit/stream/create` возвращает `201`, документ содержит `clicksHit:0, clicksUnic:0, clicksBot:0, filters:[]`, и `_id` потока появляется в `streams` группы (проверить `GET /api/edit/group/<id>`) (§2, шаг 4; routes/create.route.js:162-166).
9. `POST /api/edit/filters/create` возвращает `200` — эхо тела без изменений (§2, шаг 5).

**Клик**
10. `GET /testgroup?q=buy+iphone` с mobile-UA даёт `302`, `Location` — URL потока с **заменённым** `[subid]` на реально сгенерированный subid (не содержащий плейсхолдер), тело `Found. Redirecting to <url>` (§2, шаг 6).
11. Тот же клик с десктопным UA (фильтр `device:mobile` не пройден) даёт `302` на group-level `code` (§3.8).
12. Клик по `GET /nosuchgroup?q=x` — `302` на `http://example.com` (дефолт `trashUrl`) (§3.4).
13. `GET /` без группы — trash-редирект; при `trash=notFound` — HTML 404 (routes/tracker.route.js:14-28).
14. Потоки проверяются по возрастанию `position`; первый прошедший фильтры выигрывает (routes/tracker.route.js:56-73) — проверить, поменяв `position` двух потоков с разными URL.

**Постбек**
15. `GET /postback/<postbackKey>?subid=<subid>&payout=12.5` возвращает `200 {"status":"ok"}`, и `amount:12.5` появляется у записи статистики с этим subid (§2, шаги 7–9).
16. Неверный ключ или отсутствие `subid`/`payout` — `500` **строкой** `"Something went wrong"` (§3.7).

**Статистика**
17. `GET /api/info/stats/dashboard?type=day` возвращает `200` c ключами ровно `stats`, `last_click`, `last_amount`; элементы `stats` содержат ровно `value, hits, uniques, sales, amount, hits_last, uniques_last, sales_last, amount_last`; `value` — час `0..23` (§2, шаг 9).
18. Элемент `last_click` содержит ровно `date, group, stream, device, country, city, ip, useragent, unique, isBot, out`; `useragent` ≤ 500 символов, `out` ≤ 50 (§2, шаг 9; routes/info.route.js:115-131).
19. `GET /api/info/stats?startDate&endDate&type=query` возвращает `200 {"stats":[{"hits","uniques","sales","amount","value"}]}`, где `value` = keyword клика (§2, шаг 10).
20. Отсутствие любого из query у `/api/info/stats` — `500 {"message":"Something went wrong"}` (routes/info.route.js:217-223; поведение «без return» из §5 НЕ требуется).

**Общее**
21. Несуществующий путь — `404` строкой `"Page not found"` (§3.6).
22. `POST /api/settings/statistics/clear` в повторении **не** должен зависать — зависание оригинала помечено «воспроизводить не нужно» (§5, №5).

## 5. Известные проблемы (известная проблема / воспроизводить не нужно)

Полные перечни с источниками: [02-api.md §7 «Дефекты для рерайта»](02-api.md) (20 пунктов) и [06-docs-vs-code.md](06-docs-vs-code.md) (расхождения с внешней документацией). При повторении системы эти дефекты **воспроизводить не нужно** — они фиксируются, а не копируются. Ниже — пункты, напрямую влияющие на E2E-сценарии этого документа:

| # | Проблема (кратко) | Влияние на сценарии | Источник |
|---|---|---|---|
| 1 | Первый пользователь = владелец (авторегистрация при пустой users) | Шаг 1 §2 **использует** это поведение осознанно (иного способа создать пользователя нет); в повторении допустимо заменить явной регистрацией при сохранении контрактных статусов | routes/auth.route.js:22-29; docs/02-api.md §7.1 |
| 4 | 500 вместо 4xx при невалидных query; отсутствие `return` после `res.status(500)` в info.route.js | Пункты чек-листа 20, 22: повторение должно отдать корректный 4xx/единичный ответ, а не 500 и не двойной ответ | routes/info.route.js:53-55, 217-223; docs/02-api.md §7.4 |
| 5 | `POST /api/settings/statistics/clear` — мёртвый эндпоинт (TODO, зависание) | Не вызывать в сценариях; в повторении эндпоинт должен отвечать | routes/settings.route.js:137-143; docs/02-api.md §7.5 |
| 8 | Postback: `===` вместо timing-safe, нет NaN-проверки payout, обновление всех записей с subid, 500 при отсутствующих query | Шаг 8 §2 воспроизводит контракт успеха `{"status":"ok"}`; «грязные» аспекты — не воспроизводить | routes/postback.route.js:15-28; docs/02-api.md §7.8 |
| 9 | Уникальность клика по IP глобально, без привязки к группе | Главный путь обходит (`checkUnic:false`); тестировать глобальную уникальность не нужно | routes/tracker.route.js:46-55; docs/02-api.md §7.9 |
| 11 | `isLength({min:1,max:720})` на числовом `timeUnic` | Проверку границы 720 ч при приёмке не закладывать | utils/validators.utils.js:100-105, 128-134; docs/02-api.md §7.11 |

Остальные дефекты (№2, 3, 6, 7, 10, 12–20 из [02-api.md §7](02-api.md)) на сквозные сценарии не влияют; при повторении также помечены «известная проблема / воспроизводить не нужно».

## 6. Что проверять по другим документам

- Таблица всех 26 эндпоинтов, валидаторы, статусы ошибок — [02-api.md](02-api.md).
- Модели, семантика фильтров, полный список типов редиректов, TTL-индексы — [03-domain-tracker.md](03-domain-tracker.md).
- Экранная обвязка этих же сценариев (логин, группы, потоки, статистика, настройки) — [08-ui-spec.md](08-ui-spec.md).
- Внешний вид/деплой — [04-screens.md](04-screens.md), [09-deployment.md](09-deployment.md).
