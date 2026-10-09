# WhalesTracker — UI-спецификация для повторения с нуля

> Каноническая спецификация интерфейса админки для полного повторения WhalesTracker с нуля. Принцип: **поведение и UI — контракт**: все видимые тексты, подписи, сообщения об ошибках и реакции на действия пользователя воспроизводятся досословно; опечатки оригинала (`Usename`, `This mounth`, `Last mounth`, `Evely`) — часть контракта и переносятся буквально. Выявленные дефекты поведения, которые не нужно воспроизводить, вынесены в §8 «Известные проблемы» и помечены «известная проблема / воспроизводить не нужно».
>
> Каждое утверждение снабжено источником `файл:строка` по коду `client/src`. Общие сведения об архитектуре — [01-architecture.md](01-architecture.md); детальное описание экранов и контекстов — [04-screens.md](04-screens.md) (дубли против него заменены ссылками); эндпоинты — [02-api.md](02-api.md). Стек UI: `@material-ui/core ^4.10.1`, React 16.13, notistack 0.9, mui-datatables 2.15, recharts 1.8, @material-ui/pickers 3.2, react-sortable-hoc 1.11, material-ui-chip-input 2.0.0-beta (client/package.json, блок dependencies).

---

## 0. Глобальные договорённости (общие для всех страниц)

### 0.1 Тема MUI: палитра и типографика

Единственная тема приложения `Themes` (client/src/styles.ts:10-15):

```ts
createMuiTheme({
  palette: { type: 'light', primary: blueGrey },
})
```

- **Палитра**: тип `light`; primary — материальный `blueGrey`: 50 `#eceff1`, 100 `#cfd8dc`, 200 `#b0bec5`, 300 `#90a4ae`, 400 `#78909c`, 500 `#607d8b`, 600 `#546e7a`, 700 `#455a64`, 800 `#37474f`, 900 `#263238` (styles.ts:8,12-13; импорт `@material-ui/core/colors/blueGrey`). Secondary и error — дефолты MUI v4: secondary `#f50057`/`#c51162`, error `#f44336`.
- **Типографика**: дефолты MUI v4 — Roboto; h1–h6 от 6rem до 3.75rem, body1 1rem, body2 0.875rem; переопределений `typography`/`fontFamily` в коде нет (тема создаётся только в styles.ts:10-15).
- **Spacing/breakpoints**: дефолты MUI v4 (базовые breakpoints xs 0, sm 600, md 960, lg 1280, xl 1920 — в основной теме не переопределялись); `drawerWidth = 240` (styles.ts:17).
- **Глобальные стили** `useStyles` (styles.ts:19-82): `root` flex (styles.ts:21-23); `fab` — fixed, bottom/right `theme.spacing(2)` (styles.ts:24-28); `appBar`/`appBarShift` — transition margin+width, сдвиг на 240 (styles.ts:29-42); `drawerPaper` width 240 (styles.ts:49-55); `drawerHeader` = `theme.mixins.toolbar`, justify flex-end (styles.ts:56-63); `content` padding `spacing(1)`, marginLeft −240; `contentShift` marginLeft 0 (styles.ts:64-79).
- **Локальная тема таблиц** (mui-datatables) в трёх компонентах: переопределённые breakpoints `xs:0, sm:400, md:600, lg:1280, xl:1920` и overrides `MUIDataTableBodyCell.stackedCommon { '@media (max-width:599.95px)': { height:'100%', padding:0 } }`, `MuiTableCell.root { padding:'2px', paddingLeft:'1rem' }` — client/src/components/TableLastClick.tsx:35-63, TableLastAmount.tsx:36-64, TableStatistic.tsx:36-64.

### 0.2 Каркас Layout (все страницы, кроме Auth)

Точка входа: `ThemeProvider(theme={Themes})` → `SnackbarProvider maxSnack={3} preventDuplicate={false}` → `BrowserRouter basename={process.env.PUBLIC_URL}` → `App` (client/src/index.tsx:11-22). Авторизованная часть: цепочка провайдеров `AuthContext → GroupState → StatisticState → DashboardState → SettingsState → OfferState → Layout` (client/src/App.tsx:32-48); неавторизованная — только `AuthContext.Provider` + роуты (App.tsx:22-30). Пока `!ready` — `<Loader />` (App.tsx:18-20).

```
┌──────────────────────────────────────────────────────────────┐
│ AppBar (fixed): [≡] Whale's Tracker v0.3          [⏻ Exit]   │
├──────────┬───────────────────────────────────────────────────┤
│ Drawer   │  content (padding 8px, сдвиг при открытом drawer) │
│ (240px,  │                                                   │
│ persist) │   … содержимое страницы …                        │
│ Dashboard│                                                   │
│ Statistic│                                                   │
│ Offers   │                                                   │
│ Settings │                                                   │
│ FAQ      │                                                   │
│ ──────── │                                                   │
│ GROUPS   │                                                   │
│ <группа1>│                                                   │
│ <группа2>│                                                   │
├──────────┴───────────────────────────────────────────────────┤
│          Copyright © Whale's Tracker {год}.                   │
└──────────────────────────────────────────────────────────────┘
```

- `CssBaseline` — Layout.tsx:55. AppBar fixed, класс `appBar` (+`appBarShift` при открытом drawer) — Layout.tsx:56-61.
- Toolbar: IconButton-«гамбургер» `MenuIcon` (aria-label `open drawer`, скрывается при открытом drawer) — Layout.tsx:63-74; заголовок **`Whale's Tracker v0.3`** (Typography h6 noWrap) — Layout.tsx:76-78; справа IconButton `ExitToApp` (выход: `logout()` → редирект на `/auth`) — Layout.tsx:80-88, App.tsx:22-30.
- Drawer persistent, anchor left, ширина 240 — Layout.tsx:91-99: header с ChevronLeft/ChevronRight (закрытие) — Layout.tsx:100-108; `Divider`; список `mainListItems` — 5 пунктов: **`Dashboard`** (Speed), **`Statistic`** (Equalizer), **`Offers`** (LocalOffer), **`Settings`** (Settings), **`FAQ`** (Help) — client/src/components/ListItemsDrawer.tsx:12-44; `Divider`; `ListSubheader inset` **`GROUPS`** (Layout.tsx:113) + список групп: каждый пункт — ссылка `/group/${group._id}` с текстом `group.label` — client/src/components/ListGroupDrawer.tsx:14-26.
- main: `{props.children}` + `<Copyright />` — Layout.tsx:117-125. Copyright дословно: `Copyright © Whale's Tracker {год}.` (Typography body2, textSecondary, align center, padding `spacing(5,0,2,0)`) — client/src/components/Copyright.tsx:14-25.
- Группы грузятся `GroupContext.fetchGroups()` при монтировании, если авторизован — Layout.tsx:41-50.

### 0.3 Роутинг и навигация

Авторизован (client/src/routes.tsx:14-23): `/dashboard` → DashboardPage; `/group/:id` → EditPage; `/statistic` → StatisticPage; `/offers` → OfferPage; `/settings` → SettingsPage; `/information` → InfoPage; прочее → `Redirect to="/dashboard"`. Не авторизован: `/auth` → AuthPage, прочее → `Redirect to="/auth"` (routes.tsx:25-30). Защита клиентская: userId в localStorage под ключом `Data` (client/src/hooks/auth.hook.ts:3,10-17,19-25); при HTTP 401 `useHttp` вызывает `logout()` (client/src/hooks/http.hook.ts:34-37).

Все переходы между страницами: Drawer-меню (ListItemsDrawer.tsx:12-44; ListGroupDrawer.tsx:14-26); создание группы с Dashboard → `/group/<_id>` (ModalGroup.tsx:94-98); удаление группы на EditPage → `/dashboard` (EditPage.tsx:29-32); ссылка `Offer Page` (`href="/offers"`) из FieldCode при пустом списке оферов (FieldCode.tsx:64-76); выход → `/auth` (Layout.tsx:85-87 + App.tsx:22-30).

### 0.4 Индикация загрузки и тосты (единые правила)

- **Загрузка** — везде `<Loader />`: CircularProgress по центру, marginTop 50px — client/src/components/Loader.tsx:4-16. Используется в App (App.tsx:18-20), на страницах Statistic/Offer/Settings/Edit, вместо графика на Dashboard, внутри модалок и FieldCode (полный список — §9.4 отчёта; см. [04-screens.md](04-screens.md)). На кнопках — `disabled` во время загрузки (AuthPage.tsx:101, Editor.tsx:70/81, MenuDashboard.tsx:236, MenuStatistic.tsx:293).
- **Тосты** — notistack `SnackbarProvider maxSnack={3} preventDuplicate={false}` (index.tsx:14); вызов `useMessage()` → `enqueueSnackbar(msg)`, вариант default — client/src/hooks/message.hook.ts:3-7.
- **Ошибки** — снекбар с текстом от сервера (`data.message`); фолбэк-текст **`Something went wrong`** — http.hook.ts:38. Глобального error-boundary/страницы ошибки нет. Дословные тексты всех снекбаров — §8.4 ниже и разделы страниц.

### 0.5 Правило форм и валидации

Ни одна форма не имеет настоящей клиентской валидации: на AuthPage форма `noValidate` (обезвреживает `required`), формы в диалогах сабмитятся по `onClick`, а не form submit; числа и URL не проверяются — [04-screens.md](04-screens.md) «Замечания». Единственная «валидация» — блокировка кнопки `ADD`/`EDIT` у фильтров при пустом значении (SelectFilter.tsx:43-57) и HTML-атрибуты `required`. Отсутствие валидации — известная проблема, воспроизводить не нужно (§8, п. 8.6): при повторении допускается добавить валидацию, не меняя дословные тексты.

---

## 1. AuthPage (`/auth`)

Файл: client/src/pages/AuthPage.tsx. Видна только неавторизованным (routes.tsx:27).

### 1.1 Каркас (wireframe)

```
┌──────────────────────────────────┐
│ Container maxWidth="xs"          │
│   (paper: marginTop 8, колонка   │
│    по центру, без лого)          │
│ ┌──────────────────────────────┐ │
│ │ [Usename            ]        │ │
│ │ [Password            ]       │ │
││ [        Sign In       ]      │ │
│ └──────────────────────────────┘ │
└──────────────────────────────────┘
```

Структура: `Container maxWidth="xs"` (AuthPage.tsx:67) → форма `noValidate` (AuthPage.tsx:69) без обёртки/лого; paper marginTop 8, колонка по центру — AuthPage.tsx:15-29. Layout не рендерится.

### 1.2 Форма

| Поле | Компонент | Тип/атрибуты | Label (дословно) | Валидация | Источник |
|---|---|---|---|---|---|
| username | TextField | margin normal, required, fullWidth, autoComplete `username`, autoFocus | **`Usename`** (опечатка — часть контракта) | только HTML `required`, но форма `noValidate` — фактически не срабатывает | AuthPage.tsx:70-81, 69 |
| password | TextField | required, fullWidth, type `password`, autoComplete `current-password` | **`Password`** | аналогично — нет | AuthPage.tsx:82-93 |

Кнопка: **`Sign In`** — contained/primary, fullWidth, `disabled={loading}` (AuthPage.tsx:94-104).

### 1.3 Логика и тосты

POST `/api/auth/login` с `{username, password}` (AuthPage.tsx:57-59); успех → `auth.login(data.id)` + снекбар **`Good authentication!`** (AuthPage.tsx:60-62); любая ошибка → снекбар с текстом сервера: `useEffect` на `error` → `message(error)` + `clearError()` (AuthPage.tsx:41-46); фолбэк **`Something went wrong`** (http.hook.ts:38).

### 1.4 Состояния

- **Загрузка**: только disabled-кнопка `Sign In`, отдельного лоадера нет (AuthPage.tsx:101).
- **Пусто**: состояния нет.
- **Ошибка**: snackbar (см. §1.3).
- **Ресайз**: `maxWidth="xs"` — центральная узкая колонка на всех экранах (AuthPage.tsx:67).

### 1.5 Тема/типографика

Глобальная тема §0.1, собственных переопределений палитры и типографики нет (styles.ts:10-15 — единственная тема). Тексты — дефолтные варианты MUI (body1 для label TextField, кнопка contained primary → blueGrey).

---

## 2. DashboardPage (`/dashboard`, страница по умолчанию)

Файл: client/src/pages/DashboardPage.tsx. Маршрут: routes.tsx:15,21.

### 2.1 Каркас (wireframe)

```
┌ AppBar + Drawer (§0.2) ────────────────────────────────────┐
│ [Hits][Uniques][Sales][Amount]  ← CardDashboard (4 карточки)│
│ [Group▾][Stream▾][☑ Ignore bot][Type▾][Interval▾][Refresh] │
│ ┌──────────────── Линейный график Chart ─────────────────┐ │
│ │ (текущий период + предыдущий пунктиром)                │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Таблица "Last Amount" (10 строк, пагинация)                  │
│ Таблица "Last Click"  (10 строк, пагинация)                  │
│                                                        (＋)  │ ← FAB
└──────────────────────────────────────────────────────────────┘
```

Структура (сверху вниз) — DashboardPage.tsx:35-57: `CardDashboard` (:37) → `MenuDashboard` (:38) → `Chart` в `Grid item xs={12}`, при `loading` — `<Loader />` (:39-43) → `TableLastAmount` (:44) → `TableLastClick` (:45) → FAB `+` (AddIcon, color primary, fixed bottom-right, `classes.fab`) → открывает `ModalGroup` (:49-55; стиль styles.ts:24-28) → `ModalGroup` при `openModal` (:46-48). Данные: `clearGroup()` при монтировании (:27-29); `fetchDashboard()` при каждом изменении `interval` (:31-33) — GET `/api/info/stats/dashboard` c query `{type, groups, streams, ignoreBot, country}` — client/src/context/DashboardState.tsx:83-96. Состав контекста — [04-screens.md §2](04-screens.md).

### 2.2 Карточки-метрики (CardDashboard/CardInfo)

`Grid container justify="space-evenly" spacing={2}`; каждый item `xs={6} sm={3}` (2×2 на мобиле, 4 в ряд от sm) — client/src/components/CardDashboard.tsx:21-44. Заголовок карточки: Typography color primary, h6; ниже `Divider`, значение h6. Карточки: **`Hits`**, **`Uniques`**, **`Sales`**, **`Amount`** (Amount через `toCurrency`, USD `Intl.NumberFormat('en-US')`) — CardDashboard.tsx:29-43; client/src/utils/money.utils.ts:1-7. При загрузке показывается `0` — CardDashboard.tsx:30-42.

### 2.3 Панель фильтров (MenuDashboard)

`Grid container direction="row" justify="space-between"`; FormControl minWidth 140px — client/src/components/MenuDashboard.tsx:24-39. Поля:

| Поле | Тип | Значения (дословно) | Источник |
|---|---|---|---|
| **`Group`** | Select native (InputLabel, shrink) | `All` (`value=''`) + все группы (`label`); смена группы сбрасывает stream | MenuDashboard.tsx:128-147, 82-91 |
| **`Stream`** | Select native | `All` + стримы выбранной группы (`name`) | MenuDashboard.tsx:150-171 |
| **`Ignore bot`** | Checkbox (labelPlacement start) | — | MenuDashboard.tsx:173-189 |
| **`Type`** (линия графика) | Select native из `linesChartDashboard` | `Hits` / `Uniques` / `Amount` / `Sales` | MenuDashboard.tsx:191-209; edit.utils.ts:540-548 |
| **`Interval`** | Select native из `intervalDashboard` | `Day` / `Week` | MenuDashboard.tsx:211-229; edit.utils.ts:532-538 |
| **`Refresh`** | Кнопка contained primary, `disabled={menu.loading}`, item `xs={12} sm={1}` | → `fetchDashboard()` | MenuDashboard.tsx:231-242 |

Любое изменение фильтров диспатчит `updateValue({ignoreBot, streams:[streamId], groups:[groupId], country:[], typeLines, interval})` — MenuDashboard.tsx:71-80. Валидации нет.

### 2.4 График (Chart)

Recharts `ResponsiveContainer width="99%" maxHeight={400} aspect={1}`; `LineChart`: XAxis dataKey `value`, YAxis скрыт, сетка `3 3`, Tooltip; две линии: текущая `typeLines` — `stroke="#607d8b"`, strokeWidth 5, activeDot r=18; предыдущий период `typeLines_last` — `stroke="#82ca9d"`, strokeWidth 3, dashed `3 3` — client/src/components/Chart.tsx:30-57. Подписи оси X: часы `HH:00` при interval=day, иначе `Mon…Sun` — DashboardState.tsx:50-75.

### 2.5 Таблицы (mui-datatables)

Общие опции обеих таблиц: `responsive:'stacked'`, `selectableRows:'none'`, `filter:false`, `filterType:'dropdown'`, `rowsPerPage:10`, `rowsPerPageOptions:[10,25,50,100,500]`, `print:false`, `download:false` — client/src/components/TableLastAmount.tsx:196-205, TableLastClick.tsx:211-220. Локальная тема таблиц (breakpoints/overrides) — §0.1.

**`Last Amount`** — заголовок дословно `'Last Amount'` (TableLastAmount.tsx:209-218); колонки (все filter:true, sort:true): `Time, Group, Stream, Device, Country, City, Ip, Useragent, Amount` — TableLastAmount.tsx:120-180. Спец-рендер: Device — иконки (desktop → DesktopWindowsIcon, mobile → SmartphoneIcon, иное → DevicesOtherIcon) — TableLastAmount.tsx:104-115; Country — флаг через react-flag-icon-css, при длине >7 или пустом — пробел `' '` — TableLastAmount.tsx:71-102; Amount — `toCurrency` — TableLastAmount.tsx:192.

**`Last Click`** — заголовок дословно `'Last Click'` (TableLastClick.tsx:225-231); колонки: `Time, Group, Stream, Device, Country, City, Ip, Useragent, Unique, Bot, Out` — TableLastClick.tsx:119-193; Unique/Bot рендерятся как `'+'`/`'-'` — TableLastClick.tsx:205-206.

### 2.6 Диалог `CREATE GROUP` (ModalGroup)

Dialog, `aria-labelledby="form-stream"`, заголовок дословно **`CREATE GROUP`** — client/src/components/ModalGroup.tsx:122-129. Поля:

| Поле | Тип | Label (дословно) | Дефолт | Валидация | Источник |
|---|---|---|---|---|---|
| label | TextField size small, required, fullWidth | **`Label`** | `''` | только required-атрибут (форма не в `<form>`) | ModalGroup.tsx:132-144 |
| identifier | TextField, required, fullWidth | **`Identifier`** | `shortid.generate()` — client/src/utils/generator.utils.ts:4-6 | — | ModalGroup.tsx:145-160 |
| typeRedirect | Select native | **`Type redirect`** | `'httpRedirect'` | — | ModalGroup.tsx:75-77, 161-188 |
| code | FieldCode (см. §5.6) | описание по типу | `''` | — | ModalGroup.tsx:189-201 |
| timeUnic | TextField type number | **`Hour Unique`** | `24` | — | ModalGroup.tsx:82, 203-216 |
| checkUnic | Checkbox | **`Check unique`** | `false` | — | ModalGroup.tsx:83, 218-233 |
| isActive | Checkbox (label start) | **`Active`** | `true` | — | ModalGroup.tsx:84, 235-252 |
| useLog | Checkbox | **`Logging`** | `true` | — | ModalGroup.tsx:85, 253-268 |

Кнопка **`Save`** (fullWidth contained primary) → POST `/api/edit/group/create` (ModalGroup.tsx:271-282; запрос — client/src/context/GroupState.tsx:129-149). Ошибка — снекбар: серверный `error` (ModalGroup.tsx:87-92); при отсутствии `_id` в ответе — дословно **`Error on create group`** (GroupState.tsx:137-139). Успех → переход `/group/<_id>` (ModalGroup.tsx:94-98).

### 2.7 Состояния

- **Загрузка**: `<Loader />` вместо графика при `loading` (DashboardPage.tsx:41); карточки показывают `0` (CardDashboard.tsx:30-42); кнопка `Refresh` disabled (MenuDashboard.tsx:236).
- **Пусто**: график — `if (!stats.length) return <Loader />` (Chart.tsx:25-27) — отдельного empty-state нет; dashboard-таблицы при `loading && !value.length` не рендерятся вовсе — `if (loading && !value.length) return <></>` (TableLastAmount.tsx:116-119, TableLastClick.tsx:116-118). Отображение таблиц при пустых данных без загрузки — строки отсутствуют (заголовок таблицы остаётся).
- **Ошибка**: снекбары контекста (DashboardState.tsx:43-48; `Error on create group` — GroupState.tsx:137-139).
- **Ресайз**: карточки `xs={6} sm={3}` — 2×2 → 4 в ряд (CardDashboard.tsx:29-42); `Refresh` `xs={12} sm={1}` (MenuDashboard.tsx:231); фильтры фикс. minWidth 140px в flex-row; таблицы `responsive:'stacked'` + свои breakpoints — §0.1; пары полей ModalGroup `xs={6} sm={6}` (ModalGroup.tsx:202,218,236,253).

### 2.8 Тема/типографика

Глобальная тема §0.1; локальные переопределения — только тема mui-datatables в TableLastAmount/TableLastClick (breakpoints `xs:0, sm:400, md:600…`, `MuiTableCell.root { padding:'2px', paddingLeft:'1rem' }` — TableLastAmount.tsx:36-64, TableLastClick.tsx:35-63). Заголовки карточек — h6 primary (blueGrey 500 `#607d8b`); линия графика — `#607d8b` (совпадает с primary), предыдущий период — `#82ca9d` (Chart.tsx:44,52).

---

## 3. StatisticPage (`/statistic`)

Файл: client/src/pages/StatisticPage.tsx. Маршрут: routes.tsx:17.

### 3.1 Каркас (wireframe)

```
┌ AppBar + Drawer (§0.2) ──────────────────────────────────────┐
│      [ Days ][ Countries ][ Devices ][ Queries ]  ← Tabs     │
│ [Group▾][Stream▾][Date Start][Date End][Interval▾][Refresh]  │
│ ┌──────────────── Таблица статистики ──────────────────────┐ │
│ │ <Day|Country|Device|Query> | Hits | Uniques | EPM |      │ │
│ │                            | Sales | Amount |             │ │
│ └───────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Структура: `Tabs` centered, indicator/textColor primary — 4 таба, все `disabled={loading}`: **`Days`** (day), **`Countries`** (country), **`Devices`** (device), **`Queries`** (query) — StatisticPage.tsx:37-61; карта индексов `TAB={day:0, country:1, device:2, query:3}` — StatisticPage.tsx:6-11. Далее `TabStatistic` (StatisticPage.tsx:62): при смене таба `setType(key)` → `fetchStats()` по `useEffect [type]` (client/src/components/TabStatistic.tsx:8-12); рендер `MenuStatistic` + (`loading ? <Loader /> : <TableStatistic />`) — TabStatistic.tsx:15-19. Данные: GET `/api/info/stats` с query `{type, groups, streams, ignoreBot, startDate, endDate, country}` (даты `yyyy-MM-dd`) — client/src/context/StatisticState.tsx:72-101; фильтры персистятся в localStorage под ключом **`Stats`** (StatisticState.tsx:12, 40-55, 110-125).

### 3.2 Панель фильтров (MenuStatistic)

`Grid row justify="space-between"` + `MuiPickersUtilsProvider(DateFnsUtils)` — client/src/components/MenuStatistic.tsx:52-303. Поля:

| Поле | Тип | Значения (дословно) | Источник |
|---|---|---|---|
| **`Group`** | Select native | `All` + группы | MenuStatistic.tsx:196-217 |
| **`Stream`** | Select native | `All` + стримы группы | MenuStatistic.tsx:219-240 |
| **`Date Start`** / **`Date End`** | KeyboardDatePicker, autoOk, inline, `format="yyyy-MM-dd"`, кнопка aria-label `change date` | даты | MenuStatistic.tsx:242-269 |
| **`Interval`** | Select native из `intervalDate` | **`Today`, `Yesterday`, `Last 3 days`, `Last 7 days`, `Last 14 days`, `This week`, `Last week`, `This mounth`, `Last mounth`** (опечатки «mounth» — контракт) | MenuStatistic.tsx:270-288; edit.utils.ts:520-530 |
| **`Refresh`** | Кнопка contained primary, disabled при загрузке | → `fetchStats()` | MenuStatistic.tsx:289-299 |

Поведение: выбор интервала программно выставляет даты (subDays/startOfWeek weekStartsOn:1/startOfMonth — MenuStatistic.tsx:73-118); автокоррекция дат из будущего → `new Date()` (MenuStatistic.tsx:120-130); при смене фильтров `updateLocalStorage({...})` с `country: [], ignoreBot: false` (MenuStatistic.tsx:143-154). Валидации нет (кроме автокоррекции будущих дат).

### 3.3 Таблица (TableStatistic)

MUIDataTable с пустым заголовком `title={''}` (TableStatistic.tsx:196-201); опции: `rowsPerPage:500`, `rowsPerPageOptions:[25,50,100,500]`, остальные как у dashboard-таблиц (TableStatistic.tsx:182-191). Колонки: первая — имя типа с заглавной (`Day`/`Country`/`Device`/`Query`, из `type`) с рендером: country → флаг + код; device → иконки; остальное — текст (TableStatistic.tsx:71-142); далее **`Hits`, `Uniques`, `EPM`, `Sales`, `Amount`** (TableStatistic.tsx:143-154). `EPM` вычисляется как `amount / (hits/1000)`, `toFixed(1)` (TableStatistic.tsx:162-168); `Amount` — `toCurrency` (TableStatistic.tsx:178); сортировка по `hits` убыв. для всех типов, кроме `day` (TableStatistic.tsx:155-160).

### 3.4 Состояния

- **Загрузка**: `if (loading) return <></>` на уровне таблицы + `<Loader />` в TabStatistic (TableStatistic.tsx:120-122; TabStatistic.tsx:17); табы disabled при загрузке (StatisticPage.tsx:37-61).
- **Пусто** (единственный явный empty-state в приложении): `if (!stats.length && !loading) return <Typography align='center' variant='h5'>NO DATA STATS</Typography>` — дословно **`NO DATA STATS`** (TableStatistic.tsx:123-129).
- **Ошибка**: снекбар контекста (StatisticState.tsx:65-70).
- **Ресайз**: таблица `responsive:'stacked'` + своя тема (§0.1); фильтры minWidth 140px в flex-row.

### 3.5 Тема/типографика

Глобальная тема §0.1; локальное переопределение — тема mui-datatables в TableStatistic (TableStatistic.tsx:36-64, см. §0.1). Табы — indicator/textColor primary (blueGrey); empty-state — Typography h5 по центру (TableStatistic.tsx:123-129).

---

## 4. OfferPage (`/offers`)

Файл: client/src/pages/OfferPage.tsx. Маршрут: routes.tsx:18.

### 4.1 Каркас (wireframe)

```
┌ AppBar + Drawer (§0.2) ──────────────────────────────────────┐
│ ┌────────────────── Paper > List ──────────────────────────┐ │
│ │ <name> - <N> url. Distribution: <type>          [🗑]     │ │
│ │ <name> - <N> url. Distribution: <type>          [🗑]     │ │
│ └───────────────────────────────────────────────────────────┘ │
│ [           Add Offer            ]                            │
└──────────────────────────────────────────────────────────────┘
```

Структура: при `loading` — `<Loader />` на всю страницу (OfferPage.tsx:13-15); иначе `<ListOffers />` (OfferPage.tsx:17-21). Данные: `fetchOffer()` при монтировании → GET `/api/info/offers` (OfferPage.tsx:9-11; client/src/context/OfferState.tsx:36-50).

### 4.2 Список оферов (ListOffers)

`Paper > List`: каждый оффер — `ListItem button` с текстом-шаблоном дословно `` `${offer.name} - ${offer.offers.length} url. Distribution: ${offer.type}` `` (client/src/components/ListOffers.tsx:65-77); справа IconButton Delete (aria-label `delete`) → `deleteOffer(id)` → DELETE `/api/edit/offers/<id>` (ListOffers.tsx:78-86; OfferState.tsx:85-105). Клик по элементу → `selectOffer(offer)` → модалка редактирования (ListOffers.tsx:52-54; OfferState.tsx:80-83). Кнопка **`Add Offer`** (contained primary fullWidth) внизу → `setModal()` (ListOffers.tsx:91-98).

### 4.3 Диалог `OFFER` (ModalOffer)

Dialog, заголовок дословно **`OFFER`** (client/src/components/ModalOffer.tsx:134); внутренняя `<form onSubmit>` (ModalOffer.tsx:135). Поля:

| Поле | Тип | Label (дословно) | Валидация | Источник |
|---|---|---|---|---|
| name | TextField outlined, required, fullWidth | **`Input name offer`** | только required | ModalOffer.tsx:144-155 |
| typeDistribution | Select native outlined (без InputLabel), из `listDistribution`: **`Split`** (с процентами), **`Rotator`**, **`Evely`** (опечатка — контракт) | — | — | ModalOffer.tsx:156-176; edit.utils.ts:47-51 |
| url (динамич. список) | TextField outlined required, по одному на элемент | **`Input URL`** | только required | ModalOffer.tsx:179-232 |
| percent (только Split) | TextField type number | **`Percent`** | нет | ModalOffer.tsx:205-220 |
| — | IconButton Delete у каждой строки (удаление URL) | — | — | ModalOffer.tsx:179-232 |

Поведение: выбор типа управляет показом поля Percent (`isUsePercent`) (ModalOffer.tsx:108-116, 205-220); кнопка **`add url`** (contained primary, нижний регистр — контракт) добавляет `{url:'', percent:100}` (ModalOffer.tsx:233-243, 93-100); кнопка **`SAVE`** (submit, contained primary fullWidth) → `onSave({name, type, offers})` (ModalOffer.tsx:246-255, 118-125); сохранение — POST `/api/edit/offers/edit` (OfferState.tsx:52-78).

### 4.4 Состояния

- **Загрузка**: `<Loader />` на всю страницу (OfferPage.tsx:13-15) и в ListOffers (ListOffers.tsx:39-41 по 04-screens.md).
- **Пусто**: список рендерится только при `offers.length > 0` — при отсутствии оферов видна только кнопка `Add Offer` (ListOffers.tsx:62-90); отдельного empty-state текста нет.
- **Ошибка**: снекбар контекста (OfferState.tsx:29-34).
- **Ресайз**: name `xs=12 sm=7`, select `sm=5`, URL `sm={9|11}`, percent `sm=2`, delete `sm=1` (ModalOffer.tsx:144,156,190,206,222) — стек на мобиле.

### 4.5 Тема/типографика

Глобальная тема §0.1; собственных переопределений палитры/типографики нет. Список — MUI List в Paper; кнопки contained primary (blueGrey).

---

## 5. EditPage (`/group/:id`)

Файл: client/src/pages/EditPage.tsx. Загрузка группы: `fetchGroup(params.id)` → GET `/api/edit/group/<id>` (EditPage.tsx:21-23,34-36; GroupState.tsx:101-123). При `loading` — `<Loader />` (EditPage.tsx:38-40), иначе `<Editor onSave onDelete />`.

### 5.1 Каркас (wireframe) — трёхколоночный Editor

```
┌ AppBar + Drawer (§0.2) ───────────────────────────────────────────────┐
│ ┌─ Group (sm=4) ──┐ ┌─ Streams (sm=3) ─┐ ┌─ Filters (sm=5) ──────────┐ │
│ │ Label        *  │ │ [ Add Stream ]   │ │ [Type filter ▾][EDIT|ADD] │ │
│ │ Identifier   *  │ │ ⠿ stream1 ✎ ✕   │ │ ─────────────────────────  │ │
│ │ Type redirect ▾ │ │ ⠿ stream2 ✎ ✕   │ │ ⠿ Devices        ✕         │ │
│ │ <FieldCode>     │ │                  │ │ ⠿ Countries      ✕         │ │
│ │ Hour Unique     │ │                  │ │ (пусто: NO FILTERS)       │ │
│ │ ☐ Check unique  │ │ (пусто:          │ │                            │ │
│ │ ☑ Active        │ │  No streams)     │ │ (без стрима:               │ │
│ │ ☑ Logging       │ │                  │ │  SELECT STREAM OR          │ │
│ │ [ Save ]        │ │                  │ │  CREATE NEW)               │ │
│ │ [ Delete ]      │ │                  │ │                            │ │
│ └─────────────────┘ └──────────────────┘ └────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

`Grid container spacing={1}`, Paper-колонки с текстовыми заголовками **`Group`** / **`Streams`** / **`Filters`** (client/src/components/Editor.tsx:60-107). Адаптив: `xs={12} sm={4}` / `xs={12} sm={3}` / `xs={12} sm={5}` — в столбец на мобиле, 3 колонки от sm (Editor.tsx:60, 89, 96). В колонке Group — кнопки **`Save`** (primary) и **`Delete`** (default), обе fullWidth, `disabled={loading}` (Editor.tsx:65-86); Save → POST `/api/edit/group/<id>` (GroupState.tsx:76-99); Delete → DELETE `/api/edit/group/<id>` и `history.push('/dashboard')` (EditPage.tsx:29-32; GroupState.tsx:158-167). Если stream не выбран — текст **`SELECT STREAM OR CREATE NEW`** (Editor.tsx:100-104); если group не загружен — `<Loader />` (Editor.tsx:64).

### 5.2 Форма группы (EditGroup)

Поля идентичны ModalGroup (§2.6): **`Label`** (required), **`Identifier`** (required), Select **`Type redirect`**, FieldCode (код/URL/оффер по типу), **`Hour Unique`** (number), Checkbox **`Check unique`**, Checkbox **`Active`** (labelPlacement start), Checkbox **`Logging`** — client/src/components/EditGroup.tsx:97-228. Каждое изменение сразу диспатчит `editGroup(...)` в контекст (EditGroup.tsx:64-85) — автосохранение в стейт, на сервер — кнопкой Save в Editor.

### 5.3 Список стримов (EditStreams)

- Кнопка **`Add Stream`** (contained primary fullWidth) — открывает `ModalStream` (предварительно `clearStream/clearFilters`) — client/src/components/EditStreams.tsx:68-76, 35-39.
- Сортируемый список (react-sortable-hoc, drag handle `DragHandleIcon`, lockAxis y): каждый item — имя, иконки Edit (EditIcon) и Close (удаление → DELETE `/api/edit/group/<gid>/<sid>`) — client/src/components/SortableListStreams.tsx:15-74; GroupState.tsx:247-263. Перетаскивание меняет `position` (EditStreams.tsx:27-33; GroupState.tsx:237-245).
- Выбор стрима (`clickHandler`) → `findStream(id)` — подгружает его фильтры (EditStreams.tsx:48-52; GroupState.tsx:169-179).

### 5.4 Диалог стрима (ModalStream)

Dialog; заголовок: имя стрима либо дословно **`NEW STREAM`** (client/src/components/ModalStream.tsx:150-152). Поля:

| Поле | Тип | Label (дословно) | Источник |
|---|---|---|---|
| label | TextField required fullWidth | **`Label`** | ModalStream.tsx:154-167 |
| typeRedirect | Select из `listTypeRedirect` | **`Type redirect`** | ModalStream.tsx:168-195 |
| code | FieldCode (§5.6) | по типу | ModalStream.tsx:196-203 |
| relation | FormLabel **`Filtering values relation`** + FormGroup с двумя взаимоисключающими чекбоксами **`&&`** и **`||`** | — | ModalStream.tsx:204-230 |
| isBot / isActive / useLog | Три чекбокса (labelPlacement bottom, колонки xs=4) | **`This bot stream`**, **`Active`**, **`Logging`** | ModalStream.tsx:231-283 |

Кнопка **`SAVE`** (text primary) — добавление POST `/api/edit/stream/create` либо обновление локально (ModalStream.tsx:285-289, 103-113; GroupState.tsx:185-225).

### 5.5 Фильтры (EditFilters + SelectFilter + InputFieldFilter)

- **EditFilters**: `SelectFilter` + Divider + сортируемый список фильтров (drag; Close — удаление; клик — выбор фильтра для правки) — client/src/components/EditFilters.tsx:53-71; SortableListFilters.tsx:15-58.
- **SelectFilter**: Select с InputLabel **`Type filter`**, опция-пустышка + список `listFiltrs`; кнопка **`EDIT`** (правка существующего) либо **`ADD`** (новый), fullWidth contained primary, disabled пока нет значений (SelectFilter.tsx:110-142, логика disabled 43-57).
- Каталог `listFiltrs` (15 фильтров, name/value/type) — client/src/utils/edit.utils.ts:478-518: **`Devices`**, **`Countries`**, **`Bot Ipv6`**, **`Browsers`**, **`OS`**, **`Platforms`**, **`Cities`**, **`Browser languages`**, **`Useragent includes`**, **`Referrer includes`**, **`Referrer is Null`**, **`Useragent is Null`**, **`Ipv6 mask`**, **`Use list ips`**, **`Use list signature`**. Типы ввода: 1 — одиночный чекбокс с `label = имя фильтра` (InputFieldFilter.tsx:84-95); 2 — MUI `Autocomplete multiple` (TextField label/placeholder = имя фильтра) со справочниками: Devices — `Mobile, Desktop, Tablet, Blackberry, Mac, Raspberry, KindleFire, SmartTV` (edit.utils.ts:467-476); Countries — ~200 стран (`AD Andorra` … `ZW Zimbabwe`, edit.utils.ts:213-465); Browsers — 21 браузер (`YaBrowser` … `Facebook`, edit.utils.ts:128-150); OS — 38 ОС (`Windows 10` … `unknown`, edit.utils.ts:152-192); Platforms — 16 платформ (`Windows` … `unknown`, edit.utils.ts:194-211) (InputFieldFilter.tsx:96-114); 3 — ChipInput (material-ui-chip-input) с label/placeholder = имя фильтра (InputFieldFilter.tsx:115-126).
- Служебные тексты InputFieldFilter: нет типа — **`Select type filter`** (InputFieldFilter.tsx:74-76); неизвестный тип — **`Select another filter`** (InputFieldFilter.tsx:79-81); fallback `<p>{type}</p>` (InputFieldFilter.tsx:129-133).

### 5.6 FieldCode — «код» редиректа

Рендер зависит от выбранного типа redirect (`listTypeRedirect` — client/src/utils/edit.utils.ts:53-126):

- type `textInput` — TextField с `label = description` типа: **`Input URL`** (httpRedirect, jsRedirect, jsSelection, iframe, iframeRedirect, metaRefresh), **`Input JavaScript code`** (javascript), **`Input HTML`** (showHtml), **`Input text`** (showText), **`Input JSON`** (showJson); **`Select offer`** для типа `offer` — client/src/components/FieldCode.tsx:47-62; edit.utils.ts:53-126.
- type `select` — подгружает офферы (GET `/api/info/offers`, FieldCode.tsx:27-31); пусто: текст **`Add offer on `** + кнопка-ссылка **`Offer Page`** (`href="/offers"`) — FieldCode.tsx:64-76; иначе Select с пустой опцией и офферами по имени (FieldCode.tsx:78-100); если ровно 1 оффер — выбирается автоматически (FieldCode.tsx:33-41).
- `remote`, `403`, `400`, `404`, `500`, `end` — поле кода не рендерится (`type: null`) — edit.utils.ts:78, 121-125.

### 5.7 Состояния

- **Загрузка**: `<Loader />` на уровне страницы (EditPage.tsx:38-40) и в Editor при отсутствии group (Editor.tsx:64); кнопки Save/Delete disabled (Editor.tsx:70/81).
- **Пусто**: `No streams` (EditStreams.tsx:77-79); `NO FILTERS` (EditFilters.tsx:67-69); `SELECT STREAM OR CREATE NEW` без выбранного стрима (Editor.tsx:100-104); `Add offer on Offer Page` в FieldCode (FieldCode.tsx:64-76).
- **Ошибка**: снекбары контекста GroupState и ModalStream (ModalStream.tsx:118-123 по 04-screens.md).
- **Ресайз**: колонки `xs=12`, `sm={4|3|5}` (Editor.tsx:60, 89, 96) — столбец → 3 колонки; пары полей EditGroup `xs={6} sm={6}` (EditGroup.tsx:161,177,195,212).

### 5.8 Тема/типографика

Глобальная тема §0.1; собственных переопределений нет. Заголовки колонок — текстовые подписи в Paper; drag-handle и иконки — дефолтные иконки MUI текущего цвета текста.

---

## 6. SettingsPage (`/settings`)

Файл: client/src/pages/SettingsPage.tsx. Маршрут: routes.tsx:19. Загрузка: `fetchSettings()` → GET `/api/settings/info` (SettingsPage.tsx:13-15; SettingsState.tsx:48-60); при `loading` — `<Loader />` (SettingsPage.tsx:17-19).

### 6.1 Каркас (wireframe)

```
┌ AppBar + Drawer (§0.2) ──────────────────────────────────────┐
│              [ General ][ Other ]  ← TabList centered         │
│ ┌─ Paper maxWidth 600, по центру ──────────────────────────┐ │
│ │  General: 8 полей настроек + [SAVE]                      │ │
│ │  Other: 3 списка с [Edit][Add][Delete][Clear]            │ │
│ └───────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

Структура: `TabContext` + `TabList centered` (indicator/textColor primary) с двумя табами: **`General`** (value `general`) и **`Other`** (value `other`) (SettingsPage.tsx:22-38). Панели: `GeneralOption`, `OtherOption`.

### 6.2 Вкладка General (GeneralOption)

`Paper` maxWidth 600px по центру (client/src/components/GeneralOption.tsx:23-31, 92). Список FormControl fullWidth (Input, не TextField):

| Label (дословно) | Тип | HelperText (дословно) | Дефолт | Источник |
|---|---|---|---|---|
| **`Postback`** | text Input | **`Global postback key`** | `''` | GeneralOption.tsx:100-112 |
| **`Clear statistics days`** | number Input | **`How long save to store statistics?`** | `0` | GeneralOption.tsx:113-130 |
| **`Clear remote days`** | number Input | **`How long save to store remote value?`** | `0` | GeneralOption.tsx:131-148 |
| **`Trash`** | Select native | **`Where to send all other traffic`** | `listTrashOption[0]` | GeneralOption.tsx:149-173 |
| **`Trash URL`** | text Input | **`Link on trash`** | `''` | GeneralOption.tsx:174-186 |
| **`Query key`** | text Input | **`Name option GET query params keyword`** | `''` | GeneralOption.tsx:187-199 |
| **`Limit click`** | number Input | **`How many show clicks on dashboard page statistic`** | `10` | GeneralOption.tsx:200-217 |
| **`Limit amount`** | number Input | **`How many show amounts on dashboard page statistic`** | `10` | GeneralOption.tsx:218-235 |

Варианты Trash: **`Redirect on URL`** (url) / **`404 not found`** (notFound) — edit.utils.ts:42-45. Кнопка **`SAVE`** (contained primary fullWidth, marginTop 5) → POST `/api/settings/edit/general` (GeneralOption.tsx:236-244; SettingsState.tsx:78-92). Валидации нет.

### 6.3 Вкладка Other (OtherOption + ModalListOtherOption)

`Paper` maxWidth 600 / minWidth 450 (client/src/components/OtherOption.tsx:24-31). Список из трёх `ListItem` с текстами-шаблонами (счётчики из стора):

- `` `List black IP. Items: ${intBlackIp}` `` (OtherOption.tsx:57)
- `` `Black Signature. Items: ${intBlackSignature}` `` (OtherOption.tsx:59-61)
- `` `Remote url. Items: ${intRemoteUrl}` `` (OtherOption.tsx:62)

У каждого — `ButtonGroup size small` с кнопками дословно: **`Edit`**, **`Add`**, **`Delete`**, **`Clear`** (OtherOption.tsx:104-121). `Edit` → `fetchList(type)` (GET `/api/settings/info/list?type=<type>`, SettingsState.tsx:62-76) и открытие модалки; `Add` → модалка без загрузки; `Delete` → модалка; `Clear` → немедленный POST `/api/settings/edit/list` с `action:'clear'` (OtherOption.tsx:65-79; SettingsState.tsx:94-124).

**ModalListOtherOption**: Dialog; заголовок-шаблон дословно `` `List for ${action}` `` (action ∈ edit/add/delete) — client/src/components/ModalListOtherOption.tsx:67-68; единственное поле — multiline TextField (`rows={15}`, variant outlined, minWidth 400) со значениями, разделёнными `\n` (ModalListOtherOption.tsx:54, 70-77); кнопка submit с подписью `{action}` (ModalListOtherOption.tsx:80-89). Сохранение: POST `/api/settings/edit/list`, значения дедуплицируются и триммятся (SettingsState.tsx:126-156).

### 6.4 Состояния

- **Загрузка**: `<Loader />` на уровне страницы (SettingsPage.tsx:17-19); внутри GeneralOption (GeneralOption.tsx:87-89) и ModalListOtherOption (ModalListOtherOption.tsx:61-63).
- **Пусто**: отдельных empty-state текстов нет; списки могут содержать 0 (`Items: 0`).
- **Ошибка**: снекбар контекста (SettingsState.tsx:41-46).
- **Ресайз**: Paper `maxWidth:600px`, у OtherOption также `minWidth:'450px'` (GeneralOption.tsx:26, OtherOption.tsx:28) — на экранах <450px возможно горизонтальное переполнение (известная проблема, §8).

### 6.5 Тема/типографика

Глобальная тема §0.1; собственных переопределений нет. Поля — MUI `Input` с `InputLabel` и `FormHelperText`; табы — indicator/textColor primary.

---

## 7. InfoPage (`/information`, в меню — `FAQ`)

Файл: client/src/pages/InfoPage.tsx. Маршрут: routes.tsx:20. Статическая страница — данные не грузятся, состояний загрузки нет.

### 7.1 Каркас (wireframe)

```
┌ AppBar + Drawer (§0.2) ──────────────────────────────────────┐
│ Документация и вся информация по настройке. <ссылка>          │
│ Github проекта <ссылка>                                       │
│ Не забудьте подписаться на группу в <Телеграм.> Поставить     │
│ звезду ⭐ на <Github>.                                        │
│ Все вопросы и предложения принимаются через <Issues> Github   │
│ проекта .                                                     │
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Содержимое (дословно)

Четыре абзаца `Typography variant="body1"`, разделённые `<br/>` (InfoPage.tsx:5-50):

1. **`Документация и вся информация по настройке. `** + ссылка `https://whalestracker.netlify.app/` (target _blank).
2. **`Github проекта `** + ссылка `https://github.com/dengivseti/WhalesTracker`.
3. **`Не забудьте подписаться на группу в `** + ссылка-текст **`Телеграм.`** (`https://t.me/WhalesTracker`) + **` Поставить звезду ⭐ на `** + ссылка **`Github`** + `.`.
4. **`Все вопросы и предложения принимаются через `** + ссылка **`Issues`** (`…/issues`) + **` Github проекта .`**.

### 7.3 Состояния

Статическая страница: загрузки, пустых состояний и ошибок нет; переходы — только внешние ссылки (target `_blank`), на другие экраны не переходит.

### 7.4 Тема/типографика

Глобальная тема §0.1; тексты — Typography `body1` (1rem, Roboto); переопределений палитры/типографики нет.

---

## 8. Известные проблемы UI (известная проблема / воспроизводить не нужно)

Выявленные в исследовании дефекты. При повторении с нуля помеченное ниже поведение **не является контрактом** и не требует воспроизведения; всё остальное в документе — контракт.

1. **`option` вместо `options` у колонки `Hits`** — опции колонки ошибочно записаны в поле `option` и не применяются (client/src/components/TableStatistic.tsx:145-148). Известная проблема / воспроизводить не нужно.
2. **Горизонтальное переполнение вкладки Other** — Paper `minWidth:'450px'` на экранах <450px (client/src/components/OtherOption.tsx:28). Известная проблема / воспроизводить не нужно.
3. **`ModalListOtherOption` не синхронизирует `defaultValue`** с props при смене списка (начальное состояние; [04-screens.md](04-screens.md), компонент ModalListOtherOption). Известная проблема / воспроизводить не нужно.
4. **График: вместо пустых данных — бесконечный Loader** (`if (!stats.length) return <Loader />`, нет empty-state) — client/src/components/Chart.tsx:25-27. Известная проблема / воспроизводить не нужно (допустимо показать явное пустое состояние, если оно не меняет загрузку данных).
5. **Dashboard-таблицы полностью исчезают при загрузке без данных** — `if (loading && !value.length) return <></>` (TableLastAmount.tsx:116-119, TableLastClick.tsx:116-118). Известная проблема / воспроизводить не нужно.
6. **Drawer persistent без мобильного режима** — на узких экранах не превращается в temporary/modal, просто сдвигает контент; отдельного mobile-меню нет (Layout.tsx:91-99, styles.ts:35-79). Известная проблема / воспроизводить не нужно.
7. **Хук `useIsMounted` нигде не используется** (client/src/hooks/isMounted.hook.ts). Известная проблема / воспроизводить не нужно.
8. **Клиентская валидация форм фактически отсутствует** (`noValidate` на AuthPage обезвреживает `required`; диалоги сабмитятся по onClick; числа/URL не проверяются — [04-screens.md](04-screens.md), «Замечания»). Известная проблема / воспроизводить не нужно: при повторении допускается добавить валидацию, не меняя дословные тексты полей и ошибок.

Опечатки в видимых текстах (`Usename`, `This mounth`, `Last mounth`, `Evely`, имя экспорта `OfferContex`) — НЕ дефекты контракта: это дословные тексты/кодовые имена оригинала и воспроизводятся буквально (AuthPage.tsx:75; edit.utils.ts:528-529, 50; OfferState.tsx:22).

---

## 9. Каталог дословных текстов (для контроля воспроизведения)

- **Диалоги (Dialog)**: `CREATE GROUP` (ModalGroup.tsx:129); `<имя стрима>` / `NEW STREAM` (ModalStream.tsx:150-152); `OFFER` (ModalOffer.tsx:134); `List for ${action}` (ModalListOtherOption.tsx:68).
- **Snackbar-сообщения**: `Good authentication!` (AuthPage.tsx:62); `Error on create group` (GroupState.tsx:138); серверные `error` через useMessage во всех стейтах (AuthPage.tsx:41-46, ModalGroup.tsx:87-92, DashboardState.tsx:43-48, StatisticState.tsx:65-70, SettingsState.tsx:41-46, OfferState.tsx:29-34); `Something went wrong` (http.hook.ts:38).
- **Кнопки**: `Sign In` (AuthPage.tsx:103); `Refresh` (MenuDashboard.tsx:240, MenuStatistic.tsx:297); `Save` (ModalGroup.tsx:280, Editor.tsx:74); `SAVE` (ModalStream.tsx:287, ModalOffer.tsx:253, GeneralOption.tsx:243); `Delete` (Editor.tsx:85); `Add Stream` (EditStreams.tsx:75); `EDIT` / `ADD` (SelectFilter.tsx:141); `add url` (ModalOffer.tsx:241); `Add Offer` (ListOffers.tsx:97); `Edit` / `Add` / `Delete` / `Clear` (OtherOption.tsx:105-120); `Offer Page` (FieldCode.tsx:70-72); FAB `+` AddIcon (DashboardPage.tsx:49-55). Иконки без текста: ExitToApp (Layout.tsx:85-87), Delete/Close/Edit/DragHandle в списках (SortableListStreams.tsx:33-54, SortableListFilters.tsx:29-39, ListOffers.tsx:79-85).
- **Empty-state тексты**: `NO DATA STATS` (TableStatistic.tsx:126); `No streams` (EditStreams.tsx:78); `NO FILTERS` (EditFilters.tsx:68); `SELECT STREAM OR CREATE NEW` (Editor.tsx:103); `Add offer on` + `Offer Page` (FieldCode.tsx:67-75).
- **Заголовки таблиц**: `Last Amount` (TableLastAmount.tsx:209-218); `Last Click` (TableLastClick.tsx:225-231); `''` (TableStatistic.tsx:196-201).
- **Прочее**: `Whale's Tracker v0.3` (Layout.tsx:77); `GROUPS` (Layout.tsx:113); `Copyright © Whale's Tracker {год}.` (Copyright.tsx:14-25).
