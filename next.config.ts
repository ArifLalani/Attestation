import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The version switcher sits bottom left, where the dev indicator would cover it.
  devIndicators: false,
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/", destination: "/fr-fr/variantes/finale/20871", permanent: false },
      // The current prototype and options A to G now live on the Exemples link.
      { source: "/fr-fr/certificate/:id", destination: "/fr-fr/variantes/finale/:id", permanent: false },
      { source: "/fr-fr/variantes", destination: "/fr-fr/variantes/finale/20871", permanent: false },
      { source: "/fr-fr/variantes/:option(a|b|b-bleu|c|d|e|f|f2)/:id", destination: "/fr-fr/variantes/finale/:id", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
