import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agencies, getAgency } from "@/data/agencies";
import { CertificatePage } from "@/variants/finale-v1/components/certificate/CertificatePage";
import { VersionSwitch } from "@/variants/VersionSwitch";

// Version finale V1: the version validated on 2026-11-23 (on Vercel), kept to compare with V2 (/fr-fr/variantes/finale/[id]).
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/finale-v1/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Avis contrôlés | Opinion System (version finale V1)` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/finale-v1/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return (
    <>
      {/* Presentation: press 1 for V1, 2 for V2. */}
      <VersionSwitch />
      <CertificatePage key={id} agencyId={id} />
    </>
  );
}
