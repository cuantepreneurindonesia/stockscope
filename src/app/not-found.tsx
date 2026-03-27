import type { ReactElement } from "react";

import Link from "next/link";

/** Fallback when 404 is rendered outside `[locale]` (rare). Default locale is Indonesian. */
export default function RootNotFound(): ReactElement {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#060d18",
        color: "#e8f4f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-dm-sans), DM Sans, sans-serif",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <p style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>404</p>
        <Link href="/" style={{ color: "#2a9d8f", fontWeight: 600 }}>
          Beranda / Home
        </Link>
      </div>
    </div>
  );
}
