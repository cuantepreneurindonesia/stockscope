import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stock Screener V1 | StockScope",
  description:
    "Filter, rank, and analyze IDX stocks using precomputed financial metrics and strategy presets.",
};

export default function ScreenerV1Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
