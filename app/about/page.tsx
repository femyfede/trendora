import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Banknote, HeartHandshake, MapPinned, Store } from "lucide-react";
import { getTranslator } from "@/lib/i18n-server";
import { IMAGES, SITE } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  const { tr } = await getTranslator();
  return {
    title: tr("About Us", "Kuhusu Sisi"),
    description: tr(
      "TRENDORA is a Tanzanian online market for fashion and local shops, built in Dar es Salaam.",
      "TRENDORA ni soko la mtandaoni la mitindo na maduka ya Tanzania, lililojengwa Dar es Salaam."
    )
  };
}

export default async function AboutPage() {
  const { tr } = await getTranslator();

  const values = [
    {
      icon: Banknote,
      title: tr("Pay when it arrives", "Lipa ukipokea"),
      body: tr(
        "No card needed. Check your order at your door, then pay in cash.",
        "Huhitaji kadi ya benki. Kagua mzigo wako mlangoni, kisha ulipe pesa taslimu."
      )
    },
    {
      icon: BadgeCheck,
      title: tr("Verified sellers", "Wauzaji waliothibitishwa"),
      body: tr(
        "Every shop in our directory is checked by our team before it goes live.",
        "Kila duka kwenye orodha yetu linakaguliwa na timu yetu kabla ya kuonekana."
      )
    },
    {
      icon: MapPinned,
      title: tr("All of Tanzania", "Tanzania nzima"),
      body: tr(
        "We deliver to all 31 regions, from Dar es Salaam to Kigoma and Pemba.",
        "Tunafikisha mikoa yote 31, kutoka Dar es Salaam hadi Kigoma na Pemba."
      )
    },
    {
      icon: HeartHandshake,
      title: tr("Help in Kiswahili", "Msaada kwa Kiswahili"),
      body: tr(
        "Call or WhatsApp us and a real person from our team will help you.",
        "Tupigie au tutumie WhatsApp, mtu halisi kutoka timu yetu atakusaidia."
      )
    }
  ];

  return (
    <div>
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <Image src={IMAGES.darAerial} alt="" fill priority sizes="100vw" className="object-cover opacity-35" />
        <div className="container-shell relative py-16 sm:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sun-400">{tr("About Us", "Kuhusu Sisi")}</p>
          <h1 className="mt-3 max-w-3xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {tr(
              "Making it easy to buy from, and sell to, Tanzania.",
              "Tunarahisisha kununua na kuuza hapa Tanzania."
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/85">
            {tr(
              "TRENDORA started in Dar es Salaam with a simple idea: shopping online should feel as familiar and trustworthy as buying from the shop down the road.",
              "TRENDORA ilianzia Dar es Salaam kwa wazo rahisi: kununua mtandaoni kunapaswa kuwa rahisi na kuaminika kama kununua kwenye duka la jirani."
            )}
          </p>
        </div>
      </section>

      <section className="container-shell grid gap-10 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
          <Image
            src={IMAGES.shopkeeper}
            alt={tr("A shop owner behind her counter in Tanzania", "Mmiliki wa duka akiwa kaunta dukani kwake Tanzania")}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div>
          <p className="section-kicker">{tr("What we do", "Tunachofanya")}</p>
          <h2 className="section-title mt-2">{tr("Two things, done well", "Mambo mawili, kwa ubora")}</h2>
          <div className="mt-6 space-y-6 text-base leading-relaxed text-zinc-700">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">{tr("1. An online fashion store", "1. Duka la mitindo mtandaoni")}</h3>
              <p className="mt-1">
                {tr(
                  "Clothes, shoes, bags and accessories, delivered to your door with cash on delivery.",
                  "Nguo, viatu, mikoba na mapambo, tunakuletea mlangoni na unalipa ukipokea."
                )}
              </p>
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-ink">{tr("2. A directory of verified shops", "2. Orodha ya maduka yaliyothibitishwa")}</h3>
              <p className="mt-1">
                {tr(
                  "Business owners register their shop, we verify it, and customers anywhere in Tanzania can find them and call them directly.",
                  "Wafanyabiashara wanasajili maduka yao, tunayathibitisha, na wateja popote Tanzania wanaweza kuyapata na kuwapigia moja kwa moja."
                )}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">
              {tr("Start shopping", "Anza kununua")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/create-shop" className="btn-outline">
              <Store className="h-4 w-4" />
              {tr("Register your shop", "Sajili duka lako")}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-200/70 bg-sand">
        <div className="container-shell py-14 lg:py-16">
          <h2 className="section-title">{tr("Our promise to you", "Ahadi yetu kwako")}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, body }) => (
              <li key={title} className="rounded-2xl bg-white p-6 ring-1 ring-zinc-200/80">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-700 text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-shell py-14 text-center lg:py-16">
        <h2 className="section-title">{tr("Have a question?", "Una swali?")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-zinc-600">
          {tr("We're in", "Tuko")} {SITE.address}.{" "}
          {tr("Call, WhatsApp or send us a message.", "Tupigie, tutumie WhatsApp au ujumbe.")}
        </p>
        <Link href="/contact" className="btn-primary mt-6">
          {tr("Contact Us", "Wasiliana Nasi")}
        </Link>
      </section>
    </div>
  );
}
