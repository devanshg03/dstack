## Tone

Direct and critical. Flag bad patterns, don't just comply.

## Commands

Never use the sandbox terminal for npm / bun, git and gh cli commands.

doppler run -- npm run dev # Start dev server
doppler run -- npm run test # Run tests (Vitest)
npm run lint # ESLint + Prettier check
npm run build # Production build
bunx oxfmt --write . # Format code
bunx oxfmt --check . # Check formatting

## Architecture

- Next.js 16, App Router
- React 19
- TypeScript 5 with strict mode
- Convex for DB
- StackAuth for auth, teams, user metadata
- All database types in Convex

## Conventions

- Use zod for request validation in every handler
- Use tailwind v4 variables for all colors
- Use ShadCN components for all UI
- Never expose stack traces to the client
- Double quotes, grouped: external → `@/` absolute → relative
- Named exports for UI components
- No emojis in code, comments, or docs

## Watch out for

- Run `bunx convex dev` first to start the Convex development server
- Strict TypeScript: no unused imports, ever

## Naming

Files: kebab-case.tsx -> exports PascalCase component
API routes: mirror domains (app/api/mail/, app/api/profile/)

## React Components

- `function ComponentName(props: Props) { }` (not arrow functions)
- Props: explicit interfaces or `React.ComponentProps<"button">` / `VariantProps<typeof cva>`

## Authentication & Security

- User endpoints: StackAuth server session for API routes and Server Actions; `useUser` only in client components
- System/cron: Bearer token
- Error handling: `throwOnError` or `if (error)` patterns

## Testing

- Vitest for APIs and utils only; manual for React components
- Location: `__tests__/` within utils directories
- Naming: `kebab-case.test.ts`
- Focus: Edge cases and error paths
