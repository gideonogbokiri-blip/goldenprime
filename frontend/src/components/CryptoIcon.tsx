'use client';

interface CryptoIconProps {
  symbol: string;
  size?: number;
  className?: string;
}

const icons: Record<string, (size: number, className: string) => JSX.Element> = {
  BTC: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#F7931A"/>
      <path d="M22.5 14.5c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.3-.3l.7-2.7-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3l0 0-2.2-.5-.4 1.7s1.2.3 1.2.3c.7.2.8.6.8 1l-.8 3.2c0 .1-.1.1-.2.1l-.3-.1-.4 1.7 2.5.6c.1 0 .3.1.4.1l-.1.4-1.1.3.7 2.7 1.6.4-.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.7c2.8.5 4.9.3 5.8-2.2.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2.1-4 .7-5.2.5l.9-3.6c1.2.3 5 .9 4.3 3.1zm.5-5.4c-.5 1.9-3.4.9-4.3.7l.8-3.2c.9.2 4 .7 3.5 2.5z" fill="white"/>
    </svg>
  ),
  ETH: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#627EEA"/>
      <path d="M16 4v8.5l7 3.2-7 12.3V17.5l-7-3.2L16 4z" fill="white" fillOpacity="0.6"/>
      <path d="M16 4l7 11.7-7 3.2V4z" fill="white"/>
      <path d="M16 17.5l7-3.2L16 28V17.5z" fill="white" fillOpacity="0.8"/>
      <path d="M9 14.3L16 17.5V28l-7-12.3z" fill="white" fillOpacity="0.6"/>
    </svg>
  ),
  SOL: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="solGrad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#9945FF"/>
          <stop offset="100%" stopColor="#14F195"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#solGrad)"/>
      <path d="M9.2 20.7h13.5c.6 0 .9-.3.9.3l-2.3 2.4c-.3.3-.1.6.3.6H10.9c-.6 0-.9-.3-.6-.6l8-13.5c.3-.3.6-.3.9 0l2.3 2.4c.3.3.6.3.3.6H9.6c-.6 0-.9.3-.6.6l.2.2z" fill="white"/>
      <path d="M22.8 11.3H9.3c-.6 0-.9.3-.9-.3l2.3-2.4c.3-.3.1-.6-.3-.6h10.5c.6 0 .9.3.6.6l-8 13.5c-.3.3-.6.3-.9 0l-2.3-2.4c-.3-.3-.6-.3-.3-.6h13.5c.6 0 .9-.3.6-.6l-.2-.2z" fill="white"/>
    </svg>
  ),
  USDT: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#26A17B"/>
      <path d="M17.1 13.5V10.5h-2.2v3c-1.7.1-3.1.7-3.1 2.1 0 1.5 1.8 2 3.9 2.6 2.2.6 3.2 1.4 3.2 2.6 0 1.4-1.5 2-3.5 2v3h2.2v-3c1.7-.1 3.2-.8 3.2-2.2 0-1.7-2-2.1-4-2.7-2-.6-3.1-1.3-3.1-2.5 0-1.3 1.4-2 3.4-2.1zm-4 6.4c0-.4.5-.7 1.3-1 1.5-.4 2.3-.7 2.3-1.2 0-.6-.6-1-1.8-1h-1.8v2.2zm4.4 4.3v-2.4c.1 0 1.5-.1 1.5.7 0 .5-.5.9-1.5.9v.8z" fill="white"/>
    </svg>
  ),
  USDC: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#2775CA"/>
      <path d="M16 7.2c-4.8 0-8.8 4-8.8 8.8s4 8.8 8.8 8.8 8.8-4 8.8-8.8-4-8.8-8.8-8.8zm4.1 13.5h-1.7c-.3-1.2-1.1-2-2.4-2.4v2.4h-2v-2.4c-1.3.3-2.1 1.1-2.4 2.4H9.9v-1.7h1.5c.1-.4.2-.7.4-1.1h-1.7v-1.6h1.7c.7-1.3 2-2 3.7-2V11.9h2v2.5c1.7.3 3 1.3 3.7 2.7h1.7v1.6H21c-.1.3-.2.6-.4.9H22.2v1.6h-2.1z" fill="white"/>
    </svg>
  ),
  GPG: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <defs>
        <linearGradient id="gpgGrad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#D4AF37"/>
          <stop offset="100%" stopColor="#FFD700"/>
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="16" fill="url(#gpgGrad)"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#B8960C" strokeWidth="1" strokeDasharray="2 2"/>
      <text x="16" y="21" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1a1a1a" fontFamily="Arial, sans-serif">GP</text>
    </svg>
  ),
  XRP: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#23292F"/>
      <path d="M12.4 20.4c-.4-.2-.6-.6-.4-1l1.2-1.6-4.6-3.4c-.4-.3-.3-.7.1-.9l1.4-.6 5.3.4 2.2-2.6-2.4-1.8c-.3-.3-.1-.6.2-.7l2-.5 2.4 1.8c.3.2.5.6.3 1l-2.1 2.5 4.6 3.4c.4.3.3.7-.1.9l-1.4.6-5.4-.4-2.1 2.7c.4.2.6.5.4.9z" fill="white" fillOpacity="0.9"/>
    </svg>
  ),
  DOGE: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#C2A633"/>
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">D</text>
    </svg>
  ),
  ADA: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#0033AD"/>
      <circle cx="16" cy="10" r="2.5" fill="white"/>
      <circle cx="16" cy="22" r="2.5" fill="white"/>
      <path d="M6 16a10 10 0 0 1 20 0" stroke="white" strokeWidth="2.5" fill="none"/>
    </svg>
  ),
  DOT: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#E6007A"/>
      <circle cx="16" cy="16" r="4" fill="white"/>
    </svg>
  ),
  default: (size, className) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className}>
      <circle cx="16" cy="16" r="16" fill="#6B7280"/>
      <text x="16" y="21" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="Arial, sans-serif">?</text>
    </svg>
  ),
};

export default function CryptoIcon({ symbol, size = 24, className = '' }: CryptoIconProps) {
  const key = symbol.toUpperCase();
  const renderer = icons[key] || icons.default;
  return renderer(size, className);
}
