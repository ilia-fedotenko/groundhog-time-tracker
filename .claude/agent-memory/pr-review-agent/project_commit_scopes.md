---
name: project_commit_scopes
description: Known commit scope conventions observed in the Groundhog repo
type: project
---

Observed scopes in git history:
- `backend` — changes under `backend/`
- `frontend` — changes under `frontend/`
- `desktop` — changes under `desktop/`
- `tooling` — changes to developer tooling: `.claude/`, `.githooks/`, `CONTRIBUTING.md`, `docs/prompts/`
- (no scope) — repo-wide docs changes (README, top-level docs/)

**Why:** Derived from actual commit log patterns and CONTRIBUTING.md examples.

**How to apply:** When evaluating commit hygiene, cross-check the scope against the directories actually touched in the diff.
