"use client";

import React, { useState } from "react";

import { THEME_COLORS } from "@/lib/constants";

interface Tooltip2Props {
  text: string;
  children?: React.ReactNode;
}

/**
 * UI Component: Tooltip2
 */
export function Tooltip2({ text }: Tooltip2Props): React.ReactElement {
  const [show, setShow] = useState(false);

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          cursor: "help",
          color: THEME_COLORS.textTertiary,
          fontSize: 11,
          marginLeft: 4,
        }}
      >
        ⓘ
      </span>
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "120%",
            left: "50%",
            transform: "translateX(-50%)",
            background: THEME_COLORS.bgAlt,
            border: `1px solid ${THEME_COLORS.border}`,
            borderRadius: 6,
            padding: "6px 10px",
            fontSize: 11,
            color: THEME_COLORS.textSecondary,
            whiteSpace: "nowrap",
            maxWidth: 260,
            lineHeight: 1.4,
            zIndex: 100,
            boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}
