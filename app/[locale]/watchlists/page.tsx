/**
 * Watchlists Page
 * Main page for managing user watchlists
 */

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { WatchlistSidebar, WatchlistDetail, CreateWatchlistModal, AddStockModal } from '@/components/watchlist';

export default function WatchlistsPage() {
  const { data: session, status } = useSession();
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleWatchlistCreated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleStockAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-base">
        <div className="text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-base">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Sign in to use Watchlists
          </h1>
          <p className="text-text-secondary mb-6">
            Create watchlists to track your favorite JKSE stocks and organize your research.
          </p>
          <a
            href="/api/auth/signin"
            className="inline-block px-6 py-3 bg-brand hover:opacity-90
              text-white rounded-lg transition-opacity font-medium"
          >
            Sign In with Google
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col md:flex-row bg-surface-base">
      {/* Sidebar */}
      <div className="w-full md:w-80 lg:w-96 border-r border-border-subtle
        bg-surface-card overflow-hidden flex flex-col">
        <WatchlistSidebar
          key={refreshTrigger}
          selectedWatchlistId={selectedWatchlistId}
          onSelectWatchlist={setSelectedWatchlistId}
          onCreateNew={() => setIsCreateModalOpen(true)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden bg-surface-base">
        {selectedWatchlistId ? (
          <WatchlistDetail
            key={`${selectedWatchlistId}-${refreshTrigger}`}
            watchlistId={selectedWatchlistId}
            onAddStock={() => setIsAddStockModalOpen(true)}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-text-muted">
            <div className="text-center">
              <p className="text-lg mb-2">No watchlist selected</p>
              <p className="text-sm">Create or select a watchlist to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateWatchlistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleWatchlistCreated}
      />

      {selectedWatchlistId && (
        <AddStockModal
          isOpen={isAddStockModalOpen}
          onClose={() => setIsAddStockModalOpen(false)}
          watchlistId={selectedWatchlistId}
          onSuccess={handleStockAdded}
        />
      )}
    </div>
  );
}
