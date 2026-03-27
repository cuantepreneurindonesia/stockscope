"use client";

import Link from "next/link";

interface TerminalHeaderProps {
  locale: string;
  onLocaleChange?: (locale: string) => void;
}

export function TerminalHeader({
  locale,
  onLocaleChange,
}: TerminalHeaderProps) {
  return (
    <header
      className="bg-surface-container-lowest text-on-surface font-label antialiased 
                       border-b border-white/10 flex justify-between items-center w-full 
                       px-6 py-4 sticky top-0 z-50"
    >
      {/* Left: Logo + Navigation */}
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tight text-primary">
          Stockscope
        </span>

        <nav className="hidden md:flex gap-6 items-center">
          <Link
            className="text-on-surface-variant hover:text-on-surface transition-colors 
                       text-sm font-medium"
            href="/"
          >
            Dashboard
          </Link>
          <Link
            className="text-primary border-b-2 border-primary pb-2 text-sm font-medium"
            href={`/${locale}/screener`}
          >
            Screener
          </Link>
          <Link
            className="text-on-surface-variant hover:text-on-surface transition-colors 
                       text-sm font-medium"
            href="#"
          >
            Watchlist
          </Link>
        </nav>
      </div>

      {/* Right: Language + Avatar */}
      <div className="flex items-center gap-4">
        {/* Language Switcher */}
        <button
          onClick={() => onLocaleChange?.(locale === "en" ? "id" : "en")}
          className="material-symbols-outlined text-on-surface-variant 
                     hover:bg-white/5 transition-all p-2 rounded-lg"
          title="Change language"
        >
          language
        </button>

        {/* User Avatar */}
        <div
          className="h-8 w-8 rounded-full bg-surface-variant flex items-center 
                        justify-center text-xs font-bold text-primary border border-primary/20"
        >
          JD
        </div>
      </div>
    </header>
  );
}
