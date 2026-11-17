import type { Language } from "./types";

export const DEFAULT_LANGUAGE: Language = "sw";
export const LANGUAGE_COOKIE = "trendora_lang";

export function normalizeLanguage(value: unknown): Language {
  return value === "en" ? "en" : DEFAULT_LANGUAGE;
}

/** Picks the English or Kiswahili variant of a string. */
export function pick(language: Language, en: string, sw: string) {
  return language === "en" ? en : sw;
}

// [English, Kiswahili]
const dict = {
  "nav.home": ["Home", "Mwanzo"],
  "nav.shop": ["Products", "Bidhaa"],
  "nav.shops": ["Shops", "Maduka"],
  "nav.collections": ["Collections", "Mikusanyiko"],
  "nav.about": ["About Us", "Kuhusu Sisi"],
  "nav.contact": ["Contact Us", "Wasiliana Nasi"],
  "nav.addShop": ["Register Your Shop", "Sajili Duka Lako"],
  "nav.account": ["My Account", "Akaunti Yangu"],
  "nav.login": ["Log in", "Ingia"],
  "nav.register": ["Sign up", "Jisajili"],
  "nav.wishlist": ["Saved items", "Nilivyopenda"],
  "nav.cart": ["Cart", "Kikapu"],
  "nav.search": ["Search", "Tafuta"],
  "announce.promo": [
    "Free delivery on orders over TZS 150,000 anywhere in Tanzania",
    "Usafirishaji bure kwa oda ya zaidi ya TZS 150,000 popote Tanzania"
  ],
  "hero.eyebrow": ["Tanzania's online market", "Soko la mtandaoni la Tanzania"],
  "hero.title": ["Shop local.\nShop with confidence.", "Nunua bidhaa za nyumbani\nkwa uhakika."],
  "hero.sub": [
    "Clothes, shoes, bags and more from trusted Tanzanian sellers, delivered to your door. Pay when it arrives.",
    "Nguo, viatu, mikoba na zaidi kutoka kwa wauzaji wa Tanzania wanaoaminika. Tunakuletea mlangoni, unalipa ukipokea."
  ],
  "hero.eyebrow2": ["For business owners", "Kwa wafanyabiashara"],
  "hero.title2": ["Bring your shop\nonline today.", "Peleka duka lako\nmtandaoni leo."],
  "hero.sub2": [
    "Register your shop, get verified and let customers across Tanzania find you and call you directly.",
    "Sajili duka lako, lithibitishwe, na wateja kutoka kila kona ya Tanzania wakupate na kukupigia moja kwa moja."
  ],
  "hero.eyebrow3": ["From Dar to Zanzibar", "Kutoka Dar hadi Zanzibar"],
  "hero.title3": ["Style that feels\nlike home.", "Mitindo yenye\nladha ya nyumbani."],
  "hero.sub3": [
    "Delivery to all 31 regions of Tanzania. Dar es Salaam in 1 to 2 days.",
    "Tunafikisha mikoa yote 31 ya Tanzania. Dar es Salaam ndani ya siku 1 hadi 2."
  ],
  "hero.cta": ["Start shopping", "Anza kununua"],
  "hero.cta2": ["Register your shop", "Sajili duka lako"],
  "benefits.freeTitle": ["Free delivery", "Usafirishaji bure"],
  "benefits.freeSub": ["On orders over TZS 150,000.", "Kwa oda ya zaidi ya TZS 150,000."],
  "benefits.secureTitle": ["Pay on delivery", "Lipa ukipokea"],
  "benefits.secureSub": ["Pay cash when your order arrives.", "Unalipa pesa taslimu mzigo ukifika."],
  "benefits.returnsTitle": ["Easy returns", "Kurudisha ni rahisi"],
  "benefits.returnsSub": ["Within 14 days of delivery.", "Ndani ya siku 14 baada ya kupokea."],
  "benefits.supportTitle": ["Help in Kiswahili", "Msaada kwa Kiswahili"],
  "benefits.supportSub": ["Call or WhatsApp our team.", "Piga simu au tuma WhatsApp."],
  "sections.categories.title": ["What are you looking for?", "Unatafuta nini leo?"],
  "sections.categories.kicker": ["Shop by category", "Chagua aina"],
  "sections.best.kicker": ["Customer favourites", "Wateja wanapenda"],
  "sections.best.title": ["Best sellers this week", "Zinazouzika zaidi wiki hii"],
  "sections.best.sub": [
    "The pieces customers across Tanzania are buying right now.",
    "Bidhaa ambazo wateja kote Tanzania wananunua sasa hivi."
  ],
  "sections.viewAll": ["See all products", "Tazama bidhaa zote"],
  "sections.new.kicker": ["Just arrived", "Zimefika sasa hivi"],
  "sections.new.title": ["New arrivals", "Bidhaa mpya"],
  "sections.new.sub": ["Fresh styles added this month.", "Mitindo mipya iliyoongezwa mwezi huu."],
  "sections.new.cta": ["See new arrivals", "Tazama bidhaa mpya"],
  "newsletter.title": ["Hear about new arrivals first", "Pata habari za bidhaa mpya kwanza"],
  "newsletter.sub": [
    "One short email when new stock and offers arrive. No spam.",
    "Barua pepe fupi moja bidhaa mpya na ofa zikifika. Hatutakusumbua."
  ],
  "newsletter.placeholder": ["Your email address", "Barua pepe yako"],
  "newsletter.button": ["Subscribe", "Jiunge"],
  "newsletter.success": ["You're subscribed. Karibu!", "Umejiunga. Karibu sana!"],
  "newsletter.already": ["You're already subscribed.", "Tayari umejiunga."],
  "newsletter.error": ["Enter a valid email address.", "Weka barua pepe sahihi."],
  "newsletter.privacy": [
    "You can unsubscribe at any time.",
    "Unaweza kujiondoa wakati wowote."
  ],
  "footer.about": [
    "A Tanzanian online market for fashion and local shops. Built in Dar es Salaam for customers and sellers across the country.",
    "Soko la mtandaoni la mitindo na maduka ya Tanzania. Limejengwa Dar es Salaam kwa ajili ya wateja na wauzaji wa nchi nzima."
  ],
  "footer.shop": ["Shop", "Nunua"],
  "footer.help": ["Help", "Msaada"],
  "footer.contact": ["Talk to us", "Ongea nasi"],
  "footer.newsletter": ["Newsletter", "Jarida"],
  "footer.rights": ["All rights reserved.", "Haki zote zimehifadhiwa."],
  "footer.privacy": ["Privacy Policy", "Sera ya Faragha"],
  "footer.terms": ["Terms & Conditions", "Vigezo na Masharti"],
  "footer.returns": ["Returns Policy", "Sera ya Kurudisha Bidhaa"],
  "cart.title": ["Your cart", "Kikapu chako"],
  "cart.empty": ["Your cart is empty", "Kikapu chako hakina kitu"],
  "cart.emptySub": [
    "Browse our products and add the ones you like.",
    "Pitia bidhaa zetu na uongeze unazopenda."
  ],
  "cart.continue": ["Continue shopping", "Endelea kununua"],
  "cart.subtotal": ["Subtotal", "Jumla ya bidhaa"],
  "cart.shipping": ["Delivery", "Usafirishaji"],
  "cart.discount": ["Discount", "Punguzo"],
  "cart.total": ["Total", "Jumla"],
  "cart.checkout": ["Continue to checkout", "Endelea kulipia"],
  "cart.remove": ["Remove", "Ondoa"],
  "cart.quantity": ["Quantity", "Idadi"],
  "cart.summary": ["Order summary", "Muhtasari wa oda"],
  "cart.coupon": ["Discount code", "Kuponi ya punguzo"],
  "cart.apply": ["Apply", "Tumia"],
  "cart.freeShip": ["You qualify for free delivery.", "Umepata usafirishaji bure."],
  "cart.freeShipLeft": [
    "more for free delivery.",
    "zaidi upate usafirishaji bure."
  ],
  "common.search": ["Search products", "Tafuta bidhaa"],
  "common.addToCart": ["Add to cart", "Weka kwenye kikapu"],
  "common.viewAll": ["View all", "Tazama zote"],
  "common.loading": ["Loading…", "Inapakia…"],
  "common.inStock": ["In stock", "Ipo"],
  "common.soldOut": ["Sold out", "Imeisha"],
  "common.close": ["Close", "Funga"],
  "common.menu": ["Menu", "Menyu"],
  "common.free": ["Free", "Bure"],
  "common.tryAgain": ["Try again", "Jaribu tena"],
  "common.error": ["Something went wrong. Please try again.", "Kuna tatizo limetokea. Tafadhali jaribu tena."],
  "common.network": [
    "Could not connect. Check your internet and try again.",
    "Imeshindwa kuunganisha. Angalia intaneti yako kisha ujaribu tena."
  ],
  "common.wait": ["Please wait…", "Subiri kidogo…"]
} as const;

export type TranslationKey = keyof typeof dict;

export function translate(key: TranslationKey, language: Language) {
  return dict[key][language === "en" ? 0 : 1];
}

export { dict };
