#!/usr/bin/env bun
import { $ } from "bun";
import { existsSync, cpSync, mkdirSync, appendFileSync } from "fs";
import { join, resolve, dirname } from "path";
import { fileURLToPath } from "url";
import * as p from "@clack/prompts";
import color from "picocolors";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, "..", "templates");

function copyTemplate(src: string, dest: string) {
  if (!existsSync(src)) return;
  cpSync(src, dest, { recursive: true, force: true });
}

async function main() {
  console.log();
  p.intro(color.bgCyan(color.black(" create-dstack ")));

  // 1. Project name
  let projectName = process.argv[2] as string | undefined;

  if (!projectName) {
    const input = await p.text({
      message: "Project name",
      placeholder: "my-app",
      validate: (v) => (!v || v.length === 0 ? "Name is required" : undefined),
    });
    if (p.isCancel(input)) {
      p.cancel("Cancelled.");
      process.exit(0);
    }
    projectName = input as string;
  }

  // 2. Options
  const useStackAuth = await p.confirm({ message: "Add Stack Auth?" });
  if (p.isCancel(useStackAuth)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const projectDir = resolve(process.cwd(), projectName);

  if (existsSync(projectDir)) {
    p.cancel(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  // 3. Scaffold
  const s = p.spinner();

  s.start("preheating the oven...");
  await $`bunx create-next-app@latest ${projectName} --typescript --tailwind --no-eslint --app --src-dir --import-alias "@/*" --use-bun`.quiet();
  s.stop("next.js is in the chat");

  s.start("calling convex off the bench...");
  await $`bun add convex`.cwd(projectDir).quiet();
  s.stop("convex said say less");

  s.start("the linter and formatter are suiting up...");
  await $`bun add -d oxlint oxfmt`.cwd(projectDir).quiet();
  s.stop("no slop code allowed fr fr");

  s.start("adding the drip (shadcn)...");
  await $`bunx shadcn@latest init -d`.cwd(projectDir).quiet();
  s.stop("looking fire already");

  // 4. Stack Auth
  if (useStackAuth) {
    s.start("sliding stack auth into the dm...");
    await $`bun add @stackframe/stack`.cwd(projectDir).quiet();
    s.stop("auth is cooked and ready");

    // convex/auth.config.ts
    mkdirSync(join(projectDir, "convex"), { recursive: true });
    copyTemplate(
      join(TEMPLATES_DIR, "convex", "auth.config.ts"),
      join(projectDir, "convex", "auth.config.ts"),
    );

    // .env.local placeholders
    appendFileSync(
      join(projectDir, ".env.local"),
      [
        "",
        "# Stack Auth — fill in from https://app.stack-auth.com",
        "NEXT_PUBLIC_STACK_PROJECT_ID=",
        "NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=",
        "STACK_SECRET_SERVER_KEY=",
        "",
      ].join("\n"),
    );

    p.log.warn(
      "Stack Auth needs manual steps:\n" +
      `  1. Create a project at ${color.cyan("https://app.stack-auth.com")}\n` +
      `  2. Fill in ${color.dim(".env.local")} with your keys\n` +
      `  3. Set the same vars in your Convex dashboard\n` +
      `  4. Run ${color.cyan("bunx @stackframe/stack-cli@latest init")} inside the project to finish wiring up the provider`,
    );
  }

  // 5. Templates
  s.start("putting the secret sauce on it...");

  copyTemplate(join(TEMPLATES_DIR, "globals.css"), join(projectDir, "src", "app", "globals.css"));
  copyTemplate(join(TEMPLATES_DIR, "oxlint.json"), join(projectDir, "oxlint.json"));
  copyTemplate(join(TEMPLATES_DIR, "oxfmt.json"), join(projectDir, "oxfmt.json"));

  if (existsSync(join(TEMPLATES_DIR, ".claude"))) {
    copyTemplate(join(TEMPLATES_DIR, ".claude"), join(projectDir, ".claude"));
  }
  if (existsSync(join(TEMPLATES_DIR, ".cursor"))) {
    copyTemplate(join(TEMPLATES_DIR, ".cursor"), join(projectDir, ".cursor"));
  }
  copyTemplate(join(TEMPLATES_DIR, "agents.md"), join(projectDir, "agents.md"));
  copyTemplate(join(TEMPLATES_DIR, "CLAUDE.md"), join(projectDir, "CLAUDE.md"));

  const pkgPath = join(projectDir, "package.json");
  const pkg = await Bun.file(pkgPath).json();
  pkg.scripts = {
    ...pkg.scripts,
    lint: "oxlint .",
    format: "oxfmt .",
    "format:check": "oxfmt --check .",
  };
  await Bun.write(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  s.stop("this thing is absolutely cooked (in a good way)");

  // 6. Outro
  p.outro(
    `${color.green("Ready.")} ${color.dim("Next steps:")}\n\n` +
    `  ${color.cyan("cd")} ${projectName}\n` +
    `  ${color.cyan("bun dev")}            start dev server\n` +
    `  ${color.cyan("bunx convex dev")}    start Convex (first run: login)\n` +
    `  ${color.cyan("bun lint")}           run Oxlint\n` +
    `  ${color.cyan("bun format")}         run Oxfmt`,
  );
}

main().catch((e) => {
  p.cancel(e.message ?? "Something went wrong.");
  process.exit(1);
});
