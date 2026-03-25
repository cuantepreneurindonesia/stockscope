'use client';

import { useEffect, useState } from 'react';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { localizedPath } from '@/lib/i18n/localizedPath';

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

type UpgradeMessages = {
  features: string[];
  errors: {
    createFailed: string;
    script: string;
    paymentFailed: string;
  };
};

export default function UpgradePage(): React.ReactElement {
  const t = useTranslations('upgrade');
  const messages = useMessages();
  const upgradeBlock = messages.upgrade as unknown as UpgradeMessages;
  const features = upgradeBlock.features ?? [];
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get('status');
    if (s === 'success' || s === 'pending' || s === 'error') {
      setStatus(s);
    }
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src =
      process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
        ? 'https://app.midtrans.com/snap/snap.js'
        : 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute(
      'data-client-key',
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? ''
    );
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handlePayment = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 401) {
        const { signIn } = await import('next-auth/react');
        await signIn('google', {
          callbackUrl: localizedPath(locale, pathname),
        });
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data.error as string) ?? t('errors.createFailed'));
        return;
      }

      const { token } = await res.json();

      if (typeof window.snap?.pay !== 'function') {
        setError(t('errors.script'));
        return;
      }

      window.snap.pay(token, {
        onSuccess: () => {
          setStatus('success');
          router.refresh();
        },
        onPending: () => {
          setStatus('pending');
        },
        onError: () => {
          setError(t('errors.paymentFailed'));
        },
        onClose: () => {
          setIsLoading(false);
        },
      });
    } catch {
      setError(t('errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const isSuccess = status === 'success';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060d18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(16px, 5vw, 40px)',
        fontFamily: 'DM Sans, sans-serif',
        color: '#e8f4f8',
      }}
    >
      <div
        style={{
          background: '#09131f',
          border: '1px solid #1e3a52',
          borderRadius: 16,
          padding: 'clamp(24px, 6vw, 48px)',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 3,
            color: '#457b9d',
            fontFamily: 'DM Mono, monospace',
            marginBottom: 16,
          }}
        >
          {t('eyebrow')}
        </div>

        {status === 'success' && (
          <div
            style={{
              background: '#2a9d8f22',
              border: '1px solid #2a9d8f',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#2a9d8f',
              fontSize: 14,
            }}
          >
            {t('success')}
            <button
              type="button"
              onClick={() => {
                router.push('/');
                router.refresh();
              }}
              style={{
                display: 'block',
                margin: '10px auto 0',
                padding: '8px 20px',
                fontSize: 12,
                background: '#2a9d8f',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {t('refreshNow')}
            </button>
          </div>
        )}

        {status === 'pending' && (
          <div
            style={{
              background: '#e9c46a22',
              border: '1px solid #e9c46a',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#e9c46a',
              fontSize: 14,
            }}
          >
            {t('pending')}
          </div>
        )}

        {status === 'error' && (
          <div
            style={{
              background: '#e76f5122',
              border: '1px solid #e76f51',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              color: '#e76f51',
              fontSize: 14,
            }}
          >
            {t('errorStatus')}
          </div>
        )}

        <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>

        <h1
          style={{
            fontSize: 'clamp(20px, 5vw, 28px)',
            fontWeight: 700,
            color: '#e8f4f8',
            marginBottom: 8,
          }}
        >
          {t('title')}
        </h1>

        <p
          style={{
            fontSize: 14,
            color: '#a8c8e8',
            lineHeight: 1.6,
            marginBottom: 28,
          }}
        >
          {t('subtitle')}
        </p>

        <ul
          style={{
            textAlign: 'left',
            listStyle: 'none',
            padding: 0,
            margin: 0,
          }}
        >
          {features.map((text, i) => (
            <li
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 10,
              }}
            >
              <span
                style={{
                  color: '#2a9d8f',
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                ✓
              </span>
              <span
                style={{
                  color: '#a8c8e8',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {text}
              </span>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 24, marginBottom: 20 }}>
          <div
            style={{
              fontSize: 'clamp(28px, 6vw, 36px)',
              fontWeight: 700,
              color: '#e8f4f8',
              fontFamily: 'DM Mono, monospace',
            }}
          >
            Rp 17.000
          </div>
          <div style={{ fontSize: 12, color: '#6b8aad', marginTop: 4 }}>{t('priceNote')}</div>
        </div>

        <button
          type="button"
          onClick={handlePayment}
          disabled={isLoading || isSuccess}
          style={{
            width: '100%',
            padding: 14,
            background: isLoading || isSuccess ? '#457b9d' : '#2a9d8f',
            border: 'none',
            borderRadius: 10,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: isLoading || isSuccess ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif',
            transition: 'opacity 0.2s',
            marginBottom: 12,
            opacity: isLoading ? 0.85 : 1,
          }}
          onMouseOver={(e) => {
            if (!isLoading && !isSuccess) e.currentTarget.style.opacity = '0.85';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.opacity = isLoading ? '0.85' : '1';
          }}
        >
          {isSuccess ? t('complete') : isLoading ? t('creating') : t('payQris')}
        </button>

        <div
          style={{
            marginTop: 8,
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 10, color: '#6b8aad' }}>{t('accepts')}</span>
          {['QRIS'].map((label) => (
            <span
              key={label}
              style={{
                background: '#132030',
                border: '1px solid #1e3a52',
                borderRadius: 4,
                padding: '3px 8px',
                fontSize: 10,
                color: '#a8c8e8',
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {error && (
          <div
            style={{
              color: '#e76f51',
              fontSize: 12,
              marginTop: 8,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.back()}
          style={{
            marginTop: 20,
            fontSize: 12,
            color: '#6b8aad',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {t('back')}
        </button>
      </div>
    </div>
  );
}
