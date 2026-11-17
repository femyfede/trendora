import type { Language } from "./types";

export type PolicySection = { title: string; paragraphs?: string[]; list?: string[] };
export type Policy = { kicker: string; title: string; intro: string; sections: PolicySection[] };

const UPDATED = "2026-11-17";
export const POLICY_UPDATED = UPDATED;

const privacy: Record<Language, Policy> = {
  en: {
    kicker: "Legal",
    title: "Privacy Policy",
    intro:
      "TRENDORA respects your privacy. This policy explains what information we collect when you use our site, why we need it and the choices you have.",
    sections: [
      {
        title: "Information we collect",
        list: [
          "Contact details such as your name, email address and phone number.",
          "Delivery details such as your region, town, street and delivery notes.",
          "Order information, including the products, sizes, colours and quantities you buy.",
          "Account information. Passwords are stored only as salted, one-way hashes.",
          "Shop registration details if you register a shop, including payment transaction IDs you send us.",
          "Messages you send us and newsletter preferences."
        ]
      },
      {
        title: "How we use your information",
        list: [
          "To process, pack, deliver and support your orders.",
          "To call you before delivery and send order updates.",
          "To review shop applications and show approved shops in the directory.",
          "To prevent fraud and improve our service.",
          "To send marketing emails only if you subscribed. You can unsubscribe at any time."
        ]
      },
      {
        title: "What the shops directory shows",
        paragraphs: [
          "For approved shops we publicly show the shop name, type of business, description, region, district, location, phone and WhatsApp number, so customers can contact the seller. We do not publish the owner's email address or account details."
        ]
      },
      {
        title: "Cookies and storage on your device",
        paragraphs: [
          "We use a secure cookie to keep you logged in and a cookie to remember your language. Your cart, saved items and display currency are stored in your browser so they survive a page refresh. We do not use them for third-party advertising."
        ]
      },
      {
        title: "Sharing your information",
        paragraphs: [
          "We share information only with service providers that help us run the store, such as delivery partners and hosting providers, and only as needed to fulfil your order or comply with the law. We never sell your personal information."
        ]
      },
      {
        title: "Your rights",
        list: [
          "You can ask to see, correct or delete your personal information.",
          "You can unsubscribe from marketing emails at any time.",
          "You can ask us to close your account or remove your shop listing."
        ]
      },
      {
        title: "Security and retention",
        paragraphs: [
          "We keep order records as long as needed for returns, support and accounting. Passwords are hashed and sessions are signed. Please use a password you do not use anywhere else."
        ]
      },
      {
        title: "Changes to this policy",
        paragraphs: ["We may update this policy as the service grows. The date at the top shows the latest version."]
      }
    ]
  },
  sw: {
    kicker: "Kisheria",
    title: "Sera ya Faragha",
    intro:
      "TRENDORA inaheshimu faragha yako. Sera hii inaeleza taarifa tunazokusanya unapotumia tovuti yetu, kwa nini tunazihitaji, na haki ulizonazo.",
    sections: [
      {
        title: "Taarifa tunazokusanya",
        list: [
          "Taarifa za mawasiliano kama jina, barua pepe na namba ya simu.",
          "Taarifa za usafirishaji kama mkoa, mji, mtaa na maelekezo ya kukuletea mzigo.",
          "Taarifa za oda, ikiwemo bidhaa, saizi, rangi na idadi unazonunua.",
          "Taarifa za akaunti. Nenosiri huhifadhiwa kwa njia ya usimbaji (hash) isiyoweza kurudishwa.",
          "Taarifa za usajili wa duka ukisajili duka, ikiwemo namba za muamala unazotutumia.",
          "Ujumbe unaotutumia na chaguo lako la kupokea jarida."
        ]
      },
      {
        title: "Tunavyotumia taarifa zako",
        list: [
          "Kushughulikia, kufunga, kusafirisha na kuhudumia oda zako.",
          "Kukupigia simu kabla ya kukuletea mzigo na kukutumia taarifa za oda.",
          "Kukagua maombi ya maduka na kuonyesha maduka yaliyoidhinishwa kwenye orodha.",
          "Kuzuia udanganyifu na kuboresha huduma yetu.",
          "Kukutumia barua pepe za matangazo ikiwa tu umejiunga. Unaweza kujiondoa wakati wowote."
        ]
      },
      {
        title: "Kinachoonyeshwa kwenye orodha ya maduka",
        paragraphs: [
          "Kwa maduka yaliyoidhinishwa tunaonyesha hadharani jina la duka, aina ya biashara, maelezo, mkoa, wilaya, mahali lilipo, namba ya simu na WhatsApp ili wateja wawasiliane na muuzaji. Hatuchapishi barua pepe ya mmiliki wala taarifa za akaunti yake."
        ]
      },
      {
        title: "Vidakuzi (cookies) na hifadhi kwenye kifaa chako",
        paragraphs: [
          "Tunatumia kidakuzi salama kukuweka ndani ya akaunti yako, na kidakuzi cha kukumbuka lugha yako. Kikapu, bidhaa ulizohifadhi na sarafu unayotumia vinahifadhiwa kwenye kivinjari chako ili visipotee ukipakia ukurasa upya. Hatuvitumii kwa matangazo ya watu wengine."
        ]
      },
      {
        title: "Kushirikisha taarifa zako",
        paragraphs: [
          "Tunashirikisha taarifa na watoa huduma wanaotusaidia kuendesha duka tu, kama wasafirishaji na watoa huduma za seva, na kwa kiasi kinachohitajika kukamilisha oda yako au kufuata sheria. Hatuuzi taarifa zako binafsi kamwe."
        ]
      },
      {
        title: "Haki zako",
        list: [
          "Unaweza kuomba kuona, kurekebisha au kufuta taarifa zako binafsi.",
          "Unaweza kujiondoa kwenye barua pepe za matangazo wakati wowote.",
          "Unaweza kutuomba kufunga akaunti yako au kuondoa duka lako kwenye orodha."
        ]
      },
      {
        title: "Usalama na muda wa kuhifadhi",
        paragraphs: [
          "Tunahifadhi kumbukumbu za oda kwa muda unaohitajika kwa ajili ya kurudisha bidhaa, huduma kwa wateja na hesabu. Nenosiri husimbwa na vikao (sessions) vinathibitishwa kwa saini. Tafadhali tumia nenosiri ambalo hulitumii mahali pengine."
        ]
      },
      {
        title: "Mabadiliko ya sera hii",
        paragraphs: ["Tunaweza kubadilisha sera hii huduma inapokua. Tarehe iliyo juu inaonyesha toleo la karibuni."]
      }
    ]
  }
};

const terms: Record<Language, Policy> = {
  en: {
    kicker: "Legal",
    title: "Terms & Conditions",
    intro:
      "These terms apply when you use the TRENDORA website, buy from us or register a shop. By using the site you agree to them.",
    sections: [
      {
        title: "About TRENDORA",
        paragraphs: [
          "TRENDORA is an online fashion store and a directory of verified shops, based in Dar es Salaam, Tanzania. “We”, “us” and “our” mean TRENDORA."
        ]
      },
      {
        title: "Products and prices",
        paragraphs: [
          "Prices are in Tanzanian shillings (TZS). USD amounts are shown for convenience only. We try to show colours and details accurately, but screens differ. If an obvious pricing error affects your order, we will contact you before dispatch."
        ]
      },
      {
        title: "Orders",
        paragraphs: [
          "Your order is an offer to buy. All orders depend on stock. If an item becomes unavailable we will contact you to arrange an alternative or cancel it. Please make sure your phone number and address are correct."
        ]
      },
      {
        title: "Payment",
        paragraphs: [
          "Cash on delivery is available within Tanzania. M-Pesa, Mixx by Yas and Airtel Money are not active yet; we will announce them when they are ready.",
          "Never share your mobile-money PIN with anyone, including people claiming to be from TRENDORA."
        ]
      },
      {
        title: "Delivery",
        paragraphs: [
          "Delivery fees and estimated times are shown at checkout by region. Times are estimates and can be affected by weather, holidays or other events outside our control."
        ]
      },
      {
        title: "Returns",
        paragraphs: ["Our Returns Policy is part of these terms. In summary, unworn items with tags can be returned within 14 days of delivery."]
      },
      {
        title: "Shop listings",
        list: [
          "Shop owners must give true and accurate information about their business.",
          "Submitting a transaction ID is not proof of payment; a shop is listed only after we verify the payment and approve the application.",
          "Each shop is responsible for its own products, prices and dealings with customers who contact it through the directory.",
          "We may suspend or remove a listing that gives false information or receives serious complaints."
        ]
      },
      {
        title: "Accounts and acceptable use",
        list: [
          "Keep your password private and tell us if you suspect someone else is using your account.",
          "Do not place false orders, misuse discount codes or interfere with the site.",
          "We may suspend accounts that break these terms."
        ]
      },
      {
        title: "Liability and law",
        paragraphs: [
          "To the extent allowed by law we are not liable for indirect losses from using the site. Nothing here removes your rights under Tanzanian consumer law. These terms are governed by the laws of Tanzania."
        ]
      }
    ]
  },
  sw: {
    kicker: "Kisheria",
    title: "Vigezo na Masharti",
    intro:
      "Vigezo hivi vinahusika unapotumia tovuti ya TRENDORA, unaponunua kutoka kwetu au unaposajili duka. Kwa kutumia tovuti, unakubali vigezo hivi.",
    sections: [
      {
        title: "Kuhusu TRENDORA",
        paragraphs: [
          "TRENDORA ni duka la mitindo mtandaoni na orodha ya maduka yaliyothibitishwa, lenye makao yake Dar es Salaam, Tanzania. “Sisi” na “yetu” inamaanisha TRENDORA."
        ]
      },
      {
        title: "Bidhaa na bei",
        paragraphs: [
          "Bei ziko kwa shilingi za Kitanzania (TZS). Kiasi cha USD kinaonyeshwa kwa urahisi tu. Tunajitahidi kuonyesha rangi na maelezo kwa usahihi, lakini skrini hutofautiana. Ikiwa kuna kosa la wazi la bei kwenye oda yako, tutawasiliana nawe kabla ya kutuma mzigo."
        ]
      },
      {
        title: "Oda",
        paragraphs: [
          "Oda yako ni ombi la kununua. Oda zote zinategemea upatikanaji wa bidhaa. Bidhaa ikikosekana tutawasiliana nawe kupanga mbadala au kuisitisha. Tafadhali hakikisha namba ya simu na anwani yako ni sahihi."
        ]
      },
      {
        title: "Malipo",
        paragraphs: [
          "Malipo wakati wa kupokea (pesa taslimu) yanapatikana ndani ya Tanzania. M-Pesa, Mixx by Yas na Airtel Money bado hazijaanza; tutatangaza zikiwa tayari.",
          "Usimpe mtu yeyote namba yako ya siri (PIN) ya pesa za simu, hata mtu anayedai kuwa kutoka TRENDORA."
        ]
      },
      {
        title: "Usafirishaji",
        paragraphs: [
          "Gharama na muda wa usafirishaji vinaonyeshwa wakati wa kulipia kulingana na mkoa. Muda ni makadirio na unaweza kuathiriwa na hali ya hewa, sikukuu au mambo mengine yaliyo nje ya uwezo wetu."
        ]
      },
      {
        title: "Kurudisha bidhaa",
        paragraphs: ["Sera yetu ya Kurudisha Bidhaa ni sehemu ya vigezo hivi. Kwa ufupi, bidhaa ambazo hazijavaliwa na zina lebo zinaweza kurudishwa ndani ya siku 14 baada ya kupokea."]
      },
      {
        title: "Kuorodhesha maduka",
        list: [
          "Wamiliki wa maduka lazima watoe taarifa za kweli na sahihi kuhusu biashara zao.",
          "Kutuma namba ya muamala si uthibitisho wa malipo; duka huorodheshwa baada ya sisi kuhakiki malipo na kuidhinisha ombi.",
          "Kila duka linawajibika kwa bidhaa, bei na mahusiano yake na wateja wanaowasiliana nalo kupitia orodha.",
          "Tunaweza kusimamisha au kuondoa duka linalotoa taarifa za uongo au kupokea malalamiko makubwa."
        ]
      },
      {
        title: "Akaunti na matumizi sahihi",
        list: [
          "Weka nenosiri lako siri na utujulishe ukihisi mtu mwingine anatumia akaunti yako.",
          "Usiweke oda za uongo, usitumie vibaya kuponi za punguzo wala kuharibu tovuti.",
          "Tunaweza kusimamisha akaunti zinazokiuka vigezo hivi."
        ]
      },
      {
        title: "Uwajibikaji na sheria",
        paragraphs: [
          "Kwa kiwango kinachoruhusiwa na sheria, hatuwajibiki kwa hasara zisizo za moja kwa moja kutokana na matumizi ya tovuti. Hakuna kitu hapa kinachoondoa haki zako chini ya sheria za kumlinda mlaji Tanzania. Vigezo hivi vinaongozwa na sheria za Tanzania."
        ]
      }
    ]
  }
};

const returns: Record<Language, Policy> = {
  en: {
    kicker: "Customer care",
    title: "Returns Policy",
    intro:
      "If something isn't right, you can ask to return it within 14 days of delivery, as long as it is unworn, unwashed and still has its tags.",
    sections: [
      {
        title: "What can be returned",
        list: [
          "Unworn, unwashed clothes with original tags.",
          "Shoes only tried on indoors, in their original box.",
          "Unused bags and accessories in their packaging.",
          "Swimwear and earrings only if unused and in sealed hygiene packaging.",
          "Items that arrived damaged, faulty or different from what you ordered."
        ]
      },
      {
        title: "What cannot be returned",
        list: [
          "Items returned more than 14 days after delivery.",
          "Items that have been worn, washed, altered or had tags removed.",
          "Swimwear, earrings or hygiene items without sealed packaging.",
          "Items marked as final sale when you bought them."
        ]
      },
      {
        title: "How to return an item",
        list: [
          "Call or WhatsApp +255 712 345 678, or email hello@trendora.co.tz, within 14 days of delivery.",
          "Tell us your order number, the item and the reason.",
          "We will confirm whether the return is approved and explain the next steps.",
          "Pack the item with its tags. Do not send cash.",
          "Unless the item was faulty or wrong, the return delivery cost may be charged."
        ]
      },
      {
        title: "Refunds",
        paragraphs: [
          "After we receive and check your return, we will tell you the result. Approved refunds are usually paid within 5–10 working days by mobile money or bank transfer to details you give us.",
          "The original delivery fee is refunded only if the item was faulty, damaged or wrong."
        ]
      },
      {
        title: "Exchanges",
        paragraphs: ["Need another size or colour? Contact us first so we can reserve it if it is in stock. If it isn't available, we will refund you instead."]
      },
      {
        title: "Faulty or wrong items",
        paragraphs: ["Contact us within 48 hours of delivery with photos and your order number. We will replace or refund the item, including delivery costs."]
      }
    ]
  },
  sw: {
    kicker: "Huduma kwa wateja",
    title: "Sera ya Kurudisha Bidhaa",
    intro:
      "Kama kuna tatizo, unaweza kuomba kurudisha bidhaa ndani ya siku 14 baada ya kuipokea, ilimradi haijavaliwa, haijafuliwa na bado ina lebo zake.",
    sections: [
      {
        title: "Kinachoweza kurudishwa",
        list: [
          "Nguo ambazo hazijavaliwa wala kufuliwa, zikiwa na lebo zake za awali.",
          "Viatu vilivyojaribiwa ndani tu, vikiwa kwenye boksi lake.",
          "Mikoba na mapambo ambayo hayajatumika, yakiwa kwenye vifungashio vyake.",
          "Mavazi ya kuogelea na hereni ikiwa tu hayajatumika na yako kwenye kifungashio kilichofungwa.",
          "Bidhaa iliyofika ikiwa imeharibika, ina kasoro au si ile uliyoagiza."
        ]
      },
      {
        title: "Kisichoweza kurudishwa",
        list: [
          "Bidhaa inayorudishwa baada ya siku 14 tangu kupokea.",
          "Bidhaa iliyovaliwa, kufuliwa, kubadilishwa au kuondolewa lebo.",
          "Mavazi ya kuogelea, hereni au bidhaa za usafi bila kifungashio kilichofungwa.",
          "Bidhaa zilizoandikwa kuwa hazirudishwi wakati wa kununua."
        ]
      },
      {
        title: "Jinsi ya kurudisha bidhaa",
        list: [
          "Piga simu au tuma WhatsApp kwa +255 712 345 678, au barua pepe hello@trendora.co.tz, ndani ya siku 14 baada ya kupokea.",
          "Tueleze namba ya oda, bidhaa husika na sababu.",
          "Tutathibitisha kama urudishaji umekubaliwa na kukueleza hatua zinazofuata.",
          "Funga bidhaa pamoja na lebo zake. Usitume pesa taslimu.",
          "Isipokuwa bidhaa ilikuwa na kasoro au si sahihi, gharama ya kuirudisha inaweza kukutoza."
        ]
      },
      {
        title: "Kurudishiwa pesa",
        paragraphs: [
          "Tukishapokea na kukagua bidhaa, tutakujulisha matokeo. Pesa zinazokubaliwa kurudishwa kwa kawaida hulipwa ndani ya siku 5–10 za kazi kwa pesa za simu au benki, kwa taarifa utakazotupa.",
          "Gharama ya usafirishaji wa awali hurudishwa tu ikiwa bidhaa ilikuwa na kasoro, imeharibika au si sahihi."
        ]
      },
      {
        title: "Kubadilisha bidhaa",
        paragraphs: ["Unahitaji saizi au rangi nyingine? Wasiliana nasi kwanza tukuwekee ikiwa ipo. Isipopatikana, tutakurudishia pesa yako."]
      },
      {
        title: "Bidhaa yenye kasoro au isiyo sahihi",
        paragraphs: ["Wasiliana nasi ndani ya saa 48 baada ya kupokea, ukiwa na picha na namba ya oda. Tutakubadilishia au kukurudishia pesa, pamoja na gharama za usafirishaji."]
      }
    ]
  }
};

export const POLICIES = { privacy, terms, returns };
