"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";

import { Link, usePathname } from "@/i18n/navigation";
import type { NavMessageKey } from "@/types/i18n";

interface AppShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

type NavItem = {
  href: "/" | "/screener" | "/owners" | "/watchlist" | "/profile" | "/alerts";
  labelKey: NavMessageKey;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", labelKey: "overview" },
  { href: "/screener", labelKey: "screener" },
  { href: "/owners", labelKey: "owners" },
  { href: "/watchlist", labelKey: "watchlist" },
  { href: "/alerts", labelKey: "alerts" },
  { href: "/profile", labelKey: "profile" },
];

function isActive(pathname: string, href: NavItem["href"]): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ title, subtitle, children }: AppShellProps): React.ReactElement {
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  return (
    <div className="shell-root">
      <aside className="shell-sidebar" aria-label="Primary navigation">
        <div className="shell-brand">Stockscope</div>
        <nav className="shell-nav">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? "shell-link shell-link-active" : "shell-link"}
              >
                {tNav(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="shell-main">
        <header className="shell-header">
          <div>
            <p className="shell-kicker">Indonesia Equity Terminal</p>
            <h1 className="shell-title">{title}</h1>
            <p className="shell-subtitle">{subtitle}</p>
          </div>
        </header>

        <main className="shell-content">{children}</main>

        <nav className="shell-mobile-nav" aria-label="Mobile primary navigation">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={`mobile-${item.href}`}
                href={item.href}
                className={active ? "shell-mobile-link shell-mobile-link-active" : "shell-mobile-link"}
              >
                {tNav(item.labelKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
