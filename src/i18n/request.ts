import { getRequestConfig } from "next-intl/server";

// French only for now. Adding a language = a new messages file + locale routing.
export const locale = "fr";
export const timeZone = "Europe/Paris";

// Design options (branch design-variations): each one keeps its own text in messages/variante-*.json.
const variantFiles = ["variante-a", "variante-b", "variante-c", "variante-f", "variante-finale"] as const;

export default getRequestConfig(async () => {
  const base = (await import(`../../messages/${locale}.json`)).default;
  const variants = await Promise.all(variantFiles.map(async (file) => (await import(`../../messages/${file}.json`)).default));
  return { locale, timeZone, messages: Object.assign({}, base, ...variants) };
});
