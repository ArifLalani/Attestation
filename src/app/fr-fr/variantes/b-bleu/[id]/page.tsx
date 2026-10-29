import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { agencies, getAgency } from "@/data/agencies";
import { VariantPage } from "@/variants/b-blue/VariantPage";
import { BluePreviewSwitcher } from "@/variants/b-blue/BluePreviewSwitcher";

// Design option B (Chaleureux). Same data and behaviour as /fr-fr/certificate/[id].
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/b-bleu/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Option B bleu · Poppins` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/b-bleu/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return (
    <>
      <VariantPage key={id} agencyId={id} />
      <BluePreviewSwitcher agencyId={id} />
    </>
  );
}
