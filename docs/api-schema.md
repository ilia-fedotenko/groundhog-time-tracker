# API Schema

Quick reference for all endpoints. Canonical source of truth is `docs/openapi.yaml`.

## Endpoints

### Tasks

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/tasks` | List all tasks (opt. filters: `?tagId=`, `?search=`) | 200 |
| POST | `/tasks` | Create task | 201 |
| GET | `/tasks/{taskId}` | Get task with tags | 200 |
| PUT | `/tasks/{taskId}` | Rename task | 200 |
| DELETE | `/tasks/{taskId}` | Delete task + all its time entries | 204 |

### Timer (commands on a Task)

| Method | Path | Description | Success | 409 means |
|---|---|---|---|---|
| POST | `/tasks/{taskId}/timer/start` | Start timer → creates TimeEntry | 201 | timer already running |
| POST | `/tasks/{taskId}/timer/stop` | Stop active timer → sets stoppedAt | 200 | no active timer |
| GET | `/timer/active` | Get active TimeEntry (any task) — for desktop tray | 200/204 | — |

### TimeEntries

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/time-entries` | List entries (filters: `taskId`, `from`, `to`, `active`) | 200 |
| POST | `/time-entries` | Create manually (backfill) | 201 |
| GET | `/time-entries/{entryId}` | Get one entry | 200 |
| PUT | `/time-entries/{entryId}` | Update timestamps (corrections) | 200 |
| DELETE | `/time-entries/{entryId}` | Delete entry | 204 |
| GET | `/tasks/{taskId}/time-entries` | List entries scoped to a task | 200 |

### Tags

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/tags` | List all tags | 200 |
| POST | `/tags` | Create tag | 201 |
| GET | `/tags/{tagId}` | Get tag | 200 |
| PUT | `/tags/{tagId}` | Rename tag | 200 |
| DELETE | `/tags/{tagId}` | Delete tag (removes TaskTag rows) | 204 |

### Task–Tag Assignment

| Method | Path | Description | Success |
|---|---|---|---|
| GET | `/tasks/{taskId}/tags` | List tags on a task | 200 |
| PUT | `/tasks/{taskId}/tags` | Replace full tag set (body: `{tagIds:[]}`) | 200 |
| POST | `/tasks/{taskId}/tags/{tagId}` | Add single tag | 204 |
| DELETE | `/tasks/{taskId}/tags/{tagId}` | Remove single tag | 204 |

## Design Decisions

- **Timer as action sub-resource**, not raw CRUD — start/stop have server-side invariants (one active entry per task)
- **Separate request/response DTOs** — avoids readOnly field ambiguity in validators
- **camelCase** throughout — matches TS frontend; ASP.NET Core default
- **`date-time` format** (RFC 3339) for `startedAt`/`stoppedAt`
- **No auth** — out of scope for pet project
- **No API versioning prefix** — `/tasks` not `/api/v1/tasks`; overkill for a pet project
- **Error format**: RFC 7807 `ProblemDetails` — ASP.NET Core emits this by default
