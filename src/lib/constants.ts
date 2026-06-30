// Shared domain constants (Doc §7.1 categories, §14 voice)

export const CATEGORIES = [
  { key: "SKIN", label: "Skin & Facials", color: "#d9a98c", emoji: "🧖‍♀️" },
  { key: "HAIR", label: "Hair", color: "#b98a5e", emoji: "💇‍♀️" },
  { key: "NAILS", label: "Nails", color: "#c98fa0", emoji: "💅" },
  { key: "BODY", label: "Body & Massage", color: "#8a9a86", emoji: "💆" },
  { key: "WELLNESS", label: "Wellness & Recovery", color: "#7fa0a6", emoji: "🌿" },
  { key: "INJECTABLES", label: "Aesthetic Clinic", color: "#9a86a8", emoji: "✨" },
  { key: "GROOMING", label: "Men's Grooming", color: "#5e6b78", emoji: "💈" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

export function categoryMeta(key: string) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

// Hero images for the service SEO landing pages (local /public/images).
export const CATEGORY_HERO: Record<string, string> = {
  SKIN: "/images/1616394584738-fc6e612e71b9.jpg",
  HAIR: "/images/1580618672591-eb180b1a973f.jpg",
  NAILS: "/images/1632345031435-8727f6897d53.jpg",
  BODY: "/images/1519823551278-64ac92734fb1.jpg",
  WELLNESS: "/images/1445019980597-93fa8acb246c.jpg",
  INJECTABLES: "/images/1731514721772-329626f84c8b.jpg",
  GROOMING: "/images/1585747860715-2ba37e788b70.jpg",
};

export const TIERS = [
  {
    key: "GLOW",
    name: "Glow",
    blurb: "Your beauty life, organised beautifully.",
    accent: "#c8a96a",
  },
  {
    key: "SIGNATURE",
    name: "Signature",
    blurb: "Priority booking and premium add-on rates.",
    accent: "#ad8c4c",
  },
  {
    key: "BLACK",
    name: "Black Card",
    blurb: "Concierge support and exclusive events.",
    accent: "#2b2118",
  },
] as const;

export function tierMeta(key: string) {
  return TIERS.find((t) => t.key === key) ?? TIERS[0];
}

// Quick review tags (Doc §7.7)
export const REVIEW_TAGS = [
  "Calm atmosphere",
  "Spotless clean",
  "Great therapist",
  "Visible results",
  "Premium feel",
  "Easy parking",
  "Ran late",
  "Upsell pressure",
];

export const CITY = "Dubai";

// Saveable neighbourhood areas (Doc §7.2)
export const AREAS = [
  "DIFC",
  "Dubai Marina",
  "Jumeirah",
  "Downtown",
  "Business Bay",
  "Palm Jumeirah",
];

export function aed(amount: number) {
  return `AED ${amount.toLocaleString("en-AE")}`;
}
