---
name: api
description: Whenever designing or working on API routes
---

# API Development Rules

Every API route is either user-authenticated or system-authenticated. No exceptions.

## 1. Route Handlers

- Use standard Next.js `NextRequest` and `NextResponse` types only
- No custom middleware that wraps handlers

## 2. Authentication

### User APIs (browser/app requests)

Resolve the signed-in user with **StackAuth on the server**. In Route Handlers and Server Actions, use Stack's server-side session APIs—**not** the React `useUser` hook (that is client-only).

After auth, read and write data through **Convex** (`fetchQuery`, `fetchMutation`, `fetchAction` from `convex/nextjs`) so authorization can rely on `ctx.auth` inside Convex functions. Pass the Convex auth token when your setup requires it (same pattern as other OIDC providers: token option on `fetch*`).

```typescript
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import type { NextRequest } from "next/server";

export async function PATCH(request: NextRequest) {
  // 1. Resolve user with StackAuth server APIs; return 401 if missing
  // 2. Build Convex token if your Stack+Convex integration uses JWT forwarding
  const token = await getConvexAuthTokenFromRequest(request);
  const args = await request.json();
  await fetchMutation(api.example.updateThing, args, { token });
}
```

### Cron/System APIs

Use Bearer token + trusted Convex entry points:

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response("Unauthorized", { status: 401 });
}

await fetchMutation(api.jobs.runScheduled, payload);
```

Use **deployment-appropriate** Convex access for system jobs (e.g. internal mutations or HTTP actions that validate the same secret). Never reuse a "god mode" client for user-initiated work.

### Access shape

| Caller            | Auth              | Data layer                          |
| ----------------- | ----------------- | ----------------------------------- |
| User API route    | StackAuth session | Convex via `fetch*` + user token    |
| System / cron API | Bearer secret     | Convex mutation/action for batch/system work |

Never bypass user-level Convex auth for operations that should be scoped to a single user.

## 3. Validation

**Every API route MUST validate with Zod.** No exceptions.

### Validation Order: Fail Fast

1. Authenticate
2. Parse and validate request body immediately
3. Then do expensive operations (Convex calls, external APIs)

### Schema Patterns

- Use `.trim()` for strings, `.email()` for emails
- Use `.refine()` for custom business logic
- Use `z.discriminatedUnion()` for conditional validation

## 4. Error Response Format

All errors use Stripe-style format:

```typescript
{
  error: {
    type: string;      // Required: validation_error, authentication_error, api_error, etc.
    message: string;   // Required: Human-readable
    code?: string;     // Optional: MISSING_EMAIL, QUOTA_EXCEEDED, etc.
    param?: string;    // Optional: Field name for validation errors
    details?: unknown; // Optional: Zod errors array
  }
}
```

### Error Types by Status

- `400` validation_error - Invalid input
- `401` authentication_error - Not authenticated
- `403` authorization_error - Not authorized
- `404` not_found_error - Resource missing
- `429` rate_limit_error - Quota exceeded
- `500` api_error - Internal error
- `503` service_unavailable_error - External service down

### Forbidden Formats

```typescript
// NEVER use these:
{ success: false, error: "message" }
{ error: "string" }  // Must be object
{ message: "..." }   // Must use error.message
```

## 5. Standard API Template

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const user = await getStackAuthUserFromRequest(request);
  if (!user) {
    return NextResponse.json(
      {
        error: { type: "authentication_error", message: "Unauthorized" },
      },
      { status: 401 },
    );
  }

  try {
    const rawBody = await request.json();
    const data = schema.parse(rawBody);

    const token = await getConvexAuthTokenFromRequest(request, user);
    const result = await fetchMutation(api.example.createProfile, data, { token });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            type: "validation_error",
            message: "Validation failed",
            details: error.issues,
          },
        },
        { status: 400 },
      );
    }
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: { type: "api_error", message: "Internal server error" },
      },
      { status: 500 },
    );
  }
}
```

Replace `getStackAuthUserFromRequest` / `getConvexAuthTokenFromRequest` with the project's StackAuth server helpers and Convex token bridge.

## 6. Security

- Always sanitize inputs: `.trim()`, `.toLowerCase()` for emails
- Check user quotas before expensive operations via `user.clientReadOnlyMetadata`
- Use Supabase query builders, never raw SQL with user input
- Validate environment variables exist before using
- There is no SQL layer; do not concatenate user input into query strings for external services

## 7. Database Best Practices (Convex)

- Define schema and indexes in `convex/schema.ts`; query with indexed fields
- Limit list reads (e.g. `.take(n)` / bounded queries); avoid unbounded scans
- Use Convex argument validators on every function; keep Zod at the HTTP boundary
- Use `Promise.allSettled()` for concurrent operations that can fail independently
- Use `pLimit` for controlled concurrency against external APIs

## 8. Logging

- Use `console.error()` for errors with context (userId, error message, stack)
- Use `console.log()` sparingly for important business events
- Never log sensitive data (passwords, tokens, PII)
- Logs are auto-captured by Vercel

## 9. Testing

- Test files in `__tests__/` within API route folders
- Mock StackAuth server user resolution and Convex `fetch*` helpers when testing handlers in isolation
- Mock `request.json()` for body parsing
- Use `{} as NextRequest` if handler doesn't use request object
