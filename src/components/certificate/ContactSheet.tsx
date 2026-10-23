"use client";

import ButtonBase from "@mui/material/ButtonBase";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import WhatsApp from "@mui/icons-material/WhatsApp";
import { useTranslations } from "next-intl";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import type { Agency } from "@/data/types";
import { tokens } from "@/theme/theme";

/** Not in the Figma: a choice panel built from the sheet + list item styles. */
export function ContactSheet({ agency, open, onClose }: { agency: Agency; open: boolean; onClose: () => void }) {
  const t = useTranslations("Contact");
  const options = [
    { icon: <PhoneOutlined />, label: t("call"), detail: agency.phone, href: `tel:${agency.phone.replace(/\s/g, "")}` },
    { icon: <EmailOutlined />, label: t("email"), detail: agency.email, href: `mailto:${agency.email}` },
    ...(agency.whatsapp
      ? [{ icon: <WhatsApp />, label: t("whatsapp"), detail: agency.phone, href: `https://wa.me/${agency.whatsapp.replace(/\D/g, "")}` }]
      : []),
  ];

  return (
    <ResponsiveSheet open={open} onClose={onClose} title={t("title", { name: agency.name })} closeLabel={t("close")}>
      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, pb: 2 }}>
        {options.map((option) => (
          <li key={option.label}>
            <ButtonBase
              component="a"
              href={option.href}
              target={option.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
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
              <Box sx={{ width: 32, height: 32, borderRadius: "16px", bgcolor: tokens.bleu10, display: "grid", placeItems: "center", "& svg": { fontSize: 20 } }}>
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
    </ResponsiveSheet>
  );
}
