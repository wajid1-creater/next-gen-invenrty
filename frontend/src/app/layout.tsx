import type { Metadata } from 'next';
import { Geist, Geist_Mono, Instrument_Serif } from 'next/font/google';
import './globals.css';
import SentryInit from '@/components/SentryInit';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import { AppToaster } from '@/lib/toast';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Premium serif used sparingly as an italic accent on hero headlines.
// One-word emphasis pattern (e.g. "Smarter" in serif italic).
const instrumentSerif = Instrument_Serif({
  variable: '--font-display-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
});

export const metadata: Metadata = {
  title: 'NGIM — Next-Gen Inventory Management',
  description: 'Smart supply chain management platform with demand forecasting and ESG compliance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SentryInit />
        <ConfirmProvider>
          {children}
          <AppToaster />
        </ConfirmProvider>
      </body>
    </html>
  );
}
