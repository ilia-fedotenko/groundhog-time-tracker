# Contributing

## Branch strategy

| Branch | Purpose |
|---|---|
| `main` | Stable releases and milestones |
| `develop` | Active development — main working branch |
| `feature/<topic>` | Individual features, branched from `develop`, merged back into `develop` |

Feature branch name examples: `feature/domain-model`, `feature/backend-scaffold`, `feature/timer-api`.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

Examples:

```
feat(backend): add timer start/stop endpoints
fix(frontend): correct date formatting in history view
docs: update README with branch conventions
chore(desktop): upgrade Tauri to 2.x
```

Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`.

## Architectural decisions

Significant architectural decisions are recorded in `DECISIONS.md` *(coming soon)*.

## Git hooks

Pre-commit hooks are stored in `.githooks/`. Activate them once after cloning:

```bash
git config core.hooksPath .githooks
```

The `pre-commit` hook blocks commits that contain absolute user paths (`/Users/`, `/home/`).

## Rules

- Never commit directly to `main`
- Feature branches are created from `develop` and merged back into `develop` via PR
- Before committing to `develop`, always ask the user whether to create a feature branch instead.
