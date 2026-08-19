import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import ChatBot from '@/components/ChatBot';

export const metadata: Metadata = {
  title: 'GoldenPrime - Digital Gold Investment Platform',
  description: 'A professional digital asset brokerage. Fund your account, trade, refer friends, and grow your wealth securely.',
  keywords: ['GoldenPrime', 'investment', 'broker', 'digital assets', 'trading', 'referrals'],
  openGraph: {
    title: 'GoldenPrime - Digital Gold Investment Platform',
    description: 'A professional digital asset brokerage. Fund your account, trade, refer friends, and grow your wealth securely.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0a0a0a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
        <ChatBot />
      </body>
    </html>
  );
}
