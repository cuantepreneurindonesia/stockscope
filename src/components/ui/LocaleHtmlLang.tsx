"use client";

import { useEffect } from "react";

/**
 * UI Component: LocaleHtmlLang
 */
export function LocaleHtmlLang({ locale }: { locale: string }): null {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}
