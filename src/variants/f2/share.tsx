"use client";

import Snackbar from "@mui/material/Snackbar";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { Agency } from "@/data/types";

export function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export const googleDirections = (address: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
export const googleSearch = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

/** Phone share menu when there is one, otherwise the link is copied and a toast confirms it. */
export function useShare(agency: Agency) {
  const t = useTranslations("Business");
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const data = { title: agency.name, text: t("shareText", { name: agency.name }), url: window.location.href };
    if (navigator.share) {
      try {
        await navigator.share(data);
      } catch {
        // Cancelled by the user.
      }
      return;
    }
    await navigator.clipboard?.writeText(data.url);
    setCopied(true);
  };

  const toast = (
    <Snackbar
      open={copied}
      autoHideDuration={2500}
      onClose={() => setCopied(false)}
      message={t("linkCopied")}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      slotProps={{ content: { sx: { bgcolor: "#222", borderRadius: "12px", fontWeight: 600 } } }}
    />
  );

  return { share, toast };
}
