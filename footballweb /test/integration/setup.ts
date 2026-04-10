import { afterAll, beforeAll, beforeEach } from "vitest";

import { clearIntegrationData, integrationDb, integrationDatabaseUrl, resetIntegrationSchema } from "./prisma";

Object.assign(process.env, {
  NODE_ENV: "test",
  DATABASE_URL: integrationDatabaseUrl
});

beforeAll(async () => {
  resetIntegrationSchema();
});

beforeEach(async () => {
  await clearIntegrationData();
});

afterAll(async () => {
  await integrationDb.$disconnect();
});
