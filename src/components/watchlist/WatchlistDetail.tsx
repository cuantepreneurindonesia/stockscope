/**
 * Watchlist Detail - Display and manage stocks in a watchlist
 * Features: drag-drop reordering, remove stocks, add notes
 */

'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Plus, AlertCircle } from 'lucide-react';

interface WatchlistItem {
  id: string;
  ticker: string;
  notes: string | null;
  position: number;
  addedAt: string;
}

interface WatchlistDetailProps {
  watchlistId: string;
  onAddStock: () => void;
}

interface SortableItemProps {
  item: WatchlistItem;
  onRemove: (ticker: string) => void;
  pendingRemove: string | null;
  onConfirmRemove: (ticker: string) => void;
  onCancelRemove: () => void;
}

function SortableItem({ item, onRemove, pendingRemove, onConfirmRemove, onCancelRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isConfirming = pendingRemove === item.ticker;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-surface-card
        border border-border-subtle rounded-lg
        hover:border-border transition-colors"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-secondary touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Stock Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-text-primary font-mono text-sm">
          {item.ticker}
        </div>
        {item.notes && (
          <div className="text-xs text-text-muted truncate mt-1">
            {item.notes}
          </div>
        )}
      </div>

      {/* Remove / Confirm Remove */}
      {isConfirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-text-muted">Remove?</span>
          <button
            onClick={() => onConfirmRemove(item.ticker)}
            className="px-2 py-0.5 text-xs bg-bear hover:opacity-80 text-white rounded transition-opacity"
          >
            Yes
          </button>
          <button
            onClick={onCancelRemove}
            className="px-2 py-0.5 text-xs bg-surface-elevated hover:bg-border text-text-secondary rounded transition-colors"
          >
            No
          </button>
        </div>
      ) : (
        <button
          onClick={() => onRemove(item.ticker)}
          className="p-1 text-text-muted hover:text-bear transition-colors flex-shrink-0"
          title="Remove from watchlist"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export function WatchlistDetail({ watchlistId, onAddStock }: WatchlistDetailProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [watchlistName, setWatchlistName] = useState('');
  const [pendingRemove, setPendingRemove] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (watchlistId) {
      fetchWatchlistDetail();
    }
  }, [watchlistId]);

  const fetchWatchlistDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/watchlists/${watchlistId}`);
      if (!res.ok) throw new Error('Failed to fetch watchlist');
      const data = await res.json();
      setWatchlistName(data.name);
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // Update positions in backend
    try {
      const updates = newItems.map((item, index) => ({
        id: item.id,
        position: index,
      }));

      const res = await fetch(`/api/watchlists/${watchlistId}/items`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updates }),
      });

      if (!res.ok) throw new Error('Failed to update order');
    } catch (err) {
      // Revert on error
      setItems(items);
      setInlineError('Failed to save new order. Please try again.');
    }
  };

  const handleRemove = (ticker: string) => {
    setPendingRemove(ticker);
    setInlineError(null);
  };

  const handleConfirmRemove = async (ticker: string) => {
    setPendingRemove(null);
    try {
      const res = await fetch(
        `/api/watchlists/${watchlistId}/items?ticker=${ticker}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to remove stock');
      setItems((prev) => prev.filter((item) => item.ticker !== ticker));
    } catch (err) {
      setInlineError(err instanceof Error ? err.message : 'Remove failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-48 bg-surface-elevated rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 bg-surface-elevated rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!watchlistId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        Select a watchlist to view details
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-text-primary">
            {watchlistName}
          </h2>
          <button
            onClick={onAddStock}
            className="flex items-center gap-2 px-4 py-2 bg-brand hover:opacity-90
              text-white rounded-lg transition-opacity text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
        <p className="text-sm text-text-secondary">
          {items.length} {items.length === 1 ? 'stock' : 'stocks'} • Drag to reorder
        </p>
      </div>

      {/* Inline error banner */}
      {inlineError && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-bear-bg border border-bear/30 rounded-lg text-bear text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{inlineError}</span>
          <button onClick={() => setInlineError(null)} className="text-bear hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p className="mb-2">No stocks in this watchlist yet</p>
            <button
              onClick={onAddStock}
              className="text-brand hover:opacity-80 text-sm font-medium"
            >
              Add your first stock →
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={items.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <SortableItem
                    key={item.id}
                    item={item}
                    onRemove={handleRemove}
                    pendingRemove={pendingRemove}
                    onConfirmRemove={handleConfirmRemove}
                    onCancelRemove={() => setPendingRemove(null)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
