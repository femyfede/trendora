import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { getTranslator } from "@/lib/i18n-server";

export default async function NotFound() {
  const { tr } = await getTranslator();
  return (
    <div className="container-shell flex flex-col items-center py-24 text-center sm:py-32">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Search className="h-7 w-7" />
      </span>
      <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">404</p>
      <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
        {tr("We couldn't find that page.", "Ukurasa huo haukupatikana.")}
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-zinc-600">
        {tr(
          "It may have been moved or removed. Try going back home or browsing our products.",
          "Huenda umehamishwa au kuondolewa. Rudi mwanzo au angalia bidhaa zetu."
        )}
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">
          {tr("Back home", "Rudi mwanzo")}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/shop" className="btn-outline">
          {tr("Browse products", "Tazama bidhaa")}
        </Link>
      </div>
    </div>
  );
}
