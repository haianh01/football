import { getRequestConfig } from "next-intl/server";

const defaultLocale = "vi-VN";

export default getRequestConfig(async () => ({
  locale: defaultLocale,
  messages: (await import(`../messages/${defaultLocale}.json`)).default
}));

