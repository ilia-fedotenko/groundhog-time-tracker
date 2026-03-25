# Groundhog — CLAUDE.md

## Проект

Pet-проект для отслеживания рабочего времени (time tracker). Состоит из трёх составных частей:

| Часть | Стек | Назначение |
|---|---|---|
| Backend | C#/.NET | API и бизнес-логика |
| Frontend | React/TypeScript + Vite + Tailwind + shadcn/ui | Веб-интерфейс |
| Desktop | Rust/Tauri + React/TypeScript + Vite + Tailwind + shadcn/ui | macOS-приложение для быстрого доступа |
| UI Package | React/TypeScript + Tailwind + shadcn/ui | Общая библиотека компонентов (`@groundhog/ui`) |

## Структура репозитория

| Папка | Содержимое |
|---|---|
| `backend/` | C#/.NET — API и бизнес-логика |
| `frontend/` | React/TypeScript + Vite + Tailwind + shadcn/ui — веб-интерфейс |
| `desktop/src/` | React/TypeScript — фронтенд панели |
| `desktop/src-tauri/` | Rust/Tauri — нативная обёртка |
| `packages/ui/` | Общая библиотека компонентов (`@groundhog/ui`) — shadcn/ui + Tailwind 4 |
| `docs/` | OpenAPI-схема, архитектурные решения |

## UI-компоненты

Frontend и Desktop используют единый визуальный язык (Tailwind + shadcn/ui).
Общие компоненты живут в `packages/ui/` и переиспользуются через импорт `@groundhog/ui`.

Добавление нового компонента:

```bash
cd packages/ui
npx shadcn@latest add <component>  # создаёт файл в src/components/ui/
# затем добавить re-export в src/index.ts
```

## Команды запуска

> **npm workspaces**: репозиторий использует npm workspaces. `npm install` нужно запускать из **корня репозитория**, а не из поддиректорий.

### Backend (backend/)

Предварительно: установить [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0) и убедиться что `dotnet` есть в PATH.

```bash
cd backend/Groundhog.Api
dotnet run          # dev-сервер, http://localhost:5000
                    # Scalar UI:   http://localhost:5000/scalar/v1
                    # OpenAPI JSON: http://localhost:5000/openapi/v1.json
dotnet build        # сборка без запуска
```

### Frontend (frontend/)

```bash
nvm use 24       # переключиться на Node 24 (Vite 7 требует Node 18+)
npm install      # установить зависимости (запускать из корня репо!)
cd frontend
npm run dev      # dev-сервер (Vite), http://localhost:5173
npm run build    # production-сборка
npm run preview  # предпросмотр production-сборки
npm run lint     # ESLint
```

### Desktop (desktop/)

Предварительно: [установить Rust](https://rustup.rs) и убедиться что `cargo` есть в PATH.

> **Важно для Claude:** bash-команды выполняются в неинтерактивной оболочке, которая не читает `~/.zshrc`. Rust устанавливается через `~/.cargo/env`, который подключается только в интерактивных сессиях. Поэтому перед любой desktop-командой, требующей `cargo`/`tauri`, нужно явно запускать: `source ~/.cargo/env && ...`

```bash
nvm use 24        # переключиться на Node 24
npm install       # установить JS-зависимости (запускать из корня репо!)
cd desktop
source ~/.cargo/env && npm run dev    # запустить Tauri dev (Vite + Rust компилируются вместе; первый запуск долгий)
source ~/.cargo/env && npm run build  # production-сборка (.app в src-tauri/target/release/bundle/)
npm run lint      # ESLint (не требует cargo)
```

## Правила для Claude

- Перед любыми операциями с ветками или коммитами — обязательно прочитать [CONTRIBUTING.md](../CONTRIBUTING.md). Там описаны конвенции по веткам, коммитам и архитектурным решениям.
- Перед мержем любой ветки в `develop` — обязательно запустить агента `pr-review-agent` и дождаться вердикта. Мерж разрешён только при вердикте READY TO MERGE.
- Никогда не записывать абсолютные пути файловой системы (например `/Users/...`, `/home/...`) в tracked-файлы репозитория. Использовать относительные пути или описательные плейсхолдеры.
- В bash-командах для файлов внутри репозитория использовать только относительные пути (`rm .claude/settings.local.json`, `cd frontend`). Абсолютные пути допустимы только для файлов вне репозитория (например, `~/.claude/settings.json`).
