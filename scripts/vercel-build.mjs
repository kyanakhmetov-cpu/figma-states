import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const pnpmCmd = isWindows ? "pnpm.cmd" : "pnpm";

const log = (message) => {
  console.log(`[vercel-build] ${message}`);
};

const run = (args, env = process.env) => {
  log(`$ ${pnpmCmd} ${args.join(" ")}`);
  const result = spawnSync(pnpmCmd, args, {
    env,
    stdio: "inherit",
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  if (typeof result.status === "number" && result.status !== 0) {
    process.exit(result.status);
  }
};

const databaseUrl = process.env.DATABASE_URL || "";
const prismaDatabaseUrl = process.env.PRISMA_DATABASE_URL || "";
const effectiveUrl = databaseUrl || prismaDatabaseUrl;

log(`DATABASE_URL set: ${Boolean(databaseUrl)}`);
log(`PRISMA_DATABASE_URL set: ${Boolean(prismaDatabaseUrl)}`);

if (!effectiveUrl) {
  log("No database URL found. Skipping prisma migrate deploy.");
} else if (effectiveUrl.startsWith("prisma+postgres://")) {
  log("DATABASE_URL uses prisma+postgres://. Skipping prisma migrate deploy.");
  log("Set DATABASE_URL to a postgres:// connection string to run migrations.");
} else {
  const env = {
    ...process.env,
    DATABASE_URL: effectiveUrl,
  };

  log("Running prisma migrate deploy.");
  run(["prisma", "migrate", "deploy"], env);
}

log("Running next build.");
run(["build"]);
