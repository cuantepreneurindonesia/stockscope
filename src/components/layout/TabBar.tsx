"use client";

import React from "react";

interface TabBarProps {
  NAV_TABS: [string, string][];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export function TabBar({
  NAV_TABS,
  activeTab,
  setActiveTab,
}: TabBarProps): React.ReactElement {
  return (
    <div className="tab-nav-desktop">
      {NAV_TABS.map(([id, label]) => (
        <button
          key={id}
          data-tour={
            id === "overview"
              ? "tab-overview"
              : id === "table"
                ? "tab-screener"
                : undefined
          }
          onClick={() => setActiveTab(id)}
          style={{
            background: "none",
            border: "none",
            borderBottom:
              activeTab === id ? "2px solid #457B9D" : "2px solid transparent",
            color: activeTab === id ? "#a8d8ea" : "#6b8aad",
            padding: "12px 18px",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: 1,
            transition: "color 0.15s",
            whiteSpace: "nowrap",
            minHeight: 44,
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
