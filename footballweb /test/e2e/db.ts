import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const E2E_TEST_SCHEMA = process.env.E2E_DATABASE_SCHEMA || `test_e2e_${process.pid}`;

function readDatabaseUrlFromEnvFile() {
  const envFile = path.join(process.cwd(), ".env");

  if (!fs.existsSync(envFile)) {
    return undefined;
  }

  const content = fs.readFileSync(envFile, "utf8");
  const match = content.match(/^DATABASE_URL="?(.+?)"?$/m);

  return match?.[1];
}

export function createE2EDatabaseUrl() {
  const sourceUrl = process.env.E2E_DATABASE_URL || process.env.DATABASE_URL || readDatabaseUrlFromEnvFile();

  if (!sourceUrl) {
    throw new Error("DATABASE_URL or E2E_DATABASE_URL is required for Playwright tests.");
  }

  const url = new URL(sourceUrl);
  url.searchParams.set("schema", E2E_TEST_SCHEMA);

  return url.toString();
}

export const e2eDatabaseUrl = createE2EDatabaseUrl();

export function resetE2ESchema() {
  const projectRoot = process.cwd();
  const prismaBin = path.join(projectRoot, "node_modules", ".bin", "prisma");
  const nodeBin = process.execPath;
  const baseUrl = process.env.E2E_DATABASE_URL || process.env.DATABASE_URL || readDatabaseUrlFromEnvFile();

  if (!baseUrl) {
    throw new Error("DATABASE_URL or E2E_DATABASE_URL is required for Playwright tests.");
  }

  const adminUrl = new URL(baseUrl);
  adminUrl.searchParams.set("schema", "public");

  execFileSync(
    nodeBin,
    [prismaBin, "db", "execute", "--stdin", "--schema", "prisma/schema.prisma"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        DATABASE_URL: adminUrl.toString()
      },
      input: `DROP SCHEMA IF EXISTS "${E2E_TEST_SCHEMA}" CASCADE; CREATE SCHEMA "${E2E_TEST_SCHEMA}";`,
      stdio: ["pipe", "pipe", "pipe"]
    }
  );

  execFileSync(
    nodeBin,
    [prismaBin, "db", "push", "--accept-data-loss", "--skip-generate", "--schema", "prisma/schema.prisma"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        DATABASE_URL: e2eDatabaseUrl
      },
      stdio: ["pipe", "pipe", "pipe"]
    }
  );
}
