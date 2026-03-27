"use client";

import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  delay?: number;
}

/**
 * UI Component: Tooltip
 */
export function Tooltip({
  content,
  children,
  delay = 200,
}: TooltipProps): React.ReactElement {
  const [visible, setVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (): void => {
    const id = setTimeout(() => {
      setVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = (): void => {
    if (timeoutId) clearTimeout(timeoutId);
    setVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {visible && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: 8,
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#1e3a52",
              color: "#e8f4f8",
              fontSize: 11,
              padding: "6px 10px",
              borderRadius: 6,
              whiteSpace: "nowrap",
              pointerEvents: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
            }}
          >
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
