"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import DirectionsRounded from "@mui/icons-material/DirectionsRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import IosShareRounded from "@mui/icons-material/IosShareRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import LinkedIn from "@mui/icons-material/LinkedIn";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import PersonAddOutlined from "@mui/icons-material/PersonAddOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import StarRounded from "@mui/icons-material/StarRounded";
import WhatsApp from "@mui/icons-material/WhatsApp";
import X from "@mui/icons-material/X";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { opinionSystemLinks } from "@/data/opinionSystem";
import { formatCount, formatScore } from "@/lib/format";
import { frenchTime } from "@/lib/hours";
import { OpenBadge, useOpenLabel, WeekTable } from "./Hours";
import { directionsUrl, googleDirections, useShare } from "./share";
import { b } from "./theme";
import { focusSx, Hairline, HEADER_VAR, Pill, Sheet, TextLink } from "./ui";
import { useScore } from "./useScore";

/** Desktop: the sticky card on the right, like Airbnb's reservation card. */
export function ContactCard() {
  const t = useTranslations("Business");
  const ta = useTranslations("Actions");
  const th = useTranslations("Hours");
  const tb = useTranslations("VarianteB.card");
  const tbar = useTranslations("VarianteB.bar");
  const { agency, setPanel, openAssistant, goToSection } = useCertificate();
  const { summary, visible, controle } = useScore();
  const { today } = useOpenLabel(agency.hours);
  const { share, toast } = useShare(agency);
  const [week, setWeek] = useState(false);
  const weekId = useId();
  const todayRanges = today >= 0 ? agency.hours[today] : null;

  return (
    <Box component="aside" aria-label={tb("label")} sx={{ position: "sticky", top: `calc(${HEADER_VAR} + 24px)` }}>
      <Box id="b-contact-card" sx={{ bgcolor: b.white, borderRadius: "24px", boxShadow: `inset 0 0 0 1px ${b.line}, ${b.shadowCard}`, p: 3, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
          <Typography component="h2" sx={{ fontFamily: b.serif, fontVariationSettings: '"SOFT" 100', fontWeight: 600, fontSize: 24, lineHeight: 1.15 }}>
            {tb("title")}
          </Typography>
          {visible && (
            <ButtonBase onClick={() => goToSection("synthese")} sx={{ gap: 0.25, mt: 0.5, borderRadius: 1, fontSize: 14, flexShrink: 0, ...focusSx }}>
              <StarRounded sx={{ fontSize: 16, color: controle ? b.sage : b.ink }} />
              <Box component="span" sx={{ fontWeight: 700 }}>{formatScore(summary.average!)}</Box>
              <Box component="span" sx={{ color: b.muted, ml: 0.5, textDecoration: "underline", textUnderlineOffset: "3px" }}>{tbar("count", { count: formatCount(summary.count) })}</Box>
            </ButtonBase>
          )}
        </Box>

        <Box sx={{ borderRadius: "16px", boxShadow: `inset 0 0 0 1px ${b.lineStrong}`, overflow: "hidden" }}>
          <ButtonBase
            onClick={() => setWeek((value) => !value)}
            aria-expanded={week}
            aria-controls={weekId}
            sx={{ width: "100%", justifyContent: "space-between", textAlign: "left", px: 2, py: 1.5, gap: 1, ...focusSx }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography component="span" sx={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tb("today")}</Typography>
              <Typography component="span" sx={{ display: "block", fontSize: 15, color: b.muted }}>
                {todayRanges === null ? " " : todayRanges.length ? todayRanges.map(([start, end]) => `${frenchTime(start)} – ${frenchTime(end)}`).join(" · ") : th("closed")}
              </Typography>
            </Box>
            <KeyboardArrowDownRounded sx={{ transform: week ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }} />
          </ButtonBase>
          <Box sx={{ px: 2, pb: 1.5, borderTop: `1px solid ${b.lineStrong}`, pt: 1.25 }}>
            <OpenBadge hours={agency.hours} />
          </Box>
          <Collapse in={week}>
            <Box sx={{ px: 2, pb: 1.5 }}>
              <WeekTable hours={agency.hours} id={weekId} />
            </Box>
          </Collapse>
        </Box>

        <Pill variant="primary" fullWidth onClick={() => setPanel("contact")} aria-haspopup="dialog" sx={{ minHeight: 52, fontSize: 17 }}>
          {tb("contact")}
        </Pill>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
          <Pill variant="outline" small href={agency.website} target="_blank" rel="noopener noreferrer" startIcon={<LanguageRounded />}>
            {t("website")}
          </Pill>
          <Pill variant="outline" small href={googleDirections(agency.address)} target="_blank" rel="noopener noreferrer" startIcon={<DirectionsRounded />} onClick={(event) => event.currentTarget.setAttribute("href", directionsUrl(agency.address))}>
            {t("directions")}
          </Pill>
        </Box>
        <Typography sx={{ fontSize: 13, color: b.muted, textAlign: "center" }}>{tb("note")}</Typography>
        <Hairline />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {[
            { key: "review", icon: <RateReviewOutlined />, label: ta("leaveReview"), action: () => setPanel("reviewRequest") },
            { key: "ai", icon: <AutoAwesome sx={{ color: `${b.accent} !important` }} />, label: ta("askAi"), action: () => openAssistant() },
            { key: "share", icon: <IosShareRounded />, label: t("share"), action: share },
          ].map((item) => (
            <ButtonBase key={item.key} onClick={item.action} sx={{ justifyContent: "flex-start", gap: 1.5, minHeight: 44, px: 1, mx: -1, borderRadius: "12px", fontFamily: b.sans, fontSize: 15, fontWeight: 600, "& svg": { fontSize: 20 }, "&:hover": { bgcolor: b.ivory }, ...focusSx }}>
              {item.icon}
              <Box component="span" sx={{ flex: 1, textAlign: "left" }}>{item.label}</Box>
              <ChevronRightRounded sx={{ color: b.muted }} />
            </ButtonBase>
          ))}
        </Box>
      </Box>
      {toast}
    </Box>
  );
}

/** Phones: a bar pinned to the bottom with the score and Contacter, plus "…" for the other actions. */
export function PhoneBar() {
  const tr = useTranslations("Reputation");
  const tb = useTranslations("VarianteB.bar");
  const ta = useTranslations("Actions");
  const { setPanel, openAssistant, goToSection, scoreView } = useCertificate();
  const { summary, visible, controle } = useScore();
  const [more, setMore] = useState(false);

  const actions = [
    { key: "review", icon: <RateReviewOutlined />, label: ta("leaveReview"), action: () => setPanel("reviewRequest") },
    { key: "ai", icon: <AutoAwesome sx={{ color: b.accent }} />, label: ta("askAi"), action: () => openAssistant() },
    { key: "signup", icon: <PersonAddOutlined />, label: ta("signup"), action: () => window.open(opinionSystemLinks.signup, "_blank", "noopener,noreferrer") },
  ];

  return (
    <>
      <Box sx={{ display: { xs: "flex", md: "none" }, position: "fixed", left: 0, right: 0, bottom: 0, zIndex: (theme) => theme.zIndex.appBar, alignItems: "center", gap: 1.5, px: 2, pt: 1.25, pb: "calc(10px + env(safe-area-inset-bottom))", bgcolor: b.white, borderTop: `1px solid ${b.line}`, boxShadow: "0 -4px 16px rgba(34, 24, 10, 0.06)" }}>
        <ButtonBase onClick={() => goToSection("synthese")} sx={{ flex: 1, minWidth: 0, justifyContent: "flex-start", textAlign: "left", borderRadius: 1, ...focusSx }} aria-label={visible ? `${tr(`views.${scoreView}`)} : ${tr("scoreAria", { score: formatScore(summary.average!) })}` : undefined}>
          {visible && (
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: 16 }}>
                <StarRounded sx={{ fontSize: 18, color: controle ? b.sage : b.ink }} />
                <Box component="span" sx={{ fontWeight: 700 }}>{formatScore(summary.average!)}</Box>
                <Box component="span" sx={{ color: b.ink, textDecoration: "underline", textUnderlineOffset: "3px", whiteSpace: "nowrap" }}>· {tb("count", { count: formatCount(summary.count) })}</Box>
              </Box>
              <Typography sx={{ fontSize: 12, color: controle ? b.sageText : b.muted, fontWeight: 600 }}>{tr(`views.${scoreView}`)}</Typography>
            </Box>
          )}
        </ButtonBase>
        <Pill variant="primary" onClick={() => setPanel("contact")} aria-haspopup="dialog" sx={{ px: 2.5 }}>
          {ta("contact")}
        </Pill>
        <IconButton onClick={() => setMore(true)} aria-label={ta("openMenu")} aria-haspopup="dialog" sx={{ width: 48, height: 48, bgcolor: b.sand, color: b.ink, "&:hover": { bgcolor: b.sandDeep }, ...focusSx }}>
          <MoreHorizRounded />
        </IconButton>
      </Box>
      <Sheet open={more} onClose={() => setMore(false)} title={ta("menuLabel")} closeLabel={ta("closeMenu")}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 1.5, pb: "calc(16px + env(safe-area-inset-bottom))" }}>
          {actions.map((item) => (
            <li key={item.key}>
              <ButtonBase
                onClick={() => {
                  setMore(false);
                  item.action();
                }}
                sx={{ width: "100%", justifyContent: "flex-start", gap: 2, minHeight: 60, px: 1.5, borderRadius: "16px", fontFamily: b.sans, fontSize: 16, fontWeight: 600, "&:hover": { bgcolor: b.ivory }, ...focusSx }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: "14px", bgcolor: b.sand, display: "grid", placeItems: "center" }}>{item.icon}</Box>
                {item.label}
              </ButtonBase>
            </li>
          ))}
        </Box>
      </Sheet>
    </>
  );
}

const networks = [
  { key: "linkedin", icon: <LinkedIn /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "instagram", icon: <Instagram /> },
  { key: "x", icon: <X /> },
] as const;

/** Contacter: phone, e-mail, WhatsApp, then the company's social pages. */
export function ContactSheetB() {
  const t = useTranslations("Contact");
  const { agency, panel, setPanel } = useCertificate();
  const close = () => setPanel(null);
  const socialsId = useId();
  const options = [
    { icon: <PhoneOutlined />, label: t("call"), detail: agency.phone, href: `tel:${agency.phone.replace(/\s/g, "")}` },
    { icon: <EmailOutlined />, label: t("email"), detail: agency.email, href: `mailto:${agency.email}` },
    ...(agency.whatsapp ? [{ icon: <WhatsApp />, label: t("whatsapp"), detail: agency.phone, href: `https://wa.me/${agency.whatsapp.replace(/\D/g, "")}` }] : []),
  ];
  const socials = networks.flatMap(({ key, icon }) => (agency.socials[key] ? [{ key, icon, href: agency.socials[key]! }] : []));

  return (
    <Sheet open={panel === "contact"} onClose={close} title={t("title", { name: agency.name })} closeLabel={t("close")} width={480}>
      <Box sx={{ p: 2.5, pb: "calc(20px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 3 }}>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          {options.map((option) => (
            <li key={option.label}>
              <ButtonBase
                component="a"
                href={option.href}
                target={option.href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                onClick={close}
                sx={{ width: "100%", justifyContent: "flex-start", gap: 2, p: 1.5, borderRadius: "18px", boxShadow: `inset 0 0 0 1px ${b.line}`, color: b.ink, transition: "box-shadow 150ms ease", "&:hover": { boxShadow: `inset 0 0 0 1px ${b.ink}` }, ...focusSx }}
              >
                <Box sx={{ width: 44, height: 44, borderRadius: "14px", bgcolor: b.accentTint, color: b.accentDark, display: "grid", placeItems: "center", flexShrink: 0 }}>{option.icon}</Box>
                <Box sx={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                  <Typography sx={{ fontSize: 16, fontWeight: 600 }}>{option.label}</Typography>
                  <Typography sx={{ fontSize: 14, color: b.muted, overflowWrap: "anywhere" }}>{option.detail}</Typography>
                </Box>
                <ChevronRightRounded sx={{ color: b.muted }} />
              </ButtonBase>
            </li>
          ))}
        </Box>
        {socials.length > 0 && (
          <Box component="section" aria-labelledby={socialsId}>
            <Typography id={socialsId} component="h3" sx={{ fontSize: 16, fontWeight: 700, mb: 1.5 }}>{t("socialsTitle")}</Typography>
            <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 1 }}>
              {socials.map((social) => (
                <li key={social.key}>
                  <ButtonBase
                    component="a"
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t("newTab", { label: t(social.key), name: agency.name })}
                    onClick={close}
                    sx={{ width: "100%", flexDirection: "column", gap: 0.75, py: 1.5, borderRadius: "18px", bgcolor: b.ivory, color: b.ink, fontSize: 13, fontWeight: 600, transition: "transform 150ms ease, background-color 150ms ease", "&:hover": { bgcolor: b.sand, transform: "translateY(-2px)" }, ...focusSx }}
                  >
                    {social.icon}
                    {t(social.key)}
                  </ButtonBase>
                </li>
              ))}
            </Box>
          </Box>
        )}
        <TextLink onClick={close} sx={{ alignSelf: "center", display: { md: "none" } }}>{t("close")}</TextLink>
      </Box>
    </Sheet>
  );
}
