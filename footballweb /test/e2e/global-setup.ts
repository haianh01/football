import { resetE2ESchema } from "./db";

export default async function globalSetup() {
  if (process.env.PLAYWRIGHT_BASE_URL) {
    return;
  }

  resetE2ESchema();
}
