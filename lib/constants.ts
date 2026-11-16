import type { Category, Currency, Language } from "./types";

export const SITE = {
  name: "TRENDORA",
  tagline: "Modern fashion, made for you.",
  phone: "+255 712 345 678",
  phoneHref: "+255712345678",
  whatsapp: "+255 712 345 678",
  email: "hello@trendora.co.tz",
  address: "Msasani Peninsula, Dar es Salaam, Tanzania",
  hours: "Mon – Sat, 9:00 – 19:00 EAT"
};

export const FREE_SHIPPING_THRESHOLD = 150000;
export const USD_RATE = 2600;

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: "TZS", label: "TZS Shilling" },
  { value: "USD", label: "USD Dollar" }
];

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "sw", label: "Kiswahili" },
  { value: "en", label: "English" }
];

export const CATEGORIES: {
  value: Category;
  label: string;
  swLabel: string;
  image: string;
}[] = [
  {
    value: "Women",
    label: "Nguo za Wanawake",
    swLabel: "Nguo za Wanawake",
    image:
      "https://images.unsplash.com/photo-1575206383204-ba39a1b8cbe5?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Men",
    label: "Nguo za Wanaume",
    swLabel: "Nguo za Wanaume",
    image:
      "https://images.unsplash.com/photo-1507473885790-e6c9a6a02f5b?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Crop Tops",
    label: "Kropi Tops",
    swLabel: "Vipande vya kuongeza",
    image:
      "https://images.unsplash.com/photo-1520417593131-1c1b9a07c0ba?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Dresses",
    label: "Magauni",
    swLabel: "Magauni",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Swimwear",
    label: "Nguo za Kuogelea",
    swLabel: "Vifaa vya samaki",
    image:
      "https://images.unsplash.com/photo-1606107557195-30543607dbf5?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Shoes",
    label: "Viatu",
    swLabel: "Viatu",
    image:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Accessories",
    label: "Vifaa vya Kipekee",
    swLabel: "Vifaa vya kujibu hisa",
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80"
  },
  {
    value: "Bags",
    label: "Mikoba",
    swLabel: "Mikoba",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"
  }
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

export const REGIONS: {
  id: string;
  name: string;
  fee: number;
  eta: string;
}[] = [
  { id: "dar-es-salaam", name: "Dar es Salaam", fee: 7000, eta: "1 – 2 days" },
  { id: "arusha", name: "Arusha", fee: 10000, eta: "2 – 4 days" },
  { id: "dodoma", name: "Dodoma", fee: 10000, eta: "2 – 4 days" },
  { id: "mwanza", name: "Mwanza", fee: 12000, eta: "3 – 5 days" },
  { id: "mbeya", name: "Mbeya", fee: 13000, eta: "3 – 5 days" },
  { id: "tanga", name: "Tanga", fee: 11000, eta: "2 – 4 days" },
  { id: "morogoro", name: "Morogoro", fee: 9000, eta: "2 – 3 days" },
  { id: "zanzibar", name: "Zanzibar", fee: 12000, eta: "2 – 4 days" },
  { id: "other-tz", name: "Other region in Tanzania", fee: 15000, eta: "3 – 6 days" }
];

export const COUNTRIES = [
  { value: "Tanzania", label: "Tanzania", dial: "+255" },
  { value: "Kenya", label: "Kenya", dial: "+254" },
  { value: "Uganda", label: "Uganda", dial: "+256" },
  { value: "Rwanda", label: "Rwanda", dial: "+250" },
  { value: "Burundi", label: "Burundi", dial: "+257" },
  { value: "Zambia", label: "Zambia", dial: "+260" },
  { value: "Malawi", label: "Malawi", dial: "+265" }
];

export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order is delivered.",
    available: true
  },
  {
    id: "mpesa",
    label: "M-Pesa",
    description: "Mobile money — integration pending, not active yet.",
    available: false
  },
  {
    id: "mixx",
    label: "Mixx by Yas",
    description: "Mobile money — integration pending, not active yet.",
    available: false
  },
  {
    id: "airtel",
    label: "Airtel Money",
    description: "Mobile money — integration pending, not active yet.",
    available: false
  },
  {
    id: "test",
    label: "Demo test payment",
    description: "Sandbox mode for testing checkout. No real charge is made.",
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

export const HERO_SLIDES = [
  {
    eyebrowKey: "hero.eyebrow",
    titleKey: "hero.title",
    subKey: "hero.sub",
    image:
      "https://images.unsplash.com/photo-1575206383204-ba39a1b8cbe5?auto=format&fit=crop&w=1400&q=85",
    noteKey: "hero.note"
  },
  {
    eyebrowKey: "hero.eyebrow2",
    titleKey: "hero.title2",
    subKey: "hero.sub2",
    image:
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=85",
    noteKey: "hero.note2"
  },
  {
    eyebrowKey: "hero.eyebrow3",
    titleKey: "hero.title3",
    subKey: "hero.sub3",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=85",
    noteKey: "hero.note3"
  }
];