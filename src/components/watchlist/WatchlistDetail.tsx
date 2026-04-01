/**
 * Watchlist Detail - Display and manage stocks in a watchlist
 * Features: drag-drop reordering, remove stocks, add notes
 */

'use client';

import { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Plus } from 'lucide-react';

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
}

function SortableItem({ item, onRemove }: SortableItemProps) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 
        border border-gray-200 dark:border-gray-700 rounded-lg
        hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 
          dark:hover:text-gray-300 touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Stock Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 dark:text-white font-mono">
          {item.ticker}
        </div>
        {item.notes && (
          <div className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
            {item.notes}
          </div>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(item.ticker)}
        className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
        title="Remove from watchlist"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function WatchlistDetail({ watchlistId, onAddStock }: WatchlistDetailProps) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchlistName, setWatchlistName] = useState('');

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
      console.error('Reorder failed:', err);
      // Revert on error
      setItems(items);
      alert('Failed to save new order');
    }
  };

  const handleRemove = async (ticker: string) => {
    if (!confirm(`Remove ${ticker} from watchlist?`)) return;

    try {
      const res = await fetch(
        `/api/watchlists/${watchlistId}/items?ticker=${ticker}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to remove stock');
      setItems((prev) => prev.filter((item) => item.ticker !== ticker));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Remove failed');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
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
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {watchlistName}
          </h2>
          <button
            onClick={onAddStock}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
              text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {items.length} {items.length === 1 ? 'stock' : 'stocks'} • Drag to reorder
        </p>
      </div>

      {/* Stock List */}
      <div className="flex-1 overflow-y-auto p-6">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="mb-2">No stocks in this watchlist yet</p>
            <button
              onClick={onAddStock}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 
                dark:hover:text-blue-300 text-sm font-medium"
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
