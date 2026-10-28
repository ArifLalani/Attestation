import { Figtree } from "next/font/google";

/** Option C typeface. Used through `style.fontFamily`, so dialogs and sheets (portals on <body>) get it too. */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
