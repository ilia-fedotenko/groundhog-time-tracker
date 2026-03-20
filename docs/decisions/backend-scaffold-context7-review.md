# Backend Code Review — Groundhog Time Tracker

**Scope:** `backend/`
**Date:** 2026-03-20
**State:** Scaffold / stub-фаза — бизнес-логика не реализована.
**Tools:** Статический анализ кода + проверка через официальную документацию ASP.NET Core 10 (context7).

---

## 1. Именование и структура

### 1.1 `TaskTagsUpdateRequest` лежит не в том файле
**`Models/Tags.cs:16`** — DTO для связи задача-тег находится внутри `Tags.cs`. Нужно перенести в `Models/TaskTags.cs` или `Models/Tasks.cs`.

### 1.2 Нет `[Route]` атрибута на уровне класса у контроллеров
**Все контроллеры** — роут-префикс повторяется строкой в каждом методе:

```csharp
[HttpGet("tasks")]
[HttpPost("tasks")]
[HttpGet("tasks/{taskId:guid}")]
```

Для `TimerController` это оправдано (смешанные префиксы), для остальных — добавить `[Route("tasks")]` / `[Route("tags")]` на класс.

### 1.3 Доменный `Task` затеняет `System.Threading.Tasks.Task`
**Все контроллеры и модели** — с `ImplicitUsings` в `.csproj` пространство `System.Threading.Tasks` импортируется глобально. Любой разработчик в контроллере может случайно обратиться не к той `Task`. Переименовать в `WorkTask`, `TrackedTask` или `Job`.

---

## 2. Дизайн API

### 2.1 `GET /timer/active` возвращает `204` — нетипично для GET
**`Controllers/TimerController.cs:24`**

`204 No Content` означает "запрос выполнен, тела нет". Для GET-эндпоинта, который сигнализирует об отсутствии ресурса, правильнее `404 Not Found`. Тогда клиент (десктоп-приложение) не будет различать `200` (таймер активен) и `204` (таймера нет) — логика становится прямее.

### 2.2 `POST /tasks/{taskId}/tags/{tagId}` объявлен идемпотентным — конфликт с семантикой HTTP
**`Controllers/TaskTagsController.cs:22`**

`POST` по определению не является идемпотентным. Если поведение "no-op при дубликате" намеренное — нужно использовать `PUT`. Если остаётся `POST` — задокументировать решение в ADR.

### 2.3 Дублирование маршрутов для time entries
**`Controllers/TimeEntriesController.cs:43`**

`GET /tasks/{taskId}/time-entries` и `GET /time-entries?taskId={taskId}` возвращают одни данные. Вложенный маршрут даёт дополнительную валидацию (`404` для несуществующей задачи) — если это намеренно, стоит явно отразить в ADR, иначе дублирование придётся поддерживать в двух местах.

### 2.4 `201 Created` без `Location` заголовка
**`TasksController.cs:17`, `TagsController.cs:17`, `TimeEntriesController.cs:21`**

RFC 9110 предписывает `201` включать `Location` заголовок с URL созданного ресурса. При реализации стабов использовать `CreatedAtAction(nameof(GetTask), new { taskId = ... }, response)` вместо `StatusCode(201)`.

---

## 3. Обработка ошибок

### 3.1 `UseDeveloperExceptionPage()` не первый в pipeline *(context7)*
**`Program.cs:34`**

Официальная документация ASP.NET Core требует, чтобы exception handling middleware стоял **первым** — до всех остальных, чтобы перехватывать исключения из любого последующего middleware.

Текущий код:
```csharp
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();               // ← эти идут раньше
    app.MapScalarApiReference(...);
    app.UseDeveloperExceptionPage(); // ← должно быть первым
}
```

Правильно (из официальной документации):
```csharp
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage(); // ← первым
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors();
app.UseAuthorization();
app.MapOpenApi(); // OpenAPI регистрируется позже
app.MapControllers();
```

> **Примечание *(context7)*:** `UseExceptionHandler()` без аргументов (в связке с `AddProblemDetails()`) — задокументированный официальный паттерн ASP.NET Core 8+, не требующий изменений.

---

## 4. Безопасность

### 4.1 CORS захардкожен на `localhost:5173` для всех окружений
**`Program.cs:18-26`, `Program.cs:43`**

`UseCors("LocalFrontend")` применяется во всех окружениях включая production. В `appsettings.json` нет секции для CORS. Нужно вынести origin в конфигурацию и применять политику в зависимости от окружения.

### 4.2 `UseAuthorization()` без `UseAuthentication()` — вводит в заблуждение
**`Program.cs:45`**

`UseAuthorization()` зарегистрирован, схема аутентификации не настроена, `[Authorize]` нигде не используется. Если auth вне скоупа — удалить вызов. Если планируется — добавить комментарий.

### 4.3 `AllowedHosts: "*"` отключает валидацию Host-заголовка
**`appsettings.json:8`**

Дефолтное значение из шаблона. Открывает вектор атаки через Host-заголовок (SSRF). Перед любым деплоем ограничить конкретными хостами.

### 4.4 Нет HTTPS ни в одном окружении
Только `http://localhost:5000`. ADR документирует это как сознательное решение для скаффолда — но HTTPS необходимо добавить до появления реальных пользовательских данных.

---

## 5. Модели и валидация

### 5.1 `WhenWritingNull` нарушает контракт `stoppedAt` — **КРИТИЧНО** *(context7)*
**`Program.cs:10-11`, `Models/TimeEntries.cs:18`**

```csharp
// Program.cs
options.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
```

```csharp
// Models/TimeEntries.cs
public record TimeEntryResponse(Guid Id, Guid TaskId, DateTimeOffset StartedAt, DateTimeOffset? StoppedAt);
```

OpenAPI-схема объявляет `stoppedAt` как `required` (всегда присутствует в ответе, но может быть `null`). С настройкой `WhenWritingNull` поле будет **полностью пропущено** из JSON когда таймер активен — клиент не получит `"stoppedAt": null`, не получит поле вообще.

Варианты исправления:
- Убрать глобальный `WhenWritingNull` и управлять поведением точечно
- Добавить `[JsonIgnore(Condition = JsonIgnoreCondition.Never)]` на `StoppedAt`

### 5.2 Нет атрибутов валидации на DTO
**Все `Models/`**

OpenAPI-схема задаёт ограничения (`minLength: 1`, `maxLength: 200` для имени задачи и т.д.), но в C#-моделях они не закодированы:

```csharp
// Сейчас:
public record TaskCreateRequest(string Name);

// Должно быть:
public record TaskCreateRequest(
    [Required, MinLength(1), MaxLength(200)] string Name
);
```

`[ApiController]` без этих атрибутов не отклонит пустую строку или имя в 10 000 символов.

### 5.3 `string Name` без `[Required]` может стать `null` через JSON-биндер
**`Models/Tasks.cs:4`, `Models/Tags.cs:4`**

Несмотря на `<Nullable>enable</Nullable>`, JSON-десериализатор не применяет nullable-проверки C# — `{"name": null}` успешно пройдёт биндинг. Нужен `[Required]` или `[JsonRequired]`.

### 5.4 `TaskResponse.Tags` — потенциальный N+1 при реализации
**`Models/Tasks.cs:11-15`**

`List<TagResponse> Tags` внутри ответа задачи потребует eager loading при реализации `ListTasks`. Заготовить join/include заранее.

---

## 6. Конфигурация и зависимости

### 6.1 Floating-версии NuGet-пакетов ломают воспроизводимость сборки
**`Groundhog.Api.csproj:11-12`**

```xml
<PackageReference Include="Microsoft.AspNetCore.OpenApi" Version="10.*" />
<PackageReference Include="Scalar.AspNetCore" Version="2.*" />
```

Два разработчика, запустившие `dotnet restore` в разное время, могут получить разные версии пакетов. `global.json` пинит SDK-версию — пакеты должны быть пинены аналогично. Либо точные версии, либо включить `<RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>`.

---

## 7. Тестирование

### 7.1 Ноль тестовых проектов
В `Groundhog.sln` единственный проект — `Groundhog.Api`. Нет xUnit/NUnit, нет `WebApplicationFactory`, нет контрактных тестов против `docs/openapi.yaml`.

### 7.2 Отсутствует `public partial class Program` для тестов
**`Program.cs`**

`WebApplicationFactory<Program>` из тестового проекта требует доступ к типу `Program`. Без маркерного класса интеграционные тесты не скомпилируются. Добавить в конец `Program.cs`:

```csharp
public partial class Program { }
```

---

## 8. Прочее

### 8.1 Стаяший шаблонный `.http`-файл
**`Groundhog.Api/Groundhog.Api.http`**

```
@Groundhog.Api_HostAddress = http://localhost:5216  // неверный порт (нужен 5000)
GET {{Groundhog.Api_HostAddress}}/weatherforecast/  // несуществующий эндпоинт
```

Заменить на актуальные запросы к `/tasks`, `/tags`, `/time-entries`, `/timer/active`.

---

## Сводная таблица

| Приоритет | # | Файл | Проблема |
|---|---|---|---|
| **Критично** | 1 *(context7)* | `Program.cs:10`, `Models/TimeEntries.cs:18` | `WhenWritingNull` скрывает `stoppedAt: null`, нарушая OpenAPI-контракт |
| **High** | 2 | Все `Models/` | Нет атрибутов валидации — ограничения из OpenAPI не применяются |
| **High** | 3 | Решение целиком | Нет тестовых проектов и нет `public partial class Program` |
| **High** | 4 | `Program.cs:18-26` | CORS захардкожен на `localhost:5173` во всех окружениях |
| **Medium** | 5 *(context7)* | `Program.cs:34` | `UseDeveloperExceptionPage()` не первый в pipeline |
| **Medium** | 6 | `Models/Tasks.cs:4` | `string Name` может получить `null` через JSON-биндер |
| **Medium** | 7 | Все контроллеры | `Task` затеняет `System.Threading.Tasks.Task` |
| **Medium** | 8 | `TimerController.cs:24` | `204` на GET нетипично — лучше `404` |
| **Medium** | 9 | `TasksController.cs:17` и др. | `201 Created` без `Location` заголовка (при реализации) |
| **Medium** | 10 | `Groundhog.Api.csproj:11-12` | Floating NuGet-версии ломают воспроизводимость |
| **Medium** | 11 | `appsettings.json:8` | `AllowedHosts: "*"` отключает валидацию Host-заголовка |
| **Low** | 12 | Все контроллеры | Нет `[Route]` на уровне класса — префикс дублируется в каждом методе |
| **Low** | 13 | `TaskTagsController.cs:22` | `POST` + "идемпотентный" — противоречие семантике HTTP |
| **Low** | 14 | `TimeEntriesController.cs:43` | Дублирование маршрутов без явного обоснования |
| **Low** | 15 | `Program.cs:45` | `UseAuthorization()` без схемы аутентификации — бессмысленный вызов |
| **Low** | 16 | `Models/Tags.cs:16` | `TaskTagsUpdateRequest` в неправильном файле |
| **Low** | 17 | `Groundhog.Api.http` | Стаяший шаблон с неверным портом и несуществующим эндпоинтом |
