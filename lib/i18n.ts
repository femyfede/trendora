import type { Language } from "./types";

const dict = {
  "nav.home": ["Home", "Nyumbani"],
  "nav.shop": ["Shop", "Duka"],
  "nav.shops": ["Marketplace shops", "Maduka"],
  "nav.men": ["Men", "Wanaume"],
  "nav.women": ["Women", "Wanawake"],
  "nav.new": ["New Arrivals", "Mpya"],
  "nav.collections": ["Collections", "Mikusanyiko"],
  "nav.contact": ["Contact", "Wasiliana"],
  "announce.support": ["Customer support", "Huduma kwa wateja"],
  "announce.promo": [
    "Free delivery on orders over TZS 150,000 — don't miss this chance.",
    "Usafirishaji bure kwa oda zaidi ya TZS 150,000 — usikose nafasi hii."
  ],
  "hero.eyebrow": ["New season. New style.", "Msimu mpya. Mtindo mpya."],
  "hero.title": ["Dress Smart,\nLook Trendy.", "Vaa kwa Akili,\nOnekane wa Kisasa."],
  "hero.sub": [
    "Discover your style with our latest fashion collections.",
    "Gundua mtindo wako na mikusanyiko yetu ya hivi karibuni."
  ],
  "hero.note": ["Up to 30% off selected styles.", "Punguzo hadi 30% kwa mitindo teule."],
  "hero.eyebrow2": ["The everyday edit", "Mkusanyiko wa kila siku"],
  "hero.title2": ["Easy Pieces,\nEndless Looks.", "Vipande Rahisi,\nMitindo Bila Mwisho."],
  "hero.sub2": [
    "Build a wardrobe that works as hard as you do.",
    "Jenga vazia linalokufaa kila siku."
  ],
  "hero.note2": ["New basics, made to layer.", "Mavazi mapya ya msingi, kwa tabaka."],
  "hero.eyebrow3": ["Made for Tanzania", "Imetengenezwa kwa Tanzania"],
  "hero.title3": ["Local Style,\nGlobal Energy.", "Mtindo wa Nyumbani,\nNguvu ya Kimataifa."],
  "hero.sub3": [
    "Considered fashion, delivered across Tanzania.",
    "Mitindo teule, inawasilishwa kote Tanzania."
  ],
  "hero.note3": ["Delivery from Dar es Salaam to Zanzibar.", "Uwasilishaji kutoka Dar es Salaam hadi Zanzibar."],
  "hero.cta": ["Shop Now", "Nunua Sasa"],
  "benefits.freeTitle": ["Free Shipping", "Usafirishaji Bure"],
  "benefits.freeSub": ["On qualifying orders.", "Kwa oda zinazostahili."],
  "benefits.secureTitle": ["Secure Payments", "Malipo Salama"],
  "benefits.secureSub": ["Safe and reliable checkout.", "Malipo salama na ya kuaminika."],
  "benefits.returnsTitle": ["Easy Returns", "Kurudisha kwa Urahisi"],
  "benefits.returnsSub": ["Hassle-free return process.", "Mchakato rahisi wa kurudisha."],
  "benefits.supportTitle": ["Customer Support", "Huduma kwa Wateja"],
  "benefits.supportSub": ["We're here to help.", "Tuko hapa kukusaidia."],
  "sections.categories.title": ["Explore Top Collections", "Chunguza Mikusanyiko"],
  "sections.categories.sub": [
    "Find your style from our latest collections.",
    "Pata mtindo wako kutoka mikusanyiko yetu mipya."
  ],
  "sections.categories.kicker": ["Shop by category", "Nunua kwa aina"],
  "sections.best.kicker": ["Curated weekly", "Mkusanyiko wa wiki"],
  "sections.new.kicker": ["Just landed", "Imetua sasa"],
  "sections.best.title": ["Weekly Top Sellers", "Wauzaji Bora wa Wiki"],
  "sections.best.sub": [
    "Shop the most popular items currently trending.",
    "Nunua bidhaa maarufu zinazovuma sasa."
  ],
  "sections.viewAll": ["View All Products", "Tazama Bidhaa Zote"],
  "sections.new.title": ["New Arrivals", "Bidhaa Mpya"],
  "sections.new.sub": ["Fresh drops, just for you.", "Bidhaa mpya, kwa ajili yako."],
  "sections.new.cta": ["Shop New Arrivals", "Nunua Bidhaa Mpya"],
  "promo.label": ["The Trendora Edit", "Mkusanyiko wa Trendora"],
  "promo.title": ["Your Style,\nYour Story.", "Mtindo Wako,\nHadithi Yako."],
  "promo.sub": [
    "Refresh your wardrobe with pieces made for every occasion.",
    "Sasisha vazia lako kwa vipande vinavyofaa kila tukio."
  ],
  "promo.cta": ["Explore Collection", "Chunguza Mkusanyiko"],
  "newsletter.title": ["Join the Trendora list", "Jiunge na orodha ya Trendora"],
  "newsletter.sub": [
    "Get first access to new drops, exclusive offers and style notes.",
    "Pata bidhaa mpya kwanza, ofa maalum na vidokezo vya mitindo."
  ],
  "newsletter.placeholder": ["Your email address", "Barua pepe yako"],
  "newsletter.button": ["Subscribe", "Jiandikishe"],
  "newsletter.success": ["You're on the list. Karibu Trendora!", "Umejiunga. Karibu Trendora!"],
  "newsletter.error": ["Enter a valid email address.", "Weka barua pepe sahihi."],
  "newsletter.privacy": [
    "We respect your privacy. Unsubscribe anytime.",
    "Tunaheshimu faragha yako. Unaweza kujiondoa wakati wowote."
  ],
  "footer.about": [
    "Modern, considered fashion from Dar es Salaam to the world. Designed for real life, made to be worn on repeat.",
    "Mitindo ya kisasa kutoka Dar es Salaam kwa dunia. Imebuniwa kwa maisha halisi, ivae tena na tena."
  ],
  "footer.shop": ["Shop", "Duka"],
  "footer.help": ["Customer Care", "Huduma kwa Wateja"],
  "footer.contact": ["Get in touch", "Wasiliana nasi"],
  "footer.newsletter": ["Newsletter", "Jarida"],
  "footer.rights": ["All rights reserved.", "Haki zote zimehifadhiwa."],
  "footer.privacy": ["Privacy Policy", "Sera ya Faragha"],
  "footer.terms": ["Terms & Conditions", "Sheria na Masharti"],
  "footer.returns": ["Returns Policy", "Sera ya Kurudisha"],
  "cart.title": ["Your Cart", "Kikapu Chako"],
  "cart.empty": ["Your cart is empty.", "Kikapu chako ni tupu."],
  "cart.emptySub": [
    "Discover new pieces and make them yours.",
    "Gundua vipande vipya na vifanye vyako."
  ],
  "cart.continue": ["Continue shopping", "Endelea kununua"],
  "cart.subtotal": ["Subtotal", "Jumla ndogo"],
  "cart.shipping": ["Shipping", "Usafirishaji"],
  "cart.discount": ["Discount", "Punguzo"],
  "cart.total": ["Total", "Jumla"],
  "cart.checkout": ["Proceed to Checkout", "Nenda kwa Malipo"],
  "cart.remove": ["Remove", "Ondoa"],
  "cart.quantity": ["Quantity", "Idadi"],
  "cart.summary": ["Order Summary", "Muhtasari wa Oda"],
  "cart.coupon": ["Discount code", "Msimbo wa punguzo"],
  "cart.apply": ["Apply", "Tumia"],
  "cart.freeShip": ["You've unlocked free shipping.", "Umepata usafirishaji bure."],
  "cart.freeShipLeft": [
    "away from free shipping.",
    "kabla ya kupata usafirishaji bure."
  ],
  "common.search": ["Search products", "Tafuta bidhaa"],
  "common.addToCart": ["Add to Cart", "Ongeza kwenye Kikapu"],
  "common.viewAll": ["View all", "Tazama zote"],
  "common.loading": ["Loading", "Inapakia"],
  "common.inStock": ["In stock", "Ipo stoo"],
  "common.soldOut": ["Sold out", "Imeisha"],
  "common.close": ["Close", "Funga"],
  "common.menu": ["Menu", "Menyu"]
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(key: TranslationKey, language: Language) {
  return dict[key][language === "sw" ? 1 : 0];
}

export { dict };
