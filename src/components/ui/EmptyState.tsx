import React from 'react';

type EmptyStateType = 'search' | 'filter' | 'error';

interface EmptyStateProps {
  type: EmptyStateType;
  query?: string;
  onAction: () => void;
}

const EMPTY_STATES = {
  search: {
    icon: '🔍',
    title: (q: string) => `No results for "${q}"`,
    body: 'Try a different ticker or company name.',
    action: 'Clear search',
  },
  filter: {
    icon: '📊',
    title: () => 'No stocks match your filters',
    body: 'Try adjusting or resetting your filters to see more results.',
    action: 'Reset filters',
  },
  error: {
    icon: '⚠️',
    title: () => 'Something went wrong',
    body: "We couldn't load the data. Please try again.",
    action: 'Try again',
  },
};

export function EmptyState({ type, query, onAction }: EmptyStateProps) {
  const state = EMPTY_STATES[type];
  return (
    <div className="
      flex flex-col items-center
      justify-center py-16 px-6
      text-center animate-fade-in
    ">
      <span className="text-5xl mb-4">
        {state.icon}
      </span>
      <h3 className="
        text-base font-semibold
        text-text-primary mb-2
      ">
        {state.title(query ?? '')}
      </h3>
      <p className="
        text-sm text-text-secondary
        max-w-xs mb-6
      ">
        {state.body}
      </p>
      <button
        onClick={onAction}
        className="
          px-4 py-2 rounded-lg
          bg-brand-dim text-brand
          text-sm font-medium
          hover:bg-brand hover:text-white
          transition-all duration-150
        ">
        {state.action}
      </button>
    </div>
  );
}
