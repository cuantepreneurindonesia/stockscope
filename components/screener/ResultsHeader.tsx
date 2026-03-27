'use client';

interface ResultsHeaderProps {
  totalResults: number;
  view: 'table' | 'cards';
  onViewChange: (view: 'table' | 'cards') => void;
}

export function ResultsHeader({ totalResults, view, onViewChange }: ResultsHeaderProps) {
  return (
    <div className="p-6 md:p-10 flex flex-col md:flex-row justify-between items-start 
                    md:items-end gap-6 border-b border-outline-variant/5">
      {/* Left: Title & Badge */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] 
                           font-bold rounded uppercase tracking-tighter border border-primary/20">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse mr-1"></span>
            Live Market
          </span>
          <span className="text-on-surface-variant text-xs">
            • Total Results: {totalResults.toLocaleString()}
          </span>
        </div>
        <h1 className="text-3xl md:text-5xl font-label font-medium uppercase tracking-widest text-on-surface">
          Screening Matrix
        </h1>
      </div>

      {/* Right: View Toggle */}
      <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg">
        <button
          onClick={() => onViewChange('table')}
          className={`p-2 rounded-md transition-all ${
            view === 'table'
              ? 'bg-surface-variant text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="Table view"
        >
          <span className="material-symbols-outlined">list</span>
        </button>
        <button
          onClick={() => onViewChange('cards')}
          className={`p-2 rounded-md transition-all ${
            view === 'cards'
              ? 'bg-surface-variant text-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
          title="Card view"
        >
          <span className="material-symbols-outlined">grid_view</span>
        </button>
      </div>
    </div>
  );
}
