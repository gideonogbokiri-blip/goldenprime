'use client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: '#09090b', color: '#fff', fontFamily: 'sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, margin: '0 0 8px' }}>Something went wrong</h1>
            <p style={{ fontSize: 14, color: '#a1a1aa', lineHeight: 1.6, margin: '0 0 24px' }}>
              We couldn&apos;t load the app. Please try again or reopen this page.
            </p>
            {error.message && (
              <p style={{ fontSize: 11, color: '#71717a', fontFamily: 'monospace', wordBreak: 'break-word', margin: '0 0 24px' }}>
                {error.message}
              </p>
            )}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => reset()} style={{ background: '#D4AF37', color: '#000', border: 0, borderRadius: 12, padding: '12px 24px', fontWeight: 600, cursor: 'pointer' }}>
                Try again
              </button>
              <a href="/" style={{ border: '1px solid #ffffff1a', borderRadius: 12, padding: '12px 24px', color: '#d4d4d8', textDecoration: 'none', fontWeight: 600 }}>
                Go home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
