---
name: project_branch_strategy
description: Branch strategy and merge target rules for the Groundhog repo
type: project
---

Feature branches (`feature/<topic>`) are created from `develop` and must be merged back into `develop` — never directly into `main`. `main` is reserved for stable releases only.

**Why:** Documented in CONTRIBUTING.md and enforced as a hard rule: "Never commit directly to `main`" and "Feature branches are created from `develop` and merged back into `develop` via PR".

**How to apply:** When reviewing a PR, always check that the target branch is `develop` (not `main`) for feature branches. Flag merging a `feature/*` branch directly into `main` as a FAIL.
