"use client";

import { Mail } from "lucide-react";
import { NewsletterForm } from "./newsletter-form";
import { useStore } from "./store-context";

export function NewsletterSection() {
  const { t } = useStore();

  return (
    <section className="container-shell py-14 sm:py-16 lg:py-20">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-brand-100 bg-brand-50 px-6 py-12 text-center sm:rounded-[2rem] sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full border border-brand-200/70"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full border border-brand-200/70"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-2xl">
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-brand-700 shadow-sm">
            <Mail className="h-5 w-5" />
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {t("newsletter.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-zinc-600">
            {t("newsletter.sub")}
          </p>
          <NewsletterForm className="mx-auto mt-7 max-w-xl text-left" />
        </div>
      </div>
    </section>
  );
}
