import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agencies, getAgency } from "@/data/agencies";
import { CertificatePage } from "@/variants/finale/components/certificate/CertificatePage";
import { VariantSwitcher } from "@/variants/VariantSwitcher";

// Version finale 2: the same page as Version 1, with the current prototype's hero at the top.
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/finale-2/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Avis contrôlés | Opinion System (version finale 2)` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/finale-2/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return (
    <>
      <CertificatePage key={id} agencyId={id} hero="actuel" />
      <VariantSwitcher current="finale-2" agencyId={id} />
    </>
  );
}
