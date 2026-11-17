import Link from "next/link";
import { getTranslator } from "@/lib/i18n-server";
import { POLICIES, POLICY_UPDATED } from "@/lib/policies";
import { SITE } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

export async function policyMetadata(name: keyof typeof POLICIES) {
  const { language } = await getTranslator();
  const policy = POLICIES[name][language];
  return { title: policy.title, description: policy.intro.slice(0, 160) };
}

export async function PolicyPage({ name }: { name: keyof typeof POLICIES }) {
  const { tr, t, language } = await getTranslator();
  const policy = POLICIES[name][language];

  return (
    <div>
      <section className="border-b border-zinc-200/70 bg-sand">
        <div className="container-shell py-10 sm:py-14">
          <nav aria-label={tr("Breadcrumb", "Ulipo")} className="text-xs text-zinc-500">
            <Link href="/" className="hover:text-brand-700">
              {tr("Home", "Mwanzo")}
            </Link>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-ink">{policy.title}</span>
          </nav>
          <p className="section-kicker mt-4">{policy.kicker}</p>
          <h1 className="section-title mt-1.5">{policy.title}</h1>
          <p className="mt-2 text-sm text-zinc-500">
            {tr("Last updated:", "Ilisasishwa:")} {formatDate(POLICY_UPDATED, language)}
          </p>
        </div>
      </section>

      <div className="container-shell max-w-3xl py-10 lg:py-14">
        <p className="text-base leading-relaxed text-zinc-700">{policy.intro}</p>

        <div className="mt-8 space-y-8">
          {policy.sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-extrabold text-ink">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2.5 text-base leading-relaxed text-zinc-700">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 space-y-2 text-base text-zinc-700">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[10px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm leading-relaxed text-zinc-700">
            {tr("Questions about this policy? Email", "Una swali kuhusu sera hii? Tuma barua pepe")}{" "}
            <a href={`mailto:${SITE.email}`} className="font-semibold text-brand-700 underline">
              {SITE.email}
            </a>{" "}
            {tr("or call", "au piga")}{" "}
            <a href={`tel:${SITE.phoneHref}`} className="font-semibold text-brand-700 underline">
              {SITE.phone}
            </a>
            .
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
            <Link href="/privacy" className="hover:underline">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:underline">{t("footer.terms")}</Link>
            <Link href="/returns" className="hover:underline">{t("footer.returns")}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
