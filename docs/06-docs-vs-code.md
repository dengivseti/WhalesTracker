# WhalesTracker — Сверка внешней документации (netlify) с кодом

> Источник: [whalestracker.netlify.app](https://whalestracker.netlify.app/) (репо [whalesTracker_docs](https://github.com/dengivseti/whalesTracker_docs)). Сверено с кодом ветки `docs/system-documentation` (базис `3df483e`). Проверены страницы: started/logic, started/settings, settings/streams, settings/filters, redirects/remote, extra/postbacks. Страницы redirects/* (http, js, offer, jsSelection, iframe, iframeRedirect, meta, javascript, other) описывают поведение, уже покрытое [03-domain-tracker.md](03-domain-tracker.md) по коду, и точечно не сверялись.

## Сводная таблица расхождений

| Утверждение документации | Что в коде | Файл |
|---|---|---|
| «Переход по ссылке ВАШ_ДОМЕН/group&query=QUERY, где group — **id группы**» (logic) | В URL используется **`Group.name`** (уникальный slug), не ObjectId `_id`; формат `/{name}?{getKey}={value}` | routes/tracker.route.js:35-37, models/Group.js:5 |
| «query — передаваемое значение», ключ якобы `query` | Имя GET-параметра задаётся настройкой `getKey`, по умолчанию **`q`** | tracker/userInfo.js:23,41, utils/settings.utils.js |
| Фильтр Device: список из 9 значений (Mobile, Desktop, Tablet, Blackberry, Mac, Raspberry, KindleFire, SmartTV) | Код поддерживает **13**: ещё `ipad, ipod, android, androidTablet, samsung` | tracker/filters.js:9-49 |
| «Bot ipv6 — считать юзера с ipv6 **ботом**» (filters) | Фильтр только проверяет «IP является IPv6»; пометка `isBot` в статистике — отдельный статичный флаг потока, связи с этим фильтром нет | tracker/filters.js:51, models/Stream.js:19, routes/tracker.route.js:86 |
| «Cities — можно указать любую **страну**» (filters; опечатка) | Фильтр по **городу** (`geo.city`) | tracker/filters.js:67 |
| «Clear remote days — default **25**» (settings, redirects/remote) | Настройка `clearRemote`, default **'30'** | models/Setting.js, utils/settings.utils.js |
| Свойства потока: Label, Type redirect, Input, Relation, This is bot, Active, Logging (streams) | Соответствуют полям `name`, `typeRedirect`, `code`, `relation`, `isBot`, `isActive`, `useLog` — расхождение только в именах; в доках не упомянуты `position` (порядок) и счётчики `clicksHit/clicksUnic/clicksBot` | models/Stream.js:4-20 |
| Настройки «Основные»: перечислены 8 | В модели Setting есть ещё `theme`, `language`, `protect`, `sendTelegram`, `telegramBotToken`, `telegramChatId` — в UI настроек не отображаются и кодом (кроме чтения) не используются; Telegram-уведомления **не реализованы** | models/Setting.js:3-18 |
| Постбек: `http://ДОМЕН/postback/{key}?subid={cid}&payout={sum}`, ключ в Settings-General-Postback | Соответствует коду: `GET /postback/:id` + `subid`,`payout` обязательны; `amount = +payout` пишется в Statistic по subid | routes/postback.route.js:15-25 |
| Remote: привязка значения `q` → случайный URL из списка, срок жизни из Clear remote days; без ключа — случайный URL каждый раз | Соответствует коду: Mongo `Remote` (TTL `clearRemote`), fallback Redis `listUrl`; без query — случайный из `listUrl` | utils/url.utils.js:30-56 |
| Логика распределения: группа → потоки сверху вниз, && / ||, фолбэк на группу | Соответствует коду | tracker/stream.js, routes/tracker.route.js:30-132 |

## Выводы для рерайта

1. **Практически вся функциональная документация netlify достоверна** — расхождения косметические (имена полей, дефолты, списки значений фильтров).
2. Главная терминологическая путаница — «id группы» vs `name`-slug в URL; в рерайте стоит назвать это явно «slug группы».
3. Задокументированные, но не реализованные возможности: Telegram-уведомления (`sendTelegram` и токены — мёртвые настройки), `protect` («captcha on log» — не реализована), очистка статистики за период (`/api/settings/statistics/clear` — TODO с битым путём).
4. Документация не покрывает: первую автoregистрацию админа при пустой БД, счётчики потока `clicksHit/clicksUnic/clicksBot` (не инкрементируются), настроечные ключи Redis и файлы `dist/*.dat`.
