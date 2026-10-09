# WhalesTracker — Экраны приложения (админка)

> Все 7 страниц React-клиента: роутинг, элементы UI, формы, состояния, переходы, используемые компоненты и хуки. Ссылки — файл:строки. См. также: [матрица экран↔API](05-screen-api-mapping.md).

# Задача D — Экраны фронтенда (WhalesTracker, client/src)

## Общая архитектура и роутинг

- Точка входа `App.tsx`: инициализирует аутентификацию через `useAuth()` (client/src/App.tsx:12), пока `ready === false` показывает `<Loader />` (client/src/App.tsx:17-19).
- Авторизованный пользователь оборачивается в провайдеры: `AuthContext` → `GroupState` → `StatisticState` → `DashboardState` → `SettingsState` → `OfferState` → `Layout` (client/src/App.tsx:20-49).
- Неавторизованный — только `AuthContext.Provider` без Layout и без остальных контекстов (client/src/App.tsx:22-30).
- Роутинг определён в `useRouter(isAuthenticated)` (client/src/routes.tsx:17):
  - авторизован: `/dashboard` → DashboardPage, `/group/:id` → EditPage, `/statistic` → StatisticPage, `/offers` → OfferPage, `/settings` → SettingsPage, `/information` → InfoPage; любой другой путь → Redirect на `/dashboard` (client/src/routes.tsx:19-27).
  - не авторизован: `/auth` → AuthPage, всё остальное → Redirect на `/auth` (client/src/routes.tsx:29-33).
- Защита маршрутов — исключительно клиентская: факт `!!userId` из `useAuth()` (client/src/App.tsx:13); userId хранится в localStorage под ключом `Data` (client/src/hooks/auth.hook.ts:4,12,19-25). Дополнительно `useHttp` при ответе 401 вызывает `logout()` (client/src/hooks/http.hook.ts:32-35).
- react-router-dom v5 (`Switch`, `Route`, `Redirect`, `useHistory`, `useParams`) — client/src/routes.tsx:2, client/src/pages/EditPage.tsx:2.

## Хуки и контексты (используются страницами)

- `useAuth` (client/src/hooks/auth.hook.ts:6-27): login/logout пишут/удаляют `{userId}` в localStorage (`Data`); при монтировании восстанавливает сессию.
- `useHttp` (client/src/hooks/http.hook.ts:11-53): `request(url, method, body, headers, qs)` на fetch, JSON-тело, query-string через `getQueryString` (client/src/hooks/http.hook.ts:5-10); состояния `loading`/`error`, `clearError`, авто-logout при 401.
- `useMessage` (client/src/hooks/message.hook.ts:1-7): снекбар через notistack `enqueueSnackbar`.
- `useIsMounted` (client/src/hooks/isMounted.hook.ts:1-10): ref-флаг смонтированности (в страницах не найдено использований — grep по pages/components не даёт вызовов; назначение не ясно / зарезервирован).
- Контексты: `AuthContext` (client/src/context/AuthContext.ts:9-19), `GroupContext` (GroupState.tsx), `DashboardContext`, `StatisticContext`, `SettingsContext`, `OfferContex` (обратите внимание на опечатку в имени экспорта, client/src/context/OfferState.tsx; используется в client/src/pages/OfferPage.tsx:2). Все state-контексты построены на `useReducer` + экшены-обёртки над `useHttp`; точные редьюсеры: client/src/context/groupReducer.ts, dashboardReducer.ts, statisticReducer.ts, settingsReducer.ts, offerReducer.ts.

---

## 1. AuthPage

Файл: client/src/pages/AuthPage.tsx

1. **Маршрут и защита**: `/auth`, доступна только неавторизованным (все прочие пути редиректятся на неё) — client/src/routes.tsx:29-33.
2. **Назначение**: вход по логину/паролю; после успеха сохраняет `userId` в AuthContext/localStorage (client/src/pages/AuthPage.tsx:60-71).
3. **UI**: `Container` (maxWidth xs) с формой (client/src/pages/AuthPage.tsx:83-101): TextField «Usename» (опечатка в лейбле), TextField «Password» (type=password), кнопка «Sign In» (disabled при loading) (client/src/pages/AuthPage.tsx:95-108).
4. **Форма** (`IFormAuth`, client/src/pages/AuthPage.tsx:11-14):
   - `username` — text, TextField required/fullWidth/autoFocus; клиентской валидации помимо HTML-атрибута `required` нет, форма с `noValidate` (client/src/pages/AuthPage.tsx:85), т.е. required фактически не срабатывает.
   - `password` — password, TextField required; валидации нет (тот же `noValidate`).
5. **Состояния**: загрузка — кнопка disabled (`disabled={loading}`, client/src/pages/AuthPage.tsx:104); ошибка — снекбар через useEffect на `error` → `message(error)` + `clearError()` (client/src/pages/AuthPage.tsx:49-53); пустого состояния нет.
6. **Переходы**: явного history.push нет — редирект происходит из-за смены `userId` в `useAuth` → `useRouter` переключается на защищённые маршруты (client/src/App.tsx:13-15, routes.tsx:17).
7. **Хуки/контексты**: `useHttp`, `useMessage`, `AuthContext` (client/src/pages/AuthPage.tsx:29-32); MUI Button/TextField/Container.

## 2. DashboardPage

Файл: client/src/pages/DashboardPage.tsx

1. **Маршрут**: `/dashboard`, только для авторизованных (client/src/routes.tsx:19); является страницей по умолчанию (Redirect, routes.tsx:26).
2. **Назначение**: сводный дашборд: карточки итогов, фильтры, линейный график, таблицы последних кликов и сумм; создание новой группы.
3. **UI**: `CardDashboard` (4 карточки Hits/Uniques/Sales/Amount) (client/src/pages/DashboardPage.tsx:39), `MenuDashboard` (фильтры) (:40), график `Chart` или Loader (:42-44), `TableLastAmount` (:45), `TableLastClick` (:46), модалка `ModalGroup` по FAB «+» (:47-55).
4. **Форма**: на самой странице формы нет; поля находятся в `MenuDashboard` (см. ниже) и `ModalGroup`.
5. **Состояния**: загрузка — `<Loader />` вместо графика при `loading` (client/src/pages/DashboardPage.tsx:43); при `!stats.length` `Chart` тоже показывает Loader (client/src/components/Chart.tsx:21-23) — отдельного «пустого» состояния графика нет. Ошибки обрабатываются в контексте/модалке, не здесь.
6. **Переходы**: FAB открывает `ModalGroup`; после создания группы `ModalGroup` делает `history.push('/group/<id>')` (client/src/components/ModalGroup.tsx:78-82). Боковое меню даёт навигацию (Layout).
7. **Хуки/контексты**: `GroupContext.clearGroup` при монтировании (client/src/pages/DashboardPage.tsx:26-28), `DashboardContext` (loading/fetchDashboard/interval, повторный fetch при смене interval, :30-32).

### Вложенные компоненты Dashboard

**MenuDashboard** (client/src/components/MenuDashboard.tsx:44-244) — панель фильтров:
- Select «Group» (native, опция All + группы) (:140-157); смена группы сбрасывает stream (:88-98).
- Select «Stream» — опции стримов выбранной группы (:159-180).
- Checkbox «Ignore bot» (:183-197).
- Select «Type» — линии графика из `linesChartDashboard`: Hits/Uniques/Amount/Sales (client/src/utils/edit.utils.ts:540-547).
- Select «Interval» — Day/Week (`intervalDashboard`, client/src/utils/edit.utils.ts:532-538).
- Кнопка «Refresh» → `menu.fetchDashboard()`, disabled при loading (:218-231).
- Любое изменение полей сразу пишет значение в контекст через `menu.updateValue({...})` (client/src/components/MenuDashboard.tsx:69-79) — форма без сабмита.
- Клиентской валидации нет; пустые значения допускаются («All»).

**Chart** (client/src/components/Chart.tsx:18-57): recharts `LineChart` с двумя линиями — текущий период (`typeLines`) и предыдущий (`${typeLines}_last`, пунктир) (:41-54); пустые данные → Loader.

**CardDashboard / CardInfo** (client/src/components/CardDashboard.tsx:16-45, CardInfo.tsx:18-45): 4 карточки; при loading показывают 0 (`value={loading ? 0 : ...}`, CardDashboard.tsx:33-43); Amount форматируется `toCurrency` (client/src/utils/money.utils.ts:1-7, Intl en-US USD).

**TableLastAmount** (client/src/components/TableLastAmount.tsx:53-218): mui-datatables «Last Amount»; колонки Time, Group, Stream, Device (иконки), Country (флаг через react-flag-icon-css; при длине >7 или пустой — пробел; при ошибке рендера — текст) (:65-88), City, Ip, Useragent, Amount (`toCurrency`) (:126-176). Скрыт пока `loading && !value.length` (:120-122). Опции: rowsPerPage 10, без print/download, selectableRows none (:198-206).

**TableLastClick** (client/src/components/TableLastClick.tsx:53-233): аналогичная таблица «Last Click»; доп. колонки Unique и Bot как «+»/«-» и Out (:196-218); то же условие скрытия при загрузке без данных (:176-178).

**ModalGroup** (client/src/components/ModalGroup.tsx:60-284) — форма «CREATE GROUP» (Dialog):
- `label` — TextField required «Label» (:131-146); валидации нет (Dialog-форма без noValidate, но submit идёт по onClick, не по form submit).
- `identifier` — TextField required «Identifier», предзаполняется `generateId()` (shortid) (:76, 148-163; client/src/utils/generator.utils.ts:4-6).
- Select «Type redirect» из `listTypeRedirect` (17 вариантов: HTTP Redirect, JS Redirect, Offer, JS Selection, Remote, Iframe, Iframe Redirect, Meta Redirect, JavaScript, Show Html/Text/Json, 403/400/404/500, Stop) (:165-192; client/src/utils/edit.utils.ts:39-93).
- `FieldCode` — динамическое поле кода, тип зависит от выбранного redirect (textInput / select / ничего) (:193-200; client/src/components/FieldCode.tsx:23-103).
- `timeUnic` — TextField type=number «Hour Unique», default 24 (:203-217); `Number(event.target.value)`, валидации нет.
- Checkbox: «Check unique» (default false), «Active» (default true), «Logging» (default true) (:218-263).
- Кнопка «Save» → `addGroup(...)` (:87-99); ошибки — снекбар (:71-76); после создания — редирект на `/group/:id` (:78-82).

## 3. StatisticPage

Файл: client/src/pages/StatisticPage.tsx

1. **Маршрут**: `/statistic`, авторизованные (client/src/routes.tsx:21).
2. **Назначение**: статистика по группам/стримам с разбивкой по дню, стране, устройству или запросу.
3. **UI**: MUI `Tabs` (Days/Countries/Devices/Queries, все disabled при loading) (client/src/pages/StatisticPage.tsx:40-58) + `TabStatistic` (:59).
4. **Форма**: на странице нет; фильтры в `MenuStatistic` (ниже).
5. **Состояния**: loading блокирует табы (StatisticPage.tsx:44-56); загрузка/пусто обрабатываются внутри `TabStatistic`/`TableStatistic`.
6. **Переходы**: нет прямых; навигация через Layout.
7. **Хуки/контексты**: `StatisticContext` (`setType`, `loading`, `type`); маппинг индексов табов `TAB = {day:0, country:1, device:2, query:3}` (client/src/pages/StatisticPage.tsx:11-16); смена таба вызывает `setType(key)` (:25-35).

### Вложенные компоненты Statistic

**TabStatistic** (client/src/components/TabStatistic.tsx:8-20): при смене `type` → `fetchStats()`; `loading ? <Loader/> : <TableStatistic/>`.

**MenuStatistic** (client/src/components/MenuStatistic.tsx:41-303):
- Select «Group» и «Stream» (аналогично дашборду, All + списки) (:236-263, 265-292).
- `KeyboardDatePicker` «Date Start» и «Date End» (формат yyyy-MM-dd, autoOk) (:121-149) — material-ui-pickers + date-fns.
- Select «Interval» из `intervalDate`: Today/Yesterday/Last 3/7/14 days/This week/Last week/This mounth (опечатка)/Last mounth (client/src/utils/edit.utils.ts:520-530). Выбор интервала программно пересчитывает даты через date-fns (subDays/startOfWeek с weekStartsOn:1/startOfMonth и т.п., client/src/components/MenuStatistic.tsx:60-102).
- Клиентская валидация дат: если дата в будущем — сбрасывается на `new Date()` (client/src/components/MenuStatistic.tsx:104-115).
- Кнопка «Refresh» → `fetchStats()`, disabled при loading (:294-306).
- Изменения пишутся в контекст и localStorage через `menu.updateLocalStorage({...})` (client/src/components/MenuStatistic.tsx:127-139).

**TableStatistic** (client/src/components/TableStatistic.tsx:39-204): mui-datatables; при пустых данных — «NO DATA STATS» (Typography h5, :90-95); скрыт при loading (:87-89). Колонки: первая — имя типа с заглавной буквы (Day/Country/...) с кастомным рендером: страны — флаг+код (:44-71), устройства — иконки desktop/mobile/other (:72-86); Hits, Uniques, EPM, Sales, Amount (:135-166). EPM считается как `amount / (hits/1000)` с округлением до 0.1 (:168-174). Не «day»-типы сортируются по hits по убыванию (:176-181).

## 4. OfferPage

Файл: client/src/pages/OfferPage.tsx

1. **Маршрут**: `/offers`, авторизованные (client/src/routes.tsx:22).
2. **Назначение**: управление офферами (список URL-ов с типом распределения трафика).
3. **UI**: только `ListOffers` (client/src/pages/OfferPage.tsx:19-21); fetch при монтировании (`fetchOffer`, :13-15).
4. **Форма**: в `ModalOffer` (см. ниже).
5. **Состояния**: загрузка — `<Loader />` на уровне страницы (client/src/pages/OfferPage.tsx:17-19) и в ListOffers (client/src/components/ListOffers.tsx:39-41); пусто — список скрыт, остаётся только кнопка «Add Offer» (client/src/components/ListOffers.tsx:44-45); ошибок на уровне страницы нет.
6. **Переходы**: нет явных; из `FieldCode` (на странице группы) есть ссылка-кнопка `href="/offers"` на эту страницу (client/src/components/FieldCode.tsx:83-90).
7. **Хуки/контексты**: `OfferContex` (client/src/pages/OfferPage.tsx:12).

### Вложенные компоненты Offer

**ListOffers** (client/src/components/ListOffers.tsx:17-108): Paper со списком офферов — каждый `ListItem` кликабелен (`selectOffer`), текст «`name - N url. Distribution: type`» (:57-66), кнопка удаления `deleteOffer` (:68-76); кнопка «Add Offer» открывает `ModalOffer` через `setModal()` (:79-87); сохранение объединяет выбранный оффер с данными формы (`{...offer, ...value}`) (:24-33).

**ModalOffer** (client/src/components/ModalOffer.tsx:32-258) — форма «OFFER» с настоящим `<form onSubmit>`:
- `name` — TextField required «Input name offer» (outlined) (:109-122).
- Select «typeDistribution» из `listDistribution`: Split (с процентами), Rotator, Evely [так в коде] (без процентов) (:123-144; client/src/utils/edit.utils.ts:25-29). Выбор типа управляет показом поля процентов через `isUsePercent` (:49-56, 158-176).
- Динамический список URL-пар: `url` — TextField required «Input URL» (:142-155) и `percent` — TextField type=number «Percent» (только для Split) (:158-176); кнопки: DeleteIcon у каждой строки (`handleRemoveInput`, :66-73) и «add url» (`handleAddInput`, добавляет `{url:'', percent:100}`, :59-64). Валидации процентов нет.
- «SAVE» — type=submit → `onSave({name, type, offers: fields})` (:88-96).

## 5. EditPage

Файл: client/src/pages/EditPage.tsx

1. **Маршрут**: `/group/:id`, авторизованные (client/src/routes.tsx:20); `id` — параметр (`useParams<RouteParams>`, client/src/pages/EditPage.tsx:14).
2. **Назначение**: редактор группы (кампании): настройки группы, стримы и их фильтры.
3. **UI**: целиком делегирован `Editor` (client/src/pages/EditPage.tsx:41-43): три колонки Paper — «Group» (`EditGroup` + Save/Delete), «Streams» (`EditStreams`), «Filters» (`EditFilters` или заглушка «SELECT STREAM OR CREATE NEW» при отсутствии выбранного стрима) (client/src/components/Editor.tsx:45-85).
4. **Формы**: в EditGroup/ModalStream/SelectFilter (ниже).
5. **Состояния**: загрузка — `<Loader />` при `loading` (client/src/pages/EditPage.tsx:36-38) и внутри Editor (group отсутствует → Loader, Editor.tsx:57); фильтры без выбора стрима — текст-заглушка (Editor.tsx:76-79).
6. **Переходы**: «Delete» → `removeGroup()` затем `history.push('/dashboard')` (client/src/pages/EditPage.tsx:27-31); Save → `saveEditGroup()` без перехода (:23-25).
7. **Хуки/контексты**: `GroupContext` (fetchGroup/saveEditGroup/removeGroup), react-router `useHistory`/`useParams`.

### Вложенные компоненты Edit

**EditGroup** (client/src/components/EditGroup.tsx:29-230): та же форма, что ModalGroup, но инициализированная из `group` и автоматически синхронизирующая каждое изменение в контекст через `editGroup(...)` в useEffect (:51-66) — сохранение на сервер отдельной кнопкой Save в Editor. Поля: `label` (TextField required), `identifier` (TextField required), Select «Type redirect», `FieldCode`, `timeUnic` (number), Checkbox «Check unique», «Active», «Logging» (:89-229). Валидации нет.

**FieldCode** (client/src/components/FieldCode.tsx:23-103): поле кода редиректа; при `type === 'textInput'` — TextField с label=description (:64-79); при `'select'` — подгружает офферы (`fetchOffer`) и рендерит Select офферов (:81-101), при отсутствии офферов — сообщение «Add offer on Offer Page» с кнопкой-ссылкой `/offers` (:82-91); если единственный оффер — выбирается автоматически (:34-43); при type=null (Remote, коды ошибок, Stop) — ничего не рендерит (:103).

**EditStreams** (client/src/components/EditStreams.tsx:10-99): кнопка «Add Stream» (открывает `ModalStream`, предварительно `clearStream()`/`clearFilters()`, :46-49); сортируемый список `SortableListStreams` (react-sortable-hoc, drag по Y, `arrayMove` → `editPositionStreams`, :38-42, 51-54); клик по стриму — `findStream` (выбор, :63-66), иконки Edit (открыть модалку) и Close (удалить `removeStream`) (:56-61, 67-69). Пусто: текст «No streams» при `!streams` (:57-59).

**ModalStream** (client/src/components/ModalStream.tsx:36-291) — форма добавления/редактирования стрима (Dialog, заголовок — имя стрима или «NEW STREAM»):
- `label` — TextField required «Label» (:168-180).
- Select «Type redirect» из `listTypeRedirect` (:182-207).
- `FieldCode` (:209-216).
- Реляция фильтров: два Checkbox «&&» / «||» (взаимоисключающие, `relation`) (:228-246).
- Checkbox «This bot stream» (`isBot`), «Active», «Logging» (:248-280).
- «SAVE» → если новый стрим — `addStream(stream)`, иначе `updateStreams(stream)`; при этом поля уже записаны в `stream` контекста через `editStream(...)` в useEffect (:99-116); ошибки — снекбар (:118-123). Валидации нет; save обёрнут в try/catch (:90-98).

**EditFilters** (client/src/components/EditFilters.tsx:12-80): `SelectFilter` (форма добавления/редактирования фильтра) + сортируемый список `SortableListFilters` (drag, `arrayMove` → `editPositionFilters`, позиция определяет порядок применения фильтров); клик — `findFilter`, крестик — `removeFilter`; изменения списка автоматически пишутся `updateFilters(filters)` при выбранном стриме (:32-36). Пусто: «NO FILTERS» (:70-72).

**SelectFilter** (client/src/components/SelectFilter.tsx:16-146): Select «Type filter» из `listFiltrs` (15 фильтров: Devices, Countries, Bot Ipv6, Browsers, OS, Platforms, Cities, Browser languages, Useragent includes, Referrer includes, Referrer is Null, Useragent is Null, Ipv6 mask, Use list ips, Use list signature — client/src/utils/edit.utils.ts:478-518); под ним `InputFieldFilter` с значением, зависящим от типа; кнопка ADD/EDIT, disabled пока значения не заполнены (`disabledBtn` логика: boolean → активна; пустой массив или отсутствие типа → disabled, :30-45). `filterHandler` вызывает `addFilter` или `editFilter` с `{name, action, position}` (:67-84); валидация — только блокировка кнопки при пустом значении (:68-70).

**InputFieldFilter** (client/src/components/InputFieldFilter.tsx:16-133): три вида ввода по `filterObj.type`: тип 1 — Checkbox (например, Referrer is Null) (:77-88); тип 2 — multi-`Autocomplete` (Devices, Countries, Browsers, OS, Platforms) с опциями из valueObj (:89-105); тип 3 — `ChipInput` (Cities, языки, UA/Referrer includes, Ipv6 mask) (:106-116). Без выбранного типа — «Select type filter» (:68-70); значение передаётся наверх через `onValue` (:51-58).

**SortableListStreams / SortableListFilters** (client/src/components/SortableListStreams.tsx:9-74, SortableListFilters.tsx:9-58): обёртки react-sortable-hoc (SortableContainer/SortableElement/SortableHandle) над MUI List; в стримах — DragHandle, имя, кнопки Edit/Close; в фильтрах — DragHandle, читаемое имя фильтра из `listFiltrs`, кнопка Close.

## 6. SettingsPage

Файл: client/src/pages/SettingsPage.tsx

1. **Маршрут**: `/settings`, авторизованные (client/src/routes.tsx:23).
2. **Назначение**: глобальные настройки приложения: общие (General) и списки (Other).
3. **UI**: MUI-lab `TabContext/TabList/TabPanel` с табами «General» и «Other» (client/src/pages/SettingsPage.tsx:27-41).
4. **Формы**: в `GeneralOption` и `OtherOption`+`ModalListOtherOption` (ниже).
5. **Состояния**: загрузка — `<Loader />` (client/src/pages/SettingsPage.tsx:20-22); ошибок на уровне страницы нет.
6. **Переходы**: нет.
7. **Хуки/контексты**: `SettingsContext` (`fetchSettings` при монтировании, :17-19).

### Вложенные компоненты Settings

**GeneralOption** (client/src/components/GeneralOption.tsx:22-231) — Paper с формой (сабмита нет, кнопка SAVE c onClick):
- `postbackKey` — Input text «Postback» (helper «Global postback key») (:79-91); без валидации.
- `clearDayStatistic` — Input number «Clear statistics days» (сколько хранить статистику) (:92-104).
- `clearRemote` — Input number «Clear remote days» (:105-117).
- `trash` — native Select из `listTrashOption`: «Redirect on URL» / «404 not found» (client/src/utils/edit.utils.ts:22-25; GeneralOption.tsx:118-135).
- `trashUrl` — Input text «Trash URL» (helper «Link on trash») (:136-148).
- `getKey` — Input text «Query key» (имя GET-параметра keyword) (:149-160).
- `logLimitClick` — Input number «Limit click» (сколько кликов показывать на дашборде) (:161-173), default 10.
- `logLimitAmount` — Input number «Limit amount» (:174-186), default 10.
- Кнопка «SAVE» → `updateSettings({...})` c приведением чисел через `+` (:60-74). Валидации полей нет. Локальный loading вкладки — Loader (:77-79).

**OtherOption** (client/src/components/OtherOption.tsx:17-138): Paper со списком трёх наборов (:26-33): «List black IP», «Black Signature», «Remote url» с счётчиками элементов из контекста; у каждого — ButtonGroup Edit/Add/Delete/Clear (:63-97): `clear` — сразу `clearList(type)`; `edit`/`add` — `fetchList(type)` и открытие модалки; `delete` — открывает модалку с действием delete (кликHandler, :35-50). Ошибок/пустых состояний здесь нет.

**ModalListOtherOption** (client/src/components/ModalListOtherOption.tsx:29-93): Dialog «List for {action}» с одним многострочным TextField (multiline, 15 строк) — значения списков редактируются как текст «по одному в строке»; SAVE (`clickButtonHandler`) разбивает по `\n` и вызывает `onSave(string[])` (:39-42, 78-88); при `loading` — Loader (:44-46). Валидации нет; `defaultValue` не синхронизируется с props при смене списка (initial state, :37).

## 7. InfoPage

Файл: client/src/pages/InfoPage.tsx

1. **Маршрут**: `/information`, авторизованные (client/src/routes.tsx:24); в меню подписан как «FAQ» (client/src/components/ListItemsDrawer.tsx:40-44).
2. **Назначение**: статическая страница ссылок: документация (whalestracker.netlify.app), GitHub, Telegram-группа, Issues (:7-51).
3. **UI**: 4 блока `Typography variant="body1"` с внешними `<a target="_blank">`-ссылками.
4. **Формы**: нет.
5. **Состояния**: нет (статика; loading/error/empty отсутствуют).
6. **Переходы**: только внешние ссылки, на другие экраны не переходит.
7. **Хуки/контексты**: не использует.

---

## Layout (каркас авторизованной части)

- client/src/components/Layout.tsx:26-128: фиксированный AppBar с заголовком «Whale's Tracker v0.3» (:75) и кнопкой выхода `ExitToApp` → `logout()` (:70-79); persistent Drawer слева (:85-110) с `mainListItems` (навигация Dashboard/Statistic/Offers/Settings/FAQ через react-router `Link`, ListItemsDrawer.tsx:13-46) и секцией GROUPS — `ListGroupDrawer` (ListItemsDrawer.tsx + ListGroupDrawer.tsx:11-25: элемент на каждую группу — `Link` на `/group/<id>`); контент + `Copyright` (:112-121). Группы загружаются `fetchGroups()` при аутентификации (:38-53).

---

## Все файлы client/src/components/ (роль каждого)

| Файл | Роль |
|---|---|
| AuthPage-не related — см. ниже по алфавиту | |
| CardDashboard.tsx | Сетка из 4 карточек итогов (Hits/Uniques/Sales/Amount) на Dashboard. |
| CardInfo.tsx | Переиспользуемая карточка «заголовок + значение» (MUI Card) для дашборда. |
| Chart.tsx | Линейный график recharts (текущий и предыдущий период) на Dashboard. |
| Copyright.tsx | Подстрочная строка «Copyright © Whale's Tracker {год}» в Layout. |
| EditFilters.tsx | Панель фильтров выбранного стрима на странице группы: SelectFilter + сортируемый список фильтров. |
| EditGroup.tsx | Форма редактирования полей группы на странице группы (синхронизация с контекстом на каждое изменение). |
| EditStreams.tsx | Панель стримов группы: добавление, сортировка, выбор, редактирование, удаление. |
| Editor.tsx | Трёхколоночный каркас страницы /group/:id (Group / Streams / Filters) с кнопками Save и Delete. |
| FieldCode.tsx | Динамическое поле «код редиректа»: текстовое поле, Select офферов или ничего — по типу редиректа. |
| GeneralOption.tsx | Вкладка General настроек: 8 глобальных параметров + SAVE. |
| InputFieldFilter.tsx | Ввод значения фильтра (Checkbox / Autocomplete / ChipInput) по типу фильтра. |
| Layout.tsx | Общий каркас авторизованного приложения: AppBar, drawer-навигация, список групп, logout. |
| ListGroupDrawer.tsx | Пункты групп в drawer-меню со ссылками на /group/:id. |
| ListItemsDrawer.tsx | Статичные пункты главного меню drawer (Dashboard/Statistic/Offers/Settings/FAQ). |
| ListOffers.tsx | Список офферов с выбором/удалением и кнопкой Add Offer (страница /offers). |
| Loader.tsx | Универсальный индикатор загрузки (MUI CircularProgress). |
| MenuDashboard.tsx | Панель фильтров дашборда (Group/Stream/Ignore bot/Type/Interval/Refresh). |
| MenuStatistic.tsx | Панель фильтров статистики (Group/Stream/даты/Interval/Refresh) с пересчётом дат по интервалу. |
| ModalGroup.tsx | Диалог создания группы с формы (открывается FAB на Dashboard). |
| ModalListOtherOption.tsx | Диалог редактирования списков настроек (black IPs / signatures / remote urls) как многострочного текста. |
| ModalOffer.tsx | Диалог создания/редактирования оффера: имя, тип распределения, динамический список URL/percent. |
| ModalStream.tsx | Диалог создания/редактирования стрима группы. |
| OtherOption.tsx | Вкладка Other настроек: списки black IP / signatures / remote url с действиями Edit/Add/Delete/Clear. |
| SelectFilter.tsx | Форма выбора типа фильтра и его значения, кнопка ADD/EDIT (внутри EditFilters). |
| SortableListFilters.tsx | Сортируемый (drag) список фильтров стрима (react-sortable-hoc). |
| SortableListStreams.tsx | Сортируемый (drag) список стримов с кнопками Edit/Remove (react-sortable-hoc). |
| TabStatistic.tsx | Обёртка вкладки статистики: перезагрузка данных при смене типа + переключение Loader/таблица. |
| TableLastAmount.tsx | Таблица mui-datatables последних «amount»-событий (Last Amount) на Dashboard. |
| TableLastClick.tsx | Таблица mui-datatables последних кликов (Last Click) на Dashboard. |
| TableStatistic.tsx | Таблица mui-datatables статистики (Hits/Uniques/EPM/Sales/Amount) на /statistic. |

Неиспользуемых компонентов не обнаружено: каждый из 30 файлов импортируется хотя бы одной страницей или другим компонентом (проверено по импортам в pages/* и перекрёстным импортам: например, `useIsMounted` — хук, не компонент, и он в components не импортируется; среди компонентов «мёртвых» нет).

## Замечания / неясности

- `hooks/isMounted.hook.ts` — в pages/components вызовов `useIsMounted()` не найдено; назначение не ясно (видимо, заготовка).
- Экспорт контекста офферов назван `OfferContex` (без буквы «t») — client/src/context/OfferState.tsx; все места использования разделяют эту опечатку (client/src/pages/OfferPage.tsx:2, client/src/components/ListOffers.tsx:7, client/src/components/FieldCode.tsx:10).
- Ни одна форма не имеет настоящей клиентской валидации (только MUI-атрибут `required`, который в основном обезврежен `noValidate`/onClick-сабмитом); числа и URL не проверяются.
- Обработка ошибок HTTP централизована: `useHttp` кладёт сообщение в `error` и делает logout при 401 (client/src/hooks/http.hook.ts:31-40); показ — через notistack-снекбары в AuthPage, ModalGroup, ModalStream.
