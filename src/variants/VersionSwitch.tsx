"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { presentation } from "@/variants/presentation";

/** Presentation only: V1 is the version validated on 2026-11-23, V2 the one after the stakeholder feedback. */
const versions: Record<string, string> = { "1": "finale-v1", "2": "finale" };
const sections = ["synthese", "avis", "agences", "qualite"];

/**
 * Nothing on screen: pressing 1 shows V1, pressing 2 shows V2, to compare the two versions while presenting.
 * Pressing 3 shows (or hides again) V2's hero as it looks for an agency without a photo.
 * Switching keeps the section being looked at (Synthèse, Avis, Agence, Qualité). Ignored while typing in a field.
 */
export function VersionSwitch() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const current = pathname.includes("/variantes/finale-v1/") ? "finale-v1" : "finale";
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (event.key === "3") {
        presentation.setNoPhoto(current === "finale-v1" ? true : !presentation.noPhoto());
        if (current === "finale") return;
      }
      const segment = event.key === "3" ? "finale" : versions[event.key];
      if (!segment || segment === current) return;
      // The section whose top has reached the header (the last one that has).
      const headerBottom = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
      const here =
        window.scrollY < 40
          ? undefined
          : sections
              .map((id) => document.getElementById(id))
              .filter((el): el is HTMLElement => !!el && el.getBoundingClientRect().top <= headerBottom + 24)
              .pop();
      const next = pathname.replace(`/variantes/${current}/`, `/variantes/${segment}/`);
      router.push(here ? `${next}#${here.id}` : next, { scroll: !here });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pathname, router]);

  return null;
}
