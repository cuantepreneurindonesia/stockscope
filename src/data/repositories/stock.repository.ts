import { getDB } from "@/lib/mongodb";
import type { StockV1 } from "@/types/stock";

/**
 * Fetch all IDX stocks from the database without enrichment.
 *
 * @param limit - Maximum number of records to return (default: 10 000)
 */
export async function getAllStocks(limit = 10_000): Promise<StockV1[]> {
  const db = await getDB();
  const docs = await db
    .collection("stocks")
    .find({}, { projection: { code: 1, issuer: 1, sector: 1, industry: 1 } })
    .limit(limit)
    .toArray();

  return docs
    .filter((d) => typeof d.code === "string")
    .map((d) => ({
      symbol: d.code as string,
      name: (d.issuer as string | undefined) ?? (d.code as string),
      sector: (d.sector as string | undefined) ?? "Unknown",
      industry:
        (d.industry as string | undefined) ??
        (d.sector as string | undefined) ??
        "Unknown",
    }));
}
