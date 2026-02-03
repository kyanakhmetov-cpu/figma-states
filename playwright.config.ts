import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://localhost:3000",
  },
  webServer: {
    command: "pnpm prisma:deploy && pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      DATABASE_URL: "file:./prisma/test.db",
      UPLOAD_MAX_SIZE_MB: "6",
    },
  },
});
