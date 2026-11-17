"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useStore } from "@/components/store-context";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { tr } = useStore();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell flex flex-col items-center py-24 text-center" role="alert">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-sun-100 text-amber-700">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
        {tr("Something went wrong.", "Kuna tatizo limetokea.")}
      </h1>
      <p className="mt-2 max-w-md text-base leading-relaxed text-zinc-600">
        {tr(
          "We couldn't load this page. Check your internet connection and try again.",
          "Hatukuweza kupakia ukurasa huu. Angalia intaneti yako kisha ujaribu tena."
        )}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" />
          {tr("Try again", "Jaribu tena")}
        </button>
        <Link href="/" className="btn-outline">
          {tr("Back home", "Rudi mwanzo")}
        </Link>
      </div>
    </div>
  );
}
