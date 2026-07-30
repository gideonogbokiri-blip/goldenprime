'use client';

const TOKENS = [
  { label: 'BTC', color: '#F7931A', cx: '15%', cy: '25%', size: 32, delay: 0 },
  { label: 'ETH', color: '#627EEA', cx: '85%', cy: '20%', size: 28, delay: 0.5 },
  { label: 'SOL', color: '#9945FF', cx: '20%', cy: '75%', size: 26, delay: 1 },
  { label: 'GPG', color: '#D4AF37', cx: '80%', cy: '70%', size: 30, delay: 0.3 },
  { label: 'USDC', color: '#2775CA', cx: '50%', cy: '10%', size: 22, delay: 0.8 },
  { label: 'AAVE', color: '#B6509E', cx: '10%', cy: '50%', size: 24, delay: 1.2 },
  { label: 'UNI', color: '#FF007A', cx: '90%', cy: '45%', size: 20, delay: 0.6 },
  { label: 'BNB', color: '#F3BA2F', cx: '45%', cy: '88%', size: 26, delay: 0.4 },
];

export function FloatingTokens() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {TOKENS.map(t => (
        <div key={t.label}
          className="absolute animate-float-slow"
          style={{
            left: t.cx, top: t.cy,
            width: t.size, height: t.size,
            animationDelay: `${t.delay}s`,
          }}>
          <div className="w-full h-full rounded-full flex items-center justify-center text-[8px] font-bold"
            style={{
              background: `${t.color}10`,
              border: `1px solid ${t.color}20`,
              color: t.color,
              backdropFilter: 'blur(4px)',
            }}>
            {t.label}
          </div>
        </div>
      ))}
      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold-500/[0.03] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full bg-blue-500/[0.02] blur-[100px]" />
    </div>
  );
}

export function AuthCard({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="bg-zinc-900/60 border border-white/[0.06] rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.15)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
        </div>
        <h1 className="text-xl font-bold text-white">{title}</h1>
        <p className="text-sm text-zinc-500 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
