import type { Agency, WeekHours } from "./types";

const day = (...ranges: [string, string][]) => ranges;

/** Mon–Fri 9–19, Sat 9–12:30 and 14–18, Sun closed. */
const standardHours: WeekHours = [
  day(["09:00", "19:00"]),
  day(["09:00", "19:00"]),
  day(["09:00", "19:00"]),
  day(["09:00", "19:00"]),
  day(["09:00", "19:00"]),
  day(["09:00", "12:30"], ["14:00", "18:00"]),
  day(),
];

const ids = ["20871", "20872", "20873", "20874", "20875"];
const sisters = (id: string) => ids.filter((other) => other !== id);

// Demo stand-ins for Google Maps photos: free Pexels images, exteriors and interiors alternating.
const photoPool = [
  106399, 1080721, 1396122, 1457842, 186077, 1571460, 210617, 1643383, 259588, 1918291, 280222, 2121121,
  323780, 2635038, 3555615, 271624, 2102587, 2724749, 1438832, 534151, 2462015, 6782567, 1029599, 1170412,
].map((id) => `/images/agencies/p${id}.jpg`);

/** Six photos per agency, starting with an exterior; neighbouring agencies share at most two. */
const photosFor = (id: string) => {
  const start = ids.indexOf(id) * 4;
  return Array.from({ length: 6 }, (_, k) => photoPool[(start + k) % photoPool.length]);
};

// Phone numbers use 04 65 71 xx xx, the range ARCEP reserves for fiction, so a tap never calls a real person.
const base = {
  name: "La Boîte Immo",
  sector: "Agence immobilière",
  website: "https://www.la-boite-immo.com/",
  coverPhoto: "/images/cover.jpg",
  logo: "/images/logo-lbi.png",
  memberSince: "mars 2022",
  publicThreshold: 5,
  hours: standardHours,
} satisfies Partial<Agency>;

export const agencies: Agency[] = [
  {
    ...base,
    id: "20871",
    address: "57 Chem. de la Maunière, 83400 Hyères, France",
    city: "Hyères",
    geo: { lat: 43.1158, lng: 6.1422 },
    phone: "+33 4 65 71 24 00",
    email: "hyeres@lbi.fr",
    whatsapp: "+33465712400",
    sisterAgencyIds: sisters("20871"),
    photos: photosFor("20871"),
  },
  {
    ...base,
    id: "20872",
    address: "12 Av. de la République, 83000 Toulon, France",
    city: "Toulon",
    geo: { lat: 43.1222, lng: 5.9334 },
    phone: "+33 4 65 71 24 10",
    email: "toulon@lbi.fr",
    sisterAgencyIds: sisters("20872"),
    photos: photosFor("20872"),
  },
  {
    ...base,
    id: "20873",
    address: "3 Bd de la République, 83260 La Crau, France",
    city: "La Crau",
    geo: { lat: 43.1497, lng: 6.0731 },
    phone: "+33 4 65 71 24 20",
    email: "lacrau@lbi.fr",
    sisterAgencyIds: sisters("20873"),
    photos: photosFor("20873"),
  },
  {
    ...base,
    id: "20874",
    address: "8 Pl. de la République, 83320 Carqueiranne, France",
    city: "Carqueiranne",
    geo: { lat: 43.0942, lng: 6.0736 },
    phone: "+33 4 65 71 24 30",
    email: "carqueiranne@lbi.fr",
    sisterAgencyIds: sisters("20874"),
    photos: photosFor("20874"),
  },
  {
    ...base,
    id: "20875",
    address: "21 Av. du Général de Gaulle, 83980 Le Lavandou, France",
    city: "Le Lavandou",
    geo: { lat: 43.1376, lng: 6.3687 },
    phone: "+33 4 65 71 24 40",
    email: "lavandou@lbi.fr",
    sisterAgencyIds: sisters("20875"),
    photos: photosFor("20875"),
  },
];

export const mainAgencyId = "20871";

export function getAgency(id: string): Agency | undefined {
  return agencies.find((agency) => agency.id === id);
}
