"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Verified from "@mui/icons-material/Verified";
import RateReviewOutlined from "@mui/icons-material/RateReviewOutlined";
import Image from "next/image";
import { useCertificate } from "@/components/certificate/CertificateContext";
import { tokens } from "@/theme/theme";
import { CtaButton } from "@/variants/finale/components/ui/CtaButton";
import { useCaseData } from "@/variants/finale/cases";
import { CardTitle } from "./ReputationCard";

/**
 * Case 3 (2026-11-26): a client with no reviews yet. Instead of the Réputation card and the reviews list, one card says what the
 * Opinion System label guarantees, and invites a past client to leave the first review.
 */
export function NoReviewsCard() {
  const { agency, setPanel } = useCertificate();
  const { sector } = useCaseData();
  const guarantees = [
    `Chaque avis vient d’un vrai ${sector.people === "assurés" ? "assuré" : sector.people === "élèves" ? "élève" : "client"}, invité après sa prestation.`,
    "Les avis sont contrôlés par Opinion System avant d’être publiés, bons ou mauvais.",
    "La note ne peut pas être modifiée par l’entreprise.",
  ];
  return (
    <Box id="note" component="section" aria-labelledby="no-reviews-title" sx={{ bgcolor: tokens.blanc, borderRadius: "20px", boxShadow: tokens.shadowCardSoft, p: { xs: 1.5, md: 2 }, display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", md: "minmax(0, 1fr) minmax(0, 1fr)" }, columnGap: 4, rowGap: 2, alignItems: "start" }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <CardTitle id="no-reviews-title" eyebrow="Réputation" heading="Premiers avis à venir" />
        <Typography sx={{ fontSize: 14, lineHeight: 1.55, color: tokens.gris }}>
          {agency.name} a rejoint Opinion System en {agency.memberSince}. Ses premiers avis {sector.people} apparaîtront ici dès qu’ils auront été contrôlés.
        </Typography>
        <Box component="ul" sx={{ listStyle: "none", m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
          {guarantees.map((text) => (
            <Box component="li" key={text} sx={{ display: "flex", gap: 1, alignItems: "flex-start", fontSize: 14, lineHeight: 1.45, color: tokens.bleuFonce }}>
              <Verified sx={{ fontSize: 20, color: tokens.vertOs, flexShrink: 0 }} />
              {text}
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: { xs: 1.5, sm: 2 }, borderRadius: "16px", border: "1px solid #d6e4f3", background: "linear-gradient(135deg, #ffffff 45%, rgba(67, 182, 163, 0.1) 100%)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
            <Image src="/figma/quality-badge.png" alt="" fill sizes="64px" unoptimized style={{ objectFit: "contain" }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.3, color: tokens.bleuFonce }}>Vous êtes {sector.people === "élèves" ? "un ancien élève" : sector.people === "assurés" ? "assuré" : "client"} ?</Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.45, color: tokens.gris }}>Partagez votre expérience : votre avis sera le premier publié.</Typography>
          </Box>
        </Box>
        <CtaButton icon={null} onClick={() => setPanel("reviewRequest")} sx={{ gap: 1 }}>
          <RateReviewOutlined sx={{ fontSize: 20 }} />
          Déposer un avis
        </CtaButton>
      </Box>
    </Box>
  );
}
