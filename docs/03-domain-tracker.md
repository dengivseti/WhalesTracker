# WhalesTracker — Домен и движок трекера

> Модели данных, логика распределения трафика, фильтры, типы редиректов, постбеки и статистика. Все ссылки — файл:строки.

# Задача C — Домен и движок трекера (WhalesTracker)

Стек: Node.js + Express + Mongoose (MongoDB), Redis-массивы для чёрных списков, TTL-индексы Mongo. Все пути относительно корня репозитория.

---

## 1. Модели (models/*.js)

### 1.1 Group (models/Group.js:4-15)

| Поле | Тип | Default | Назначение |
|---|---|---|---|
| label | String, required | — | Отображаемое название группы (models/Group.js:5) |
| name | String, required, unique | — | Слаг из URL трекера, по нему ищется группа (models/Group.js:6, routes/tracker.route.js:20) |
| typeRedirect | String, required | 'httpRedirect' | Тип редиректа группы по умолчанию (models/Group.js:7-11) |
| code | String | — | Значение редиректа (URL / JS-код / HTML / id Offer — зависит от typeRedirect) (models/Group.js:12) |
| checkUnic | Boolean, required | false | Включить проверку уникальности по IP (models/Group.js:13-14) |
| timeUnic | Number, required | 24 | Окно уникальности в часах (models/Group.js:15-16, используется как subHours в routes/tracker.route.js:33-38) |
| useLog | Boolean, required | true | Писать ли статистику на уровне группы (models/Group.js:17-18) |
| isActive | Boolean, required | true | Группа активна (models/Group.js:19-20, проверка routes/tracker.route.js:27) |
| date | Date | Date.now | Дата создания (models/Group.js:21) |
| streams | [ObjectId → Stream] | [] | Список потоков группы (models/Group.js:22) |

Методы: `addToStream(id)` (models/Group.js:25-33), `removeStream(id)` (models/Group.js:35-42), `removeAllStreams()` (models/Group.js:44-47).

### 1.2 Stream (models/Stream.js:4-19)

| Поле | Тип | Default | Назначение |
|---|---|---|---|
| position | Number, required | — | Порядок проверки потока (меньше — раньше) (models/Stream.js:5, сортировка routes/tracker.route.js:41-43) |
| name | String, required | — | Название потока (models/Stream.js:6) |
| clicksHit | Number, required | 0 | Счётчик хитов (models/Stream.js:7) |
| clicksUnic | Number, required | 0 | Счётчик уников (models/Stream.js:8) |
| clicksBot | Number, required | 0 | Счётчик ботов (models/Stream.js:9) |
| typeRedirect | String, required | 'httpRedirect' | Тип редиректа потока (models/Stream.js:10-14) |
| code | String | — | Значение редиректа потока (models/Stream.js:15) |
| useLog | Boolean, required | true | Логировать клики этого потока (models/Stream.js:16-17) |
| isActive | Boolean, required | true | Поток активен (models/Stream.js:18-19) |
| date | Date | Date.now | Дата создания (models/Stream.js:20) |
| relation | Boolean, required | true | true — «И» (все фильтры), false — «ИЛИ» (любой фильтр); комментарий в коде (models/Stream.js:21) |
| isBot | Boolean, required | true | Признак «этот поток — для ботов», пишется в Statistic.isBot (models/Stream.js:22, routes/tracker.route.js:67) |
| filters | Array (schemaless) | — | Массив объектов фильтров `{name, action, ...}` (models/Stream.js:23, обрабатывается tracker/stream.js:7-10) |

Метод: `updateFilters(filters)` (models/Stream.js:26-29). Замечание: счётчики clicksHit/Unic/Bot в рассмотренных файлах нигде не инкрементируются — назначение не ясно (возможно, обновляются вне этих файлов).

### 1.3 Offer (models/Offer.js:4-14)

| Поле | Тип | Default | Назначение |
|---|---|---|---|
| date | Date | Date.now | Дата создания (models/Offer.js:5) |
| name | String, required | — | Название оффера (models/Offer.js:6) |
| type | String, required | — | Тип ротации: 'split' / 'evely' / 'rotator' (models/Offer.js:7, utils/url.utils.js:54-71) |
| offers | Array | — | Подмассив: `{ url: String required, percent: Number 0-100 default 100 }` (models/Offer.js:8-12) |

Индекс: `{ date: 1 }` (models/Offer.js:16).

### 1.4 Remote (models/Remote.js:4-14)

| Поле | Тип | Default | Назначение |
|---|---|---|---|
| query | String, required, unique | — | Ключевое слово (keyword), для которого зафиксирован URL (models/Remote.js:5) |
| url | String, required | — | Закреплённый URL (models/Remote.js:6) |
| date | Date | Date.now | Дата создания (models/Remote.js:7) |
| expireAt | Date | now + 5 дней | TTL — удаляется Mongo (models/Remote.js:8-11); реальный срок переопределяется настройкой `clearRemote` (utils/url.utils.js:43-47) |

Индекс TTL: `{ expireAt: 1 }, { expireAfterSeconds: 0 }` (models/Remote.js:15).

### 1.5 Setting (models/Setting.js:15-21)

Хранилище key-value настроек. Допустимые ключи (enum, models/Setting.js:3-18):

| key | Комментарий из кода |
|---|---|
| postbackKey | Ключ постбэка |
| clearDayStatistic | «day save logs» — срок хранения статистики (дни) |
| theme | Тема сайта light/dark |
| language | Язык |
| trash | Режим trash: 'notFound' или прямой редирект (routes/tracker.route.js:9-14) |
| trashUrl | URL для trash-трафика |
| logLimitClick | Лимит отображения последних кликов |
| logLimitAmount | Лимит отображения сумм |
| getKey | Имя GET-параметра с keyword |
| protect | Капча на логах |
| sendTelegram | Слать уведомления в Telegram |
| telegramBotToken | Токен Telegram-бота |
| telegramChatId | ID чата Telegram |
| clearRemote | Срок жизни Remote в днях |

Поля: `key` (String, required, unique, maxlength 50, enum) (models/Setting.js:19-25), `value` (String, maxlength 100) (models/Setting.js:26).

### 1.6 Statistic (models/Statistic.js:4-24)

| Поле | Тип | Default | Назначение |
|---|---|---|---|
| date | Date | Date.now | Момент клика (models/Statistic.js:5) |
| expireAt | Date | now + 5 дней | TTL записи; при создании перезаписывается `date + clearDayStatistic` дней (models/Statistic.js:6-9, routes/tracker.route.js:73-79) |
| group | ObjectId → Group, required | — | Группа клика (models/Statistic.js:10) |
| stream | ObjectId → Stream | — | Поток (null при фолбэке на группу) (models/Statistic.js:11) |
| out | String | — | Итоговый URL выхода (models/Statistic.js:12) |
| keyword | String | — | Ключевое слово из GET (models/Statistic.js:13) |
| redirect | String | — | Тип редиректа (models/Statistic.js:14) |
| device | String | — | mobile/desktop/tablet/other (tracker/userInfo.js:6-16) |
| country | String | — | Страна из geoip (models/Statistic.js:17) |
| city | String | — | Город из geoip (models/Statistic.js:18) |
| language | String | — | Первый язык Accept-Language (models/Statistic.js:19, routes/tracker.route.js:69) |
| unique | Boolean | — | Уникальность по IP+окну (models/Statistic.js:20) |
| isBot | Boolean | — | Флаг бота потока (models/Statistic.js:21) |
| ip | String | — | IP клиента (models/Statistic.js:22) |
| referer | String | — | Referer (models/Statistic.js:23) |
| useragent | String | — | Сырой UA (models/Statistic.js:24) |
| amount | Number | 0 | Выплата, обновляется постбэком (models/Statistic.js:25, routes/postback.route.js:22-24) |
| subid | String | — | shortid клика, ключ постбэка (models/Statistic.js:26, routes/tracker.route.js:44) |

Индексы: TTL `{ expireAt: 1 }` (models/Statistic.js:28), `{ date: 1 }` (models/Statistic.js:29).

### 1.7 User (models/User.js:4-8)

| Поле | Тип | Назначение |
|---|---|---|
| username | String, required, unique | Логин администратора (models/User.js:5) |
| password | String, required | Пароль (models/User.js:6); хеширование в этой модели не видно — назначение не ясно, проверять auth.route.js |

---

## 2. Схема URL трекера

- Маршрут: `GET /:id` — единственный публичный вход (routes/tracker.route.js:18). `:id` — `group.name`.
- `GET /` — редирект в trash (routes/tracker.route.js:16-20).
- Postback: `GET /<postback.route mount>/:id?subid=...&payout=...` (routes/postback.route.js:14) — проверяется наличие `subid` и `payout` (routes/postback.route.js:15-19).
- GET-параметр с именем из настройки `getKey` читается как keyword (tracker/userInfo.js:22, routes/tracker.route.js:47).
- В целевой URL подставляется только один макрос `[subid]` (utils/url.utils.js:88).
- Итоговый вид: `http://host/<group.name>?<getKey>=<keyword>` → ответ редиректа/HTML/JS.

---

## 3. Алгоритм выбора потока (routes/tracker.route.js:18-129)

1. `redirectTrash(res)`: если настройка `trash` == 'notFound' — рендер 404-страницы через redirect('404', trashUrl), иначе обычный редирект на `trashUrl` (routes/tracker.route.js:9-14).
2. `Group.findOne({ name: req.params.id }).populate('streams')`; если не найдена или `!group.isActive` — trash (routes/tracker.route.js:20-28).
3. Сбор userInfo (routes/tracker.route.js:29).
4. Уникальность: если `group.checkUnic && group.timeUnic > 0` — поиск Statistic по `ip` и `date >= now - timeUnic` часов; есть совпадения → `unique = false`, `count = candidate.length` (routes/tracker.route.js:31-39).
5. Потоки сортируются по `position` по возрастанию (routes/tracker.route.js:41-43). Генерируется `subid = shortid.generate().toLowerCase()` (routes/tracker.route.js:44).
6. Цикл по потокам: пропускаются неактивные; для активных вызывается `stream(user, stream)` — проверка фильтров (tracker/stream.js:4-31).
7. Первый прошедший поток: `getUrl(typeRedirect, code, subid, user.query, count)` — резолв URL (remote/offer/макрос, utils/url.utils.js:76-91); при `group.useLog && stream.useLog` сохраняется Statistic; выполняется `redirect(stream.typeRedirect, url, res)` — выход (routes/tracker.route.js:49-86).
8. Если ни один поток не прошёл — фолбэк на настройки самой группы: `getUrl(group.typeRedirect, group.code, ...)`, лог при `group.useLog`, `redirect(group.typeRedirect, url, res)` (routes/tracker.route.js:88-127).
9. Любое исключение — `500 "Something went wrong"` (routes/tracker.route.js:128).

Проверка фильтров одного потока (tracker/stream.js:4-31):
1. Если `filters` пустой/undefined → `false` (поток не проходит; tracker/stream.js:7-9).
2. Фильтры сортируются по `position` (tracker/stream.js:10).
3. `relation=true` (И): первый не прошедший фильтр → `false`; все прошли → `true`.
4. `relation=false` (ИЛИ): первый прошедший → `true`; иначе `false` (tracker/stream.js:16-28).

---

## 4. Полный список фильтров (tracker/filters.js)

Диспетчер `filtration(name, action)` — tracker/filters.js:124-157; неизвестное имя → `false`.

| name (параметр фильтра) | action | Логика | Строки |
|---|---|---|---|
| device | массив устройств | true, если хотя бы одно совпало: mobile, desktop, tablet, ipad, ipod, android, blackberry, mac, samsung, raspberry, androidTablet, kindleFire, SmartTV → соответствующие флаги useragent | tracker/filters.js:11-29, 36-42 |
| countries | массив стран | `user.geo.country` входит в массив | tracker/filters.js:60, 130 |
| cities | массив городов | `user.geo.city` входит в массив | tracker/filters.js:61, 138 |
| botIpv6 | boolean | true, если IP содержит ':' (IPv6) | tracker/filters.js:44-45 |
| browsers | массив | имя браузера из useragent входит в массив | tracker/filters.js:47-48 |
| os | массив | ОС из useragent входит в массив | tracker/filters.js:50-51 |
| platforms | массив | platform из useragent входит в массив; 'Windows' дополняется 'Microsoft Windows' | tracker/filters.js:53-57 |
| langBrowsers | массив | пересечение с `user.lang` (Accept-Language) | tracker/filters.js:63-69 |
| uaIncludes | массив подстрок | useragent.source содержит хотя бы одну | tracker/filters.js:71-77 |
| referIncludes | массив подстрок | referer содержит хотя бы одну | tracker/filters.js:79-85 |
| nullReffer | boolean | action=true и referer пуст | tracker/filters.js:87-88 |
| nullUa | boolean | action=true и UA пуст | tracker/filters.js:90-91 |
| maskIpv6 | массив масок | IP содержит одну из подстрок | tracker/filters.js:93-99 |
| useListBlackIps | boolean | IP в Redis-списке `blackIps` (проверка `ip_to_cidr`) | tracker/filters.js:109-113 |
| useListBotSignatures | boolean | UA содержит подпись из Redis-списка `blackSignatures` | tracker/filters.js:101-107 |

Источники чёрных списков — Redis-массивы через `getArray` (utils/arrayRedis.utils.js:53-64); заполнение фильтрами строк (utils/arrayRedis.utils.js:22-33).

---

## 5. Полный список типов редиректов (tracker/redirect.js:5-239)

| typeRedirect | Что делает |
|---|---|
| httpRedirect | `res.redirect(url)` — обычный HTTP-редирект (tracker/redirect.js:7) |
| jsRedirect | HTML с генерированным «мусорным» заголовком/контентом, `meta refresh` 1 сек + `window.location` (tracker/redirect.js:8-23) |
| iframe | Отдаёт text/javascript — «splashpage»-скрипт, открывающий URL в полноэкранном iframe (tracker/redirect.js:25-63) |
| javascript | HTML, где `code` вставляется как тело `<script>` (исполняется произвольный JS) (tracker/redirect.js:65-79) |
| metaRefresh | HTML с `<meta http-equiv="refresh" content="0; URL=...">` (tracker/redirect.js:81-96) |
| iframeRedirect | HTML: скрытый iframe `javascript:parent.location=...` + `location.replace` через 1 сек (tracker/redirect.js:98-121) |
| jsSelection | text/javascript: `window.location = url` в обработчике `window.onerror` (tracker/redirect.js:123-132) |
| remote | Редирект на URL, закешированный/выбранный для keyword (пусто → `res.end()`) (tracker/redirect.js:133-137) |
| offer | Редирект на URL оффера (пусто → `res.end()`) (tracker/redirect.js:138-142) |
| showHtml | 200, Content-Type text/html, тело = code (tracker/redirect.js:143-146) |
| showText | 200, text/plain, тело = code (tracker/redirect.js:147-149) |
| showJson | 200, application/json, тело = code (tracker/redirect.js:150-152) |
| 403 | 403 + имитация страницы ошибки (tracker/redirect.js:153-168) |
| 400 | 400 'Bad Request' (tracker/redirect.js:169-170) |
| 404 | 404 + страница «Object not found» (tracker/redirect.js:171-180) |
| 500 | 500 + страница «Server error» (tracker/redirect.js:181-191) |
| end | `res.end()` без тела (tracker/redirect.js:192-193) |
| default | `res.end()` (tracker/redirect.js:194) |

Резолв значения `code` перед редиректом (utils/url.utils.js:76-91):
- `remote` → `getUrlRemote(query)`: Redis-список `listUrl` (случайный), либо кэш Remote по query, либо случайный URL из списка с записью в Remote (TTL = `clearRemote` дней), иначе trashUrl (utils/url.utils.js:37-52).
- `offer` → `getUrlOffer(id, count)`: Offer по id; 1 URL → он; иначе ротация по `type`: split — взвешенная по percent (utils/url.utils.js:7-15), evely — равновероятно (utils/url.utils.js:17-20), rotator — по счётчику кликов (utils/url.utils.js:22-25); нет оффера/неизвестный тип → trashUrl (utils/url.utils.js:27-74).
- Макрос `[subid]` заменяется на сгенерированный subid (utils/url.utils.js:88).

---

## 6. userInfo — источники данных (tracker/userInfo.js:19-31)

| Поле | Источник |
|---|---|
| ip | `request-ip` (`requestIp.getClientIp(req)`) (tracker/userInfo.js:23) |
| isIpv6 | `ip.includes(':')` (tracker/userInfo.js:24) |
| geo | `geoip-lite` `lookup(ip)`; при промахе `{country:'', city:''}` (tracker/userInfo.js:26-31) |
| useragent | `req.useragent` (express-useragent, подключается вне этих файлов) (tracker/userInfo.js:32) |
| device | checkDevice: isMobile→'mobile', isDesktop→'desktop', isTablet→'tablet', иначе 'other' (tracker/userInfo.js:6-16, 33) |
| lang | `req.acceptsLanguages()` (tracker/userInfo.js:22, 34) |
| refer | `req.headers.referrer || req.headers.referer` (tracker/userInfo.js:26, 35) |
| params | `req.params.id` (имя группы) (tracker/userInfo.js:36) |
| query | `req.query[getKey]`, где `getKey` — настройка (tracker/userInfo.js:21, 37) |

---

## 7. Postback (routes/postback.route.js)

- Формат: `GET /<mount>/:id?subid=<subid>&payout=<сумма>` (routes/postback.route.js:14).
- `:id` должен совпадать с настройкой `postbackKey` (routes/postback.route.js:15).
- Обязательны query-параметры `subid` и `payout`, иначе 500 (routes/postback.route.js:15-19).
- Действие: `Statistic.where({ subid }).updateOne({ amount: +payout })` (routes/postback.route.js:22-24).
- Ответ: `{ status: 'ok' }` (routes/postback.route.js:25).
- Макросы: поддерживаются только `subid` и `payout`. Примечание: статистика по postback.amount сопоставляется только по subid, группа/поток не проверяются; `updateOne` без опций обновляет первый совпавший документ.

---

## 8. Statistic: события, структура, TTL

- Единственное «событие» — клик: документ создаётся в routes/tracker.route.js:57-80 (поток) и routes/tracker.route.js:97-123 (фолбэк на группу). Структура — см. §1.6.
- Условия записи: `group.useLog && stream.useLog` для потока; `group.useLog` для фолбэка (routes/tracker.route.js:58, 96).
- TTL: поле `expireAt` = момент клика + `clearDayStatistic` дней (настройка Setting, routes/tracker.route.js:73-79); TTL-индекс `{ expireAt: 1 }, { expireAfterSeconds: 0 }` (models/Statistic.js:28). Схемный дефолт +5 дней (models/Statistic.js:6-9).
- Постбэк дозаписывает только `amount` по subid (routes/postback.route.js:22-24).
- Счётчики кликов лежат не в Statistic, а в Stream.clicksHit/clicksUnic/clicksBot (models/Stream.js:7-9); инкременты в этих файлах не видны.

---

## 9. Замечания для рерайта

1. **Инъекции в redirect.js**: `url`/`code` интерполируются прямо в HTML/JS-шаблоны без экранирования (tracker/redirect.js:11-22, 66-78, 100-120, 126-131) — XSS/произвольный JS по дизайну, но при рерайте стоит валидировать/экранировать хотя бы кавычки.
2. **statistic.save() без await** (routes/tracker.route.js:81, 124) — тихие потери записей, необработанные rejection.
3. **Подсчёт уникальности ищет по IP без фильтра по группе** — любой клик с того же IP в окне timeUnic обнуляет уникальность для всех групп (routes/tracker.route.js:33-38).
4. **Пустой filters = поток никогда не сработает** (tracker/stream.js:7-9 возвращает false); интуитивнее было бы «поток без фильтров проходит всегда» — задокументировать или изменить.
5. **Фолбэк-лог не ставит `stream`** — документ без stream; отличить фолбэк можно только по null (routes/tracker.route.js:97-123).
6. **`isBot` в Statistic берётся из потока**, а не из реального детекта ботов — фильтры ботов лишь маршрутизируют, бот-статус не вычисляется (routes/tracker.route.js:67, models/Stream.js:22).
7. **Счётчики Stream.clicks\* не инкрементируются** в рассмотренных файлах — назначение не ясно (возможно, мёртвый код или внешний процесс).
8. **Ошибки all → 500 «Something went wrong»** без логирования (routes/tracker.route.js:128, routes/postback.route.js:30).
9. **Постбэк**: нет проверки источника (кроме статического ключа), `updateOne` обновляет первый документ, `+payout` без валидации (routes/postback.route.js:14-26).
10. **Настройка value — String maxlength 100** (models/Setting.js:26): числовые настройки (clearDayStatistic, clearRemote, timeUnic) хранятся строками и конвертируются на лету — источник ошибок типов.
11. **Мёртвый код**: в tracker/stream.js ветки `isUsed = false` при `!relation` (tracker/stream.js:25-27) не влияют на результат (ранее уже был return). В redirect.js case 'remote' и 'offer' дублируют httpRedirect-поведение.
12. **Пароль User без схемы хеширования в модели** (models/User.js:6) — при рерайте вынести хеширование в слой аутентификации явно (назначение не ясно без auth.route.js).
13. **Cookie-механика «iframe»-редиректа** — скопированный legacy-скрипт (tracker/redirect.js:25-63): при рерайте переписать или удалить; `document.write` и setInterval-скролл устарели.
14. **Synchronous loop с await в цикле потоков** (routes/tracker.route.js:49-86) — приемлемо для последовательного выбора, но при большом числе потоков/фильтров с Redis-вызовами растёт латентность; кэшировать blackIps/blackSignatures.
