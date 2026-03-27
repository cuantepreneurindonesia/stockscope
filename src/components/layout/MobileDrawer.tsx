"use client";

import React, { RefObject, useCallback, useEffect } from "react";

interface MobileDrawerProps {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerRef: RefObject<HTMLDivElement | null>;
  NAV_TABS: [string, string][];
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export function MobileDrawer({
  drawerOpen,
  setDrawerOpen,
  drawerRef,
  NAV_TABS,
  activeTab,
  setActiveTab,
}: MobileDrawerProps): React.ReactElement {
  const handleTabClick = useCallback(
    (tabId: string): void => {
      setActiveTab(tabId);
      setDrawerOpen(false);
    },
    [setActiveTab, setDrawerOpen],
  );

  useEffect(() => {
    if (!drawerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [drawerOpen, setDrawerOpen, drawerRef]);

  return (
    <>
      <div
        className={`drawer-overlay ${drawerOpen ? "open" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        ref={drawerRef}
        className={`mobile-drawer ${drawerOpen ? "open" : ""}`}
      >
        <button
          className="drawer-close"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close navigation"
        >
          ✕
        </button>
        {NAV_TABS.map(([id, label]) => (
          <button
            key={id}
            className={`drawer-nav-btn ${activeTab === id ? "active" : ""}`}
            onClick={() => handleTabClick(id)}
          >
            {label}
          </button>
        ))}
      </div>
    </>
  );
}
