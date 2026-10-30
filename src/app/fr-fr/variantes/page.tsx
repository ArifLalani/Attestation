import type { Metadata } from "next";
import Link from "next/link";
import { variants } from "@/variants/registry";

export const metadata: Metadata = { title: "Options de design — Certificat électronique" };

const blurbs: Record<string, string> = {
  original: "La version validée, telle que dans le Figma.",
  a: "Proche de la marque : bleu marine, vert et jaune. Le score d'abord, comme Trustpilot.",
  b: "Chaleureux : photos, couleurs douces, avis qui se lisent comme des histoires, comme Airbnb.",
  d: "La Boîte Immo : une identité affirmée, du vert et une énergie positive.",
  e: "Essentiel : une interface lumineuse, épurée et pensée pour tous.",
  c: "Pratique : actions rapides, carte et horaires en premier, comme une fiche Google.",
  f: "Classique : la mise en page du prototype avec les couleurs et les polices du certificat actuel d'Opinion System.",
};

export default function Page() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "48px 20px", fontFamily: "system-ui, sans-serif", color: "#111" }}>
      <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Certificat électronique — options de design</h1>
      <p style={{ margin: "0 0 32px", color: "#555" }}>Même parcours, mêmes données, six interfaces différentes. Le sélecteur en bas à gauche passe d&apos;une option à l&apos;autre.</p>
      <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12 }}>
        {variants.map((variant) => (
          <li key={variant.id}>
            <Link href={variant.href("20871")} style={{ display: "block", padding: "16px 20px", border: "1px solid #ddd", borderRadius: 12, color: "inherit", textDecoration: "none" }}>
              <strong style={{ fontSize: 18 }}>{variant.name}</strong>
              <span style={{ display: "block", marginTop: 4, color: "#555" }}>{blurbs[variant.id]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
