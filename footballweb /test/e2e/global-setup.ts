import { resetE2ESchema } from "./db";

export default async function globalSetup() {
  resetE2ESchema();
}
