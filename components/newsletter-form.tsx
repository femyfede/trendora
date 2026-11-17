"use client";

import { useId, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { cn, isValidEmail } from "@/lib/utils";
import { useStore } from "./store-context";

export function NewsletterForm({
  variant = "light",
  className
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const id = useId();
  const { t } = useStore();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setStatus("error");
      setMessage(t("newsletter.error"));
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t("common.error"));
      setStatus("success");
      setMessage(data.alreadySubscribed ? t("newsletter.already") : t("newsletter.success"));
      setEmail("");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof TypeError ? t("common.network") : error instanceof Error ? error.message : t("common.error")
      );
    }
  };

  const dark = variant === "dark";

  return (
    <div className={className}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor={`newsletter-${id}`} className="sr-only">
          {t("newsletter.placeholder")}
        </label>
        <input
          id={`newsletter-${id}`}
          type="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder={t("newsletter.placeholder")}
          className={cn(
            "min-w-0 flex-1 rounded-full border px-5 py-3 text-sm outline-none transition",
            dark
              ? "border-white/20 bg-white/10 text-white placeholder:text-white/60 focus:border-white/60"
              : "border-zinc-200 bg-white text-ink placeholder:text-zinc-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/15"
          )}
          aria-describedby={`newsletter-status-${id}`}
          aria-invalid={status === "error"}
          autoComplete="email"
          inputMode="email"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
            dark
              ? "bg-white text-ink hover:bg-brand-50"
              : "bg-brand-700 text-white hover:bg-brand-800"
          )}
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t("newsletter.button")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div id={`newsletter-status-${id}`} aria-live="polite">
        {status === "success" && (
          <p
            className={cn(
              "mt-3 flex items-center gap-1.5 text-xs font-medium",
              dark ? "text-brand-200" : "text-emerald-700"
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {message}
          </p>
        )}
        {status === "error" && (
          <p role="alert" className={cn("mt-3 text-xs font-medium", dark ? "text-red-300" : "text-red-600")}>{message}</p>
        )}
        {status === "idle" && (
          <p
            className={cn(
              "mt-3 text-xs",
              dark ? "text-white/55" : "text-zinc-500"
            )}
          >
            {t("newsletter.privacy")}
          </p>
        )}
      </div>
    </div>
  );
}
