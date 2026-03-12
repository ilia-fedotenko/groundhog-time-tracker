# Groundhog — CLAUDE.md

## Проект

Pet-проект для отслеживания рабочего времени (time tracker). Состоит из трёх составных частей:

| Часть | Стек | Назначение |
|---|---|---|
| Backend | C#/.NET | API и бизнес-логика |
| Frontend | React/TypeScript + Vite + Tailwind + shadcn/ui | Веб-интерфейс |
| Desktop | Rust/Tauri + React/TypeScript + Vite + Tailwind | macOS-приложение для быстрого доступа |

## Структура репозитория

| Папка | Содержимое |
|---|---|
| `backend/` | C#/.NET — API и бизнес-логика |
| `frontend/` | React/TypeScript + Vite + Tailwind + shadcn/ui — веб-интерфейс |
| `desktop/src/` | React/TypeScript — фронтенд панели |
| `desktop/src-tauri/` | Rust/Tauri — нативная обёртка |
| `docs/` | OpenAPI-схема, архитектурные решения |

## UI-компоненты

Frontend и Desktop используют единый визуальный язык (Tailwind + shadcn/ui).
Общие компоненты выносятся в общее место и переиспользуются в обоих приложениях.

## Ветки

| Ветка | Назначение |
|---|---|
| `main` | Стабильные релизы и milestone'ы |
| `develop` | Активная разработка — основная рабочая ветка |
| `feature/<тема>` | Отдельные фичи, создаются от `develop`, вливаются в `develop` |

Примеры имён feature-веток: `feature/domain-model`, `feature/backend-scaffold`, `feature/timer-api`.

## Коммиты

Используем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

feat(backend): add timer start/stop endpoints
fix(frontend): correct date formatting in history view
docs: update README with branch conventions
chore(desktop): upgrade Tauri to 2.x
```

Типы: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.

## Команды запуска

### Backend (backend/)

```bash
# заглушка — появится после скаффолдинга
```

### Frontend (frontend/)

```bash
cd frontend
nvm use 24       # переключиться на Node 24 (Vite 7 требует Node 18+)
npm install      # установить зависимости
npm run dev      # dev-сервер (Vite), http://localhost:5173
npm run build    # production-сборка
npm run preview  # предпросмотр production-сборки
npm run lint     # ESLint
```

### Desktop (desktop/)

Предварительно: [установить Rust](https://rustup.rs) и убедиться что `cargo` есть в PATH.

```bash
cd desktop
nvm use 24        # переключиться на Node 24
npm install       # установить JS-зависимости
npm run dev       # запустить Tauri dev (Vite + Rust компилируются вместе; первый запуск долгий)
npm run build     # production-сборка (.app в src-tauri/target/release/bundle/)
npm run lint      # ESLint
```

## Правила для Claude

- Никогда не коммитить напрямую в `main`
- feature-ветки создаются от `develop`, вливаются в `develop` через PR/merge
- Следовать Conventional Commits
- История решений — в `DECISIONS.md`
