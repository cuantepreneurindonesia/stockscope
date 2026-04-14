/**
 * Watchlist Sidebar - List all user watchlists
 * Shows watchlist cards with stock count and quick actions
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, List, Trash2, AlertCircle, X } from 'lucide-react';

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
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

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
    setPendingDelete(id);
    setInlineError(null);
  };

  const handleConfirmDelete = async (id: string) => {
    setPendingDelete(null);
    try {
      const res = await fetch(`/api/watchlists/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setWatchlists((prev) => prev.filter((w) => w.id !== id));
      if (selectedWatchlistId === id) {
        onSelectWatchlist(watchlists[0]?.id || '');
      }
    } catch (err) {
      setInlineError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  if (!session?.user) {
    return (
      <div className="p-4 text-center text-sm text-text-muted">
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
            className="h-20 bg-surface-elevated rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-bear">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-text-secondary" />
            <h2 className="text-lg font-semibold text-text-primary">
              Watchlists
            </h2>
          </div>
          <span className="text-xs text-text-muted">
            {watchlists.length}
          </span>
        </div>
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
            bg-brand hover:opacity-90 text-white rounded-lg
            transition-opacity text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Watchlist
        </button>
      </div>

      {/* Inline error */}
      {inlineError && (
        <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 bg-bear-bg border border-bear/30 rounded-lg text-bear text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1">{inlineError}</span>
          <button onClick={() => setInlineError(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Watchlist Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {watchlists.length === 0 ? (
          <div className="text-center py-8 text-text-muted text-sm">
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
                border
                ${
                  selectedWatchlistId === watchlist.id
                    ? 'bg-brand-dim border-brand'
                    : 'bg-surface-card border-border-subtle hover:border-border'
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
                    <h3 className="font-semibold text-sm text-text-primary truncate">
                      {watchlist.name}
                    </h3>
                  </div>
                  {watchlist.description && (
                    <p className="text-xs text-text-muted line-clamp-1 mb-2">
                      {watchlist.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">
                      {watchlist.itemCount} {watchlist.itemCount === 1 ? 'stock' : 'stocks'}
                    </span>
                    {watchlist.tickers.length > 0 && (
                      <span className="text-xs font-mono text-text-muted">
                        {watchlist.tickers.slice(0, 3).join(', ')}
                        {watchlist.tickers.length > 3 && '...'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete / Confirm delete */}
                {pendingDelete === watchlist.id ? (
                  <div className="flex flex-col items-end gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <span className="text-xs text-text-muted">Delete?</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleConfirmDelete(watchlist.id)}
                        className="px-2 py-0.5 text-xs bg-bear hover:opacity-80 text-white rounded transition-opacity"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setPendingDelete(null)}
                        className="px-2 py-0.5 text-xs bg-surface-elevated hover:bg-border text-text-secondary rounded transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={(e) => handleDelete(watchlist.id, e)}
                    className="p-1 text-text-muted hover:text-bear transition-colors flex-shrink-0"
                    title="Delete watchlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
