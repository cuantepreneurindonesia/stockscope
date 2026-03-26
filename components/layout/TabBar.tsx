'use client';

import React from 'react';

interface TabBarProps {
  NAV_TABS: [string, string][];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export function TabBar({ NAV_TABS, activeTab, setActiveTab }: TabBarProps): React.ReactElement {
  return (
    <div className="tab-nav-desktop">
      {NAV_TABS.map(([id, label]) => (
        <button
          key={id}
          data-tour={id === 'overview' ? 'tab-overview' : id === 'table' ? 'tab-screener' : undefined}
          onClick={() => setActiveTab(id)}
          className={`
            bg-transparent border-none border-b-2 px-[18px] py-3 cursor-pointer
            text-xs font-mono tracking-wide transition-colors duration-150
            whitespace-nowrap min-h-[44px]
            ${activeTab === id
              ? 'border-b-accent text-accent'
              : 'border-b-transparent text-ink-muted hover:text-ink-secondary'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
