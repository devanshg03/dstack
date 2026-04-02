---
name: api-timing-logs
description: Adds readable one-line phase timing logs for API routes and server handlers (local debugging and production correlation). Use when instrumenting slow routes, debugging latency, adding request tracing, or when the user asks for timing logs, speed stats, or structured server logging.
---

# API phase timing logs (gold standard)

## Goals

- **Scannable in a terminal**: one line per phase, aligned columns, no nested objects on the happy path.
- **Grep-friendly**: fixed bracket tag per feature (e.g. `[ck-gen]`, `[mail-send]`).
- **Minimal PII**: log `user=…` **once** at start; repeat **only** on error lines that need correlation.

## Log line shape

```
[TAG] begin  user=<full-user-id>
[TAG] <step>              <ms>ms  <optional key=value ...>
```

- **`TAG`**: short, stable, unique within the codebase (2–8 chars after the bracket is enough if unambiguous).
- **`step`**: lowercase, use **dots** for sub-phases (`db.company_row`, `storage.sign`, `llm`). Pad `step` to a fixed width (e.g. 18 chars) so `ms` columns line up.
- **`ms`**: wall time for **that phase only** (`Date.now() - phaseStart`), not cumulative unless the step name says `total`.
- **Detail tail**: space-separated `key=value`. Prefer counts and compact units over raw dumps.

## Helpers (TypeScript pattern)

Copy/adapt per route; keep helpers **file-local** unless three+ routes need the same tag.

```ts
const TAG = "[feature-tag]";

function elapsedMs(start: number) {
  return Date.now() - start;
}

function phaseLog(step: string, ms: number, detail?: string) {
  const tail = detail ? `  ${detail}` : "";
  console.info(`${TAG} ${step.padEnd(18)} ${String(ms).padStart(5)}ms${tail}`);
}

function phaseWarn(bucket: string, detail: string) {
  console.warn(`${TAG} ${bucket}  ${detail}`);
}

function phaseErr(step: string, userId: string, detail: string) {
  console.error(`${TAG} ${step}  user=${userId}  ${detail}`);
}
```

After auth (or once `userId` is known): `console.info(\`${TAG} begin  user=${userId}\`);`then use`phaseLog`for every subsequent phase **without** repeating`userId`.

## What to log per phase

- **External I/O**: hub pull, DB reads/writes, storage sign/download, HTTP fetches, LLM calls—each gets its own line with duration.
- **CPU-ish work** only if it can be large (parse/format of huge payloads); otherwise merge with the phase that produced the bytes.
- **Final line**: `done` or `total` with end-to-end `ms` plus 1–3 summary stats (`docs=`, `llmIn=34500ch`, etc.).

## Units and compaction

- Prefer **`kch`** (thousands of **characters**) when approximating payload size from string length. Do **not** label char counts as `kB` (misleading).
- Rough token hints are OK: `~8676tok` with a comment in code that it is approximate (e.g. chars/4).
- For multiple similar items, one compact tail beats an array of objects:  
  `ok=3/3 raw~1200kch  [a.json:400kch@800ms, b.pdf:…]`
- Cap list length in logs (e.g. first 3 files + `+2 more`) if noise gets large.

## Errors

- Use **`phaseErr`** for failures where you need to find the user in logs: include `user=<id>` and a **short** reason (message string, not full stack objects).
- Keep generic `console.error` for unexpected exceptions if you already logged `begin` with `user=`.

## Anti-patterns

- Repeating `userId` on every `info` line.
- Dumping **full prompts**, document bodies, or tokens in logs.
- Large **JSON blobs** for routine success paths—use one line + counts.
- Inconsistent tags (e.g. mixing `console.info("feature: …")` and `[tag] …` styles) in the same route.
