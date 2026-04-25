import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'NGIM - Next-Gen Inventory Management',
  description: 'Smart supply chain management platform with demand forecasting and ESG compliance',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
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
