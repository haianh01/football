import { PrismaClient } from "@prisma/client";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_SCHEMA = process.env.TEST_DATABASE_SCHEMA || `test_integration_${process.pid}`;

function createTestDatabaseUrl() {
  const sourceUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!sourceUrl) {
    throw new Error("DATABASE_URL or TEST_DATABASE_URL is required for integration tests.");
  }

  const url = new URL(sourceUrl);
  url.searchParams.set("schema", TEST_SCHEMA);

  return url.toString();
}

export const integrationDatabaseUrl = createTestDatabaseUrl();

export const integrationDb = new PrismaClient({
  datasourceUrl: integrationDatabaseUrl,
  log: ["error"]
});

export async function clearIntegrationData() {
  await integrationDb.matchPost.deleteMany();
  await integrationDb.teamInvite.deleteMany();
  await integrationDb.teamMember.deleteMany();
  await integrationDb.team.deleteMany();
  await integrationDb.userPreference.deleteMany();
  await integrationDb.userIdentity.deleteMany();
  await integrationDb.user.deleteMany();
}

export function resetIntegrationSchema() {
  const currentFile = fileURLToPath(import.meta.url);
  const projectRoot = path.resolve(path.dirname(currentFile), "..", "..");
  const prismaBin = path.join(projectRoot, "node_modules", ".bin", "prisma");
  const baseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!baseUrl) {
    throw new Error("DATABASE_URL or TEST_DATABASE_URL is required for integration tests.");
  }

  const adminUrl = new URL(baseUrl);
  adminUrl.searchParams.set("schema", "public");

  execFileSync(
    prismaBin,
    ["db", "execute", "--stdin", "--schema", "prisma/schema.prisma"],
    {
      cwd: projectRoot,
      env: {
        ...process.env,
        DATABASE_URL: adminUrl.toString()
      },
      input: `DROP SCHEMA IF EXISTS "${TEST_SCHEMA}" CASCADE; CREATE SCHEMA "${TEST_SCHEMA}";`,
      stdio: ["pipe", "pipe", "pipe"]
    }
  );

  execFileSync(prismaBin, ["db", "push", "--accept-data-loss", "--skip-generate", "--schema", "prisma/schema.prisma"], {
    cwd: projectRoot,
    env: {
      ...process.env,
      DATABASE_URL: integrationDatabaseUrl
    },
    stdio: ["pipe", "pipe", "pipe"]
  });
}
