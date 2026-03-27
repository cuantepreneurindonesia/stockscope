"use client";

import React, { useTransition } from "react";

import { useLocale } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

/**
 * UI Component: LocaleSwitcher
 */
export function LocaleSwitcher(): React.ReactElement {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      style={{
        display: "flex",
        gap: 4,
        alignItems: "center",
        fontSize: 11,
      }}
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          disabled={isPending || loc === locale}
          onClick={() => {
            if (loc === locale) return;
            startTransition(() => {
              router.replace(pathname, { locale: loc });
            });
          }}
          style={{
            padding: "4px 8px",
            borderRadius: 4,
            border: "1px solid #1e3a52",
            background: loc === locale ? "#457b9d" : "#132030",
            color: loc === locale ? "#fff" : "#a8c8e8",
            cursor: loc === locale ? "default" : "pointer",
            fontWeight: 600,
            textTransform: "uppercase",
            opacity: isPending ? 0.7 : 1,
          }}
        >
          {loc}
        </button>
      ))}
    </div>
  );
}
