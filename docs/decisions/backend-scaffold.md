# Backend Scaffold: ASP.NET Core Web API

## Context

Следующий шаг по roadmap — скаффолдинг backend. Директория `backend/` существует, но пустая. Цель: поднять работающий HTTP-сервер с заглушками для всех эндпоинтов из OpenAPI-схемы. База данных не нужна — только сервер, который стартует и отвечает на запросы.

## Структура результата

```
backend/
├── .gitignore               # dotnet-generated: bin/, obj/
├── global.json              # pin .NET 9 SDK
├── Groundhog.sln
└── Groundhog.Api/
    ├── Groundhog.Api.csproj
    ├── Program.cs
    ├── appsettings.json
    ├── appsettings.Development.json
    ├── Properties/
    │   └── launchSettings.json   # http://localhost:5000
    ├── Controllers/
    │   ├── TasksController.cs
    │   ├── TimerController.cs
    │   ├── TimeEntriesController.cs
    │   ├── TagsController.cs
    │   └── TaskTagsController.cs
    └── Models/
        ├── Tasks.cs
        ├── Tags.cs
        └── TimeEntries.cs
```

## Решения

### Фреймворк

ASP.NET Core Web API, controller-based (не Minimal API) — более явная структура для проекта такого размера.

### OpenAPI UI

Scalar (`/scalar/v1`) вместо Swagger/Swashbuckle. В .NET 9 встроена генерация OpenAPI-документа (`Microsoft.AspNetCore.OpenApi`), Scalar выступает UI-слоем поверх него. Swashbuckle имеет известные проблемы совместимости с .NET 9.

- OpenAPI JSON: `/openapi/v1.json`
- Scalar UI: `/scalar/v1`

### JSON-сериализация

camelCase + игнор null-полей — соответствует OpenAPI-схеме.

### Ошибки

`AddProblemDetails()` — RFC 7807, как задано в OpenAPI-схеме. `[ApiController]` на каждом контроллере обеспечивает автоматические `400 ValidationProblemDetails` при ошибках биндинга.

### CORS

Разрешён `http://localhost:5173` (Vite dev server).

### Порт

`http://localhost:5000` — без HTTPS на этапе скаффолдинга.

### Стратегия заглушек

| Тип запроса | Ответ |
|---|---|
| `GET` список | `200 OK` + `[]` |
| `GET` по id | `404 Not Found` |
| `GET /timer/active` | `204 No Content` |
| `POST`, `PUT`, `DELETE` | `501 Not Implemented` |

### Нюансы маршрутизации

**TimerController**: смешанные префиксы (`/tasks/{id}/timer/start`, `/tasks/{id}/timer/stop`, `/timer/active`) — нет общего `[Route]` на классе, каждый метод получает полный путь.

**TimeEntriesController**: два маршрута для списка — `/time-entries` и `/tasks/{taskId}/time-entries` — два отдельных метода.

### Models

Иммутабельные C# `record`-типы. `DateTimeOffset` (не `DateTime`) для RFC 3339-совместимых дат.

## Верификация

```bash
curl http://localhost:5000/tasks          # 200 []
curl http://localhost:5000/tags           # 200 []
curl http://localhost:5000/time-entries   # 200 []
curl http://localhost:5000/timer/active   # 204
curl -X POST http://localhost:5000/tasks \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'                    # 501
curl http://localhost:5000/tasks/00000000-0000-0000-0000-000000000000  # 404 + application/problem+json
# Browser: http://localhost:5000/scalar/v1
```
