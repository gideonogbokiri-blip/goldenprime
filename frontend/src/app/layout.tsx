import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import ChatBot from '@/components/ChatBot';

export const metadata: Metadata = {
  title: 'GoldenPrime - Digital Gold Investment Platform',
  description: 'A professional digital asset brokerage. Fund your account, trade, refer friends, and grow your wealth securely.',
  keywords: ['GoldenPrime', 'investment', 'broker', 'digital assets', 'trading', 'referrals'],
  manifest: '/manifest.json',
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
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
        <ChatBot />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // The old service worker cached pages and served stale HTML/JS on
              // subsequent visits (especially outside Chrome). The app no longer
              // needs a service worker, so unregister any old ones and drop their
              // caches to make sure every browser loads fresh assets.
              window.addEventListener('load', function () {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function (registrations) {
                    registrations.forEach(function (registration) { registration.unregister(); });
                  }).catch(function () {});
                }
                if (window.caches && caches.keys) {
                  caches.keys().then(function (keys) {
                    keys.filter(function (key) { return key.indexOf('goldenprime') === 0; })
                      .forEach(function (key) { caches.delete(key); });
                  }).catch(function () {});
                }
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
