"use client";

import { useState } from "react";

interface AccordionProps {
  title: string;
  badge?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({
  title,
  badge,
  children,
  defaultOpen = false,
}: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 0",
          background: "none",
          border: "none",
          borderBottom: "1px solid #132030",
          color: "#457b9d",
          fontSize: 10,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          cursor: "pointer",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#a8d8ea";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#457b9d";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{title}</span>
          {badge !== undefined && badge > 0 && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 18,
                height: 18,
                padding: "0 6px",
                background: "#457b9d",
                color: "#e8f4f8",
                fontSize: 10,
                fontWeight: 600,
                borderRadius: 9,
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: 14,
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            paddingTop: 16,
            animation: "slideDown 0.2s ease-out",
          }}
        >
          {children}
          <style jsx>{`
            @keyframes slideDown {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
