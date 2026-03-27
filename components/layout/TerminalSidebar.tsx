'use client';

import { usePathname } from 'next/navigation';

interface TerminalSidebarProps {
  locale: string;
}

export function TerminalSidebar({ locale }: TerminalSidebarProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => pathname.includes(path);

  return (
    <aside className="hidden md:flex flex-col h-[calc(100vh-68px)] w-64 
                      bg-surface border-r border-white/5 font-label text-sm 
                      tracking-wide sticky top-[68px]">
      {/* Brand Section */}
      <div className="p-6">
        <div className="text-primary font-black text-xs uppercase tracking-widest mb-1">
          Stockscope
        </div>
        <div className="text-on-surface-variant text-[10px] opacity-60">
          Terminal v1.0
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <a
          href={`/${locale}`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg 
                     transition-all duration-200
                     ${isActive('/') && !isActive('/screener')
                       ? 'bg-primary/10 text-primary'
                       : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                     }`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </a>

        <a
          href={`/${locale}/screener`}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg 
                     transition-all duration-200
                     ${isActive('/screener')
                       ? 'bg-primary/10 text-primary'
                       : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'
                     }`}
        >
          <span className="material-symbols-outlined">filter_alt</span>
          <span>Screener</span>
        </a>

        <a
          href="#"
          className="flex items-center gap-3 text-on-surface-variant px-4 py-3 
                     hover:bg-white/5 hover:text-on-surface transition-all duration-200 
                     rounded-lg"
        >
          <span className="material-symbols-outlined">visibility</span>
          <span>Watchlist</span>
        </a>
      </nav>

      {/* Footer Info (Optional) */}
      <div className="p-4 border-t border-white/5">
        <p className="text-[10px] text-on-surface-variant/40 text-center">
          Live Market Data
        </p>
      </div>
    </aside>
  );
}
