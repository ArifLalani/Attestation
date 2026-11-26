import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mainAgencyId } from "@/data/agencies";
import { caseSlugs } from "@/variants/finale/caseSlugs";
import { CertificatePage } from "@/variants/finale/components/certificate/CertificatePage";

// Use cases of the version finale (2026-11-26): each one a demo client showing an edge state of the page. The list is at /finale/cas.
export const instant = false;

export function generateStaticParams() {
  return caseSlugs.map((cas) => ({ cas }));
}

export async function generateMetadata({ params }: PageProps<"/fr-fr/variantes/finale/cas/[cas]">): Promise<Metadata> {
  const { cas } = await params;
  return { title: `Cas ${cas} — version finale`, robots: { index: false } };
}

export default async function Page({ params }: PageProps<"/fr-fr/variantes/finale/cas/[cas]">) {
  const { cas } = await params;
  if (!(caseSlugs as readonly string[]).includes(cas)) notFound();
  return <CertificatePage key={cas} agencyId={mainAgencyId} caseSlug={cas} />;
}
