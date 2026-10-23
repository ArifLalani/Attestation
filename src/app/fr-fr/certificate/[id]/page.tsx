import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CertificatePage } from "@/components/certificate/CertificatePage";
import { agencies, getAgency } from "@/data/agencies";

// Every agency page is prerendered; switching agencies may wait for the next page instead of streaming a shell.
export const instant = false;

export function generateStaticParams() {
  return agencies.map((agency) => ({ id: agency.id }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/certificate/[id]">): Promise<Metadata> {
  const { id } = await params;
  const agency = getAgency(id);
  return agency ? { title: `${agency.name} ${agency.city} — Avis contrôlés | Opinion System` } : {};
}

export default async function Page({ params }: PageProps<"/fr-fr/certificate/[id]">) {
  const { id } = await params;
  if (!getAgency(id)) notFound();
  return <CertificatePage agencyId={id} />;
}
