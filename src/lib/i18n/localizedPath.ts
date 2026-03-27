import { routing } from "@/i18n/routing";

/** Build absolute path for NextAuth `callbackUrl` from `usePathname()` (no locale prefix). */
export function localizedPath(locale: string, pathname: string): string {
  const path = pathname?.startsWith("/") ? pathname : `/${pathname || ""}`;
  if (locale === routing.defaultLocale) {
    return path === "" ? "/" : path;
  }
  if (path === "/") {
    return `/${locale}`;
  }
  return `/${locale}${path}`;
}
