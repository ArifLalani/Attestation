"use client";

import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Facebook from "@mui/icons-material/Facebook";
import Instagram from "@mui/icons-material/Instagram";
import LinkedIn from "@mui/icons-material/LinkedIn";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import X from "@mui/icons-material/X";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { ResponsiveSheet } from "@/variants/f/components/ui/ResponsiveSheet";
import type { Agency } from "@/data/types";
import { tokens } from "@/variants/f/theme";

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

function OptionList({ options, onClose }: { options: ContactOption[]; onClose: () => void }) {
  return (
    <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0 }}>
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
              gap: 1.5,
              px: 2,
              pt: 1.5,
              pb: "13px",
              borderBottom: `1px solid ${tokens.grisMoyen1}`,
              color: tokens.bleuFonce,
              "&:hover": { bgcolor: tokens.bleu5 },
            }}
          >
            <Box sx={{ width: 32, height: 32, borderRadius: "4px", bgcolor: tokens.bleu10, display: "grid", placeItems: "center", "& svg": { fontSize: 20 } }}>
              {option.icon}
            </Box>
            <Box sx={{ textAlign: "left" }}>
              <Typography sx={{ fontSize: 16, fontWeight: 500, lineHeight: "16px" }}>{option.label}</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: "14px", color: tokens.gris, mt: 0.5 }}>{option.detail}</Typography>
            </Box>
          </ButtonBase>
        </li>
      ))}
    </Box>
  );
}

/** Not in the Figma: a choice panel built from the sheet + list item styles. */
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
  const socials: ContactOption[] = networks.flatMap(({ key, icon }) => {
    const href = agency.socials[key];
    return href ? [{ icon, label: t(key), detail: agency.name, href, ariaLabel: t("newTab", { label: t(key), name: agency.name }) }] : [];
  });

  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t("title", { name: agency.name })} closeLabel={t("close")}>
      <Box sx={{ pb: 2 }}>
        <OptionList options={options} onClose={onClose} />
        {socials.length > 0 && (
          <Box component="section" aria-labelledby={socialsId}>
            <Typography id={socialsId} component="h3" sx={{ px: 2, pt: 2, pb: 0.5, fontSize: 12, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", color: tokens.gris }}>
              {t("socialsTitle")}
            </Typography>
            <OptionList options={socials} onClose={onClose} />
          </Box>
        )}
      </Box>
    </ResponsiveSheet>
  );
}
