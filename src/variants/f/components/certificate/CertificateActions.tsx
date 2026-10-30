"use client";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Fade from "@mui/material/Fade";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Rating from "@mui/material/Rating";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import Close from "@mui/icons-material/Close";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { ReviewRequestSheet } from "@/variants/f/components/reviews/ReviewRequestSheet";
import { FigmaIcon } from "@/variants/f/components/ui/FigmaIcon";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { formatCount, formatScore } from "@/lib/format";
import { isPublic, reviewsForScore, summarize } from "@/lib/scoring";
import { tokens } from "@/variants/f/theme";
import { AssistantPanel } from "./AssistantPanel";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { ContactSheet } from "./ContactSheet";

/**
 * Desktop floating pill (900 px and up), replacing the side widget: the active score on the left
 * (follows the Avis global / Avis Contrôlés switch and the selected advisor), a yellow "Contacter" on the
 * right that opens the same actions as the phone FAB. Shown once the business card has scrolled away.
 */
export function DesktopScorePill() {
  const t = useTranslations("Actions");
  const tr = useTranslations("Reputation");
  const { agency, reviews, scoreView, scoreCollaboratorId, setPanel, openAssistant, goToSection } = useCertificate();
  const summary = useMemo(() => summarize(reviewsForScore(reviews, scoreView, scoreCollaboratorId)), [reviews, scoreView, scoreCollaboratorId]);
  const visible = summary.average !== null && isPublic(summary.count, agency.publicThreshold);
  const [shown, setShown] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const card = document.querySelector("#synthese article");
    if (!card) return;
    const observer = new IntersectionObserver(([entry]) => setShown(!entry.isIntersecting && entry.boundingClientRect.top < 0));
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const actions = [
    { key: "contact", icon: <PhoneOutlined fontSize="small" />, label: t("contact"), action: () => setPanel("contact") },
    { key: "review", icon: <RateReviewOutlined fontSize="small" />, label: t("leaveReview"), action: () => setPanel("reviewRequest") },
    { key: "signup", icon: <PersonAddOutlined fontSize="small" />, label: t("signup"), action: () => window.open(opinionSystemLinks.signup, "_blank", "noopener,noreferrer") },
    { key: "ai", icon: <AutoAwesome fontSize="small" sx={{ color: tokens.vertOs }} />, label: t("askAi"), action: () => openAssistant() },
  ];
  const controle = scoreView === "controle";

  return (
    <Fade in={shown}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          position: "fixed",
          right: 24,
          bottom: 24,
          zIndex: (theme) => theme.zIndex.speedDial,
          alignItems: "center",
          gap: 1,
          p: 0.5,
          pl: visible ? 2 : 0.5,
          borderRadius: "999px",
          bgcolor: tokens.bleuFonce,
          boxShadow: tokens.elevation6,
        }}
      >
        {visible && (
          <ButtonBase
            onClick={() => goToSection("synthese")}
            aria-label={`${tr(`views.${scoreView}`)} : ${tr("scoreAria", { score: formatScore(summary.average!) })}`}
            sx={{ gap: 1, borderRadius: "999px", color: tokens.blanc }}
          >
            <Typography component="span" sx={{ fontSize: 18, fontWeight: 700, lineHeight: 1, color: controle ? tokens.vertOs : tokens.blanc }}>
              {formatScore(summary.average!)}
            </Typography>
            <Rating readOnly value={summary.average} precision={0.1} sx={{ fontSize: 16, "& .MuiRating-iconEmpty": { color: "rgba(255,255,255,0.35)" } }} />
            <Typography component="span" sx={{ fontSize: 12, color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>
              {tr("reviewCount", { count: formatCount(summary.count) })}
            </Typography>
          </ButtonBase>
        )}
        <ButtonBase
          onClick={(event) => setMenuAnchor(event.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(menuAnchor)}
          aria-label={t("openMenu")}
          sx={{ gap: 0.5, px: 2, py: 1.25, borderRadius: "999px", bgcolor: tokens.jaune400, color: tokens.bleuFonce, fontSize: 14, fontWeight: 600, "&:hover": { bgcolor: tokens.jaune600 } }}
        >
          {t("contact")}
          <FigmaIcon name="expand-more" />
        </ButtonBase>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "bottom", horizontal: "right" }}
          slotProps={{ paper: { sx: { mb: 1, borderRadius: "4px", minWidth: 240 } }, list: { "aria-label": t("menuLabel") } }}
        >
          {actions.map((action) => (
            <MenuItem
              key={action.key}
              onClick={() => {
                setMenuAnchor(null);
                action.action();
              }}
              sx={{ gap: 1.5, py: 1.25, fontSize: 14, fontWeight: 500, color: tokens.bleuFonce }}
            >
              {action.icon}
              {action.label}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Fade>
  );
}

/** Figma closed FAB (1243:89101), expanded using MUI's accessible speed dial. */
export function CertificateActions() {
  const t = useTranslations("Actions");
  const { agency, panel, setPanel, openAssistant } = useCertificate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width:900px)");
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  // Listed from the button upwards: "Demander à l'IA" sits closest to the thumb, last in the desktop menu.
  const actions = [
    { key: "ai", icon: <AutoAwesome sx={{ color: tokens.vertOs }} />, label: t("askAi"), action: () => openAssistant() },
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
          slotProps={{ tooltip: { title: action.label, open: true }, fab: { sx: { bgcolor: tokens.blanc, color: tokens.bleuFonce } }, staticTooltipLabel: { sx: { bgcolor: tokens.blanc, color: tokens.bleuFonce, fontFamily: "inherit", fontSize: 14, fontWeight: 500, borderRadius: "4px", py: 1.25, px: 1.5, cursor: "pointer", whiteSpace: "nowrap" } } }} />)}
      </SpeedDial>
      <ContactSheet agency={agency} open={panel === "contact"} onClose={() => setPanel(null)} />
      <ReviewRequestSheet />
      <AssistantPanel />
    </>
  );
}
