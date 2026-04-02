---
name: create-pr
description: Turn current workspace changes into a published GitHub pull request by creating or reusing a branch, committing the changes, pushing the branch, and opening a PR with gh.
---

## 1. Trigger this skill

- Use when the user asks to run end-to-end PR publishing for current local changes.
- Use when the user asks for branch creation + commit + push + PR in one command.

## 2. Required tooling

- `git` and `gh` are available and authenticated.
- `scripts/create-pr.sh` exists at repo root.
- Git remote `origin` is configured.

## 3. Inputs you can pass

- `TARGET_BRANCH`: desired branch name.
- `COMMIT_MESSAGE`: commit message used for the commit.
- `PR_TITLE`: PR title shown in GitHub.
- `PR_BODY_FILE`: optional markdown file path for PR body.
- `BASE_BRANCH`: PR base branch (default `main`).
- `GIT_REMOTE`: git remote name (default `origin`).

## 4. Process

Run the workflow via script:

```bash
TARGET_BRANCH=<branch-name> \
COMMIT_MESSAGE="<message>" \
PR_TITLE="<PR title>" \
BASE_BRANCH=<base branch> \
scripts/create-pr.sh
```

Workflow order:

- Create or checkout `TARGET_BRANCH`.
- Add all local changes and create one commit with `COMMIT_MESSAGE`.
- Push branch with upstream tracking to `GIT_REMOTE`.
- Open a PR from `TARGET_BRANCH` to `BASE_BRANCH`.
- Print PR URL on success.

## 5. Safety and failure behavior

- Abort with clear error when no changes are present.
- Abort when required commands are unavailable.
- If PR creation fails after push, return a message with the pushed remote branch and stop cleanly.

## 6. PR description guidelines

# Pull Request Guide

This document describes how we write PRs for this project. The goal is for a reviewer — or anyone reading the PR months later — to understand what problem existed, what decision was made, and why, without having to read the code.

---

## Structure

Every non-trivial PR should follow this structure:

### 1. Summary

One short paragraph stating what this PR does and why it matters. No bullet lists here — write in prose.

### 2. Before vs After

For architectural or flow changes, show the old and new as ASCII diagrams or code blocks. Label the problems with the old approach explicitly. The diagram should make the improvement self-evident.

```
# Example
Before:
  raw snapshot (~50K tokens)
    └─ agent A → agent B → agent C (sequential)

After:
  formatted input (~1.5K tokens)
    ├─ agent A
    ├─ agent B  (parallel)
    └─ agent C
```

### 3. Key Improvements

Bullet list of the specific wins. Be concrete — use numbers.

- "~97% token reduction" not "significant token reduction"
- "MAE dropped from 3.5 to 2.1" not "improved accuracy"
- "removed one sequential LLM hop" not "made it faster"

### 4. Deep-dive Sections

For anything non-obvious — evaluation methodology, format design, data shape changes, model selection — give it its own titled section. Reviewers who want detail can read it; others can skip.

### 5. New Data Shape

Whenever the output schema of a service or database record changes, show the new shape as a TypeScript snippet or JSON example.

### 6. Open TODOs

Explicitly list what is **not** in this PR but should be done. Bold the item name, one sentence of context. This prevents follow-up questions and captures intent before it gets lost.

- **Item name** — why it matters and what needs to happen

### 7. Test Plan

Checkboxes with specific commands and specific things to verify. Not "test it works" but:

- [ ] Run `doppler run -- npx tsx scripts/foo.ts` — verify output X
- [ ] Process a new profile end-to-end — confirm data shape matches Y
- [ ] Retry a partially-failed job — confirm only failed steps re-run

---

## Tone and Style

- No emojis
- No tool attribution footers (e.g. "Generated with X")
- Write in plain declarative sentences: "Personality runs in parallel" not "We made personality run in parallel"
- Use exact numbers where available
- For model or approach comparisons, use a table
- Don't hedge: say what happened

## Title Format

Use [Conventional Commits](https://www.conventionalcommits.org/). Use title case for PR titles (capitalize principal words; lowercase short conjunctions like `and`, `or`, `for` unless they start the title). Preserve identifiers as they appear in code (`Cluster.AgentId`, API names, etc.).

Keep titles under 72 characters. Use the description/body for details, not the title.

---

## PR Size

- Prefer one focused PR over several small ones for tightly coupled changes
- If a PR touches both a refactor and a new feature, split them unless they are inseparable
- Infrastructure changes (schema, DB migrations) should be their own PR
