/**
 * Watchlist Sidebar - List all user watchlists
 * Shows watchlist cards with stock count and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, List, Trash2 } from 'lucide-react';

interface Watchlist {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  position: number;
  itemCount: number;
  tickers: string[];
  createdAt: string;
  updatedAt: string;
}

interface WatchlistSidebarProps {
  onSelectWatchlist: (id: string) => void;
  selectedWatchlistId: string | null;
  onCreateNew: () => void;
}

export function WatchlistSidebar({
  onSelectWatchlist,
  selectedWatchlistId,
  onCreateNew,
}: WatchlistSidebarProps) {
  const { data: session } = useSession();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchWatchlists();
    }
  }, [session]);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/watchlists');
      if (!res.ok) throw new Error('Failed to fetch watchlists');
      const data = await res.json();
      setWatchlists(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this watchlist? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setWatchlists((prev) => prev.filter((w) => w.id !== id));
      if (selectedWatchlistId === id) {
        onSelectWatchlist(watchlists[0]?.id || '');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (!session?.user) {
    return (
      <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
        Sign in to create watchlists
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Watchlists
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {watchlists.length}
          </span>
        </div>
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
            bg-blue-600 hover:bg-blue-700 text-white rounded-lg
            transition-colors duration-150 text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Watchlist
        </button>
      </div>

      {/* Watchlist Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {watchlists.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            <p className="mb-2">No watchlists yet</p>
            <p className="text-xs">Create one to track your favorite stocks</p>
          </div>
        ) : (
          watchlists.map((watchlist) => (
            <div
              key={watchlist.id}
              onClick={() => onSelectWatchlist(watchlist.id)}
              className={`
                p-3 rounded-lg cursor-pointer transition-all duration-150
                border-2
                ${
                  selectedWatchlistId === watchlist.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {watchlist.color && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: watchlist.color }}
                      />
                    )}
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                      {watchlist.name}
                    </h3>
                  </div>
                  {watchlist.description && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">
                      {watchlist.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {watchlist.itemCount} {watchlist.itemCount === 1 ? 'stock' : 'stocks'}
                    </span>
                    {watchlist.tickers.length > 0 && (
                      <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                        {watchlist.tickers.slice(0, 3).join(', ')}
                        {watchlist.tickers.length > 3 && '...'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(watchlist.id, e)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Delete watchlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
