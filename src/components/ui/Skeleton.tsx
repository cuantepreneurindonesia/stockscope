import React from 'react';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`
      bg-gradient-to-r
      from-surface-elevated
      via-surface-card
      to-surface-elevated
      bg-[length:200%_100%]
      animate-shimmer rounded-lg
      ${className}
    `}/>
  );
}

export function StockCardSkeleton() {
  return (
    <div className="bg-surface-card border border-border-subtle rounded-xl p-4">
      <div className="flex justify-between mb-2">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-12"/>
          <Skeleton className="h-3 w-28"/>
        </div>
        <div className="space-y-1.5 items-end flex flex-col">
          <Skeleton className="h-4 w-20"/>
          <Skeleton className="h-5 w-14"/>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <Skeleton className="h-5 w-20"/>
        <Skeleton className="h-3 w-24"/>
      </div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-border-subtle">
      {[14,32,18,16,14,14,12].map((w,i)=>(
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-3.5 w-${w}`}/>
        </td>
      ))}
    </tr>
  );
}
