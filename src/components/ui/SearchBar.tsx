"use client";

import React, { useState, useEffect } from 'react';

// Simple debounce hook implementation
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export function SearchBar({ onSearch, placeholder = "Search ticker or company...", initialValue = "" }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 300);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative w-full">
      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-text-muted pointer-events-none">
        search
      </span>
      <input
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder={placeholder}
        className="
          w-full h-11 pl-10 pr-10
          bg-surface-input border border-border rounded-xl
          text-sm text-text-primary placeholder:text-text-muted
          focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-dim
          transition-all duration-150
        "
      />
      {value && (
        <button
          onClick={() => {
            setValue('');
            onSearch('');
          }}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            p-1 rounded-md text-text-muted hover:text-text-primary
            hover:bg-surface-elevated transition-colors flex items-center justify-center
          ">
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      )}
    </div>
  );
}
