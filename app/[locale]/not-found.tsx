import type { ReactElement } from 'react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function NotFound(): Promise<ReactElement> {
  const t = await getTranslations('errors');
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
        <h1 style={{ fontSize: 'clamp(48px, 10vw, 72px)', fontWeight: 700, marginBottom: 8 }}>
          {t('notFoundTitle')}
        </h1>
        <p style={{ color: '#a8c8e8', marginBottom: 24, maxWidth: 360, lineHeight: 1.6 }}>
          {t('notFoundBody')}
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            padding: '12px 24px',
            background: '#2a9d8f',
            color: '#fff',
            borderRadius: 10,
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          {t('notFoundCta')}
        </Link>
      </div>
    </div>
  );
}
