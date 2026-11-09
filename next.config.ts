import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  cacheComponents: true,
  // The dev indicator would sit over the page in demos.
  devIndicators: false,
  // Phones on the same Wi-Fi (the address changes with the network).
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
  partialPrefetching: true,
  async redirects() {
    return [
      { source: "/", destination: "/fr-fr/variantes/finale/20871", permanent: false },
      // The current prototype and options A to G now live on the Exemples link; Version 2 (finale-2) was dropped for Version 1.
      { source: "/fr-fr/certificate/:id", destination: "/fr-fr/variantes/finale/:id", permanent: false },
      { source: "/fr-fr/variantes", destination: "/fr-fr/variantes/finale/20871", permanent: false },
      { source: "/fr-fr/variantes/:option(a|b|b-bleu|c|d|e|f|f2|finale-2)/:id", destination: "/fr-fr/variantes/finale/:id", permanent: false },
    ];
  },
};

export default withNextIntl(nextConfig);
