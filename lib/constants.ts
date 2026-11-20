import type { Category, Currency, Language } from "./types";

export const SITE = {
  name: "TRENDORA",
  tagline: "Mitindo ya kisasa na maduka ya Tanzania, sehemu moja.",
  phone: "+255 712 345 678",
  phoneHref: "+255712345678",
  whatsapp: "+255 712 345 678",
  email: "hello@trendora.co.tz",
  address: "Msasani, Dar es Salaam, Tanzania",
  hours: {
    en: "Mon – Sat, 9:00 – 19:00 EAT",
    sw: "Jumatatu – Jumamosi, saa 3 asubuhi – saa 1 jioni"
  }
};

export const FREE_SHIPPING_THRESHOLD = 150000;
export const USD_RATE = 2600;

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "TZS", label: "TZS" },
  { value: "USD", label: "USD" }
];

export const LANGUAGES: { value: Language; label: string; short: string }[] = [
  { value: "sw", label: "Kiswahili", short: "SW" },
  { value: "en", label: "English", short: "EN" }
];

/** Builds an optimised Unsplash URL. All photos are used under the Unsplash License. */
export const photo = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=70`;

export const CATEGORIES: {
  value: Category;
  label: string;
  swLabel: string;
  image: string;
}[] = [
  { value: "Women", label: "Women", swLabel: "Wanawake", image: photo("1531123414780-f74242c2b052", 400) },
  { value: "Men", label: "Men", swLabel: "Wanaume", image: photo("1556452576-3e2d58536f62", 400) },
  { value: "Dresses", label: "Dresses", swLabel: "Magauni", image: photo("1709809081557-78f803ce93a0", 400) },
  { value: "Crop Tops", label: "Tops", swLabel: "Blauzi", image: photo("1708170236215-b6edcad7f49a", 400) },
  { value: "Shoes", label: "Shoes", swLabel: "Viatu", image: photo("1676984030434-23f76c2d0e56", 400) },
  { value: "Bags", label: "Bags", swLabel: "Mikoba", image: photo("1625646741211-711bdd65c570", 400) },
  { value: "Accessories", label: "Accessories", swLabel: "Mapambo", image: photo("1760726743536-019e9e2b06b8", 400) },
  { value: "Swimwear", label: "Beachwear", swLabel: "Mavazi ya Pwani", image: photo("1745304598502-07177a76ad8c", 400) }
];

export function categoryLabel(value: string, language: Language) {
  const match = CATEGORIES.find((item) => item.value === value) ??
    SHOP_CATEGORIES.find((item) => item.value === value);
  if (!match) return value;
  return language === "sw" ? match.swLabel : match.label;
}

/** Business types a seller can register. Includes every product category so older applications stay valid. */
export const SHOP_CATEGORIES: { value: string; label: string; swLabel: string }[] = [
  ...CATEGORIES.map(({ value, label, swLabel }) => ({ value, label, swLabel })),
  { value: "Fabrics", label: "Kitenge & fabrics", swLabel: "Vitenge na vitambaa" },
  { value: "Tailoring", label: "Tailoring", swLabel: "Ushonaji" },
  { value: "Kids", label: "Kids' clothing", swLabel: "Nguo za watoto" },
  { value: "Beauty", label: "Beauty & cosmetics", swLabel: "Urembo na vipodozi" },
  { value: "Other", label: "Other", swLabel: "Nyingine" }
];

export const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "One Size"
];

export const BRANDS = ["TRENDORA", "Zuri Wear", "Kijani Studio", "Urban Thread"];

export type Region = {
  id: string;
  name: string;
  fee: number;
  eta: [number, number];
  /** Kept only so older orders and shops still resolve; not offered in forms. */
  legacy?: boolean;
};

const zone = (name: string, fee: number, eta: [number, number]): Region => ({
  id: name.toLowerCase().replace(/[^a-z]+/g, "-"),
  name,
  fee,
  eta
});

/**
 * All 31 regions of Tanzania. Delivery fees keep the store's existing pricing:
 * regions that had their own price keep it, every other region uses the former
 * "other region" price (TZS 15,000).
 */
export const REGIONS: Region[] = [
  zone("Dar es Salaam", 7000, [1, 2]),
  zone("Arusha", 10000, [2, 4]),
  zone("Dodoma", 10000, [2, 4]),
  zone("Geita", 15000, [3, 6]),
  zone("Iringa", 15000, [3, 6]),
  zone("Kagera", 15000, [3, 6]),
  zone("Katavi", 15000, [3, 6]),
  zone("Kigoma", 15000, [3, 6]),
  zone("Kilimanjaro", 15000, [3, 6]),
  zone("Lindi", 15000, [3, 6]),
  zone("Manyara", 15000, [3, 6]),
  zone("Mara", 15000, [3, 6]),
  zone("Mbeya", 13000, [3, 5]),
  zone("Morogoro", 9000, [2, 3]),
  zone("Mtwara", 15000, [3, 6]),
  zone("Mwanza", 12000, [3, 5]),
  zone("Njombe", 15000, [3, 6]),
  zone("Pwani", 15000, [3, 6]),
  zone("Rukwa", 15000, [3, 6]),
  zone("Ruvuma", 15000, [3, 6]),
  zone("Shinyanga", 15000, [3, 6]),
  zone("Simiyu", 15000, [3, 6]),
  zone("Singida", 15000, [3, 6]),
  zone("Songwe", 15000, [3, 6]),
  zone("Tabora", 15000, [3, 6]),
  zone("Tanga", 11000, [2, 4]),
  zone("Kaskazini Unguja", 12000, [2, 4]),
  zone("Kusini Unguja", 12000, [2, 4]),
  zone("Mjini Magharibi", 12000, [2, 4]),
  zone("Kaskazini Pemba", 12000, [2, 4]),
  zone("Kusini Pemba", 12000, [2, 4]),
  { ...zone("Zanzibar", 12000, [2, 4]), legacy: true },
  { ...zone("Other region in Tanzania", 15000, [3, 6]), legacy: true }
];

export const SELECTABLE_REGIONS = REGIONS.filter((region) => !region.legacy);

export function findRegion(name: string) {
  return REGIONS.find((region) => region.name === name);
}

export function formatEta(eta: [number, number], language: Language) {
  return language === "sw" ? `siku ${eta[0]} – ${eta[1]}` : `${eta[0]} – ${eta[1]} days`;
}

export const INTERNATIONAL_SHIPPING_FEE = 35000;

export const COUNTRIES = [
  { value: "Tanzania", label: "Tanzania", dial: "+255" },
  { value: "Kenya", label: "Kenya", dial: "+254" },
  { value: "Uganda", label: "Uganda", dial: "+256" },
  { value: "Rwanda", label: "Rwanda", dial: "+250" },
  { value: "Burundi", label: "Burundi", dial: "+257" },
  { value: "Zambia", label: "Zambia", dial: "+260" },
  { value: "Malawi", label: "Malawi", dial: "+265" }
];

export const PAYMENT_METHODS: {
  id: string;
  label: { en: string; sw: string };
  description: { en: string; sw: string };
  available: boolean;
}[] = [
  {
    id: "cod",
    label: { en: "Cash on delivery", sw: "Lipa ukipokea" },
    description: {
      en: "Pay in cash when your order is delivered.",
      sw: "Lipa pesa taslimu mzigo wako ukifika."
    },
    available: true
  },
  {
    id: "mpesa",
    label: { en: "M-Pesa", sw: "M-Pesa" },
    description: { en: "Coming soon.", sw: "Inakuja hivi karibuni." },
    available: false
  },
  {
    id: "mixx",
    label: { en: "Mixx by Yas", sw: "Mixx by Yas" },
    description: { en: "Coming soon.", sw: "Inakuja hivi karibuni." },
    available: false
  },
  {
    id: "airtel",
    label: { en: "Airtel Money", sw: "Airtel Money" },
    description: { en: "Coming soon.", sw: "Inakuja hivi karibuni." },
    available: false
  },
  {
    id: "test",
    label: { en: "Test payment", sw: "Malipo ya majaribio" },
    description: {
      en: "Development only. No real money is charged.",
      sw: "Kwa majaribio tu. Hakuna pesa halisi inayokatwa."
    },
    available: process.env.NODE_ENV !== "production"
  }
];

export const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled"
] as const;

export const ORDER_STATUS_LABELS: Record<(typeof ORDER_STATUSES)[number], { en: string; sw: string }> = {
  pending: { en: "Received", sw: "Imepokelewa" },
  processing: { en: "Being prepared", sw: "Inaandaliwa" },
  shipped: { en: "On the way", sw: "Iko njiani" },
  completed: { en: "Delivered", sw: "Imefika" },
  cancelled: { en: "Cancelled", sw: "Imesitishwa" }
};

export const SHOP_STATUS_LABELS: Record<string, { en: string; sw: string }> = {
  PENDING_PAYMENT: { en: "Awaiting payment", sw: "Inasubiri malipo" },
  PAYMENT_PROCESSING: { en: "Payment being checked", sw: "Malipo yanahakikiwa" },
  PENDING_APPROVAL: { en: "Pending approval", sw: "Inasubiri uthibitisho" },
  ACTIVE: { en: "Active", sw: "Duka liko hewani" },
  REJECTED: { en: "Rejected", sw: "Ombi limekataliwa" },
  SUSPENDED: { en: "Suspended", sw: "Limesimamishwa" },
  EXPIRED: { en: "Expired", sw: "Muda umeisha" }
};

export const IMAGES = {
  shopkeeper: photo("1687422808311-a776f467a468", 1600),
  tailor: photo("1687422809069-0fa3546b8471", 1600),
  stoneTown: photo("1695643875095-f5620748605d", 1400),
  sewing: photo("1790943780822-9918073fe9f1", 1200),
  vendorPhone: photo("1687422809654-579d81c29d32", 1200),
  market: photo("1672079806571-fd202b42d22a", 1400),
  baskets: photo("1776409933815-3497439f829a", 1200),
  darAerial: photo("1589177900326-900782f88a55", 1600),
  headwrap: photo("1614291129408-3dd5436942e6", 1200),
  fabrics: photo("1768212565426-58b089b6386d", 1200),
  beach: photo("1745304598502-07177a76ad8c", 1200),
  menStyle: photo("1764593008195-87ca871d72bd", 1200),
  beads: photo("1760726743536-019e9e2b06b8", 1200),
  // Home page hero slides: clothing for sale.
  heroBoutique: photo("1567401893414-76b7b1e5a7a5", 1600),
  heroFabrics: photo("1768212565426-58b089b6386d", 1600)
};

export const HERO_SLIDES = [
  {
    eyebrowKey: "hero.eyebrow",
    titleKey: "hero.title",
    subKey: "hero.sub",
    image: IMAGES.heroBoutique,
    position: "object-[center_40%]"
  },
  {
    eyebrowKey: "hero.eyebrow2",
    titleKey: "hero.title2",
    subKey: "hero.sub2",
    image: IMAGES.tailor,
    position: "object-[center_35%]"
  },
  {
    eyebrowKey: "hero.eyebrow3",
    titleKey: "hero.title3",
    subKey: "hero.sub3",
    image: IMAGES.heroFabrics,
    position: "object-[center_50%]"
  }
] as const;
