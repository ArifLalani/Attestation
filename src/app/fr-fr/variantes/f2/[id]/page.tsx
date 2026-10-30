import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agencies, getAgency } from "@/data/agencies";
import { VariantPage } from "@/variants/f2/VariantPage";
import { VariantSwitcher } from "@/variants/VariantSwitcher";

// Design option F2: B's layout in the live certificate page's colours and fonts. Same data and behaviour as /fr-fr/certificate/[id].
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/f2/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Avis contrôlés | Opinion System (option F2)` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/f2/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return (
    <>
      <VariantPage key={id} agencyId={id} />
      <VariantSwitcher current="f2" agencyId={id} />
    </>
  );
}
