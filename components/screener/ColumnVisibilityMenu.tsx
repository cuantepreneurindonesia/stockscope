'use client';

import { useState, useEffect, useRef } from 'react';

export interface ColumnConfig {
  id: string;
  label: string;
  visible: boolean;
  core?: boolean; // Core columns are always shown
}

interface ColumnVisibilityMenuProps {
  columns: ColumnConfig[];
  onChange: (columns: ColumnConfig[]) => void;
}

export function ColumnVisibilityMenu({ columns, onChange }: ColumnVisibilityMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleToggle = (columnId: string) => {
    const updated = columns.map(col =>
      col.id === columnId && !col.core ? { ...col, visible: !col.visible } : col
    );
    onChange(updated);
  };

  const handleShowAll = () => {
    const updated = columns.map(col => ({ ...col, visible: true }));
    onChange(updated);
  };

  const handleShowCore = () => {
    const updated = columns.map(col => ({ ...col, visible: !!col.core }));
    onChange(updated);
  };

  const visibleCount = columns.filter(c => c.visible).length;

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: '#09131f',
          border: '1px solid #1e3a52',
          borderRadius: 6,
          padding: '8px 12px',
          color: '#a8c8e8',
          fontSize: '0.875rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#0d1e30';
          e.currentTarget.style.borderColor = '#457b9d';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#09131f';
          e.currentTarget.style.borderColor = '#1e3a52';
        }}
        title="Customize visible columns"
      >
        <span style={{ fontSize: '1rem' }}>⚙️</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '0.75rem' }}>
          {visibleCount}/{columns.length}
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            right: 0,
            background: '#060d18',
            border: '1px solid #1e3a52',
            borderRadius: 8,
            padding: 12,
            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            minWidth: 220
          }}
        >
          <div style={{ 
            fontSize: 9, 
            fontFamily: "'DM Mono', monospace", 
            color: '#457b9d', 
            textTransform: 'uppercase', 
            letterSpacing: 1.5, 
            fontWeight: 600,
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: '1px solid #132030'
          }}>
            Column visibility
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {columns.map(col => (
              <label
                key={col.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: col.core ? 'not-allowed' : 'pointer',
                  opacity: col.core ? 0.5 : 1,
                  padding: '4px 6px',
                  borderRadius: 4,
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => {
                  if (!col.core) e.currentTarget.style.background = '#0d1e30';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <input
                  type="checkbox"
                  checked={col.visible}
                  disabled={col.core}
                  onChange={() => handleToggle(col.id)}
                  style={{
                    width: 16,
                    height: 16,
                    cursor: col.core ? 'not-allowed' : 'pointer',
                    accentColor: '#457b9d'
                  }}
                />
                <span style={{ 
                  fontSize: '0.8125rem', 
                  color: col.visible ? '#e8f4f8' : '#6b8aad',
                  fontWeight: col.visible ? 500 : 400
                }}>
                  {col.label}
                  {col.core && (
                    <span style={{ 
                      marginLeft: 6, 
                      fontSize: '0.625rem', 
                      color: '#457b9d',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5
                    }}>
                      (core)
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>

          <div style={{ 
            display: 'flex', 
            gap: 6,
            paddingTop: 8,
            borderTop: '1px solid #132030'
          }}>
            <button
              onClick={handleShowCore}
              style={{
                flex: 1,
                background: '#09131f',
                border: '1px solid #1e3a52',
                borderRadius: 4,
                padding: '6px 8px',
                color: '#a8c8e8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0d1e30';
                e.currentTarget.style.borderColor = '#457b9d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#09131f';
                e.currentTarget.style.borderColor = '#1e3a52';
              }}
            >
              Core only
            </button>
            <button
              onClick={handleShowAll}
              style={{
                flex: 1,
                background: '#09131f',
                border: '1px solid #1e3a52',
                borderRadius: 4,
                padding: '6px 8px',
                color: '#a8c8e8',
                fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: 500
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0d1e30';
                e.currentTarget.style.borderColor = '#457b9d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#09131f';
                e.currentTarget.style.borderColor = '#1e3a52';
              }}
            >
              Show all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
