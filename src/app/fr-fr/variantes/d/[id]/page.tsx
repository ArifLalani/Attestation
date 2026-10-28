import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agencies, getAgency } from "@/data/agencies";
import { VariantPage } from "@/variants/studio/VariantPage";
import { VariantSwitcher } from "@/variants/VariantSwitcher";

// Design option A (Confiance). Same data and behaviour as /fr-fr/certificate/[id].
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/d/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Avis contrôlés | Opinion System (option D)` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/d/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return (
    <>
      <VariantPage key={id} agencyId={id} variant="d" />
      <VariantSwitcher current="d" agencyId={id} />
    </>
  );
}
