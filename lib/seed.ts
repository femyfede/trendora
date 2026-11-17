import type { Database, Product, User, Review, ShopApplication, Shop, PaymentRecord } from "./types";
import { randomBytes } from "crypto";
import { hashPassword } from "./auth";

// Seeded accounts get an unguessable random password so nobody can sign in with
// credentials published in source control. Reset them from the admin side if needed.
const lockedPassword = () => hashPassword(randomBytes(24).toString("hex"));

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const C = {
  teal: { name: "Teal", hex: "#0E5F6D" },
  white: { name: "Ivory", hex: "#F2EFE8" },
  black: { name: "Black", hex: "#141414" },
  blush: { name: "Blush", hex: "#E5B7AE" },
  sand: { name: "Sand", hex: "#D8C6AF" },
  sky: { name: "Sky", hex: "#AFC8DC" },
  olive: { name: "Olive", hex: "#6E7357" },
  rose: { name: "Rose", hex: "#C98A93" },
  blue: { name: "Denim Blue", hex: "#53718C" },
  gold: { name: "Gold", hex: "#C7A86B" }
};

const product = (p: Product) => p;

const products: Product[] = [
  product({
    id: "p-wrap-top",
    slug: "ribbed-wrap-top",
    name: "Ribbed Wrap Top",
    category: "Crop Tops",
    brand: "TRENDORA",
    description:
      "A soft ribbed wrap top with a flattering V neckline and a tie waist. Designed to move with you, it pairs effortlessly with high-waist denim or our pleated trousers.",
    material: "72% cotton, 25% recycled polyester, 3% elastane",
    details: [
      "Slim, comfortable stretch rib",
      "Adjustable self-tie waist",
      "Model is 173cm and wears size S",
      "Machine wash cold, dry flat"
    ],
    price: 78000,
    compareAtPrice: 95000,
    images: [u("photo-1525507119028-ed4c629a60a3"), u("photo-1515886657613-9f3515b0c78f")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.rose, C.white, C.teal],
    rating: 4.6,
    reviewCount: 328,
    sold: 1240,
    stock: 12,
    isNew: false,
    isBestSeller: true,
    isActive: true,
    createdAt: "2026-06-10T09:00:00.000Z"
  }),
  product({
    id: "p-baby-tee",
    slug: "fitted-baby-tee",
    name: "Fitted Baby Tee",
    category: "Crop Tops",
    brand: "TRENDORA",
    description:
      "The everyday fitted tee, cut a little shorter and a little closer. A clean neckline and smooth cotton jersey make it the perfect layering piece for every season.",
    material: "100% combed cotton jersey, 220gsm",
    details: [
      "Cropped, fitted silhouette",
      "Reinforced neckline",
      "Model is 170cm and wears size S",
      "Machine wash cold with like colours"
    ],
    price: 52000,
    compareAtPrice: 65000,
    images: [u("photo-1521572163474-6864f9cf17ab"), u("photo-1554568218-0f1715e72254")],
    sizes: ["XS", "S", "M", "L"],
    colors: [C.sky, C.white, C.black],
    rating: 4.8,
    reviewCount: 94,
    sold: 980,
    stock: 24,
    isNew: false,
    isBestSeller: true,
    isActive: true,
    createdAt: "2026-07-02T09:00:00.000Z"
  }),
  product({
    id: "p-cargo-shorts",
    slug: "utility-cargo-shorts",
    name: "Utility Cargo Shorts",
    category: "Women",
    brand: "TRENDORA",
    description:
      "Relaxed utility shorts with roomy pockets and a drawcord waist. Built for city days and weekend escapes in equal measure.",
    material: "98% cotton twill, 2% elastane",
    details: [
      "Relaxed mid-thigh fit",
      "Six functional pockets",
      "Adjustable drawcord waist",
      "Machine wash cold"
    ],
    price: 91000,
    compareAtPrice: null,
    images: [u("photo-1591195853828-11db59a44f6b"), u("photo-1584370848010-d7fe6bc767ec")],
    sizes: ["S", "M", "L", "XL"],
    colors: [C.olive, C.sand, C.black],
    rating: 4.7,
    reviewCount: 76,
    sold: 860,
    stock: 8,
    isNew: false,
    isBestSeller: true,
    isActive: true,
    createdAt: "2026-06-21T09:00:00.000Z"
  }),
  product({
    id: "p-oversized-sweatshirt",
    slug: "oversized-sweatshirt",
    name: "Oversized Sweatshirt",
    category: "Women",
    brand: "TRENDORA",
    description:
      "An ultra-soft brushed sweatshirt with dropped shoulders and a relaxed body. The kind of piece you reach for on repeat.",
    material: "80% cotton, 20% recycled polyester fleece",
    details: [
      "Oversized unisex fit",
      "Brushed inner fleece",
      "Ribbed cuffs and hem",
      "Machine wash cold, tumble dry low"
    ],
    price: 70000,
    compareAtPrice: null,
    images: [u("photo-1556821840-3a63f95609a7"), u("photo-1620799140408-edc6dcb6d633")],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [C.sky, C.white, C.teal],
    rating: 4.5,
    reviewCount: 112,
    sold: 790,
    stock: 15,
    isNew: false,
    isBestSeller: true,
    isActive: true,
    createdAt: "2026-05-18T09:00:00.000Z"
  }),
  product({
    id: "p-slip-dress",
    slug: "satin-slip-dress",
    name: "Satin Slip Dress",
    category: "Dresses",
    brand: "Zuri Wear",
    description:
      "A bias-cut satin slip dress that skims the body beautifully. Delicate adjustable straps and a fluid drape make it a go-to for dinners and celebrations.",
    material: "100% recycled satin polyester",
    details: [
      "Bias cut for a fluid drape",
      "Adjustable spaghetti straps",
      "Midi length, fully lined",
      "Hand wash cold or dry clean"
    ],
    price: 120000,
    compareAtPrice: 150000,
    images: [u("photo-1595777457583-95e059d581b8"), u("photo-1566174053879-31528523f8ae")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.teal, C.black, C.blush],
    rating: 4.9,
    reviewCount: 184,
    sold: 720,
    stock: 6,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-10-14T09:00:00.000Z"
  }),
  product({
    id: "p-linen-dress",
    slug: "linen-midi-dress",
    name: "Linen Midi Dress",
    category: "Dresses",
    brand: "Zuri Wear",
    description:
      "Breezy linen-blend midi with a softly cinched waist and side split. Made for warm afternoons and long lunches.",
    material: "55% linen, 45% cotton",
    details: [
      "Side split hem",
      "Removable fabric belt",
      "Side pockets",
      "Gentle machine wash, line dry"
    ],
    price: 135000,
    compareAtPrice: null,
    images: [u("photo-1594633312681-425c7b97ccd1"), u("photo-1572804013309-59a88b7e92f1")],
    sizes: ["XS", "S", "M", "L"],
    colors: [C.sand, C.white, C.olive],
    rating: 4.7,
    reviewCount: 64,
    sold: 430,
    stock: 9,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-09-28T09:00:00.000Z"
  }),
  product({
    id: "p-bikini-set",
    slug: "cabana-bikini-set",
    name: "Cabana Bikini Set",
    category: "Swimwear",
    brand: "Zuri Wear",
    description:
      "A flattering two-piece set with adjustable ties and medium coverage. Made with a smooth, quick-drying fabric for beach days and poolside afternoons.",
    material: "82% recycled nylon, 18% elastane",
    details: [
      "Adjustable triangle top",
      "Medium-coverage bottoms",
      "Quick-dry, chlorine-resistant fabric",
      "Rinse after wear, dry in shade"
    ],
    price: 85000,
    compareAtPrice: 105000,
    images: [u("photo-1608042314453-ae338d80c427"), u("photo-1560090995-01632a28895b")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.teal, C.black, C.rose],
    rating: 4.4,
    reviewCount: 52,
    sold: 310,
    stock: 14,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-10-06T09:00:00.000Z"
  }),
  product({
    id: "p-onepiece",
    slug: "seaside-one-piece",
    name: "Seaside One-Piece",
    category: "Swimwear",
    brand: "Zuri Wear",
    description:
      "A sculpting one-piece with a scoop back and supportive straps. Understated, comfortable and made to last season after season.",
    material: "78% recycled polyamide, 22% elastane",
    details: [
      "Removable soft cups",
      "Medium leg, scoop back",
      "UPF 50+ fabric",
      "Rinse after wear, dry in shade"
    ],
    price: 95000,
    compareAtPrice: null,
    images: [u("photo-1570976447640-ac859083963f"), u("photo-1589739900266-43b2843f4c12")],
    sizes: ["XS", "S", "M", "L"],
    colors: [C.black, C.sand, C.teal],
    rating: 4.6,
    reviewCount: 38,
    sold: 260,
    stock: 0,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-10-16T09:00:00.000Z"
  }),
  product({
    id: "p-heels",
    slug: "strappy-block-heels",
    name: "Strappy Block Heels",
    category: "Shoes",
    brand: "Kijani Studio",
    description:
      "An elegant strappy sandal set on a stable block heel. The padded footbed keeps you comfortable from first look to last dance.",
    material: "Vegan leather upper, rubber sole",
    details: [
      "7cm block heel",
      "Cushioned footbed",
      "Adjustable ankle strap",
      "True to size"
    ],
    price: 110000,
    compareAtPrice: null,
    images: [u("photo-1543163521-1bf539c55dd2"), u("photo-1533867617858-e7b97e060509")],
    sizes: ["36", "37", "38", "39", "40", "41"],
    colors: [C.black, C.sand],
    rating: 4.7,
    reviewCount: 91,
    sold: 540,
    stock: 5,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-08-11T09:00:00.000Z"
  }),
  product({
    id: "p-sneakers",
    slug: "cloud-chunky-sneakers",
    name: "Cloud Chunky Sneakers",
    category: "Shoes",
    brand: "Urban Thread",
    description:
      "A modern chunky sneaker with a lightweight sole and breathable knit upper. Easy to style, easy to wear all day.",
    material: "Recycled knit upper, EVA sole",
    details: [
      "Lightweight EVA midsole",
      "Padded collar and tongue",
      "Removable insole",
      "Order your usual size"
    ],
    price: 145000,
    compareAtPrice: 175000,
    images: [u("photo-1560343090-f0409e92791a"), u("photo-1595950653106-6c9ebd614d3a")],
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: [C.white, C.black, C.olive],
    rating: 4.8,
    reviewCount: 210,
    sold: 890,
    stock: 18,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-07-19T09:00:00.000Z"
  }),
  product({
    id: "p-tote",
    slug: "everyday-leather-tote",
    name: "Everyday Leather Tote",
    category: "Bags",
    brand: "Kijani Studio",
    description:
      "A generously sized tote in supple vegan leather, with an internal zip pocket and magnetic closure. Your new everyday carry-all.",
    material: "Premium vegan leather, cotton lining",
    details: [
      "Fits a 14-inch laptop",
      "Internal zip pocket",
      "Magnetic top closure",
      "Wipe clean with a soft cloth"
    ],
    price: 130000,
    compareAtPrice: null,
    images: [u("photo-1584917865442-de89df76afd3"), u("photo-1548036328-c9fa89d128fa")],
    sizes: ["One Size"],
    colors: [C.sand, C.black, C.teal],
    rating: 4.9,
    reviewCount: 143,
    sold: 610,
    stock: 7,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-08-26T09:00:00.000Z"
  }),
  product({
    id: "p-crossbody",
    slug: "mini-crossbody-bag",
    name: "Mini Crossbody Bag",
    category: "Bags",
    brand: "Kijani Studio",
    description:
      "A compact crossbody with just enough room for the essentials. Adjustable strap and a clean, structured shape.",
    material: "Vegan leather, recycled polyester lining",
    details: [
      "Adjustable shoulder strap",
      "Zip top closure",
      "One internal slip pocket",
      "Wipe clean only"
    ],
    price: 89000,
    compareAtPrice: null,
    images: [u("photo-1590874103328-eac38a683ce7"), u("photo-1566150905458-1bf1fc113f0d")],
    sizes: ["One Size"],
    colors: [C.black, C.blush, C.sand],
    rating: 4.5,
    reviewCount: 67,
    sold: 390,
    stock: 21,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-09-12T09:00:00.000Z"
  }),
  product({
    id: "p-earrings",
    slug: "gold-hoop-earrings",
    name: "Gold Hoop Earrings",
    category: "Accessories",
    brand: "Kijani Studio",
    description:
      "Classic gold-tone hoops with a lightweight, everyday feel. Nickel-free and designed to be worn on repeat.",
    material: "18k gold-plated brass, nickel free",
    details: [
      "35mm diameter",
      "Lightweight hollow construction",
      "Butterfly closure",
      "Keep away from water and perfume"
    ],
    price: 35000,
    compareAtPrice: null,
    images: [u("photo-1535632066927-ab7c9ab60908"), u("photo-1611652022419-a9419f74343d")],
    sizes: ["One Size"],
    colors: [C.gold],
    rating: 4.8,
    reviewCount: 205,
    sold: 950,
    stock: 32,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-07-30T09:00:00.000Z"
  }),
  product({
    id: "p-sunglasses",
    slug: "retro-round-sunglasses",
    name: "Retro Round Sunglasses",
    category: "Accessories",
    brand: "Kijani Studio",
    description:
      "Slim round frames with tinted lenses and UV400 protection. A subtle statement for sunny days in the city or by the coast.",
    material: "Acetate frame, UV400 lenses",
    details: [
      "UV400 protection",
      "Includes soft protective pouch",
      "Unisex fit",
      "Clean with the included cloth"
    ],
    price: 42000,
    compareAtPrice: 55000,
    images: [u("photo-1572635196237-14b3f281503f"), u("photo-1511499767150-a48a237f0083")],
    sizes: ["One Size"],
    colors: [C.black, C.sand],
    rating: 4.3,
    reviewCount: 48,
    sold: 280,
    stock: 16,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-09-03T09:00:00.000Z"
  }),
  product({
    id: "p-men-tee",
    slug: "essential-cotton-tee",
    name: "Essential Cotton Tee",
    category: "Men",
    brand: "TRENDORA",
    description:
      "A clean, heavyweight cotton tee with a modern relaxed fit. The foundation of a well-edited wardrobe.",
    material: "100% organic cotton, 240gsm",
    details: [
      "Relaxed fit",
      "Ribbed crew neckline",
      "Pre-shrunk fabric",
      "Machine wash cold"
    ],
    price: 45000,
    compareAtPrice: null,
    images: [u("photo-1523381210434-271e8be1f52b"), u("photo-1583743814966-8936f5b7be1a")],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [C.white, C.black, C.olive],
    rating: 4.6,
    reviewCount: 302,
    sold: 1420,
    stock: 40,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-06-30T09:00:00.000Z"
  }),
  product({
    id: "p-chinos",
    slug: "relaxed-chino-trousers",
    name: "Relaxed Chino Trousers",
    category: "Men",
    brand: "Urban Thread",
    description:
      "Smart-casual chinos with a relaxed straight leg and a comfortable mid rise. Dressed up or down with ease.",
    material: "97% cotton, 3% elastane",
    details: [
      "Straight relaxed leg",
      "Four-pocket styling",
      "Zip fly with button closure",
      "Machine wash cold"
    ],
    price: 98000,
    compareAtPrice: null,
    images: [u("photo-1542272604-787c3835535d"), u("photo-1591195853828-11db59a44f6b")],
    sizes: ["S", "M", "L", "XL"],
    colors: [C.sand, C.olive, C.black],
    rating: 4.5,
    reviewCount: 71,
    sold: 410,
    stock: 11,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-08-05T09:00:00.000Z"
  }),
  product({
    id: "p-hoodie",
    slug: "heavyweight-hoodie",
    name: "Heavyweight Hoodie",
    category: "Men",
    brand: "Urban Thread",
    description:
      "A substantial fleece hoodie with a double-lined hood and a boxy fit. Warm without the bulk.",
    material: "100% cotton fleece, 400gsm",
    details: [
      "Boxy oversized fit",
      "Double-lined hood",
      "Kangaroo pocket",
      "Machine wash cold, dry flat"
    ],
    price: 115000,
    compareAtPrice: null,
    images: [u("photo-1578681994506-b8f463449011"), u("photo-1620799140408-edc6dcb6d633")],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [C.black, C.olive, C.sand],
    rating: 4.8,
    reviewCount: 158,
    sold: 520,
    stock: 13,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-10-11T09:00:00.000Z"
  }),
  product({
    id: "p-denim-jacket",
    slug: "denim-trucker-jacket",
    name: "Denim Trucker Jacket",
    category: "Men",
    brand: "Urban Thread",
    description:
      "A timeless trucker jacket in a mid-wash denim. Rigid enough to hold its shape, soft enough to wear from day one.",
    material: "100% cotton denim",
    details: [
      "Classic trucker fit",
      "Chest flap pockets",
      "Adjustable waist tabs",
      "Machine wash cold, inside out"
    ],
    price: 160000,
    compareAtPrice: 190000,
    images: [u("photo-1544022613-e87ca75a784a"), u("photo-1551028719-00167b16eac5")],
    sizes: ["S", "M", "L", "XL"],
    colors: [C.blue, C.black],
    rating: 4.7,
    reviewCount: 89,
    sold: 340,
    stock: 4,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-10-18T09:00:00.000Z"
  }),
  product({
    id: "p-trousers",
    slug: "pleated-wide-leg-trousers",
    name: "Pleated Wide-Leg Trousers",
    category: "Women",
    brand: "TRENDORA",
    description:
      "Tailored wide-leg trousers with a front pleat and a flattering high waist. Polished enough for work, easy enough for the weekend.",
    material: "68% recycled polyester, 30% viscose, 2% elastane",
    details: [
      "High-rise, wide leg",
      "Front pleats",
      "Side pockets",
      "Machine wash cold, hang dry"
    ],
    price: 105000,
    compareAtPrice: null,
    images: [u("photo-1591369822096-ffd140ec948f"), u("photo-1506629082955-511b1aa562c8")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.black, C.sand, C.teal],
    rating: 4.6,
    reviewCount: 57,
    sold: 360,
    stock: 10,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-09-22T09:00:00.000Z"
  }),
  product({
    id: "p-cardigan",
    slug: "knit-button-cardigan",
    name: "Knit Button Cardigan",
    category: "Women",
    brand: "TRENDORA",
    description:
      "A softly structured knit cardigan with tonal buttons. Layer it over a baby tee or wear it buttoned as a top.",
    material: "50% cotton, 30% viscose, 20% nylon",
    details: [
      "Relaxed fit",
      "Tonal corozo buttons",
      "Ribbed trims",
      "Hand wash cold, dry flat"
    ],
    price: 95000,
    compareAtPrice: null,
    images: [u("photo-1434389677669-e08b4cac3105"), u("photo-1525507119028-ed4c629a60a3")],
    sizes: ["XS", "S", "M", "L"],
    colors: [C.blush, C.sand, C.teal],
    rating: 4.4,
    reviewCount: 41,
    sold: 240,
    stock: 7,
    isNew: false,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-09-15T09:00:00.000Z"
  }),
  product({
    id: "p-poplin-shirt",
    slug: "poplin-oversized-shirt",
    name: "Poplin Oversized Shirt",
    category: "Women",
    brand: "TRENDORA",
    description:
      "Crisp cotton poplin cut in an oversized silhouette, with a curved hem and dropped shoulders. Wear it buttoned, open or knotted.",
    material: "100% cotton poplin",
    details: [
      "Oversized fit",
      "Curved hem",
      "Dropped shoulders",
      "Machine wash cold, warm iron"
    ],
    price: 88000,
    compareAtPrice: null,
    images: [u("photo-1485968579580-b6d095142e6e"), u("photo-1551488831-00ddcb6c6bd3")],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [C.white, C.sky, C.teal],
    rating: 4.7,
    reviewCount: 73,
    sold: 300,
    stock: 12,
    isNew: true,
    isBestSeller: false,
    isActive: true,
    createdAt: "2026-10-20T09:00:00.000Z"
  })
];

export const seedDatabase = (): Database => ({
  products,
  orders: [],
  discounts: [
    {
      code: "TREND10",
      percent: 10,
      freeShipping: false,
      active: true,
      description: "10% off your order"
    },
    {
      code: "WELCOME15",
      percent: 15,
      freeShipping: false,
      active: true,
      description: "15% off for new customers"
    },
    {
      code: "FREESHIP",
      percent: 0,
      freeShipping: true,
      active: true,
      description: "Free delivery on any order"
    },
    {
      code: "SUMMER20",
      percent: 20,
      freeShipping: false,
      active: false,
      description: "Expired summer campaign"
    }
  ],
  users: [
    {
      id: "user-admin",
      name: "Admin User",
      email: "admin@trendora.co.tz",
      passwordHash: lockedPassword(),
      role: "admin",
      isActive: true,
      lastLoginAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    {
      id: "user-manager",
      name: "Store Manager",
      email: "manager@trendora.co.tz",
      passwordHash: lockedPassword(),
      role: "manager",
      isActive: true,
      lastLoginAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    {
      id: "user-demo",
      name: "Demo Customer",
      email: "demo@trendora.co.tz",
      passwordHash: lockedPassword(),
      role: "customer",
      isActive: true,
      lastLoginAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ] as User[],
  reviews: [
    {
      id: "rev-1",
      productId: "p-wrap-top",
      userId: "user-demo",
      userName: "Demo Customer",
      rating: 5,
      title: "Love this top!",
      comment: "Perfect fit, great quality. Will definitely buy more.",
      verified: true,
      createdAt: "2026-10-15T10:00:00.000Z"
    },
    {
      id: "rev-2",
      productId: "p-wrap-top",
      userId: "user-demo",
      userName: "Demo Customer",
      rating: 4,
      title: "Good but runs small",
      comment: "Nice material but order a size up.",
      verified: true,
      createdAt: "2026-10-10T14:30:00.000Z"
    },
    {
      id: "rev-3",
      productId: "p-baby-tee",
      userId: "user-demo",
      userName: "Demo Customer",
      rating: 5,
      title: "Best basic tee",
      comment: "Soft, fits well, washes perfectly. My new go-to.",
      verified: true,
      createdAt: "2026-10-05T09:15:00.000Z"
    }
  ] as Review[],
  subscribers: [],
  messages: [],
  shopApplications: [] as ShopApplication[],
  shops: [] as Shop[],
  payments: [] as PaymentRecord[],
  settings: {
    shopRegistrationFeeTzs: null,
    shopPaymentInstructions: ""
  }
});