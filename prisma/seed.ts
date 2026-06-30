import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// Images are served locally from /public/images/<id>.jpg (downloaded once).
// The `id` is the original Unsplash photo id, kept only as a stable filename.
const img = (id: string) => `/images/${id}.jpg`;

// Validated themed image pool (all files exist in /public/images).
const POOL: Record<string, string[]> = {
  SKIN: [
    "1570172619644-dfd03ed5d881", "1616394584738-fc6e612e71b9", "1643684391140-c5056cfd3436",
    "1643684460412-76908d8e5a25", "1544717304-a2db4a7b16ee", "1552693673-1bf958298935",
    "1512290923902-8a9f81dc236c",
  ],
  HAIR: [
    "1560066984-138dadb4c035", "1634449571010-02389ed0f9b0", "1580618672591-eb180b1a973f",
    "1595475884562-073c30d45670", "1560869713-7d0a29430803", "1554519934-e32b1629d9ee",
    "1574015974293-817f0ebebb74", "1600948836101-f9ffda59d250", "1521590832167-7bcbfaa6381f",
    "1562322140-8baeececf3df", "1599351431202-1e0f0137899a",
  ],
  NAILS: [
    "1604654894610-df63bc536371", "1632345031435-8727f6897d53", "1610992015762-45dca7fa3a85",
    "1619607146034-5a05296c8f9a", "1607779097040-26e80aa78e66", "1612887390768-fb02affea7a6",
    "1630843599725-32ead7671867", "1571290274554-6a2eaa771e5f", "1610992015836-7c249d75782d",
    "1599206676335-193c82b13c9e",
  ],
  BODY: [
    "1544161515-4ab6ce6db874", "1519823551278-64ac92734fb1", "1515377905703-c4788e51af15",
    "1600334089648-b0d9d3028eb2", "1620733723572-11c53f73a416", "1598901986949-f593ff2a31a6",
    "1519824145371-296894a0daa9", "1611073615830-9f76902c10fe",
  ],
  WELLNESS: [
    "1445019980597-93fa8acb246c", "1518860308377-800f02d5498a", "1500815845799-7748ca339f27",
    "1600334129128-685c5582fd35", "1519868343531-805e97cbda3e", "1532926381893-7542290edf1d",
  ],
  INJECTABLES: [
    "1576091160550-2173dba999ef", "1700760933574-9f0f4ea9aa3b", "1731514721772-329626f84c8b",
    "1665231795856-769fb08a90bc", "1648775507324-b48dd3791fa5", "1551076826-72190fff02d3",
  ],
  GROOMING: [
    "1503951914875-452162b0f3f1", "1585747860715-2ba37e788b70", "1647140655214-e4a2d914971f",
    "1605497788044-5a32c7078486", "1621605815971-fbc98d665033", "1536520002442-39764a41e987",
    "1596728325488-58c87691e9af", "1599351431613-18ef1fdd27e1", "1517832606299-7ae9b720a186",
  ],
  PRODUCT: [
    "1583209814683-c023dd293cc6", "1631730486572-226d1f595b68", "1629198688000-71f23e745b6e",
    "1613803745799-ba6c10aace85", "1600634999623-864991678406", "1601049413574-214d105b26e4",
  ],
};

// Build a 4-photo gallery for a venue: its main image first, then 3 distinct
// images from the same category pool, rotated by `seed` so venues differ.
function buildGallery(category: string, mainId: string, seed: number): string {
  const pool = (POOL[category] ?? POOL.WELLNESS).filter((id) => id !== mainId);
  const off = seed % Math.max(1, pool.length);
  const rotated = [...pool.slice(off), ...pool.slice(0, off)];
  return JSON.stringify([mainId, ...rotated.slice(0, 3)].map(img));
}

// Deterministic per-category counter so service photos vary.
const svcCounter: Record<string, number> = {};
function serviceImage(category: string): string {
  const pool = POOL[category] ?? POOL.PRODUCT;
  const i = (svcCounter[category] = (svcCounter[category] ?? 0) + 1);
  return img(pool[i % pool.length]);
}

type ServiceSeed = {
  name: string; category: string; durationMin: number; retailPrice: number;
  creditCost: number; therapistLevel?: string; includedInPlan?: boolean; description: string;
};

type VenueSeed = {
  slug: string; name: string; category: string; neighbourhood: string; address: string;
  lat: number; lng: number; rating: number; reviewCount: number; description: string;
  image: string; amenities: string[]; isNew?: boolean; spotlight?: boolean; services: ServiceSeed[];
};

const PLANS = [
  { slug: "glow", name: "Glow", tier: "GLOW", priceMonthly: 399, creditsPerMonth: 8, guestPasses: 0, order: 1,
    description: "Your beauty life, organised beautifully. Perfect to start.",
    perks: ["8 credits / month", "Access to all partner venues", "Member rates on add-ons", "Saved-money dashboard"] },
  { slug: "signature", name: "Signature", tier: "SIGNATURE", priceMonthly: 749, creditsPerMonth: 18, guestPasses: 1, order: 2,
    description: "More visits, priority booking and a monthly guest pass.",
    perks: ["18 credits / month", "Priority booking windows", "1 guest pass / month", "Premium add-on rates", "The Edit early access"] },
  { slug: "black-card", name: "Black Card", tier: "BLACK", priceMonthly: 1499, creditsPerMonth: 40, guestPasses: 2, order: 3,
    description: "Concierge support, exclusive events and the most value.",
    perks: ["40 credits / month", "Dedicated concierge", "2 guest passes / month", "Exclusive member events", "First access to new clinics"] },
];

const VENUES: VenueSeed[] = [
  {
    slug: "maison-lumiere", name: "Maison Lumière", category: "SKIN", neighbourhood: "DIFC",
    address: "Gate Village 4, DIFC, Dubai", lat: 25.2138, lng: 55.2796, rating: 4.9, reviewCount: 214,
    description: "A calm, light-filled skin atelier in the heart of DIFC. Medical-grade facials with a concierge feel.",
    image: "1570172619644-dfd03ed5d881", amenities: ["Luxury", "Female-only hours", "Valet parking", "Accessible"], spotlight: true,
    services: [
      { name: "Signature Hydrating Facial", category: "SKIN", durationMin: 60, retailPrice: 520, creditCost: 2, description: "Deep hydration with lymphatic massage and LED finish." },
      { name: "Dermaplaning Glow", category: "SKIN", durationMin: 45, retailPrice: 380, creditCost: 1, therapistLevel: "Master", description: "Physical exfoliation for instant smoothness and glow." },
      { name: "Express Lunchtime Facial", category: "SKIN", durationMin: 30, retailPrice: 260, creditCost: 1, description: "A quick reset between meetings — cleanse, mask, glow." },
    ],
  },
  {
    slug: "the-hair-house", name: "The Hair House", category: "HAIR", neighbourhood: "Jumeirah",
    address: "Jumeirah Beach Road, Dubai", lat: 25.2048, lng: 55.2418, rating: 4.8, reviewCount: 331,
    description: "A warm, editorial hair house known for lived-in colour and glossy blowouts.",
    image: "1560066984-138dadb4c035", amenities: ["Luxury", "Parking", "Men-friendly"], spotlight: true,
    services: [
      { name: "Gloss & Blowout", category: "HAIR", durationMin: 75, retailPrice: 340, creditCost: 2, description: "Shine gloss treatment with a smooth, bouncy blowout." },
      { name: "Balayage Refresh", category: "HAIR", durationMin: 150, retailPrice: 890, creditCost: 4, therapistLevel: "Master", description: "Hand-painted, lived-in colour with a toner finish." },
      { name: "Men's Cut & Style", category: "GROOMING", durationMin: 45, retailPrice: 220, creditCost: 1, description: "Precision cut and style for men." },
    ],
  },
  {
    slug: "lacquer-nail-studio", name: "Lacquer Nail Studio", category: "NAILS", neighbourhood: "Dubai Marina",
    address: "Marina Walk, Dubai Marina", lat: 25.0805, lng: 55.1403, rating: 4.7, reviewCount: 188,
    description: "A spotless, modern nail studio for express manicures done right.",
    image: "1604654894610-df63bc536371", amenities: ["Spotless", "Express service", "Female-only hours"],
    services: [
      { name: "Express Gel Manicure", category: "NAILS", durationMin: 40, retailPrice: 180, creditCost: 1, description: "Fast, flawless gel manicure with a glossy finish." },
      { name: "Luxury Pedicure", category: "NAILS", durationMin: 60, retailPrice: 260, creditCost: 2, description: "Soak, scrub, massage and polish — pure restoration." },
    ],
  },
  {
    slug: "stillpoint-spa", name: "Stillpoint Spa", category: "BODY", neighbourhood: "Palm Jumeirah",
    address: "Shoreline, Palm Jumeirah", lat: 25.1124, lng: 55.139, rating: 4.9, reviewCount: 402,
    description: "Recovery-focused spa with deep-tissue and post-workout massage.",
    image: "1544161515-4ab6ce6db874", amenities: ["Luxury", "Accessible", "Valet parking", "Recovery"], spotlight: true,
    services: [
      { name: "Deep Tissue Recovery", category: "BODY", durationMin: 60, retailPrice: 460, creditCost: 2, description: "Targeted deep-tissue work for tension and recovery." },
      { name: "Post-Work De-stress Massage", category: "BODY", durationMin: 50, retailPrice: 390, creditCost: 2, description: "Unwind after the day with a calming full-body massage." },
      { name: "Lymphatic Drainage", category: "WELLNESS", durationMin: 60, retailPrice: 480, creditCost: 2, therapistLevel: "Master", description: "Gentle, de-puffing lymphatic massage." },
    ],
  },
  {
    slug: "clinic-aurelia", name: "Clinic Aurelia", category: "INJECTABLES", neighbourhood: "Downtown",
    address: "Sheikh Mohammed bin Rashid Blvd, Downtown", lat: 25.1972, lng: 55.2744, rating: 4.8, reviewCount: 96,
    description: "A discreet aesthetic clinic with licensed practitioners and a calm, premium feel.",
    image: "1576091160550-2173dba999ef", amenities: ["Luxury", "Accessible", "Licensed clinic"], isNew: true,
    services: [
      { name: "Skin Consultation", category: "INJECTABLES", durationMin: 30, retailPrice: 300, creditCost: 1, therapistLevel: "Master", description: "One-on-one consultation with a licensed practitioner." },
      { name: "Hydrafacial Pro", category: "SKIN", durationMin: 60, retailPrice: 650, creditCost: 3, therapistLevel: "Master", description: "Medical-grade resurfacing for radiant skin." },
    ],
  },
  {
    slug: "barbershop-no-7", name: "Barbershop No. 7", category: "GROOMING", neighbourhood: "Business Bay",
    address: "Bay Square, Business Bay", lat: 25.1857, lng: 55.2772, rating: 4.7, reviewCount: 142,
    description: "A modern men's grooming house — sharp cuts, hot towels, good coffee.",
    image: "1503951914875-452162b0f3f1", amenities: ["Men-friendly", "Parking", "Express service"], isNew: true,
    services: [
      { name: "Signature Cut & Hot Towel", category: "GROOMING", durationMin: 45, retailPrice: 200, creditCost: 1, description: "Classic cut finished with a hot-towel shave detail." },
      { name: "Beard Sculpt", category: "GROOMING", durationMin: 30, retailPrice: 140, creditCost: 1, description: "Precision beard shaping and conditioning." },
    ],
  },
  // ---- New venues ----
  {
    slug: "glasshouse-skin", name: "Glasshouse Skin", category: "SKIN", neighbourhood: "Jumeirah",
    address: "Al Wasl Road, Jumeirah", lat: 25.1985, lng: 55.2412, rating: 4.8, reviewCount: 121,
    description: "A bright, botanical facial studio focused on glass-skin results and barrier health.",
    image: "1616394584738-fc6e612e71b9", amenities: ["Luxury", "Female-only hours", "Parking"], spotlight: true,
    services: [
      { name: "Glass Skin Facial", category: "SKIN", durationMin: 75, retailPrice: 560, creditCost: 3, therapistLevel: "Master", description: "Layered hydration and gentle resurfacing for a dewy finish." },
      { name: "Barrier Repair Facial", category: "SKIN", durationMin: 60, retailPrice: 440, creditCost: 2, description: "Calming treatment for sensitive, reactive skin." },
    ],
  },
  {
    slug: "atelier-blonde", name: "Atelier Blonde", category: "HAIR", neighbourhood: "DIFC",
    address: "Central Park Towers, DIFC", lat: 25.2155, lng: 55.281, rating: 4.9, reviewCount: 176,
    description: "Specialist colour atelier for blondes, balayage and glossy, healthy hair.",
    image: "1580618672591-eb180b1a973f", amenities: ["Luxury", "Valet parking"],
    services: [
      { name: "Signature Balayage", category: "HAIR", durationMin: 180, retailPrice: 980, creditCost: 4, therapistLevel: "Master", description: "Bespoke hand-painted colour for a sun-kissed finish." },
      { name: "Bond Gloss Treatment", category: "HAIR", durationMin: 60, retailPrice: 320, creditCost: 2, description: "Bond-building gloss for shine and strength." },
      { name: "Blow-dry Bar", category: "HAIR", durationMin: 45, retailPrice: 200, creditCost: 1, description: "A polished blow-dry for any occasion." },
    ],
  },
  {
    slug: "polished-nail-bar", name: "Polished Nail Bar", category: "NAILS", neighbourhood: "Downtown",
    address: "Dubai Mall Fashion Avenue, Downtown", lat: 25.1965, lng: 55.2796, rating: 4.6, reviewCount: 244,
    description: "A chic nail bar known for clean nail art and a flawless gel finish.",
    image: "1632345031435-8727f6897d53", amenities: ["Spotless", "Express service"], isNew: true,
    services: [
      { name: "Russian Manicure", category: "NAILS", durationMin: 75, retailPrice: 300, creditCost: 2, therapistLevel: "Master", description: "Precise dry manicure for an ultra-clean finish." },
      { name: "Gel Art Set", category: "NAILS", durationMin: 60, retailPrice: 240, creditCost: 2, description: "Custom nail art with a long-lasting gel finish." },
    ],
  },
  {
    slug: "hammam-and-co", name: "Hammam & Co", category: "BODY", neighbourhood: "Palm Jumeirah",
    address: "Club Vista Mare, Palm Jumeirah", lat: 25.1105, lng: 55.1185, rating: 4.9, reviewCount: 158,
    description: "A traditional hammam reimagined — exfoliation rituals and deep relaxation.",
    image: "1519823551278-64ac92734fb1", amenities: ["Luxury", "Female-only hours", "Accessible"], spotlight: true,
    services: [
      { name: "Traditional Hammam Ritual", category: "BODY", durationMin: 90, retailPrice: 620, creditCost: 3, description: "Steam, black soap, kessa exfoliation and rhassoul clay." },
      { name: "Aromatherapy Massage", category: "BODY", durationMin: 60, retailPrice: 420, creditCost: 2, description: "Custom essential-oil blend for full-body calm." },
    ],
  },
  {
    slug: "reset-recovery-lab", name: "Reset Recovery Lab", category: "WELLNESS", neighbourhood: "Business Bay",
    address: "The Opus, Business Bay", lat: 25.1869, lng: 55.2641, rating: 4.8, reviewCount: 87,
    description: "A modern recovery lab — cryo, compression and lymphatic wellness.",
    image: "1445019980597-93fa8acb246c", amenities: ["Recovery", "Men-friendly", "Parking"], isNew: true,
    services: [
      { name: "Cryotherapy Session", category: "WELLNESS", durationMin: 30, retailPrice: 280, creditCost: 1, description: "Whole-body cold therapy for recovery and energy." },
      { name: "Compression & Lymphatic", category: "WELLNESS", durationMin: 45, retailPrice: 320, creditCost: 2, description: "Compression therapy to de-puff and restore." },
    ],
  },
  {
    slug: "gentlemans-den", name: "The Gentleman's Den", category: "GROOMING", neighbourhood: "Dubai Marina",
    address: "Marina Plaza, Dubai Marina", lat: 25.0775, lng: 55.1395, rating: 4.7, reviewCount: 199,
    description: "An old-school barber den with modern fades, hot shaves and grooming.",
    image: "1585747860715-2ba37e788b70", amenities: ["Men-friendly", "Parking", "Express service"],
    services: [
      { name: "Skin Fade & Style", category: "GROOMING", durationMin: 50, retailPrice: 230, creditCost: 1, description: "Sharp skin fade finished with a tailored style." },
      { name: "Royal Hot Shave", category: "GROOMING", durationMin: 40, retailPrice: 180, creditCost: 1, therapistLevel: "Master", description: "Traditional cut-throat shave with hot towels." },
    ],
  },
];

const JOURNAL = [
  { slug: "best-lunchtime-treatments-dubai", title: "The Best Lunchtime Treatments in Dubai", excerpt: "Glow up on your break — express facials and manicures under 45 minutes.", category: "The Edit", imageId: "1512290923902-8a9f81dc236c", body: "Time is the real luxury. These express treatments are designed to fit between meetings while still delivering visible results..." },
  { slug: "facialists-to-know", title: "New Facialists to Know This Season", excerpt: "The therapists quietly building cult followings across the city.", category: "The Edit", imageId: "1519014816548-bf5fe059798b", body: "A great facial is about hands as much as products. We rounded up the facialists members keep rebooking..." },
  { slug: "pre-event-glow-plan", title: "Your Pre-Event Glow Plan", excerpt: "A simple week-by-week routine to look your best before a big night.", category: "Routines", imageId: "1487412947147-5cebf100ffc2", body: "Start one week out with hydration, finish with a gloss and a brow tidy the day before. Here is the full plan..." },
  { slug: "men-grooming-edit", title: "The Men's Grooming Edit", excerpt: "Sharp cuts, hot shaves and skincare that fits into a busy week.", category: "The Edit", imageId: "1599351431613-18ef1fdd27e1", body: "Grooming has gone from afterthought to ritual. Here are the cuts, shaves and quick skin treatments worth booking..." },
  { slug: "rainy-day-spa-edit", title: "The Rainy Day Spa Edit", excerpt: "Where to retreat when you want to disappear for a few hours.", category: "The Edit", imageId: "1518860308377-800f02d5498a", body: "Some days call for steam, quiet and a long massage. These are the spas members escape to..." },
  { slug: "nail-art-trends", title: "Nail Art Trends Worth Booking", excerpt: "From clean girl gloss to quiet-luxury chrome — this season's sets.", category: "Trends", imageId: "1619607146034-5a05296c8f9a", body: "Nail art is having a quiet-luxury moment. Here's what members are asking for at the studios this season..." },
];

async function main() {
  // Skip if already seeded (unless FORCE_SEED=1) so restarts don't wipe data.
  if (process.env.FORCE_SEED !== "1") {
    const existing = await prisma.plan.count().catch(() => 0);
    if (existing > 0) {
      console.log("✅ Database already seeded — skipping. (FORCE_SEED=1 to reseed.)");
      return;
    }
  }

  console.log("🌱 Seeding Licensed to Glow…");

  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.passportStamp.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.service.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.journalPost.deleteMany();
  await prisma.user.deleteMany();
  await prisma.plan.deleteMany();

  const plans: Record<string, { id: string }> = {};
  for (const p of PLANS) {
    plans[p.slug] = await prisma.plan.create({ data: { ...p, perks: JSON.stringify(p.perks) } });
  }

  for (const j of JOURNAL) {
    await prisma.journalPost.create({
      data: { slug: j.slug, title: j.title, excerpt: j.excerpt, body: j.body, category: j.category, imageUrl: img(j.imageId) },
    });
  }

  const pw = await bcrypt.hash("password123", 10);

  await prisma.user.create({ data: { email: "admin@glow.app", passwordHash: pw, name: "Glow Admin", role: "ADMIN" } });
  const partner = await prisma.user.create({ data: { email: "partner@glow.app", passwordHash: pw, name: "Lena (Partner)", role: "PARTNER" } });
  const member = await prisma.user.create({
    data: {
      email: "member@glow.app", passwordHash: pw, name: "Sara Al Noori", role: "MEMBER", tier: "SIGNATURE",
      goals: JSON.stringify(["Glowing skin", "Healthy hair", "Self-care routine"]), budget: "premium",
    },
  });

  const renewal = new Date();
  renewal.setDate(renewal.getDate() + 18);
  await prisma.membership.create({
    data: { userId: member.id, planId: plans["signature"].id, creditsRemaining: 12, savedAmount: 1240, retailUsed: 1640, streakWeeks: 4, renewalDate: renewal },
  });

  const createdServices: { id: string; venueId: string; name: string; category: string; retailPrice: number; creditCost: number }[] = [];
  for (let i = 0; i < VENUES.length; i++) {
    const v = VENUES[i];
    const venue = await prisma.venue.create({
      data: {
        slug: v.slug, name: v.name, category: v.category, neighbourhood: v.neighbourhood, address: v.address,
        lat: v.lat, lng: v.lng, rating: v.rating, reviewCount: v.reviewCount, description: v.description,
        imageUrl: img(v.image), gallery: buildGallery(v.category, v.image, i),
        amenities: JSON.stringify(v.amenities), isNew: v.isNew ?? false, spotlight: v.spotlight ?? false,
        approved: true, ownerId: i < 2 ? partner.id : null,
        services: {
          create: v.services.map((s) => ({
            name: s.name, category: s.category, durationMin: s.durationMin, retailPrice: s.retailPrice,
            creditCost: s.creditCost, therapistLevel: s.therapistLevel ?? "Senior", includedInPlan: s.includedInPlan ?? true,
            description: s.description, imageUrl: serviceImage(s.category),
          })),
        },
      },
      include: { services: true },
    });
    for (const s of venue.services) {
      createdServices.push({ id: s.id, venueId: venue.id, name: s.name, category: s.category, retailPrice: s.retailPrice, creditCost: s.creditCost });
    }
  }

  // Past bookings + reviews + stamps for the demo member
  const past1 = createdServices[0];
  const past2 = createdServices.find((s) => s.category === "NAILS")!;
  const pastDate1 = new Date(); pastDate1.setDate(pastDate1.getDate() - 14);
  const pastDate2 = new Date(); pastDate2.setDate(pastDate2.getDate() - 6);

  const b1 = await prisma.booking.create({ data: { userId: member.id, serviceId: past1.id, venueId: past1.venueId, date: pastDate1, status: "COMPLETED", creditsUsed: past1.creditCost, retailValue: past1.retailPrice, therapistPref: "No preference" } });
  await prisma.review.create({ data: { bookingId: b1.id, userId: member.id, venueId: past1.venueId, serviceId: past1.id, rating: 5, cleanliness: 5, therapist: 5, result: 5, ambience: 5, value: 4, tags: JSON.stringify(["Calm atmosphere", "Visible results", "Premium feel"]), notes: "Left absolutely glowing." } });
  await prisma.passportStamp.create({ data: { userId: member.id, label: "DIFC Skin Glow", category: "SKIN" } });

  const b2 = await prisma.booking.create({ data: { userId: member.id, serviceId: past2.id, venueId: past2.venueId, date: pastDate2, status: "COMPLETED", creditsUsed: past2.creditCost, retailValue: past2.retailPrice } });
  await prisma.review.create({ data: { bookingId: b2.id, userId: member.id, venueId: past2.venueId, serviceId: past2.id, rating: 5, cleanliness: 5, therapist: 4, result: 5, ambience: 4, value: 5, tags: JSON.stringify(["Spotless clean", "Easy parking"]) } });
  await prisma.passportStamp.create({ data: { userId: member.id, label: "Marina Manicure", category: "NAILS" } });

  const upcoming = createdServices.find((s) => s.category === "BODY")!;
  const upDate = new Date(); upDate.setDate(upDate.getDate() + 3); upDate.setHours(18, 0, 0, 0);
  await prisma.booking.create({ data: { userId: member.id, serviceId: upcoming.id, venueId: upcoming.venueId, date: upDate, status: "UPCOMING", creditsUsed: upcoming.creditCost, retailValue: upcoming.retailPrice, therapistPref: "Senior therapist" } });

  const favVenue = createdServices.find((s) => s.category === "HAIR")!;
  await prisma.favorite.create({ data: { userId: member.id, venueId: favVenue.venueId } });

  console.log(`✅ Seed complete — ${VENUES.length} venues, ${createdServices.length} services, ${JOURNAL.length} journal posts.`);
  console.log("   Demo logins (password: password123):");
  console.log("   • member@glow.app   (Signature member)");
  console.log("   • partner@glow.app  (venue partner)");
  console.log("   • admin@glow.app    (operations)");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
