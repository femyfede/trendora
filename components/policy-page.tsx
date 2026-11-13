import Link from "next/link";

type Section = {
  title: string;
  paragraphs?: string[];
  list?: string[];
};

export function PolicyPage({
  kicker,
  title,
  updated,
  intro,
  sections,
  footer,
  children
}: {
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
  footer?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <section className="border-b border-zinc-200/70 bg-[#F7F8F7]">
        <div className="container-shell py-10 sm:py-14">
          <nav aria-label="Breadcrumb" className="text-[11px] text-zinc-500">
            <Link href="/" className="hover:text-brand-700">
              Home
            </Link>
            <span className="mx-1.5">/</span>
            <span className="font-medium text-ink">{title}</span>
          </nav>
          <p className="section-kicker mt-4">{kicker}</p>
          <h1 className="section-title mt-1.5">{title}</h1>
          <p className="mt-2 text-[11px] text-zinc-400">Last updated: {updated}</p>
        </div>
      </section>

      <div className="container-shell max-w-3xl py-10 lg:py-14">
        <p className="text-sm leading-relaxed text-zinc-600">{intro}</p>

        <div className="mt-8 space-y-8">
          {sections.map((section, index) => (
            <section key={section.title}>
              <h2 className="font-display text-lg font-extrabold text-ink">
                {index + 1}. {section.title}
              </h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2.5 text-sm leading-relaxed text-zinc-600">
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-3 space-y-2 text-sm text-zinc-600">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-2.5">
                      <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-600" />
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {children}

        {footer && <div className="mt-10">{footer}</div>}

        <div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs leading-relaxed text-zinc-600">
            Questions about this policy? Email{" "}
            <a
              href="mailto:hello@trendora.co.tz"
              className="font-semibold text-brand-700 underline"
            >
              hello@trendora.co.tz
            </a>{" "}
            or call{" "}
            <a href="tel:+255712345678" className="font-semibold text-brand-700 underline">
              +255 712 345 678
            </a>
            . Our team is available Monday to Saturday, 9:00 – 19:00 EAT.
          </p>
          <div className="mt-3 flex flex-wrap gap-4 text-[11px] font-semibold text-brand-700">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms & Conditions
            </Link>
            <Link href="/returns" className="hover:underline">
              Returns Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
