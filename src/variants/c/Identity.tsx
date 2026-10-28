"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import IosShare from "@mui/icons-material/IosShare";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Verified from "@mui/icons-material/Verified";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import type { Agency } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { frenchTime, localClock, openingStatus } from "@/lib/hours";
import { summarize } from "@/lib/scoring";
import { ActionCircle, Stars } from "./ui";
import { focusRing, pc } from "./theme";

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

/** "Ouvert · Ferme à 19 h" in emerald, or the next opening in red. Computed in the browser (Paris time). */
export function OpenStatusText({ agency }: { agency: Agency }) {
  const t = useTranslations("Hours");
  const now = useNow();
  const status = now ? openingStatus(agency.hours, now) : null;
  if (!status) return <Box component="span" sx={{ visibility: "hidden" }}>·</Box>;
  const [state, ...rest] = (status.open
    ? t("openUntil", { time: frenchTime(status.closesAt) })
    : status.opensAt === null
      ? t("closed")
      : status.opensDay === null
        ? t("closedOpensToday", { time: frenchTime(status.opensAt) })
        : t("closedOpensOn", { day: t(`days.${status.opensDay}`), time: frenchTime(status.opensAt) })
  ).split(" · ");
  return (
    <Box component="span" role="status" sx={{ fontSize: 15, lineHeight: 1.4 }}>
      <Box component="span" sx={{ fontWeight: 700, color: status.open ? pc.emeraldText : pc.red }}>{state}</Box>
      {rest.length > 0 && <Box component="span" sx={{ color: pc.ink }}> · {rest.join(" · ")}</Box>}
    </Box>
  );
}

/** The week, today in bold on a tonal row. */
export function HoursTable({ agency }: { agency: Agency }) {
  const t = useTranslations("Hours");
  const now = useNow();
  const today = now ? localClock(now).weekday : -1;
  return (
    <Box component="dl" sx={{ m: 0, display: "flex", flexDirection: "column" }}>
      {agency.hours.map((ranges, day) => (
        <Box
          key={day}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            px: 1.5,
            py: 0.75,
            borderRadius: "10px",
            fontSize: 14,
            fontWeight: day === today ? 700 : 500,
            bgcolor: day === today ? pc.indigoSoft : "transparent",
            color: pc.ink,
          }}
        >
          <Box component="dt">{t(`daysTitle.${day}`)}</Box>
          <Box component="dd" sx={{ m: 0, textAlign: "right", color: ranges.length ? pc.ink : pc.red }}>
            {ranges.length ? ranges.map(([start, end]) => `${frenchTime(start)} – ${frenchTime(end)}`).join(", ") : t("closed")}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function InfoRow({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, minHeight: 44, py: 1 }}>
      <Box sx={{ display: "flex", color: pc.indigoDark, pt: "1px", "& svg": { fontSize: 22 } }}>{icon}</Box>
      <Box sx={{ flex: 1, minWidth: 0, fontSize: 15, lineHeight: 1.45 }}>{children}</Box>
    </Box>
  );
}

const linkSx = { color: pc.ink, textDecoration: "none", textUnderlineOffset: "3px", "&:hover": { textDecoration: "underline" }, "&:focus-visible": focusRing } as const;

/** Name, rating, category and the info rows (address, hours, phone, website), Google Business style. */
export function Identity({ compactCover = false, info = true }: { compactCover?: boolean; info?: boolean }) {
  const t = useTranslations("VarianteC");
  const tb = useTranslations("Business");
  const { agency, reviews, goToSection, setPanel } = useCertificate();
  const [copied, setCopied] = useState(false);
  const summary = useMemo(() => summarize(reviews), [reviews]);
  const photos = [agency.coverPhoto, ...agency.photos.slice(0, 4)];

  const share = async () => {
    const data = { title: agency.name, text: tb("shareText", { name: agency.name }), url: window.location.href };
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

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {/* Phones: a swipeable strip of photos. Desktop side panel: one wide cover. */}
      {compactCover ? (
        <Box sx={{ position: "relative", height: 160, flexShrink: 0 }}>
          <Image src={agency.coverPhoto} alt={tb("coverAlt", { name: agency.name })} fill priority sizes="460px" style={{ objectFit: "cover" }} />
        </Box>
      ) : (
        <Box
          role="region"
          aria-label={t("photosLabel", { name: agency.name })}
          tabIndex={0}
          sx={{ display: "flex", gap: 0.5, overflowX: "auto", scrollSnapType: "x mandatory", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, borderRadius: "20px", "&:focus-visible": focusRing }}
        >
          {photos.map((src, index) => (
            <Box key={src} sx={{ position: "relative", flex: index === 0 ? "0 0 78%" : "0 0 42%", height: { xs: 176, sm: 220 }, scrollSnapAlign: "start", borderRadius: index === 0 ? "20px 6px 6px 20px" : "6px", overflow: "hidden", bgcolor: pc.outline }}>
              <Image src={src} alt={index === 0 ? tb("coverAlt", { name: agency.name }) : ""} fill priority={index === 0} sizes="(min-width: 600px) 480px, 80vw" style={{ objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ px: compactCover ? 3 : { xs: 1, sm: 1.5 }, pt: compactCover ? 0 : 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1.5, mt: compactCover ? "-28px" : 0 }}>
          <Box sx={{ position: "relative", width: 64, height: 64, borderRadius: "18px", bgcolor: "#fff", border: `3px solid #fff`, boxShadow: "0 2px 10px rgba(27,31,42,0.14)", overflow: "hidden", flexShrink: 0 }}>
            <Image src={agency.logo} alt={tb("logoAlt", { name: agency.name })} fill sizes="64px" style={{ objectFit: "contain" }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: pc.emeraldText, pb: 0.5, minWidth: 0 }}>
            <Verified sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>{t("verifiedProfile")}</Typography>
          </Box>
        </Box>

        <Box>
          <Typography component="h1" sx={{ fontSize: { xs: 26, md: 28 }, fontWeight: 700, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            {agency.name} <Box component="span" sx={{ color: pc.muted, fontWeight: 500 }}>· {agency.city}</Box>
          </Typography>
          {summary.average !== null && (
            <ButtonBase
              onClick={() => goToSection("avis")}
              aria-label={t("ratingLink", { score: formatScore(summary.average), count: formatCount(summary.count) })}
              sx={{ mt: 0.75, gap: 0.75, borderRadius: "8px", fontSize: 15, minHeight: 32, "&.Mui-focusVisible": focusRing, "&:hover .vc-count": { textDecoration: "underline" } }}
            >
              <Box component="span" sx={{ fontWeight: 700 }}>{formatScore(summary.average)}</Box>
              <Stars value={summary.average} size={17} />
              <Box component="span" className="vc-count" sx={{ color: pc.indigoDark, fontWeight: 600, textUnderlineOffset: "3px" }}>({formatCount(summary.count)})</Box>
            </ButtonBase>
          )}
          <Typography sx={{ fontSize: 15, color: pc.muted, mt: 0.25 }}>{agency.sector}</Typography>
        </Box>

        <Box role="group" aria-label={t("actionsLabel")} sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 0.5, py: 1 }}>
          <ActionCircle primary icon={<PhoneOutlined />} label={t("actions.contact")} onClick={() => setPanel("contact")} />
          <ActionCircle icon={<DirectionsOutlined />} label={t("actions.directions")} href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`} onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))} />
          <ActionCircle icon={<LanguageOutlined />} label={t("actions.website")} href={agency.website} />
          <ActionCircle icon={<IosShare />} label={t("actions.share")} onClick={share} />
          <ActionCircle icon={<RateReviewOutlined />} label={t("actions.review")} onClick={() => setPanel("reviewRequest")} />
        </Box>

        {info && <AgencyInfo />}
      </Box>

      <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={tb("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />
    </Box>
  );
}

/** Address (to Nos Agences), hours that unfold into the week, phone and website. */
export function AgencyInfo({ divider = true }: { divider?: boolean }) {
  const t = useTranslations("VarianteC");
  const tb = useTranslations("Business");
  const { agency, goToSection } = useCertificate();
  const [hoursOpen, setHoursOpen] = useState(false);
  const hoursId = useId();
  const website = agency.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  return (
    <Box sx={{ borderTop: divider ? `1px solid ${pc.outline}` : "none", pt: 0.5 }}>
      <InfoRow icon={<PlaceOutlined />}>
        <Link
          href="#agences"
          aria-label={tb("addressLink", { address: agency.address })}
          onClick={(event) => {
            event.preventDefault();
            goToSection("agences");
          }}
          sx={linkSx}
        >
          {agency.address}
        </Link>
      </InfoRow>
      <InfoRow icon={<ScheduleOutlined />}>
        <ButtonBase
          onClick={() => setHoursOpen((value) => !value)}
          aria-expanded={hoursOpen}
          aria-controls={hoursId}
          aria-label={t("hoursToggle")}
          sx={{ width: "100%", justifyContent: "space-between", gap: 1, textAlign: "left", borderRadius: "8px", fontSize: "inherit", "&.Mui-focusVisible": focusRing }}
        >
          <OpenStatusText agency={agency} />
          <ExpandMore sx={{ color: pc.muted, transition: "transform 200ms ease", transform: hoursOpen ? "rotate(180deg)" : "none" }} />
        </ButtonBase>
        <Collapse in={hoursOpen}>
          <Box id={hoursId} sx={{ pt: 1, ml: -1.5 }}>
            <HoursTable agency={agency} />
          </Box>
        </Collapse>
      </InfoRow>
      <InfoRow icon={<PhoneOutlined />}>
        <Link href={`tel:${agency.phone.replace(/\s/g, "")}`} sx={linkSx}>{agency.phone}</Link>
      </InfoRow>
      <InfoRow icon={<LanguageOutlined />}>
        <Link href={agency.website} target="_blank" rel="noopener noreferrer" sx={linkSx}>{website}</Link>
      </InfoRow>
    </Box>
  );
}
