# Полная документация WhalesTracker — план выполнения

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать в `docs/` исчерпывающую документацию текущей системы (7 экранов, все API-методы, связи экран↔API) как основу для рерайта.

**Architecture:** Слоевой обход кода параллельными субагентами (фаза исследования) → сборка шести MD-документов мной в этой сессии → сверка с netlify-документацией → индекс и финальная проверка полноты.

**Tech Stack:** Markdown, mermaid-диаграммы; исследование — read/grep/glob по коду репо; субагенты — модель `glm-5.3-flash` (provider `zai`, модель `zai/glm-5.3-flash` — переопределение `model` в каждом вызове subagent).

**Spec:** `docs/superpowers/specs/2026-10-09-whalestracker-documentation-design.md`

## Global Constraints

- Вся работа только в ветке `docs/system-documentation`; в master не коммитить (решение пользователя, зафиксировано в Hindsight).
- Язык документов — русский; идентификаторы кода (роуты, поля, функции) — как в коде.
- Каждое утверждение в документах прослеживается к файлу/строкам кода (`путь:строка`).
- Не менять код проекта; ветка docs/ только добавляет файлы документации.
- Коммит после каждого завершённого документа.
- Исследовательские субагенты — только модель `glm-5.3-flash`; сборка документов — сессия основного агента.

## Review Focus

- Полнота API: ни один route из `routes/*.route.js` не должен остаться незадокументированным — проверка счётчиком методов (grep по `router.(get|post|put|delete)`).
- Полнота экранов: все 7 файлов `client/src/pages/*.tsx` покрыты; компоненты страниц описаны.
- Матрица связей двусторонняя: у каждого API есть список вызывающих экранов или пометка «внешний/трекер».
- Расхождения код ↔ netlify-доки фиксируются, а не «исправляются» под доки.
- Мёртвый/непонятный код помечается как «назначение не ясно», не выбрасывается.

---

### Task 1: Параллельное исследование слоёв (субагенты, glm-5.3-flash)

**Files:**
- Create: нет (находки возвращаются в сессию)
- Read: весь репо (см. зоны ниже)

**Interfaces:**
- Produces: структурированные находки 5 субагентов (A-E) для задач 2-6.

- [ ] **Step 1: Запустить 5 субагентов параллельно (одним сообщением), каждый с `model: "glm-5.3-flash"`**

  Промпты (каждый — самодостаточный, с указанием «только чтение, верни структурированные находки с путями:строками»):

  - **A. Бэкенд-ядро** → `app.js`, `middleware/`, `utils/`, `Dockerfile`, `docker-compose*.yml`, `nginx/`, `config/`. Вернуть: цепочка middleware, конфиги, роли Redis/Mongo, порты, Docker-сборка.
  - **B. API-роуты** → `routes/*.route.js` + подключённые middleware/валидаторы. Вернуть: на каждый HTTP-метод — путь, метод, auth, параметры (query/body), валидация, ответы, побочные эффекты. Дополнить grep-счётчиком `router.(get|post|put|delete|use)`.
  - **C. Домен и трекер** → `models/*.js`, `tracker/*.js`, `routes/postback.route.js`, `routes/tracker.route.js`. Вернуть: все поля всех 7 моделей, алгоритм выбора потока, полный список фильтров и их параметры, все типы редиректов, формат postback, схема URL трекера, как пишется статистика.
  - **D. Фронтенд-страницы** → `client/src/pages/*.tsx` + `client/src/components/`. Вернуть: на каждую из 7 страниц — назначение, UI-элементы, формы с полями и валидацией, состояния, роутинг, вложенные компоненты.
  - **E. API-клиент фронтенда** → `client/src/context/`, `client/src/hooks/`, `client/src/utils/` (fetch/axios вызовы). Вернуть: на каждый вызов API — URL, HTTP-метод, тело, откуда вызывается (страница/хук/контекст), что с ответом.

- [ ] **Step 2: Собрать результаты, пометить пробелы**

  Если субагент вернул null/неполно — его зону добираю сам чтением кода до перехода к сборке.

### Task 2: `docs/01-architecture.md` и `docs/03-domain-tracker.md`

**Files:**
- Create: `docs/01-architecture.md`, `docs/03-domain-tracker.md`

**Interfaces:**
- Consumes: находки A, C.
- Produces: разделы «домен» и «трекер-движок», на которые ссылается 02 и 05.

- [ ] **Step 1: Написать 01-architecture.md** — обзор системы, структура репо, middleware-цепочка, Redis/Mongo роли, Docker/nginx, конфиги. Ссылки на файлы:строки.
- [ ] **Step 2: Написать 03-domain-tracker.md** — 7 моделей (таблица полей), потоки/группы/офферы, фильтры (таблица), типы редиректов (по одному разделу), postback, схема URL, статистика.
- [ ] **Step 3: Коммит** — `git add docs/01-architecture.md docs/03-domain-tracker.md && git commit -m "docs: architecture and domain/tracker documentation"`

### Task 3: `docs/02-api.md`

**Files:**
- Create: `docs/02-api.md`

**Interfaces:**
- Consumes: находка B (+ A для auth-механики, C для доменных терминов).
- Produces: канонический список эндпоинтов для матрицы в Task 5.

- [ ] **Step 1: Написать 02-api.md** — сгруппировать по роут-файлам; на каждый метод: путь, глагол, auth, параметры, валидация, ответы (JSON-примеры), побочные эффекты. Начать с таблицы-оглавления всех эндпоинтов.
- [ ] **Step 2: Проверка полноты** — `grep -E "router\.(get|post|put|delete)" routes/*.route.js | wc -l` совпадает с числом задокументированных методов.
- [ ] **Step 3: Коммит** — `git commit -m "docs: full API reference"`

### Task 4: `docs/04-screens.md`

**Files:**
- Create: `docs/04-screens.md`

**Interfaces:**
- Consumes: находка D.
- Produces: 7 разделов экранов, на каждый ссылается матрица в Task 5.

- [ ] **Step 1: Написать 04-screens.md** — по разделу на страницу: AuthPage, DashboardPage, StatisticPage, OfferPage, EditPage, SettingsPage, InfoPage. В каждом: назначение, элементы UI, формы (поля/валидация), состояния (загрузка/ошибка/пусто), переходы на другие экраны, используемые компоненты/хуки, localStorage.
- [ ] **Step 2: Проверка полноты** — 7 разделов = 7 файлов в `client/src/pages/`.
- [ ] **Step 3: Коммит** — `git commit -m "docs: screens documentation"`

### Task 5: `docs/05-screen-api-mapping.md`

**Files:**
- Create: `docs/05-screen-api-mapping.md`

**Interfaces:**
- Consumes: находка E + списки эндпоинтов (Task 3) и экранов (Task 4).
- Produces: финальная матрица связей.

- [ ] **Step 1: Построить матрицу** — таблица: экран × API-метод × момент вызова (mount/кнопка/поллинг) × параметры; обратная секция «API → вызывающие экраны», включая эндпоинты без UI-вызывателей (трекер/postback — пометка «внешний»).
- [ ] **Step 2: Добавить mermaid-диаграмму** — фронтенд-страницы → API-группы → модели.
- [ ] **Step 3: Сверка двусторонности** — каждый эндпоинт из 02 присутствует либо в матрице, либо в пометке «внешний»; каждый экран из 04 имеет хотя бы одну строку (или пометку «API не вызывает»).
- [ ] **Step 4: Коммит** — `git commit -m "docs: screen-to-API mapping matrix"`

### Task 6: `docs/06-docs-vs-code.md`, `docs/README.md`, финальная сверка

**Files:**
- Create: `docs/06-docs-vs-code.md`, `docs/README.md`

**Interfaces:**
- Consumes: все предыдущие документы; web_fetch по ~20 страницам https://whalestracker.netlify.app/ (started/logic, install, auth, dashboard, statistick, offers, settings, settings/groups, settings/streams, settings/filters, redirects/*, extra/postbacks, extra/faq, extra/changelog).

- [ ] **Step 1: Обойти страницы netlify-доков** (web_fetch, пакетами) и сверить утверждения с кодом → `06-docs-vs-code.md`: таблица «утверждение дока / что в коде / файл».
- [ ] **Step 2: Написать docs/README.md** — индекс шести документов + executive summary системы (стек, компоненты, объём, состояние, риски для рерайта).
- [ ] **Step 3: Финальная проверка критериев готовности из спеки** — все 7 страниц описаны; все эндпоинты задокументированы; все модели описаны; матрица двусторонняя; каждое утверждение имеет ссылку на код.
- [ ] **Step 4: Коммит** — `git commit -m "docs: docs-vs-code comparison and documentation index"`
