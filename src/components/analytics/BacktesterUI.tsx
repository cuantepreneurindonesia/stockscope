'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';

interface BacktesterUIProps {
  ticker: string;
}

interface BacktestFormInputs {
  indicator: string;
  operator: string;
  threshold: number;
}

export const BacktesterUI: React.FC<BacktesterUIProps> = ({ ticker }) => {
  const { control, handleSubmit } = useForm<BacktestFormInputs>({
    defaultValues: {
      indicator: 'RSI',
      operator: '<',
      threshold: 30
    }
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const onSubmit = async (data: BacktestFormInputs) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker,
          indicator: data.indicator,
          operator: data.operator,
          threshold: Number(data.threshold),
          initialCapital: 10000000
        })
      });

      const json = await res.json();
      
      if (!res.ok) {
        throw new Error(json.error || 'Simulation failed');
      }
      
      setResult(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 bg-slate-900 rounded-xl shadow-lg border border-slate-800 mt-6">
      <h3 className="text-xl font-bold text-white mb-4">Strategy Backtester (Simulated P&L)</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Indicator</label>
          <Controller
            name="indicator"
            control={control}
            render={({ field }) => (
              <select {...field} className="form-select bg-slate-800 text-white rounded p-2 border border-slate-700">
                <option value="RSI">RSI (14 periods)</option>
              </select>
            )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Condition</label>
          <Controller
             name="operator"
             control={control}
             render={({ field }) => (
               <select {...field} className="form-select bg-slate-800 text-white rounded p-2 border border-slate-700">
                 <option value="<">Less Than (&lt;)</option>
                 <option value=">">Greater Than (&gt;)</option>
               </select>
             )}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-300">Buy Threshold</label>
          <Controller
             name="threshold"
             control={control}
             render={({ field }) => (
               <input {...field} type="number" className="form-input bg-slate-800 text-white rounded p-2 border border-slate-700" />
             )}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Simulating...' : 'Run Backtest'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 text-red-400 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4">Simulation Results</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-slate-800 rounded">
              <p className="text-sm text-slate-400">Initial Capital</p>
              <p className="text-xl font-bold text-white">Rp {(result.initialCapital).toLocaleString()}</p>
            </div>
             <div className="p-4 bg-slate-800 rounded">
              <p className="text-sm text-slate-400">Final Capital</p>
              <p className={`text-xl font-bold ${result.finalCapital >= result.initialCapital ? 'text-green-400' : 'text-red-400'}`}>
                Rp {(result.finalCapital).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <p className="text-sm text-slate-400">ROI</p>
              <p className={`text-xl font-bold ${result.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {result.roi.toFixed(2)}%
              </p>
            </div>
            <div className="p-4 bg-slate-800 rounded">
              <p className="text-sm text-slate-400">Total Trades</p>
              <p className="text-xl font-bold text-white">{result.totalTrades}</p>
            </div>
          </div>

          {result.trades.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs text-slate-400 uppercase bg-slate-800">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Price</th>
                    <th className="px-4 py-2">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {result.trades.map((trade: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-700">
                      <td className="px-4 py-2">{trade.date}</td>
                      <td className={`px-4 py-2 font-bold ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.type}
                      </td>
                      <td className="px-4 py-2">Rp {trade.price.toLocaleString()}</td>
                      <td className="px-4 py-2 opacity-70">{trade.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
