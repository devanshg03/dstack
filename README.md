# create-dstack

Scaffold a production-ready Next.js app with a single command.

```bash
bunx create-dstack my-app
```

## What's included


| Tool                                             | Purpose                   |
| ------------------------------------------------ | ------------------------- |
| [Next.js](https://nextjs.org) (latest)           | Framework                 |
| [Bun](https://bun.sh)                            | Runtime + package manager |
| [Convex](https://convex.dev)                     | Backend + database        |
| [Shadcn UI](https://ui.shadcn.com)               | Component library         |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter) | Linter                    |
| [Oxfmt](https://www.npmjs.com/package/oxfmt)     | Formatter                 |


## Scripts

```bash
bun dev            # start dev server
bunx convex dev    # start Convex backend (first run requires login)
bun lint           # run Oxlint
bun format         # run Oxfmt
bun format:check   # check formatting without writing
```

## License

MIT © [Devansh Gandhi](https://github.com/devanshg03)