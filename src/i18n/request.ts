import { getRequestConfig } from "next-intl/server";

// French only for now. Adding a language = a new messages file + locale routing.
export const locale = "fr";
export const timeZone = "Europe/Paris";

export default getRequestConfig(async () => ({
  locale,
  timeZone,
  messages: (await import(`../../messages/${locale}.json`)).default,
}));
