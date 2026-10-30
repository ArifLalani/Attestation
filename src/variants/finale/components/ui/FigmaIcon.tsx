import Image from "next/image";

/** Icons exported from Figma (public/figma), drawn at their exported size. */
const icons = {
  "os-icon-logo": [24, 24],
  funnel: [24, 24],
  "sort-ascending": [24, 24],
  share: [20, 20],
  buildings: [20, 20],
  "map-pin": [17, 20],
  "open-dot": [14, 10],
  "globe-white": [20, 20],
  "globe-navy": [20, 20],
  "check-badge-white": [17.1429, 17.1429],
  "check-badge-navy": [17.1429, 17.1429],
  "expand-more": [20, 20],
  "chevron-right": [16, 16],
  close: [20, 20],
  search: [20, 20],
  group: [24, 24],
  check: [16, 16],
  "star-small": [16, 16],
  "arrows-clockwise": [20, 20],
  "thumbs-up": [18, 18],
  flag: [18, 18],
  "expand-more-blue": [18, 18],
  "expand-less-blue": [18, 18],
  "certified-badge": [20, 20],
  "x-circle": [16, 16],
  "icon-right-more": [20, 20],
  "icon-right-arrow": [20, 20],
  "icon-right-disabled": [20, 20],
  reset: [20, 20],
  "social-instagram": [24, 24],
  "social-facebook": [24, 24],
  "social-linkedin": [24, 24],
  "agency-pin": [20, 20],
  "agency-clock": [20, 20],
  "agency-phone": [20, 20],
  "agency-star": [20, 20],
  "agency-collapse": [16, 16],
  "certification-chevron": [20, 20],
  "footer-email": [20, 20],
  "fab-more": [24, 24],
  "source-os-certified": [17.3333, 17.3333],
  "source-os-simple": [20, 20],
  "source-imported": [20, 20],
  "source-google": [24, 24],
} as const;

export type FigmaIconName = keyof typeof icons;

export function FigmaIcon({ name, alt = "" }: { name: FigmaIconName; alt?: string }) {
  const [width, height] = icons[name];
  return (
    <Image
      src={`/figma/${name}.svg`}
      width={width}
      height={height}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      unoptimized
      style={{ display: "block", flexShrink: 0 }}
    />
  );
}
