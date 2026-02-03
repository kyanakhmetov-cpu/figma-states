import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const pnpmCmd = isWindows ? "pnpm.cmd" : "pnpm";

const log = (message) => {
  console.log(`[vercel-build] ${message}`);
};

const run = (args, env = process.env, options = {}) => {
  const { allowFailure = false } = options;
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
    if (!allowFailure) {
      process.exit(result.status);
    }
  }

  return result.status ?? 0;
};

const databaseUrl = process.env.DATABASE_URL || "";
const prismaDatabaseUrl = process.env.PRISMA_DATABASE_URL || "";
const postgresUrl = process.env.POSTGRES_URL || "";
const effectiveUrl = databaseUrl || postgresUrl || prismaDatabaseUrl;

log(`DATABASE_URL set: ${Boolean(databaseUrl)}`);
log(`POSTGRES_URL set: ${Boolean(postgresUrl)}`);
log(`PRISMA_DATABASE_URL set: ${Boolean(prismaDatabaseUrl)}`);

log("Running prisma generate.");
run(["prisma", "generate"]);

if (!effectiveUrl) {
  log("No database URL found. Skipping prisma migrate deploy.");
} else if (effectiveUrl.startsWith("prisma+postgres://")) {
  log("Database URL uses prisma+postgres://. Skipping prisma migrate deploy.");
  log("Set DATABASE_URL or POSTGRES_URL to a postgres:// connection string to run migrations.");
} else {
  const env = {
    ...process.env,
    DATABASE_URL: effectiveUrl,
  };

  log("Running prisma migrate deploy.");
  const migrateStatus = run(["prisma", "migrate", "deploy"], env, {
    allowFailure: true,
  });

  if (migrateStatus !== 0) {
    log("prisma migrate deploy failed. Falling back to prisma db push.");
    run(["prisma", "db", "push"], env);
  }
}

log("Running next build.");
run(["build"]);
