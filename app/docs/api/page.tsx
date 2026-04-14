import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'API Documentation | Stockscope Developer',
  description: 'Reference documentation for the Stockscope REST API',
};

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/stocks',
    description: 'List stocks with optional filtering and pagination.',
    params: [
      { name: 'page', type: 'number', description: 'Page number (default: 1)' },
      { name: 'limit', type: 'number', description: 'Results per page (max: 100)' },
      { name: 'sector', type: 'string', description: 'Filter by sector name' },
      { name: 'search', type: 'string', description: 'Search by ticker or company name' },
    ],
    auth: 'API Key',
  },
  {
    method: 'GET',
    path: '/api/v1/stocks/:ticker',
    description: 'Get detailed data for a single stock ticker.',
    params: [
      { name: 'ticker', type: 'string', description: 'Stock ticker code (e.g. BBCA)' },
    ],
    auth: 'API Key',
  },
  {
    method: 'GET',
    path: '/api/v1/price-alerts',
    description: 'List all active price alerts for the authenticated user.',
    params: [],
    auth: 'API Key (Premium+)',
  },
  {
    method: 'POST',
    path: '/api/v1/price-alerts',
    description: 'Create a new price alert.',
    params: [
      { name: 'ticker', type: 'string', description: 'Stock ticker code' },
      { name: 'condition', type: '"above" | "below"', description: 'Alert trigger condition' },
      { name: 'targetPrice', type: 'number', description: 'Price threshold' },
    ],
    auth: 'API Key (Premium+)',
  },
  {
    method: 'DELETE',
    path: '/api/v1/price-alerts/:id',
    description: 'Delete a price alert by ID.',
    params: [
      { name: 'id', type: 'string', description: 'Alert ID' },
    ],
    auth: 'API Key (Premium+)',
  },
  {
    method: 'GET',
    path: '/api/v1/watchlists',
    description: 'List all watchlists for the authenticated user.',
    params: [],
    auth: 'API Key',
  },
  {
    method: 'POST',
    path: '/api/backtest',
    description: 'Run a strategy backtest simulation on historical data.',
    params: [
      { name: 'ticker', type: 'string', description: 'Stock ticker' },
      { name: 'indicator', type: '"RSI"', description: 'Technical indicator' },
      { name: 'operator', type: '"<" | ">"', description: 'Entry condition operator' },
      { name: 'threshold', type: 'number', description: 'Signal threshold value' },
      { name: 'initialCapital', type: 'number', description: 'Starting capital in IDR (default: 10,000,000)' },
    ],
    auth: 'Session (requires sign-in)',
  },
];

const methodColors: Record<string, string> = {
  GET: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  POST: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PATCH: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/developer/api-keys"
            className="text-sm text-slate-500 dark:text-slate-400 hover:underline mb-4 inline-block"
          >
            ← Back to API Keys
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">
            API Documentation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            The Stockscope REST API provides access to Indonesian equity data, price alerts, watchlists, and strategy backtesting.
          </p>
        </div>

        {/* Authentication */}
        <section className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Authentication</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Pass your API key in the <code className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code> header:
          </p>
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-sm font-mono overflow-x-auto">
            {`Authorization: Bearer sk_live_your_api_key_here`}
          </pre>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-xs">
            Generate API keys from your{' '}
            <Link href="/developer/api-keys" className="text-blue-600 dark:text-blue-400 hover:underline">
              Developer Dashboard
            </Link>
            . API access requires a Pro plan.
          </p>
        </section>

        {/* Base URL */}
        <section className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Base URL</h2>
          <pre className="bg-slate-900 text-slate-100 rounded-xl p-4 text-sm font-mono overflow-x-auto">
            {`https://stockscope.app`}
          </pre>
        </section>

        {/* Rate Limits */}
        <section className="mb-10 p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Rate Limits</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Plan</th>
                  <th className="pb-3 font-semibold text-slate-700 dark:text-slate-300">Rate Limit</th>
                </tr>
              </thead>
              <tbody className="text-slate-600 dark:text-slate-400 divide-y divide-slate-100 dark:divide-slate-800">
                <tr><td className="py-2">Free</td><td className="py-2">No API access</td></tr>
                <tr><td className="py-2">Premium</td><td className="py-2">100 req/hour</td></tr>
                <tr><td className="py-2">Pro</td><td className="py-2">1,000 req/hour</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Endpoints */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">Endpoints</h2>
          <div className="space-y-6">
            {endpoints.map((ep, i) => (
              <div
                key={i}
                className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${methodColors[ep.method] ?? ''}`}>
                    {ep.method}
                  </span>
                  <code className="text-sm font-mono text-slate-800 dark:text-slate-200">
                    {ep.path}
                  </code>
                  <span className="ml-auto text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                    {ep.auth}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{ep.description}</p>

                {ep.params.length > 0 && (
                  <>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Parameters
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-700">
                            <th className="pb-2 font-semibold text-slate-600 dark:text-slate-300 w-32">Name</th>
                            <th className="pb-2 font-semibold text-slate-600 dark:text-slate-300 w-28">Type</th>
                            <th className="pb-2 font-semibold text-slate-600 dark:text-slate-300">Description</th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-500 dark:text-slate-400 divide-y divide-slate-50 dark:divide-slate-800">
                          {ep.params.map((p, j) => (
                            <tr key={j}>
                              <td className="py-1.5 font-mono text-slate-700 dark:text-slate-300">{p.name}</td>
                              <td className="py-1.5 font-mono text-purple-600 dark:text-purple-400">{p.type}</td>
                              <td className="py-1.5">{p.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
          Need help?{' '}
          <Link href="/developer/api-keys" className="text-blue-600 dark:text-blue-400 hover:underline">
            View your API keys
          </Link>
        </div>
      </div>
    </div>
  );
}
