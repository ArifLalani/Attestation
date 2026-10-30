import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agencies, getAgency } from "@/data/agencies";
import { CertificatePage } from "@/variants/f/components/certificate/CertificatePage";
import { VariantSwitcher } from "@/variants/VariantSwitcher";

// Design option F (Classique). Same data and behaviour as /fr-fr/certificate/[id].
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/f/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Avis contrôlés | Opinion System (option F)` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/f/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return (
    <>
      <CertificatePage key={id} agencyId={id} />
      <VariantSwitcher current="f" agencyId={id} />
    </>
  );
}
