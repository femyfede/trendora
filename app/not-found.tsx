import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-shell flex flex-col items-center py-24 text-center sm:py-32">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand-700">
        <Search className="h-7 w-7" />
      </span>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-400">
        404 — Page not found
      </p>
      <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
        This piece has moved on.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
        The page you are looking for may have been removed, renamed or never
        existed. Let&apos;s get you back to something you&apos;ll love.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <Link href="/" className="btn-primary">
          Back home
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/shop" className="btn-outline">
          Shop all pieces
        </Link>
      </div>
    </div>
  );
}
