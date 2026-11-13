"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-shell flex flex-col items-center py-24 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-amber-50 text-amber-600">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
        Something went wrong.
      </h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
        We couldn&apos;t load this page right now. Please try again, or head back to the
        store while we recover.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={reset} className="btn-primary">
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link href="/" className="btn-outline">
          Back home
        </Link>
      </div>
    </div>
  );
}
