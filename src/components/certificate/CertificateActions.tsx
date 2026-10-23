"use client";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Typography from "@mui/material/Typography";
import Close from "@mui/icons-material/Close";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ReviewRequestSheet } from "@/components/reviews/ReviewRequestSheet";
import { CtaButton } from "@/components/ui/CtaButton";
import { FigmaIcon } from "@/components/ui/FigmaIcon";
import { StaffAvatar } from "@/components/ui/StaffAvatar";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/theme/theme";
import { useCertificate } from "./CertificateContext";
import { ContactSheet } from "./ContactSheet";
import { OpenStatus } from "./OpenStatus";

/** Desktop companion to the mobile FAB, using the same active score and shared actions. */
export function DesktopActions() {
  const t = useTranslations("Actions");
  const tr = useTranslations("Reputation");
  const { agency, team, reviews, scoreView, scoreCollaboratorId, setPanel, toolbarPinned } = useCertificate();
  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  const person = team.find((member) => member.id === scoreCollaboratorId);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  return (
    <Box component="aside" aria-labelledby="quick-actions-title" sx={{ display: { xs: "none", md: "flex" }, position: "sticky", top: tokens.headerHeight + (toolbarPinned ? 76 : 16), alignSelf: "start", bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCard, p: 2.5, flexDirection: "column", gap: 2, transition: "top 180ms ease" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Image src={agency.logo} alt="" width={44} height={44} style={{ objectFit: "contain", borderRadius: "50%" }} />
        <Box sx={{ minWidth: 0 }}>
          <Typography id="quick-actions-title" component="h2" sx={{ fontSize: 16, fontWeight: 600 }}>{agency.name}</Typography>
          <Typography sx={{ fontSize: 12, color: tokens.gris }}>{agency.city}</Typography>
        </Box>
      </Box>
      <Box sx={{ "& p": { whiteSpace: "normal" } }}><OpenStatus hours={agency.hours} /></Box>
      <Box sx={{ py: 2, borderTop: `1px solid ${tokens.grisMoyen1}`, borderBottom: `1px solid ${tokens.grisMoyen1}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: 12, color: tokens.gris, fontWeight: 600 }}>{tr(`views.${scoreView}`)}</Typography>
        {person && <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><StaffAvatar person={person} /><Typography sx={{ fontSize: 13, fontWeight: 500 }}>{person.name}</Typography></Box>}
        {visible ? <>
          <Typography sx={{ fontSize: 40, lineHeight: 1.2, fontWeight: 700, color: scoreView === "controle" ? tokens.vertOs : tokens.bleuFonce }}>{formatScore(summary.average!)}<Box component="span" sx={{ fontSize: 16, color: tokens.gris }}>/5</Box></Typography>
          <Rating readOnly value={summary.average} precision={0.1} aria-label={tr("scoreAria", { score: formatScore(summary.average!) })} />
          <Typography sx={{ fontSize: 13, color: tokens.gris }}>{tr("reviewCount", { count: formatCount(summary.count) })}</Typography>
        </> : <Typography sx={{ fontSize: 13, color: tokens.gris }}>{tr("notPublic")}</Typography>}
      </Box>
      <CtaButton onClick={() => setPanel("contact")} icon={null}>{t("contact")}</CtaButton>
      <CtaButton variant="secondary" onClick={() => setPanel("reviewRequest")} icon={null}>{t("leaveReview")}</CtaButton>
      <CtaButton variant="secondary" href={opinionSystemLinks.signup} target="_blank" rel="noopener noreferrer" icon={null} sx={{ fontSize: 13 }}>{t("signup")}</CtaButton>
    </Box>
  );
}

/** Figma closed FAB (1243:89101), expanded using MUI's accessible speed dial. */
export function CertificateActions() {
  const t = useTranslations("Actions");
  const { agency, panel, setPanel } = useCertificate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width:900px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const actions = [
    { key: "signup", icon: <PersonAddOutlined />, label: t("signup"), action: () => window.open(opinionSystemLinks.signup, "_blank", "noopener,noreferrer") },
    { key: "review", icon: <RateReviewOutlined />, label: t("leaveReview"), action: () => setPanel("reviewRequest") },
    { key: "contact", icon: <PhoneOutlined />, label: t("contact"), action: () => setPanel("contact") },
  ];

  return (
    <>
      <Backdrop open={open} onClick={() => setOpen(false)} sx={{ display: { md: "none" }, zIndex: (theme) => theme.zIndex.speedDial - 1, bgcolor: "rgba(4,27,68,0.2)" }} />
      <SpeedDial ariaLabel={t("menuLabel")} open={open} onOpen={(_, reason) => { if (reason === "toggle") setOpen(true); }} onClose={() => setOpen(false)}
        icon={<FigmaIcon name="fab-more" />} openIcon={<Close sx={{ color: tokens.blanc }} />}
        FabProps={{ sx: { width: 56, height: 56, bgcolor: tokens.jaune600, boxShadow: tokens.elevation6, "&:hover": { bgcolor: tokens.jaune400 } }, "aria-label": t(open ? "closeMenu" : "openMenu") }}
        sx={{ display: { xs: "flex", md: "none" }, position: "fixed", right: { xs: 24, sm: "max(24px, calc((100vw - 640px) / 2 + 24px))" }, bottom: "calc(24px + env(safe-area-inset-bottom))" }}>
        {actions.map((action) => <SpeedDialAction key={action.key} icon={action.icon} onClick={() => { setOpen(false); action.action(); }}
          slotProps={{ tooltip: { title: action.label, open: true }, fab: { sx: { bgcolor: tokens.blanc, color: tokens.bleuFonce } }, staticTooltipLabel: { sx: { bgcolor: tokens.blanc, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 14, fontWeight: 500, borderRadius: "8px", py: 1.25, px: 1.5, cursor: "pointer", whiteSpace: "nowrap" } } }} />)}
      </SpeedDial>
      <ContactSheet agency={agency} open={panel === "contact"} onClose={() => setPanel(null)} />
      <ReviewRequestSheet />
    </>
  );
}
