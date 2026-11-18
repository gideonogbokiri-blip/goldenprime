'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('GoldenPrime client error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-gold-500/10 border border-gold-500/25 flex items-center justify-center mx-auto mb-6 text-gold-400 text-2xl">
          !
        </div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          We couldn&apos;t load this page. Please try again — if the problem continues, close this tab and reopen the site.
        </p>
        {error.message && (
          <p className="mb-6 text-[11px] text-zinc-500 font-mono break-words bg-white/[0.03] border border-white/[0.06] rounded-lg p-3">
            {error.message}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="bg-gold-500 text-black px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="border border-white/10 px-6 py-3 rounded-xl font-semibold text-sm text-zinc-300 hover:bg-white/[0.04] transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
