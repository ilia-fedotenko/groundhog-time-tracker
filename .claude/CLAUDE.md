# Groundhog — CLAUDE.md

## Проект

Pet-проект для отслеживания рабочего времени (time tracker). Состоит из трёх составных частей:

| Часть | Стек | Назначение |
|---|---|---|
| Backend | C#/.NET | API и бизнес-логика |
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui | Веб-интерфейс |
| Desktop | Rust/Tauri | macOS-приложение для быстрого доступа |

## Структура репозитория

| Папка | Содержимое |
|---|---|
| `backend/` | C#/.NET — API и бизнес-логика |
| `frontend/` | React + Vite + TypeScript — веб-интерфейс |
| `desktop/` | Rust/Tauri — macOS-приложение |
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
# заглушка — появится после скаффолдинга
```

### Desktop (desktop/)

```bash
# заглушка — появится после скаффолдинга
```

## Правила для Claude

- Никогда не коммитить напрямую в `main`
- feature-ветки создаются от `develop`, вливаются в `develop` через PR/merge
- Следовать Conventional Commits
- История решений — в `DECISIONS.md`
