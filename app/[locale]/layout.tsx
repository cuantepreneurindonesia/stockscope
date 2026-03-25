import type { ReactElement, ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { LocaleHtmlLang } from '@/components/LocaleHtmlLang';
import { routing, type AppLocale } from '@/i18n/routing';

export function generateStaticParams(): { locale: AppLocale }[] {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<{ title: string; description: string }> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>): Promise<ReactElement> {
  const { locale } = await params;
  if (!routing.locales.includes(locale as AppLocale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <NextIntlClientProvider messages={messages}>
      <LocaleHtmlLang locale={locale} />
      {children}
    </NextIntlClientProvider>
  );
}
