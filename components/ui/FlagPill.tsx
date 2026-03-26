'use client';

import React from 'react';

const FLAG_CLASSES: Record<string, string> = {
  'Insider>75%':        'bg-bear/10 border-bear/30 text-bear',
  'SingleCP>50%':       'bg-tier-red/10 border-tier-red/30 text-tier-red',
  'LowFloat<15%':       'bg-tier-amber/10 border-tier-amber/30 text-tier-amber',
  'CriticalFloat<5%':   'bg-bear/15 border-bear/40 text-bear',
  'ZeroForeign':        'bg-ink-muted/10 border-ink-muted/20 text-ink-muted',
};

export function FlagPill({ flag }: { flag: string }): React.ReactElement {
  const classes = FLAG_CLASSES[flag] ?? 'bg-base-500/30 border-base-400/30 text-ink-muted';

  return (
    <span className={`inline-block border rounded text-[9px] px-1.5 py-px m-px leading-normal ${classes}`}>
      {flag}
    </span>
  );
}
