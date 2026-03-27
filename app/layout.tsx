import type { Metadata, Viewport } from 'next';
import { DM_Sans, DM_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

// Terminal Design System Fonts
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Right to Information',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#060d18',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${dmMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Stockscope" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${dmSans.className} bg-[#060d18] text-[#e8f4f8] antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
