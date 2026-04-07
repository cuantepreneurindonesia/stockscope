# ANALYSIS AUDIT: Technical Indicators & Backtesting Integration

## 1. Data Shape for TA-Lib Indicator Calculation
TA-Lib via the `talib` Node bridge requires flat, primitive numerical arrays of historical data ordered correctly.

**Input Requirements**:
- `startIdx`: Target starting index of the series (usually 0).
- `endIdx`: Ending index (usually `array.length - 1`).
- `inReal`: An array of `float` prices (e.g., `closes` array).
- Optional parameters like `optInTimePeriod` for RSI length.

**Data Preparation**:
- Backend will query Mongoose/Prisma for `DailyFact` where `ticker = <input>`.
- The data naturally comes as arrays of JSON objects: `[ { date, open, high, low, close... }, ... ]`.
- We map this into contiguous flat arrays: `closes = data.map(d => d.close)`.
- **Handling Edge Cases**: Empty daily facts or undefined `close` prices will be filtered or interpolated to prevent `talib.execute` from crashing.

## 2. Payload Structure for Chart.js Component
To maintain a high-performance React component, data must be structured explicitly for the structure that Chart.js (`react-chartjs-2`) understands natively.

**Backend Response Payload (`/api/indicators/:symbol`)**:
```json
{
  "ticker": "BBCA",
  "periodStart": "2025-01-01",
  "periodEnd": "2026-03-01",
  "labels": ["2026-03-01", "2026-03-02", "2026-03-03"],
  "datasets": {
    "price": [8000, 8100, 8200],
    "rsi": [null, null, 65.2],
    "macd": {
      "macd": [null, null, 1.5],
      "signal": [null, null, 1.0],
      "histogram": [null, null, 0.5]
    }
  }
}
```
*Note*: Returned arrays for indicators like RSI inherently have leading blank elements due to the lookback period `N`. These are padded with `null` so their indexes match the `labels` array index precisely.

## 3. Backtesting Logic Flow
The backtester executes a step-by-step state simulation exclusively on the Node backend.

**Endpoint**: `POST /api/backtest`
1. **Tier Enforcer**: Query Redis for prefix `backtest:count:<user_id>:<month>`. If limited out (>5) without premium, reject with `403/429`. Premium endpoint bypassed logic.
2. **Strategy Initialization**: Parse inputs `{ strategy: 'RSI', condition: '<', threshold: 30, initialBal: 10000000 }`.
3. **Indicator Compute**: Pre-calculate the entire array of the requested metric (e.g. `RSI_14`) using the `services/analysis.js` bridge up to `talib`.
4. **Historical Loop Simulator**:
   - `for i = 0...days` traversing price action sequentially.
   - If User is Holding CASH: Evaluate entry condition. (e.g. `RSI_14[i] < threshold`). Buy at `close[i]`, log transaction.
   - If User is Holding STOCK: Evaluate default exit condition (e.g. `RSI_14[i] > 70`). Sell at `close[i]`, deduct fees (if any), log transaction.
5. **Scorecard**: Evaluate remaining stock/cash. Determine overall ROI, max drawdown, and success rate.
6. **Delivery**: Respond payload to frontend overlay form.

## 4. Basic Fundamental Ratios (EV/EBITDA, P/E)
P/E is natively available in the Mongoose dataset (`DailyFact.pe`).
`EV/EBITDA` components (Debt, Cash reserves) are generally absent from regular price-action. We will synthesize this via available metadata or explicitly calculate it utilizing Mongoose static facts in `CompanyMaster`. If variables are omitted, placeholders will be simulated based on matching `marketCap` to demonstrate API capability.
