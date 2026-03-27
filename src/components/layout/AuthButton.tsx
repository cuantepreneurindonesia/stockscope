"use client";

import React, { useEffect, useRef, useState } from "react";

import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

import { usePathname, useRouter } from "@/i18n/navigation";

import { THEME_COLORS } from "@/lib/constants";
import { useAuth } from '@/hooks';
import { localizedPath } from "@/lib/i18n/localizedPath";

export function AuthButton(): React.ReactElement {
  const t = useTranslations("auth");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, status, signIn, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (status === "loading") {
    return (
      <div
        style={{
          width: 100,
          height: 36,
          background: THEME_COLORS.bgAlt,
          borderRadius: 6,
          border: `1px solid ${THEME_COLORS.border}`,
        }}
      />
    );
  }

  if (!user) {
    return (
      <button
        onClick={() =>
          signIn("google", {
            callbackUrl: localizedPath(locale, pathname || "/"),
          })
        }
        style={{
          background: "#fff",
          color: "#1a1a1a",
          border: "none",
          borderRadius: 6,
          padding: "8px 14px",
          fontSize: 12,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        {t("signIn")}
      </button>
    );
  }

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setDropdownOpen((o) => !o)}
        aria-expanded={dropdownOpen}
        aria-haspopup="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: THEME_COLORS.bgAlt,
          border: `1px solid ${THEME_COLORS.border}`,
          borderRadius: 6,
          padding: "6px 10px",
          cursor: "pointer",
          color: THEME_COLORS.text,
          fontSize: 12,
        }}
      >
        {user.image ? (
          <Image
            src={user.image}
            alt=""
            width={24}
            height={24}
            style={{ borderRadius: "50%" }}
          />
        ) : (
          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: THEME_COLORS.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {user.name?.[0] ?? user.email?.[0] ?? "?"}
          </span>
        )}
        <span
          style={{
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {user.name ?? user.email ?? t("userFallback")}
        </span>
      </button>

      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: 4,
            background: THEME_COLORS.bgContent,
            border: `1px solid ${THEME_COLORS.border}`,
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            minWidth: 160,
            zIndex: 50,
          }}
        >
          {user?.plan !== "premium" && (
            <button
              type="button"
              onClick={() => {
                router.push("/upgrade");
                setDropdownOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                textAlign: "left",
                background: "none",
                border: "none",
                borderBottom: "1px solid #132030",
                color: "#2a9d8f",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "DM Sans, sans-serif",
              }}
            >
              {t("upgrade")}
            </button>
          )}
          <button
            onClick={() => {
              signOut({ callbackUrl: localizedPath(locale, "/") });
              setDropdownOpen(false);
            }}
            style={{
              width: "100%",
              padding: "10px 14px",
              textAlign: "left",
              background: "none",
              border: "none",
              color: THEME_COLORS.text,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {t("signOut")}
          </button>
        </div>
      )}
    </div>
  );
}
