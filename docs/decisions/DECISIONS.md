# Decisions

## 2026-03-21 — GitHub-агент: пока не нужен

GitHub-интеграция Claude Code (@claude в issues) решает задачу асинхронной работы без открытого терминала. При локальной разработке это дублирование: Claude итак имеет полный контекст, MCP и pr-review-agent, плюс настройка MCP для эфемерных CI-контейнеров создаёт лишние накладные расходы. Вернуться к идее, если появится необходимость делегировать рутинные задачи (например, автофиксы по issues от пользователей).

## 2026-03-19 — UI: Shared Package @groundhog/ui

Монорепо на npm workspaces с общим пакетом `packages/ui` для Frontend и Desktop. Tailwind 4 без `tailwind.config.js`, shadcn/ui компоненты экспортируются как TypeScript-исходники — отдельный build-step не нужен, Vite каждого приложения компилирует inline.

[→ подробнее](ui-package.md)

## 2026-03-17 — Backend: ASP.NET Core Web API

Controller-based API на .NET 10, Scalar вместо Swagger (Swashbuckle несовместим с .NET 10), JSON в camelCase с игнором null-полей, CORS на `localhost:5173`. Заглушки: GET list → `200 []`, GET by id → `404`, POST/PUT/DELETE → `501`. Scalar UI: `/scalar/v1`.

[→ подробнее](backend-scaffold.md)
