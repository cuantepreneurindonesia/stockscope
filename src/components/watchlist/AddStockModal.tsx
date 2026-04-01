/**
 * Add Stock Modal
 * Add stocks to a watchlist with ticker input and optional notes
 */

'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistId: string;
  onSuccess: () => void;
}

export function AddStockModal({
  isOpen,
  onClose,
  watchlistId,
  onSuccess,
}: AddStockModalProps) {
  const [ticker, setTicker] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ticker.trim()) {
      setError('Stock ticker is required');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/watchlists/${watchlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticker: ticker.trim().toUpperCase(),
          notes: notes.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add stock');
      }

      setTicker('');
      setNotes('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Add Stock
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 
              dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Stock Ticker *
            </label>
            <input
              type="text"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              placeholder="e.g., BBCA, TLKM"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                font-mono text-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter the JKSE stock ticker symbol
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why are you tracking this stock?"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 
                rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none
                resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 
                text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 
                dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !ticker.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white 
                rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
