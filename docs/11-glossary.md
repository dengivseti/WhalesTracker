# WhalesTracker — Глоссарий и пользовательская модель

> Единый словарь терминов для комплекта документов повторения WhalesTracker с нуля. Источники: код репозитория (ссылки вида `файл:строка`), внешняя документация https://whalestracker.netlify.app/ (ссылки вида `[имя страницы](URL)`), docs/03-domain-tracker.md (ссылки на разделы, имена терминов приводятся полностью). Словарь исчерпывающий: все 15 фильтров и все 18 типов редиректов перечислены поимённо (разделы 3 и 4). Сортировка: цифры, латиница A–Z, кириллица А–Я.

---

## 1. Назначение и использование

Документ фиксирует канонические имена сущностей, полей, фильтров, типов редиректов и параметров — чтобы при повторении системы с нуля не возникало расхождений между терминологией сайта документации, кода и остальных документов комплекта (docs/01–10). При конфликте имён приоритет у имён из кода; соответствие терминологии сайта приведено в разделе 6.

---

## 2. Алфавитный словарь терминов

### 2.1. Цифры и латиница A–Z

**400 (тип редиректа '400')** — тип выдачи HTTP-ошибки 400 вместо перехода: `res.status(400).send('Bad Request')`, тело — строка 'Bad Request'. Источник: tracker/redirect.js:204; сайт: [Остальные](https://whalestracker.netlify.app/redirects/other). Полный список — раздел 3 настоящего документа и [docs/03-domain-tracker.md §5 «Полный список типов редиректов»](03-domain-tracker.md#5-полный-список-типов-редиректов-trackerredirectjs5-239).

**403 (тип редиректа '403')** — выдача HTTP 403 с имитированной HTML-страницей ошибки («Access forbidden!»). Источник: tracker/redirect.js:186; сайт: [Остальные](https://whalestracker.netlify.app/redirects/other).

**404 (тип редиректа '404')** — выдача HTTP 404 с HTML-страницей «Object not found!». Источник: tracker/redirect.js:206; сайт: [Остальные](https://whalestracker.netlify.app/redirects/other).

**500 (тип редиректа '500')** — выдача HTTP 500 с HTML-страницей «Server error!». Источник: tracker/redirect.js:219; сайт: [Остальные](https://whalestracker.netlify.app/redirects/other).

**botIpv6 (фильтр Bot ipv6)** — фильтр потока (boolean): клик проходит, если IP клиента — IPv6 (содержит ':'), т.е. пользователь считается «ботом по IPv6». Источник: tracker/filters.js:134 (диспетчер), 44-45; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**browsers (фильтр Browsers)** — фильтр потока (массив): имя браузера из useragent входит в массив. Допустимые значения: YaBrowser, Edge, Amaya, Konqueror, Epiphany, SeaMonkey, Flock, OmniWeb, Chromium, Chrome, Safari, IE, Opera, PS3, PSP, Firefox, WinJs, PhantomJS, AlamoFire, UC, Facebook. Источник: tracker/filters.js:136, 47-48; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**cities (фильтр Cities)** — фильтр потока (массив городов, латиницей): `user.geo.city` (geoip-lite) входит в массив. Источник: tracker/filters.js:142, 61; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**countries (фильтр Countries)** — фильтр потока (массив стран): `user.geo.country` (geoip-lite) входит в массив. Источник: tracker/filters.js:132, 60; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**default (неизвестный тип редиректа)** — ветка `default` переключателя: любой неизвестный `typeRedirect` завершает ответ пустым `res.end()`. Отдельной страницы на сайте не имеет; в админке не выбирается. Источник: tracker/redirect.js:237.

**device (фильтр Device)** — фильтр потока (массив устройств): клик проходит, если сработал хотя бы один флаг useragent. Допустимые значения: mobile, desktop, tablet, ipad, ipod, android, blackberry, mac, samsung, raspberry, androidTablet, kindleFire, SmartTV. Источник: tracker/filters.js:130, 11-42; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Evely (равномерная ротация)** — тип ротации оффера: равновероятный выбор ссылки из списка (без учёта весов). Опечатка «evely» (вместо evenly) присутствует и на сайте, и в коде — каноническое значение `type: 'evely'`. Источник: utils/url.utils.js:17-20, models/Offer.js:7; сайт: [Офферы](https://whalestracker.netlify.app/started/offers).

**Group (Группа)** — корневая сущность маршрутизации: `label` (название), `name` (слаг — идентификатор группы в URL, required, unique; на сайте называется Identifier / «Индификатор группы»), `typeRedirect` + `code` (редирект по умолчанию / фолбэк), `checkUnic` (false), `timeUnic` (24 ч), `useLog` (true), `isActive` (true), `streams` (список потоков). Источник: models/Group.js:4-47; сайт: [Настройка группы](https://whalestracker.netlify.app/settings/groups); поля — [docs/03-domain-tracker.md §1.1 «Group»](03-domain-tracker.md#11-group-modelsgroupjs4-15).

**HTTP Redirect (httpRedirect)** — тип редиректа: обычный HTTP 302 через `res.redirect(url)`. Источник: tracker/redirect.js:11-12; сайт: [Http redirect](https://whalestracker.netlify.app/redirects/http).

**Iframe** — тип редиректа: отдаёт `text/javascript` — legacy «splashpage»-скрипт, открывающий целевой URL в полноэкранном iframe (document.write, setInterval-скролл). Источник: tracker/redirect.js:31, 25-63; сайт: [Iframe](https://whalestracker.netlify.app/redirects/iframe).

**Iframe Redirect (iframeRedirect)** — тип редиректа: HTML со скрытым iframe `javascript:parent.location=...` и `location.replace` через 1 секунду. Источник: tracker/redirect.js:134, 98-121; сайт: [Iframe Redirect](https://whalestracker.netlify.app/redirects/iframeRedirect).

**JavaScript (тип редиректа javascript)** — тип редиректа: HTML-страница, в которую код из поля Input (`code`) вставляется как тело `<script>` — исполняется произвольный JS. Источник: tracker/redirect.js:100, 65-79; сайт: [JavaScript](https://whalestracker.netlify.app/redirects/javascript).

**JS Redirect (jsRedirect)** — тип редиректа: HTML с генерированным «мусорным» заголовком/контентом, `meta refresh` 1 сек + `window.location`. Источник: tracker/redirect.js:13, 8-23; сайт: [JS redirect](https://whalestracker.netlify.app/redirects/js).

**JS Selection (jsSelection)** — тип редиректа: `text/javascript` с `window.location = url` в обработчике `window.onerror`; скрипт вставляется тегом `<script src="http://tracker.com/<groupId>">` на произвольную страницу и «забирает» посетителей, подходящих под условия группы. Источник: tracker/redirect.js:156, 123-132; сайт: [JS Selection](https://whalestracker.netlify.app/redirects/jsSelection).

**Keyword (ключевое слово, Query)** — значение GET-параметра, имя которого задаёт настройка getKey (дефолт `q`). Сохраняется в статистике (Statistic.keyword) и служит ключом привязки URL в механизме Remote. Источник: tracker/userInfo.js:21-22, models/Statistic.js:13, models/Remote.js:5; сайт: [Логика работы](https://whalestracker.netlify.app/started/logic).

**langBrowsers (фильтр Browsers languages)** — фильтр потока (массив языков, например ru-RU, ru, en-US, en): пересечение с языками Accept-Language (`user.lang`). Источник: tracker/filters.js:144, 63-69; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**maskIpv6 (фильтр ipv6 mask)** — фильтр потока (массив масок-подстрок): IPv6-адрес клиента содержит одну из подстрок (пример сайта: `face`). Источник: tracker/filters.js:154, 93-99; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Meta Redirect (metaRefresh)** — тип редиректа: HTML с `<meta http-equiv="refresh" content="0; URL=...">` в head. Источник: tracker/redirect.js:117, 81-96; сайт: [Meta Redirect](https://whalestracker.netlify.app/redirects/meta).

**nullReffer (фильтр Referrer is Null)** — фильтр потока (boolean): клик проходит, если Referer пуст. Источник: tracker/filters.js:150, 87-88; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**nullUa (фильтр Useragent is Null)** — фильтр потока (boolean): клик проходит, если User-Agent пуст. Источник: tracker/filters.js:152, 90-91; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Offer (Оффер, сущность)** — набор ссылок с ротацией: `name`, `type` ('split' / 'evely' / 'rotator'), `offers` — массив `{url, percent 0-100, default 100}`. Используется как значение редиректа в группе и потоках (в `code` кладётся id оффера). Источник: models/Offer.js:4-16; сайт: [Офферы](https://whalestracker.netlify.app/started/offers); поля — [docs/03-domain-tracker.md §1.3 «Offer»](03-domain-tracker.md#13-offer-modelsofferjs4-14).

**Offer (тип редиректа 'offer')** — тип редиректа: переход на URL, выбранный ротацией оффера (split/evely/rotator); пустой результат → `res.end()`. Источник: tracker/redirect.js:171, 138-142; сайт: [Offer](https://whalestracker.netlify.app/redirects/offer).

**os (фильтр OS)** — фильтр потока (массив ОС): ОС из useragent входит в массив. Значения: Windows 2000–10, Windows Phone, OS X Cheetah–Mojave, MAC, Linux, Linux 64, Chrome OS, Wii, Playstation, iPad, iPhone, iOS, Bada, Curl, Electron, unknown. Источник: tracker/filters.js:138, 50-51; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**platforms (фильтр Platforms)** — фильтр потока (массив платформ): platform из useragent входит в массив ('Windows' дополняется 'Microsoft Windows'). Значения: Windows, Windows Phone, Apple Mac, Linux, Wii, Playstation, iPad, iPod, iPhone, Android, Blackberry, Samsung, Curl, Electron, iOS, unknown. Источник: tracker/filters.js:140, 53-57; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Postback (Постбек)** — GET-запрос от партнёрской программы вида `/<mount>/:id?subid=<subid>&payout=<сумма>`; `:id` сверяется с настройкой postbackKey; проставляет сумму выплаты `amount` в запись статистики по subid (`Statistic.where({subid}).updateOne({amount: +payout})`), ответ `{status:'ok'}`. Источник: routes/postback.route.js:14-26; сайт: [Постбеки](https://whalestracker.netlify.app/extra/postbacks); детали — [docs/03-domain-tracker.md §7 «Postback»](03-domain-tracker.md#7-postback-routespostbackroutejs).

**Postback key** — статический ключ в URL постбека (настройка; пример сайта: `http://ДОМЕНТРЕКЕРА/postback/__aw6dov?...`), задаётся/меняется в Settings → General. Единственная защита постбека. Источник: models/Setting.js:8, routes/postback.route.js:15; сайт: [Настройки](https://whalestracker.netlify.app/started/settings), [Постбеки](https://whalestracker.netlify.app/extra/postbacks).

**Query key (getKey)** — имя GET-параметра, по которому читается keyword; дефолт `q`. На сайте — «Query key», в коде — `getKey`. Источник: models/Setting.js:16, tracker/userInfo.js:21-22; сайт: [Настройки](https://whalestracker.netlify.app/started/settings).

**referIncludes (фильтр Referrer includes)** — фильтр потока (массив подстрок): Referer содержит хотя бы одну подстроку (пример сайта: google.com). Источник: tracker/filters.js:148, 79-85; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Relation (&& / ||)** — правило соединения фильтров потока: булево поле `relation`; `true` (&&, И) — должны пройти все фильтры, `false` (||, ИЛИ) — достаточно первого прошедшего. Источник: models/Stream.js:21, tracker/stream.js:16-28; сайт: [Настройка потока](https://whalestracker.netlify.app/settings/streams), [Логика работы](https://whalestracker.netlify.app/started/logic).

**Remote (тип редиректа 'remote' и механизм)** — «одна из основных особенностей трекера»: к значению keyword привязывается случайный URL из списка Remote url (Redis-список `listUrl`, кэш в коллекции Remote с TTL = clearRemote дней); без keyword каждый раз возвращается случайный домен. Источник: models/Remote.js:4-15, utils/url.utils.js:37-52, tracker/redirect.js:166; сайт: [Remote](https://whalestracker.netlify.app/redirects/remote); модель — [docs/03-domain-tracker.md §1.4 «Remote»](03-domain-tracker.md#14-remote-modelsremotejs4-14).

**Rotator** — тип ротации оффера: при первом переходе — первая ссылка, при втором — вторая и т.д.; после последней — по кругу (ротация по счётчику кликов). Источник: utils/url.utils.js:22-25; сайт: [Офферы](https://whalestracker.netlify.app/started/offers).

**Setting (Настройки)** — key-value хранилище (строки maxlength 100). Ключи: postbackKey, clearDayStatistic, theme, language, trash, trashUrl, logLimitClick, logLimitAmount, getKey, protect (капча на логах), sendTelegram, telegramBotToken, telegramChatId, clearRemote. Источник: models/Setting.js:3-26; сайт: [Настройки](https://whalestracker.netlify.app/started/settings); состав — [docs/03-domain-tracker.md §1.5 «Setting»](03-domain-tracker.md#15-setting-modelssettingjs15-21).

**Show Html / Show Text / Show Json (showHtml / showText / showJson)** — типы выдачи контента: ответ 200 с телом из поля Input (`code`) и Content-Type text/html / text/plain / application/json соответственно. Источник: tracker/redirect.js:176, 180, 183, 143-152; сайт: [Остальные](https://whalestracker.netlify.app/redirects/other).

**Split** — тип ротации оффера: взвешенный выбор ссылки по `percent` (0–100); равномерность весов не обязательна (веса 100 и 1 → вероятность второй ссылки ~1%). Источник: utils/url.utils.js:7-15; сайт: [Офферы](https://whalestracker.netlify.app/started/offers).

**Statistic (Статистика)** — запись одного клика: date, expireAt (TTL = clearDayStatistic дней), group, stream (null при фолбэке), out, keyword, redirect, device, country, city, language, unique, isBot, ip, referer, useragent, amount (дописывается постбеком), subid. Источник: models/Statistic.js:4-29; сайт: [Статистика](https://whalestracker.netlify.app/started/statistick); поля — [docs/03-domain-tracker.md §1.6 «Statistic»](03-domain-tracker.md#16-statistic-modelsstatisticjs4-24).

**Stop (тип редиректа 'end')** — «ничего не выдавать»: пустой ответ `res.end()` без тела, без ошибок и текста. Источник: tracker/redirect.js:235, 192-193; сайт: [Остальные](https://whalestracker.netlify.app/redirects/other).

**Stream (Поток)** — правило распределения внутри группы: `position` (порядок проверки сверху вниз), `name`, счётчики `clicksHit`/`clicksUnic`/`clicksBot`, `typeRedirect` + `code`, `useLog`, `isActive`, `relation`, `isBot`, `filters` (массив `{name, action, ...}`). Проверяются последовательно по `position`; первый прошедший поток выполняет свой редирект. Источник: models/Stream.js:4-29; сайт: [Настройка потока](https://whalestracker.netlify.app/settings/streams); поля — [docs/03-domain-tracker.md §1.2 «Stream»](03-domain-tracker.md#12-stream-modelsstreamjs4-19), алгоритм — [docs/03-domain-tracker.md §3 «Алгоритм выбора потока»](03-domain-tracker.md#3-алгоритм-выбора-потока-routestrackerroutejs18-129).

**Subid** — идентификатор клика (shortid в нижнем регистре), подставляется в URL макросом `[subid]` (именно в квадратных скобках) и служит ключом постбека. Единственный поддерживаемый макрос. Источник: routes/tracker.route.js:44, utils/url.utils.js:88; сайт: [Постбеки](https://whalestracker.netlify.app/extra/postbacks).

**TDS (Traffic Delivery System)** — система распределения трафика, «предназначенная для аналитики и распределения входящего трафика». В коде термин не встречается (проект — Express-приложение). Источник: [главная](https://whalestracker.netlify.app/).

**Trash / Trash URL (мусорный трафик)** — обработка кликов, которым не нашлось целевого URL: группа не найдена/неактивна, либо поток/оффер/remote не дали URL. Режимы (настройка `trash`): 'notFound' — страница 404, либо редирект на `trashUrl`. Источник: routes/tracker.route.js:9-14, 20-28; models/Setting.js:12-13; сайт: [Логика работы](https://whalestracker.netlify.app/started/logic), [Настройки](https://whalestracker.netlify.app/started/settings).

**uaIncludes (фильтр Useragent includes)** — фильтр потока (массив подстрок): User-Agent содержит хотя бы одну подстроку (примеры сайта: Instagram, google bot). Источник: tracker/filters.js:146, 71-77; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Unique (Уник, уникальный клик)** — признак уникальности: в группе с `checkUnic` клик уникален, если с этого IP не было переходов в пределах `timeUnic` часов (поиск по Statistic по IP, без фильтра по группе). Источник: routes/tracker.route.js:31-39, models/Statistic.js:20; сайт: [Настройка группы](https://whalestracker.netlify.app/settings/groups).

**useListBlackIps (фильтр Use list ips)** — фильтр потока (boolean): IP клиента входит в чёрный список `blackIps` (Redis-список, поддержка диапазонов/CIDR через ip_to_cidr). Источник: tracker/filters.js:156, 123-127; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**useListBotSignatures (фильтр Use list signature)** — фильтр потока (boolean): User-Agent содержит сигнатуру из чёрного списка `blackSignatures` (Redis-список). Источник: tracker/filters.js:158, 110-113; сайт: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**User (модель пользователя)** — ровно два поля: `username` (required, unique), `password` (required; bcrypt-хеш, cost 12 — хеширование в маршруте, не в модели). Ролей и прав нет. Источник: models/User.js:4-8, routes/auth.route.js:28; [docs/03-domain-tracker.md §1.7 «User»](03-domain-tracker.md#17-user-modelsuserjs4-8); модель пользователя — раздел 5.

### 2.2. Кириллица А–Я

**Админка** — панель управления по адресу `http://ВАШДОМЕН/admin`; вход по логину/паролю, задаваемым при первом входе (см. раздел 5). Источник: сайт: [Установка](https://whalestracker.netlify.app/started/install), [Авторизация](https://whalestracker.netlify.app/started/auth).

**Бот-поток** — поток с пометкой This is bot (`isBot`), используемый для «сбора ботов»; его клики помечаются `isBot` в статистике. Рекомендация сайта: первым потоком ставить бот-поток с антиспам-фильтрами и без логирования. Важно: isBot берётся из потока, реальный детект ботов не выполняется. Источник: models/Stream.js:22, routes/tracker.route.js:67, [docs/03-domain-tracker.md §9 «Замечания для рерайта», п. 6](03-domain-tracker.md#9-замечания-для-рерайта); сайт: [Настройка потока](https://whalestracker.netlify.app/settings/streams).

**Клоака / клоакинг** — на сайте документации и в коде термин не употребляется. Ближайшая функциональность — связка «бот-поток (This is bot) + белый поток» и антиспам-фильтры (Use list ips, Use list signature, Referrer is Null, Useragent is Null, Bot ipv6): разделение «ботового» и целевого трафика фильтрами потока. Источник: models/Stream.js:22; сайт: [Настройка потока](https://whalestracker.netlify.app/settings/streams), [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters).

**Метрики дашборда (Хиты, Уники, Доход, Количество продаж)** — типы метрик главной страницы админки; «Последние клики» / «Последние продажи» — две таблицы с лимитами logLimitClick (150) и logLimitAmount (50). Источник: models/Setting.js:14-15; сайт: [Дашбоард](https://whalestracker.netlify.app/started/dashboard).

**Партнёрская программа (ПП)** — внешняя сеть, из которой приходит трафик и в которую уходят переходы; при продаже шлёт постбек с subid и суммой. Макросы ПП (`{cid}`, `{sum}`) уточняются у менеджера; трекер поддерживает только subid и payout. Источник: routes/postback.route.js:14-24; сайт: [Постбеки](https://whalestracker.netlify.app/extra/postbacks).

**Поток** — см. **Stream (Поток)** в §2.1 (имя приводится полностью во избежание двусмысленности).

---

## 3. Полный список фильтров (15, поимённо)

Диспетчер `filtration(name, action)` — tracker/filters.js:129-160; неизвестное имя → поток не проходит. Соответствие сайту: [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters). Дублирует [docs/03-domain-tracker.md §4 «Полный список фильтров»](03-domain-tracker.md#4-полный-список-фильтров-trackerfiltersjs); имена фильтров: device, countries, cities, botIpv6, browsers, os, platforms, langBrowsers, uaIncludes, referIncludes, nullReffer, nullUa, maskIpv6, useListBlackIps, useListBotSignatures.

| # | name (в коде) | action (параметр) | Поведение | Источник |
|---|---|---|---|---|
| 1 | device | массив устройств | хотя бы один флаг useragent совпал; значения: mobile, desktop, tablet, ipad, ipod, android, blackberry, mac, samsung, raspberry, androidTablet, kindleFire, SmartTV | tracker/filters.js:11-42 |
| 2 | countries | массив стран | user.geo.country входит в массив | tracker/filters.js:60 |
| 3 | cities | массив городов (латиницей) | user.geo.city входит в массив | tracker/filters.js:61 |
| 4 | botIpv6 | boolean | IP содержит ':' (IPv6) | tracker/filters.js:44-45 |
| 5 | browsers | массив браузеров | имя браузера из useragent входит в массив (список значений — см. словарную статью browsers) | tracker/filters.js:47-48 |
| 6 | os | массив ОС | ОС из useragent входит в массив (список значений — см. словарную статью os) | tracker/filters.js:50-51 |
| 7 | platforms | массив платформ | platform из useragent входит в массив; 'Windows' дополняется 'Microsoft Windows' | tracker/filters.js:53-57 |
| 8 | langBrowsers | массив языков | пересечение с Accept-Language | tracker/filters.js:63-69 |
| 9 | uaIncludes | массив подстрок | User-Agent содержит хотя бы одну | tracker/filters.js:71-77 |
| 10 | referIncludes | массив подстрок | Referer содержит хотя бы одну | tracker/filters.js:79-85 |
| 11 | nullReffer | boolean | Referer пуст | tracker/filters.js:87-88 |
| 12 | nullUa | boolean | User-Agent пуст | tracker/filters.js:90-91 |
| 13 | maskIpv6 | массив масок-подстрок | IPv6-адрес содержит одну из подстрок | tracker/filters.js:93-99 |
| 14 | useListBlackIps | boolean | IP в Redis-списке blackIps (поддержка CIDR) | tracker/filters.js:123-127 |
| 15 | useListBotSignatures | boolean | UA содержит сигнатуру из Redis-списка blackSignatures | tracker/filters.js:110-113 |

---

## 4. Полный список типов редиректов (18, поимённо)

Переключатель `redirect(typeRedirect, url, res)` — tracker/redirect.js:7-240. Дублирует [docs/03-domain-tracker.md §5 «Полный список типов редиректов»](03-domain-tracker.md#5-полный-список-типов-редиректов-trackerredirectjs5-239); имена: httpRedirect, jsRedirect, iframe, javascript, metaRefresh, iframeRedirect, jsSelection, remote, offer, showHtml, showText, showJson, 403, 400, 404, 500, end, default.

| # | typeRedirect (в коде) | Поведение | Источник |
|---|---|---|---|
| 1 | httpRedirect | обычный HTTP-302: `res.redirect(url)` | tracker/redirect.js:11-12 |
| 2 | jsRedirect | HTML с «мусорным» контентом + meta refresh 1 с + window.location | tracker/redirect.js:13, 8-23 |
| 3 | iframe | text/javascript «splashpage», полноэкранный iframe (legacy-скрипт) | tracker/redirect.js:31, 25-63 |
| 4 | javascript | HTML, код из `code` — тело `<script>` (произвольный JS) | tracker/redirect.js:100, 65-79 |
| 5 | metaRefresh | HTML с `<meta http-equiv="refresh" content="0; URL=...">` | tracker/redirect.js:117, 81-96 |
| 6 | iframeRedirect | скрытый iframe `javascript:parent.location=...` + location.replace через 1 с | tracker/redirect.js:134, 98-121 |
| 7 | jsSelection | text/javascript: window.location в window.onerror (для вставки `<script src>` на страницу) | tracker/redirect.js:156, 123-132 |
| 8 | remote | редирект на URL, привязанный к keyword (механизм Remote); пусто → res.end() | tracker/redirect.js:166, 133-137 |
| 9 | offer | редирект на URL оффера по ротации split/evely/rotator; пусто → res.end() | tracker/redirect.js:171, 138-142 |
| 10 | showHtml | 200, text/html, тело = code | tracker/redirect.js:176, 143-146 |
| 11 | showText | 200, text/plain, тело = code | tracker/redirect.js:180, 147-149 |
| 12 | showJson | 200, application/json, тело = code | tracker/redirect.js:183, 150-152 |
| 13 | 403 | 403 + имитированная страница ошибки | tracker/redirect.js:186, 153-168 |
| 14 | 400 | 400 'Bad Request' | tracker/redirect.js:204, 169-170 |
| 15 | 404 | 404 + страница «Object not found» | tracker/redirect.js:206, 171-180 |
| 16 | 500 | 500 + страница «Server error» | tracker/redirect.js:219, 181-191 |
| 17 | end | пустой ответ res.end() (на сайте — «Stop») | tracker/redirect.js:235, 192-193 |
| 18 | default | неизвестный тип → res.end() | tracker/redirect.js:237 |

Резолв значения `code` перед редиректом (remote/offer/макрос `[subid]`) — utils/url.utils.js:76-91. Соответствие терминологии сайта — таблица в разделе 6 (строка 11).

---

## 5. Модель пользователя

### 5.1. Один админ, без ролей

- Модель User — ровно два поля: `username` (required, unique) и `password` (required). Никаких ролей, email, прав (models/User.js:4-8).
- Автосоздание при первом входе: POST /login ищет пользователя по username; если его нет и в базе нет ни одного пользователя — создаётся новый с bcrypt-хешем из введённых данных (cost 12). Если пользователь уже существует — любой другой логин/пароль отклоняется («Incorrect data»), второй аккаунт создать нельзя (routes/auth.route.js:22-37).
- Смена и сброс пароля не реализованы; сайт прямо предупреждает: «На текущий момент у Вас не будет возможности поменять их!» (сайт: [Авторизация](https://whalestracker.netlify.app/started/auth)). В коде только /login и /logout (routes/auth.route.js:7-11, 13-48).
- Сессия: `req.session.user = user._id; req.session.isAuthenticated = true` (routes/auth.route.js:44-45); logout уничтожает сессию (routes/auth.route.js:7-11).
- Вывод: система рассчитана ровно на одного оператора-владельца; понятие «роли» отсутствует и в данных, и в middleware. Доступ к админке защищён только паролем первого пользователя.

### 5.2. Типичный workflow оператора

1. Развернуть трекер на VPS с Docker (три сценария установки: For noob / Easy / For the paranoid) и запустить кластер бэкенда (сайт: [Установка](https://whalestracker.netlify.app/started/install)).
2. Войти в `/admin`, задать логин/пароль при первом входе (сайт: [Авторизация](https://whalestracker.netlify.app/started/auth)).
3. В настройках задать Trash-режим и Trash URL, Query key (`q`), ключ постбека, лимиты таблиц дашборда, сроки хранения статистики/Remote; загрузить чёрные списки IP и сигнатур, список Remote-доменов (сайт: [Настройки](https://whalestracker.netlify.app/started/settings)).
4. Создать офферы: ссылки ПП с макросом `[subid]`, тип ротации split/evely/rotator (сайт: [Офферы](https://whalestracker.netlify.app/started/offers)).
5. Создать группу: Label, Identifier (name), тип редиректа и Input по умолчанию, уникальность, логирование (сайт: [Настройка группы](https://whalestracker.netlify.app/settings/groups)).
6. Добавить потоки: первым — бот-поток (This is bot, без логирования) с антиспам-фильтрами (useListBlackIps, useListBotSignatures, nullUa, nullReffer, botIpv6); далее целевые потоки (гео, девайс, браузер и т.д.); порядок drag&drop, relation &&/|| (сайт: [Настройка потока](https://whalestracker.netlify.app/settings/streams), [Настройка фильтрации](https://whalestracker.netlify.app/settings/filters)).
7. Разместить ссылки вида `http://домен/<Identifier>?<getKey>=<keyword>` в источниках трафика; для отбора на своей странице — группа с типом Stop (end) и `<script src=".../groupId">` (сайт: [JS Selection](https://whalestracker.netlify.app/redirects/jsSelection)).
8. Передать ПП ссылку с `[subid]`; прописать у ПП постбек `http://домен/postback/<postbackKey>?subid={cid}&payout={sum}` (сайт: [Постбеки](https://whalestracker.netlify.app/extra/postbacks)).
9. Мониторить дашборд (хиты/уники/доход, последние клики/продажи) и статистику (по дням/странам/девайсам/запросам); отключать неэффективные потоки переключателем Active (сайт: [Дашбоорд](https://whalestracker.netlify.app/started/dashboard), [Статистика](https://whalestracker.netlify.app/started/statistick)).
10. Периодически обновлять трекер (`docker-compose down && pull && up --build && prune`), предварительно сохранив списки Black signature / Remote url / List black IP (сайт: [Обновление](https://whalestracker.netlify.app/started/update)).

### 5.3. Ограничения модели (важно для рерайта)

- Нет управления пользователями, ролей, восстановления пароля; пароль первого пользователя задаётся единожды (models/User.js:4-8, routes/auth.route.js:22-45).
- Постбек защищён только статическим ключом postbackKey; группа/поток при записи amount не проверяются, `updateOne` обновляет первый совпавший документ (routes/postback.route.js:14-26, [docs/03-domain-tracker.md §9, п. 9](03-domain-tracker.md#9-замечания-для-рерайта)).
- Срок жизни Remote по умолчанию в схеме +5 дней, переопределяется настройкой clearRemote (models/Remote.js:8-11).
- Настройки хранятся строками (maxlength 100) — числовые значения конвертируются на лету (models/Setting.js:26, [docs/03-domain-tracker.md §9, п. 10](03-domain-tracker.md#9-замечания-для-рерайта)).

---

## 6. Таблица расхождений терминологии сайта и кода

| # | Термин сайта | Термин/поле в коде и docs/03 | Суть расхождения | Источник |
|---|---|---|---|---|
| 1 | Identifier / «Индификатор группы» | `name` (Group) | Сайт называет поле Identifier; в модели — `name`, слаг из URL | [Настройка группы](https://whalestracker.netlify.app/settings/groups) ↔ models/Group.js:6, routes/tracker.route.js:20 |
| 2 | Check unique / Hour unique | `checkUnic` / `timeUnic` | Иные имена полей (unic vs unique); дефолты false/24 совпадают | [Настройка группы](https://whalestracker.netlify.app/settings/groups) ↔ models/Group.js:13-16 |
| 3 | Logging | `useLog` | Сайт: Logging; код: useLog | models/Group.js:17, models/Stream.js:16 |
| 4 | This is bot | `isBot` | Имя поля отличается; isBot берётся из потока, а не из реального детекта ботов | [Настройка потока](https://whalestracker.netlify.app/settings/streams) ↔ models/Stream.js:22 |
| 5 | Relation «&& / \|\|» | `relation: Boolean` (true=И, false=ИЛИ) | На сайте строковые операторы; в коде — булево поле | models/Stream.js:21 |
| 6 | Query key (дефолт `q`) | `getKey` | Имя настройки; на сайте URL примера `group&query=QUERY` без `?` — синтаксически некорректно | [Настройки](https://whalestracker.netlify.app/started/settings) ↔ models/Setting.js:16 |
| 7 | «Уникальность по Ip» | проверка по `ip` + окну timeUnic | Сайт не упоминает: проверка по IP идёт без фильтра по группе — клик с того же IP обнуляет уникальность во всех группах | [Настройка группы](https://whalestracker.netlify.app/settings/groups) ↔ routes/tracker.route.js:31-39 |
| 8 | Пустой набор фильтров потока | сайт не описывает | Поток без фильтров никогда не срабатывает (filtration → false), а не «проходит всегда» | [Настройка потока](https://whalestracker.netlify.app/settings/streams) ↔ tracker/stream.js:7-9 |
| 9 | JS Redirect — «в head прописан js script» | jsRedirect | В коде: «мусорный» контент + meta refresh 1 с + window.location | [JS redirect](https://whalestracker.netlify.app/redirects/js) ↔ tracker/redirect.js:8-23 |
| 10 | Meta Redirect — «meta тэг в body» | metaRefresh | В коде meta размещается в head документа | [Meta Redirect](https://whalestracker.netlify.app/redirects/meta) ↔ tracker/redirect.js:81-96 |
| 11 | Типы редиректов сайта (9 страниц + «остальные») | 18 значений typeRedirect | Отдельных страниц нет для showHtml/showText/showJson/400/403/404/500/default; «Stop» сайта = case `end` | [Остальные](https://whalestracker.netlify.app/redirects/other) ↔ раздел 4 настоящего документа |
| 12 | Списки «Settings → Другие» (ip, сигнатуры, Remote url) | Redis-списки blackIps / blackSignatures; Remote — Mongo + Redis listUrl | Сайт не раскрывает реализацию хранения | [Настройки](https://whalestracker.netlify.app/started/settings) ↔ tracker/filters.js:123-127 |
| 13 | Опечатки сайта («Evely», «Индификатор», «Дашбоард» и др.) | — | «Evely» зафиксирована и в коде (models/Offer.js:7) — каноническое значение `evely` | страницы сайта; models/Offer.js:7 |
| 14 | «пароль хранится в зашифрованном формате в виде хэша» | bcrypt-хеш (cost 12) | Совпадает; но хеширование выполняется в auth.route.js, а не в модели User | [Авторизация](https://whalestracker.netlify.app/started/auth) ↔ routes/auth.route.js:28 |

Совпадения терминологии (без расхождений): иерархия Группа → Потоки → Фильтры; порядок проверки сверху вниз; фолбэк на группу; имена трёх типов ротации split/evely/rotator (дословно); механика Remote; состав постбека (subid + payout, ключ в URL).

### 6.1. Сводная таблица «сайт ↔ код» для типов редиректов

| Сайт | Код (typeRedirect) |
|---|---|
| Http redirect | httpRedirect |
| JS redirect | jsRedirect |
| Offer | offer |
| JS Selection | jsSelection |
| Remote | remote |
| Iframe | iframe |
| Iframe Redirect | iframeRedirect |
| Meta Redirect | metaRefresh |
| JavaScript | javascript |
| Stop | end |
| (страница «Остальные»: текст/JSON/HTML, ошибки) | showHtml, showText, showJson, 400, 403, 404, 500 |
| (не представлен на сайте) | default |
