import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Cas d’usage — version finale", robots: { index: false } };

const cases: [string, string, string][] = [
  ["1-sans-logo", "Cas 1 · Client sans logo", "Les initiales de l’entreprise à la place du logo."],
  ["2-nom-long", "Cas 2 · Nom d’entreprise trop long", "Babychou Services Avignon : une ligne, coupée par « … »."],
  ["3-sans-avis", "Cas 3 · Aucun avis client", "1894 L'Immobilier, Marseille : nouvel adhérent, premiers avis à venir."],
  ["4-assurance", "Cas 4 · Assurance", "Generali – Segui et Paoli, Menton : vocabulaire « assurés », sans photo."],
  ["4-auto-ecole", "Cas 4 · Auto-école", "Auto-école Dubard, La Réunion : « élèves », « Établissement », 2 établissements."],
  ["5-sans-equipe", "Cas 5 · Pas d’équipe", "La section Équipe est masquée."],
  ["6-une-agence", "Cas 6 · Pas d’autres agences", "« Notre agence », un seul repère."],
  ["8-sans-photo", "Cas 8 · Pas de photo", "Hero « Aurore », pas de bande de photos."],
  ["9-plus-de-5", "Cas 9 · Plus de 5 agences", "19 agences : repères regroupés et liste avec recherche."],
];

export default function Page() {
  return (
    <main style={{ fontFamily: "Poppins, sans-serif", maxWidth: 720, margin: "0 auto", padding: "40px 20px", color: "#041b44" }}>
      <h1 style={{ fontSize: 28 }}>Cas d’usage · version finale</h1>
      <p style={{ color: "#5b6b85" }}>Le cas 7 (questions de l’encart IA) se voit dans chaque cas. La page normale : <Link href="/fr-fr/variantes/finale/20871">/finale/20871</Link>.</p>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
        {cases.map(([slug, title, text]) => (
          <li key={slug} style={{ border: "1px solid #dfe9ef", borderRadius: 12, padding: 16 }}>
            <Link href={`/fr-fr/variantes/finale/cas/${slug}`} style={{ fontWeight: 600, color: "#041b44" }}>{title}</Link>
            <div style={{ fontSize: 14, color: "#5b6b85", marginTop: 4 }}>{text}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
