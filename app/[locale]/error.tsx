'use client';

import { useEffect } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.ReactElement {
  const t = useTranslations('errors');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060d18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        fontFamily: 'var(--font-dm-sans), DM Sans, sans-serif',
        color: '#e8f4f8',
        textAlign: 'center',
      }}
    >
      <div>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, marginBottom: 12 }}>
          {t('boundaryTitle')}
        </h1>
        <p style={{ color: '#a8c8e8', marginBottom: 24, maxWidth: 400, lineHeight: 1.6 }}>
          {t('boundaryBody')}
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '12px 24px',
              background: '#2a9d8f',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t('tryAgain')}
          </button>
          <Link
            href="/"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#132030',
              color: '#e8f4f8',
              border: '1px solid #1e3a52',
              borderRadius: 10,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            {t('notFoundCta')}
          </Link>
        </div>
      </div>
    </div>
  );
}
