'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession, signIn } from 'next-auth/react';

type AlertFormData = {
  ticker: string;
  condition: 'above' | 'below';
  targetPrice: number;
};

export default function AlertForm() {
  const { data: session, status: sessionStatus } = useSession();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<AlertFormData>();
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const onSubmit = async (data: AlertFormData) => {
    if (!session?.user) return;

    setSubmitStatus(null);
    try {
      const res = await fetch('/api/price-alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create alert');
      }

      setSubmitStatus({ type: 'success', message: `Alert for ${data.ticker.toUpperCase()} created successfully!` });
      reset();
    } catch (error: any) {
      setSubmitStatus({ type: 'error', message: error.message });
    }
  };

  if (sessionStatus === 'loading') {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg border border-gray-800 text-white">
        <div className="animate-pulse h-8 bg-gray-800 rounded" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800 text-white text-center">
        <h2 className="text-xl font-bold mb-3">Stock Alerts</h2>
        <p className="text-gray-400 text-sm mb-4">Sign in to create price alerts for your stocks.</p>
        <button
          onClick={() => signIn('google')}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
        >
          Sign In to Create Alerts
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-900 rounded-lg shadow-xl border border-gray-800 text-white">
      <h2 className="text-2xl font-bold mb-4">Stock Alerts</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Ticker (e.g. BBCA)</label>
          <input
            {...register('ticker', { required: 'Ticker is required' })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="BBCA"
          />
          {errors.ticker && <p className="text-red-500 text-sm mt-1">{errors.ticker.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select
              {...register('condition', { required: true })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Price</label>
            <input
              type="number"
              {...register('targetPrice', { required: 'Target price is required', valueAsNumber: true })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
              placeholder="5500"
            />
            {errors.targetPrice && <p className="text-red-500 text-sm mt-1">{errors.targetPrice.message}</p>}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex justify-center items-center transition-colors"
        >
          Create Alert
        </button>
      </form>

      {submitStatus && (
        <div className={`mt-4 p-3 rounded text-sm text-center ${submitStatus.type === 'success' ? 'bg-green-900 border border-green-700 text-green-100' : 'bg-red-900 border border-red-700 text-red-100'}`}>
          {submitStatus.message}
        </div>
      )}
    </div>
  );
}
