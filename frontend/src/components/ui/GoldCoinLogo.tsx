'use client';

export default function GoldCoinLogo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <defs>
          <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="40%" stopColor="#D4AF37" />
            <stop offset="70%" stopColor="#B8960F" />
            <stop offset="100%" stopColor="#D4AF37" />
          </linearGradient>
          <linearGradient id="coinShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
          </linearGradient>
          <linearGradient id="coinEdge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#8B7200" />
          </linearGradient>
          <filter id="coinShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#D4AF37" floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Outer ring / edge */}
        <circle cx="50" cy="50" r="48" fill="url(#coinEdge)" filter="url(#coinShadow)" />
        {/* Main coin face */}
        <circle cx="50" cy="50" r="44" fill="url(#coinGrad)" />
        {/* Shine overlay */}
        <circle cx="50" cy="50" r="44" fill="url(#coinShine)" />
        {/* Inner decorative ring */}
        <circle cx="50" cy="50" r="36" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="34" fill="none" stroke="rgba(139,114,0,0.3)" strokeWidth="0.5" />
        {/* GP text */}
        <text x="50" y="46" textAnchor="middle" fill="#000000" fontWeight="800" fontSize="18" fontFamily="system-ui, sans-serif" letterSpacing="1">GP</text>
        {/* Price text */}
        <text x="50" y="62" textAnchor="middle" fill="rgba(0,0,0,0.5)" fontWeight="600" fontSize="10" fontFamily="system-ui, sans-serif">AU</text>
        {/* Specular highlight */}
        <ellipse cx="38" cy="32" rx="14" ry="8" fill="rgba(255,255,255,0.12)" transform="rotate(-20 38 32)" />
      </svg>
    </div>
  );
}
