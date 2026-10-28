"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import DirectionsOutlined from "@mui/icons-material/DirectionsOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import IosShare from "@mui/icons-material/IosShare";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import MoreHoriz from "@mui/icons-material/MoreHoriz";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import PlaceOutlined from "@mui/icons-material/PlaceOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import ScheduleOutlined from "@mui/icons-material/ScheduleOutlined";
import Verified from "@mui/icons-material/Verified";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
import { sectionIds, useCertificate, type SectionId } from "@/components/certificate/CertificateContext";
import { opinionSystemLinks } from "@/data/opinionSystem";
import type { Agency } from "@/data/types";
import { formatCount, formatScore } from "@/lib/format";
import { useCountUp, useNow } from "@/lib/hooks";
import { localClock } from "@/lib/hours";
import { displayScore } from "@/lib/scoring";
import { a, viewColor, viewText } from "./theme";
import { OpenStatusA, StarTiles, containerSx, focusRing, outlineSx, primarySx } from "./ui";
import { useScore } from "./useScore";

function directionsUrl(address: string) {
  const destination = encodeURIComponent(address);
  const apple = typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) && "ontouchend" in document;
  return apple ? `https://maps.apple.com/?daddr=${destination}` : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function AgencyLogo({ agency, size = 88 }: { agency: Agency; size?: number }) {
  const t = useTranslations("Business");
  return (
    <Box sx={{ position: "relative", width: size, height: size, flexShrink: 0, borderRadius: `${size * 0.24}px`, bgcolor: a.white, border: `1px solid ${a.line}`, overflow: "hidden", boxShadow: a.shadowSoft }}>
      <Box sx={{ position: "absolute", inset: "8%" }}>
        <Image src={agency.logo} alt={t("logoAlt", { name: agency.name })} fill sizes={`${size * 2}px`} style={{ objectFit: "contain" }} />
      </Box>
    </Box>
  );
}

/** Top strip: Opinion System, and what this page is. Scrolls away; the section bar below stays. */
export function BrandBar() {
  const t = useTranslations("Header");
  const tv = useTranslations("VarianteA");
  return (
    <Box component="header" sx={{ bgcolor: a.navy, color: a.white }}>
      <Box sx={{ ...containerSx, height: 52, display: "flex", alignItems: "center", gap: 1.25 }}>
        <Link href={opinionSystemLinks.home} target="_blank" rel="noopener noreferrer" aria-label={tv("brand.home")} sx={{ display: "inline-flex", alignItems: "center", gap: 1.25, color: "inherit", textDecoration: "none", borderRadius: 1, ...focusRing }}>
          <Image src="/figma/os-icon-logo.svg" alt="" width={24} height={24} unoptimized />
          <Typography component="span" sx={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.01em" }}>{t("brand")}</Typography>
        </Link>
        <Box sx={{ flex: 1 }} />
        <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7fd9c9" }}>
          <VerifiedUserOutlined sx={{ fontSize: 16 }} />
          {tv("brand.verified")}
        </Box>
      </Box>
    </Box>
  );
}

function WeekHoursList({ agency, id }: { agency: Agency; id: string }) {
  const th = useTranslations("Hours");
  const now = useNow();
  const today = now ? localClock(now).weekday : -1;
  return (
    <Box id={id} component="dl" sx={{ m: 0, mt: 1.5, p: 1.5, maxWidth: 360, bgcolor: a.white, border: `1px solid ${a.line}`, borderRadius: "12px", display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 3, rowGap: 0.75, fontSize: 14 }}>
      {agency.hours.map((ranges, day) => (
        <Box key={day} sx={{ display: "contents", "& > *": { fontWeight: day === today ? 800 : 500, color: day === today ? a.navy : a.muted } }}>
          <Box component="dt">{th(`daysTitle.${day}`)}</Box>
          <Box component="dd" sx={{ m: 0, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
            {ranges.length ? ranges.map(([start, end]) => `${start} – ${end}`).join(" · ") : th("closed")}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function useShare() {
  const t = useTranslations("Business");
  const { agency } = useCertificate();
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
  const snackbar = <Snackbar open={copied} autoHideDuration={2500} onClose={() => setCopied(false)} message={t("linkCopied")} anchorOrigin={{ vertical: "bottom", horizontal: "center" }} />;
  return { share, snackbar };
}

function ScoreNumber({ value, color }: { value: number; color: string }) {
  const animated = useCountUp(value, 700);
  return (
    <Box component="span" sx={{ fontSize: { xs: 64, md: 76 }, fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.04em", color, fontVariantNumeric: "tabular-nums", transition: "color 250ms ease" }}>
      {formatScore(displayScore(animated))}
    </Box>
  );
}

/** The big score: number, verdict word and tiles in the colour of the view. */
function ScoreBlock() {
  const t = useTranslations("Reputation");
  const tv = useTranslations("VarianteA");
  const { scoreView, goToSection } = useCertificate();
  const { summary, visible, heading, person } = useScore();
  const color = viewColor[scoreView];

  return (
    <Box
      component="section"
      aria-label={tv("score.label")}
      sx={{ position: "relative", bgcolor: a.white, border: `1px solid ${a.line}`, borderRadius: "20px", p: { xs: 2.5, md: 3.5 }, boxShadow: a.shadowFloat, overflow: "hidden" }}
    >
      <Box aria-hidden sx={{ position: "absolute", inset: "0 0 auto 0", height: 4, bgcolor: color, transition: "background-color 250ms ease" }} />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, fontSize: 13, fontWeight: 700, color: viewText[scoreView] }}>
        {scoreView === "controle" ? <Verified sx={{ fontSize: 18 }} /> : <LanguageOutlined sx={{ fontSize: 18 }} />}
        <span>{t(`views.${scoreView}`)}</span>
        {person && <Box component="span" sx={{ color: a.muted, fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>· {person.name}</Box>}
      </Box>
      {visible ? (
        <>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }} aria-label={t("scoreAria", { score: formatScore(summary.average!) })} role="img">
              <ScoreNumber value={summary.average!} color={scoreView === "controle" ? a.tealText : a.navy} />
              <Box component="span" sx={{ fontSize: 22, fontWeight: 700, color: a.muted }}>/5</Box>
            </Box>
            <Typography sx={{ pb: 0.75, fontSize: { xs: 22, md: 24 }, fontWeight: 800, letterSpacing: "-0.02em", color: a.navy }}>{tv(`verdict.${heading}`)}</Typography>
          </Box>
          <Box sx={{ mt: 2 }}>
            <StarTiles value={summary.average!} size={34} color={color} />
          </Box>
          <Typography sx={{ mt: 2, fontSize: 14, color: a.muted, lineHeight: 1.5 }}>
            <Link component="button" onClick={() => goToSection("avis")} sx={{ fontSize: "inherit", fontWeight: 700, color: a.navy, verticalAlign: "baseline", textUnderlineOffset: "3px", ...focusRing }}>
              {tv("score.basedOn", { count: formatCount(summary.count) })}
            </Link>{" "}
            · {t(`scoreSource.${scoreView}`)}
          </Typography>
        </>
      ) : (
        <Typography sx={{ fontSize: 15, color: a.muted }}>{t("notPublic")}</Typography>
      )}
    </Box>
  );
}

/** Agency identity (left) and the big score (right on desktop, under the identity on phones). */
export function Hero() {
  const t = useTranslations("Business");
  const ta = useTranslations("Agencies");
  const tv = useTranslations("VarianteA");
  const { agency, setPanel } = useCertificate();
  const { share, snackbar } = useShare();
  const [hoursOpen, setHoursOpen] = useState(false);
  const hoursId = useId();

  const actionSx = { flex: { xs: "1 1 0", sm: "0 0 auto" }, minWidth: 0, px: { xs: 1, sm: 2.25 }, gap: 0.75, fontSize: { xs: 14, sm: 15 } } as const;

  return (
    <Box
      id="synthese"
      sx={{
        scrollMarginTop: `${a.barHeight + 16}px`,
        bgcolor: a.band,
        backgroundImage: "radial-gradient(900px 380px at 85% -10%, rgba(44,149,255,0.10), transparent 70%), radial-gradient(700px 300px at 0% 110%, rgba(67,182,163,0.10), transparent 70%)",
        borderBottom: `1px solid ${a.line}`,
      }}
    >
      <Box sx={{ ...containerSx, py: { xs: 3, md: 6 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "minmax(0, 1fr) 380px" }, columnGap: 6, rowGap: 3, alignItems: "center" }}>
        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: { xs: 2, md: 2.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2, md: 3 } }}>
            <Box sx={{ display: { xs: "none", md: "block" } }}><AgencyLogo agency={agency} size={96} /></Box>
            <Box sx={{ display: { xs: "block", md: "none" } }}><AgencyLogo agency={agency} size={64} /></Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: { xs: 13, md: 14 }, fontWeight: 600, color: a.muted, mb: 0.5 }}>{tv("hero.category", { sector: agency.sector, city: agency.city })}</Typography>
              <Typography component="h1" sx={{ fontSize: { xs: 30, sm: 36, md: 48 }, fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.035em", color: a.navy }}>
                {agency.name}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, height: 32, px: 1.5, borderRadius: 999, bgcolor: a.tealTint, color: a.tealText, fontSize: 13, fontWeight: 700 }}>
              <Verified sx={{ fontSize: 18 }} />
              {tv("hero.verifiedBadge")}
            </Box>
            <Box sx={{ display: "inline-flex", alignItems: "center", height: 32, px: 1.5, borderRadius: 999, bgcolor: a.white, border: `1px solid ${a.line}`, color: a.muted, fontSize: 13, fontWeight: 600 }}>
              {tv("hero.since", { since: agency.memberSince })}
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, fontSize: 15 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
              <PlaceOutlined sx={{ fontSize: 20, color: a.muted, mt: "1px" }} />
              <Link
                href="#nos-agences"
                aria-label={t("addressLink", { address: agency.address })}
                onClick={(event) => {
                  const target = document.getElementById("nos-agences");
                  if (!target) return;
                  event.preventDefault();
                  target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
                }}
                sx={{ color: a.navy, fontWeight: 500, textDecorationColor: a.lineStrong, textUnderlineOffset: "4px", "&:hover": { textDecorationColor: a.navy }, ...focusRing }}
              >
                {agency.address}
              </Link>
            </Box>
            <Box>
              <ButtonBase
                onClick={() => setHoursOpen((value) => !value)}
                aria-expanded={hoursOpen}
                aria-controls={hoursId}
                aria-label={ta("toggleHours")}
                sx={{ gap: 1, minHeight: 32, maxWidth: "100%", flexWrap: "wrap", justifyContent: "flex-start", borderRadius: 1, ...focusRing }}
              >
                <ScheduleOutlined sx={{ fontSize: 20, color: a.muted }} />
                <OpenStatusA hours={agency.hours} size={15} />
                <Box component="span" sx={{ fontSize: 14, fontWeight: 600, color: a.blueText }}>{tv("hero.hours")}</Box>
                <ExpandMore sx={{ fontSize: 20, color: a.blueText, transform: hoursOpen ? "rotate(180deg)" : "none", transition: `transform 200ms ${a.ease}` }} />
              </ButtonBase>
              <Collapse in={hoursOpen} unmountOnExit>
                <WeekHoursList agency={agency} id={hoursId} />
              </Collapse>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flexWrap: { xs: "wrap", sm: "nowrap" }, gap: 1, pt: 0.5 }}>
            <Button onClick={() => setPanel("contact")} startIcon={<PhoneOutlined />} sx={{ ...primarySx, ...actionSx, flex: { xs: "1 1 100%", sm: "0 0 auto" }, px: 3 }}>
              {t("contact")}
            </Button>
            <Button href={agency.website} target="_blank" rel="noopener noreferrer" startIcon={<LanguageOutlined />} sx={{ ...outlineSx, ...actionSx }}>
              {t("website")}
            </Button>
            <Button
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(agency.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}
              startIcon={<DirectionsOutlined />}
              sx={{ ...outlineSx, ...actionSx }}
            >
              {t("directions")}
            </Button>
            <Button onClick={share} aria-label={t("share")} startIcon={<IosShare />} sx={{ ...outlineSx, ...actionSx }}>
              <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>{t("share")}</Box>
            </Button>
          </Box>
        </Box>

        <ScoreBlock />
      </Box>
      {snackbar}
    </Box>
  );
}

/** "Plus d'actions": déposer un avis, inscrire son entreprise, demander à l'IA. */
function MoreMenu({ anchor, onClose }: { anchor: HTMLElement | null; onClose: () => void }) {
  const t = useTranslations("Actions");
  const { setPanel, openAssistant } = useCertificate();
  const items = [
    { key: "review", icon: <RateReviewOutlined fontSize="small" />, label: t("leaveReview"), run: () => setPanel("reviewRequest") },
    { key: "ai", icon: <AutoAwesome fontSize="small" sx={{ color: a.tealText }} />, label: t("askAi"), run: () => openAssistant() },
    { key: "signup", icon: <PersonAddOutlined fontSize="small" />, label: t("signup"), run: () => window.open(opinionSystemLinks.signup, "_blank", "noopener,noreferrer") },
  ];
  return (
    <Menu
      anchorEl={anchor}
      open={Boolean(anchor)}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{ paper: { sx: { mt: 1, minWidth: 240, borderRadius: "14px", border: `1px solid ${a.line}`, boxShadow: a.shadowFloat } }, list: { "aria-label": t("menuLabel") } }}
    >
      {items.map((item) => (
        <MenuItem key={item.key} onClick={() => { onClose(); item.run(); }} sx={{ gap: 0.5, fontSize: 15, fontWeight: 600, color: a.navy }}>
          <ListItemIcon sx={{ color: a.navy }}>{item.icon}</ListItemIcon>
          {item.label}
        </MenuItem>
      ))}
    </Menu>
  );
}

/** Pinned section bar. Once pinned on desktop it also carries the agency, its score and "Contacter". */
export function SectionBar({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  const t = useTranslations("Header");
  const tb = useTranslations("Business");
  const ta = useTranslations("Actions");
  const { agency, setPanel, scoreView } = useCertificate();
  const { summary, visible } = useScore();
  const sentinel = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(false);
  const [menu, setMenu] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setPinned(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Box ref={sentinel} aria-hidden sx={{ height: 0 }} />
      <Box
        component="nav"
        aria-label={t("tabsLabel")}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          height: a.barHeight,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "saturate(180%) blur(12px)",
          borderBottom: `1px solid ${a.line}`,
          boxShadow: pinned ? "0 6px 20px -12px rgba(4,27,68,0.25)" : "none",
          transition: "box-shadow 200ms ease",
        }}
      >
        <Box sx={{ ...containerSx, height: "100%", display: "flex", alignItems: "center", gap: 2 }}>
          <Fade in={pinned}>
            <Box sx={{ display: { xs: "none", lg: "flex" }, alignItems: "center", gap: 1.25, minWidth: 0, mr: 1 }}>
              <AgencyLogo agency={agency} size={32} />
              <Typography sx={{ fontSize: 15, fontWeight: 800, whiteSpace: "nowrap" }}>{agency.name}</Typography>
              {visible && (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, fontSize: 14, fontWeight: 700, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                  <StarTiles value={summary.average!} size={16} color={viewColor[scoreView]} />
                  {formatScore(summary.average!)}
                </Box>
              )}
            </Box>
          </Fade>
          <Box role="list" sx={{ flex: { xs: 1, lg: "0 1 auto" }, display: "flex", height: "100%", mx: { xs: -1, sm: 0 } }}>
            {sectionIds.map((id) => {
              const selected = id === active;
              return (
                <Box key={id} role="listitem" sx={{ flex: { xs: 1, lg: "0 0 auto" }, display: "flex" }}>
                  <ButtonBase
                    onClick={() => onSelect(id)}
                    aria-current={selected ? "true" : undefined}
                    sx={{
                      position: "relative",
                      width: "100%",
                      px: { xs: 0.5, lg: 2 },
                      fontSize: { xs: 14, sm: 15 },
                      fontWeight: selected ? 800 : 600,
                      color: selected ? a.navy : a.muted,
                      transition: "color 150ms ease",
                      "&:hover": { color: a.navy },
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        left: { xs: 10, lg: 16 },
                        right: { xs: 10, lg: 16 },
                        bottom: 0,
                        height: 3,
                        borderRadius: "3px 3px 0 0",
                        bgcolor: a.navy,
                        transform: selected ? "scaleX(1)" : "scaleX(0)",
                        transition: `transform 250ms ${a.ease}`,
                      },
                      "&.Mui-focusVisible": { outline: `3px solid ${a.blue}`, outlineOffset: -3, borderRadius: 1 },
                    }}
                  >
                    {t(`tabs.${id}`)}
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ flex: 1, display: { xs: "none", lg: "block" } }} />
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Button onClick={() => setPanel("contact")} startIcon={<PhoneOutlined />} sx={{ ...primarySx, minHeight: 40, px: 2.25 }}>
              {tb("contact")}
            </Button>
            <IconButton onClick={(event) => setMenu(event.currentTarget)} aria-label={ta("openMenu")} aria-haspopup="menu" aria-expanded={Boolean(menu)} sx={{ width: 40, height: 40, border: `1px solid ${a.lineStrong}`, color: a.navy, ...focusRing }}>
              <MoreHoriz />
            </IconButton>
          </Box>
        </Box>
      </Box>
      <MoreMenu anchor={menu} onClose={() => setMenu(null)} />
    </>
  );
}

/** Phones: a bar at the bottom once the identity has scrolled away: the score, then "Contacter" and more. */
export function PhoneActionBar() {
  const tb = useTranslations("Business");
  const ta = useTranslations("Actions");
  const tr = useTranslations("Reputation");
  const { setPanel, scoreView, goToSection } = useCertificate();
  const { summary, visible } = useScore();
  const [shown, setShown] = useState(false);
  const [menu, setMenu] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const hero = document.getElementById("synthese");
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Box
        aria-hidden={!shown}
        inert={!shown}
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          px: 2,
          pt: 1.25,
          pb: "calc(10px + env(safe-area-inset-bottom))",
          bgcolor: "rgba(255,255,255,0.96)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${a.line}`,
          boxShadow: "0 -8px 24px -16px rgba(4,27,68,0.3)",
          transform: shown ? "translateY(0)" : "translateY(110%)",
          transition: `transform 300ms ${a.ease}`,
        }}
      >
        <Box sx={{ maxWidth: 640, mx: "auto", display: "flex", alignItems: "center", gap: 1.25 }}>
          {visible ? (
            <ButtonBase onClick={() => goToSection("synthese")} aria-label={`${tr(`views.${scoreView}`)} : ${tr("scoreAria", { score: formatScore(summary.average!) })}`} sx={{ flex: 1, minWidth: 0, justifyContent: "flex-start", gap: 1, minHeight: 44, borderRadius: 1, ...focusRing }}>
              <Box component="span" sx={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", color: scoreView === "controle" ? a.tealText : a.navy, fontVariantNumeric: "tabular-nums" }}>{formatScore(summary.average!)}</Box>
              <Box sx={{ minWidth: 0, textAlign: "left" }}>
                <StarTiles value={summary.average!} size={13} color={viewColor[scoreView]} />
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: a.muted, whiteSpace: "nowrap" }}>{tr("reviewCount", { count: formatCount(summary.count) })}</Typography>
              </Box>
            </ButtonBase>
          ) : (
            <Box sx={{ flex: 1 }} />
          )}
          <Button onClick={() => setPanel("contact")} startIcon={<PhoneOutlined />} sx={{ ...primarySx, minHeight: 48, px: 2.5 }}>
            {tb("contact")}
          </Button>
          <IconButton onClick={(event) => setMenu(event.currentTarget)} aria-label={ta("openMenu")} aria-haspopup="menu" aria-expanded={Boolean(menu)} sx={{ width: 48, height: 48, border: `1px solid ${a.lineStrong}`, color: a.navy }}>
            <MoreHoriz />
          </IconButton>
        </Box>
      </Box>
      <MoreMenu anchor={menu} onClose={() => setMenu(null)} />
    </>
  );
}
