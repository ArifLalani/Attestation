import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { NextIntlClientProvider } from "next-intl";
import { Providers } from "./providers";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "La Boîte Immo — Avis contrôlés | Opinion System",
  description: "Certificat électronique Opinion System : réputation vérifiée, avis clients contrôlés.",
};

export const viewport: Viewport = {
  themeColor: "#041b44",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={poppins.variable} data-scroll-behavior="smooth">
      <body>
        <AppRouterCacheProvider>
          <NextIntlClientProvider>
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
