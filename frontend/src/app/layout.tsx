import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';

export const metadata: Metadata = {
  title: 'GoldenPrime - Digital Gold Investment Platform',
  description: 'Invest in GoldenPrime Gold Coin (GPG) at $50 per coin. Preorder, trade P2P, and earn referral rewards on a secure, regulated crypto investment platform.',
  keywords: ['GoldenPrime', 'GPG', 'digital gold', 'crypto investment', 'gold coin', 'preorder', 'P2P trading'],
  openGraph: {
    title: 'GoldenPrime - Digital Gold Investment Platform',
    description: 'Invest in GoldenPrime Gold Coin (GPG) at $50 per coin. Preorder, trade P2P, and earn referral rewards.',
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
      </body>
    </html>
  );
}
