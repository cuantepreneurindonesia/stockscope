# UI and Filter Audit (Sprint 2 / Phase 0)

## 1. Discrepancy Notice: Tech Stack Alignment
The stated instructions mentioned an older tech stack (`React v17.0.2`, `React Router v5.3.0`). However, an audit of the current repository reveals a very modern stack:
- **Framework**: `Next.js 16.1.6` (App Router)
- **React**: `19.2.3`
- **Database**: `mongodb` client (with serverless integrations)
- **Styling**: `Tailwind CSS v4`

**Resolution Plan**:
We will build the components and APIs strictly using the existing **Next.js App Router** conventions (e.g., `app/api/screen/route.ts` instead of an Express route, and Next.js client components instead of standard React Router logic).

---

## 2. Component Tree Analysis (Frontend Mapping)
The existing screener logic resides primarily in `src/components/features/screener/`.

**Current Tree Structure:**
- `ScreenerWorkspace.tsx` (Main Container)
  - `FilterSidebar.tsx` / `FilterPanel.tsx` -> Needs updates for `react-select` (Sector) and `react-slider` (Price Range).
  - `ScreenerTable.tsx` -> Needs updates to integrate `react-table` for data grid pagination features.
  - *Current state uses Client-side or Server-rendered fetching; we will wire this to securely fetch from `/api/screen`.*

Integration points:
- **React Table**: We'll define columns, use `useTable()`, `useSortBy()`, and `usePagination()` to replace current grid logic, targeting an exact 50 items/page.
- **React Select**: We will swap existing HTML `<select>` inside `FilterPanel/Sidebar` with a custom-styled `react-select` instance for sectors.
- **React Slider**: We will implement a dual-thumb slider for `minPrice` and `maxPrice`.

---

## 3. MongoDB Aggregation Pipeline
The current `app/api/screener/route.ts` pulls `fetchAllStocks(10000)` into memory (*which explicitly violates the instruction "DO NOT pull the entire MongoDB collection into memory"*). 

For the new `/api/screen` route, filtering will happen completely at the database query level to ensure optimal memory usage and payload size.

**Aggregation Query Plan:**
```javascript
const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
const limit = 50;
const skip = (page - 1) * limit;

const sector = req.nextUrl.searchParams.get("sector");
const minPrice = req.nextUrl.searchParams.get("minPrice");
const maxPrice = req.nextUrl.searchParams.get("maxPrice");

const matchStage = {};

if (sector && sector !== "All") {
  matchStage.sector = sector;
}

if (minPrice || maxPrice) {
  matchStage.price = {};
  if (minPrice) matchStage.price.$gte = Number(minPrice);
  if (maxPrice) matchStage.price.$lte = Number(maxPrice);
}

// Pipeline
const pipeline = [
  { $match: matchStage },
  { $sort: { compositeScore: -1 } }, // Or dynamically mapped from request
  { 
    $facet: {
      metadata: [ { $count: "total" } ],
      data: [ { $skip: skip }, { $limit: limit } ] // Backend Pagination
    }
  }
];

// Perform db.collection("CompanyMaster").aggregate(pipeline);
```

---

## 4. Next Steps & Approval
I have successfully audited the codebase and formulated a plan aligned with the Next.js framework in place. 

If this plan meets your expectations, please provide approval, and I will proceed with:
- **Phase 1**: Branch creation and dependency installation (`react-table`, `react-select`, `react-slider`).
- **Phase 2**: Creation of `app/api/screen/route.ts` implementing the MongoDB aggregation layer.
- **Phase 3**: Updating the UI to use the new advanced filtering endpoint.
