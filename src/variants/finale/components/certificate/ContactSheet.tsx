"use client";

import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import X from "@mui/icons-material/X";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { ResponsiveSheet } from "@/variants/finale/components/ui/ResponsiveSheet";
import type { Agency } from "@/data/types";
import { tokens } from "@/theme/theme";

interface ContactOption {
  icon: React.ReactNode;
  label: string;
  detail: string;
  href: string;
  ariaLabel?: string;
}

const networks = [
  { key: "linkedin", icon: <LinkedIn /> },
  { key: "facebook", icon: <Facebook /> },
  { key: "instagram", icon: <Instagram /> },
  { key: "x", icon: <X /> },
] as const;

const focusSx = { "&.Mui-focusVisible": { outline: `2px solid ${tokens.bleuFonce}`, outlineOffset: 2 } } as const;

/** Rows taken from option F2: a rounded card per channel, a tinted icon tile, the detail under the label and a chevron. */
function OptionList({ options, onClose }: { options: ContactOption[]; onClose: () => void }) {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
      {options.map((option) => (
        <li key={option.label}>
          <ButtonBase
            component="a"
            href={option.href}
            target={option.href.startsWith("http") ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={option.ariaLabel}
            onClick={onClose}
            sx={{
              width: "100%",
              justifyContent: "flex-start",
              gap: 2,
              p: 1.5,
              borderRadius: "16px",
              boxShadow: `inset 0 0 0 1px ${tokens.grisMoyen1}`,
              color: tokens.bleuFonce,
              transition: "box-shadow 150ms ease, background-color 150ms ease",
              "&:hover": { boxShadow: `inset 0 0 0 1px ${tokens.bleuFonce}`, bgcolor: tokens.grisClair1 },
              ...focusSx,
            }}
          >
            <Box sx={{ width: 44, height: 44, borderRadius: "12px", bgcolor: tokens.bleu10, display: "grid", placeItems: "center", flexShrink: 0, "& svg": { fontSize: 22 } }}>
              {option.icon}
            </Box>
            <Box sx={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3 }}>{option.label}</Typography>
              <Typography sx={{ fontSize: 14, lineHeight: 1.3, color: tokens.gris, overflowWrap: "anywhere" }}>{option.detail}</Typography>
            </Box>
            <ChevronRightRounded sx={{ color: tokens.gris }} />
          </ButtonBase>
        </li>
      ))}
    </Box>
  );
}

/** The company's pages as four tiles, as in option F2. */
function SocialTiles({ socials, onClose }: { socials: (ContactOption & { key: string })[]; onClose: () => void }) {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 1 }}>
      {socials.map((social) => (
        <li key={social.key}>
          <ButtonBase
            component="a"
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.ariaLabel}
            onClick={onClose}
            sx={{
              width: "100%",
              flexDirection: "column",
              gap: 0.75,
              py: 1.5,
              borderRadius: "16px",
              bgcolor: tokens.grisClair2,
              color: tokens.bleuFonce,
              fontSize: 13,
              fontWeight: 600,
              transition: "transform 150ms ease, background-color 150ms ease",
              "&:hover": { bgcolor: tokens.grisMoyen1, transform: "translateY(-2px)" },
              ...focusSx,
            }}
          >
            {social.icon}
            {social.label}
          </ButtonBase>
        </li>
      ))}
    </Box>
  );
}

/** Contacter: phone, e-mail, WhatsApp, then the company's social pages (layout from option F2, prototype colours and font). */
export function ContactSheet({ agency, open, onClose }: { agency: Agency; open: boolean; onClose: () => void }) {
  const t = useTranslations("Contact");
  const socialsId = useId();
  const options: ContactOption[] = [
    { icon: <PhoneOutlined />, label: t("call"), detail: agency.phone, href: `tel:${agency.phone.replace(/\s/g, "")}` },
    { icon: <EmailOutlined />, label: t("email"), detail: agency.email, href: `mailto:${agency.email}` },
    ...(agency.whatsapp
      ? [{ icon: <WhatsApp />, label: t("whatsapp"), detail: agency.phone, href: `https://wa.me/${agency.whatsapp.replace(/\D/g, "")}` }]
      : []),
  ];
  const socials = networks.flatMap(({ key, icon }) => {
    const href = agency.socials[key];
    return href ? [{ key, icon, label: t(key), detail: agency.name, href, ariaLabel: t("newTab", { label: t(key), name: agency.name }) }] : [];
  });

  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t("title", { name: agency.name })} closeLabel={t("close")}>
      <Box sx={{ p: 2, pb: "calc(16px + env(safe-area-inset-bottom))", display: "flex", flexDirection: "column", gap: 3 }}>
        <OptionList options={options} onClose={onClose} />
        {socials.length > 0 && (
          <Box component="section" aria-labelledby={socialsId}>
            <Typography id={socialsId} component="h3" sx={{ mb: 1.5, fontSize: 16, fontWeight: 600, color: tokens.bleuFonce }}>
              {t("socialsTitle")}
            </Typography>
            <SocialTiles socials={socials} onClose={onClose} />
          </Box>
        )}
      </Box>
    </ResponsiveSheet>
  );
}
