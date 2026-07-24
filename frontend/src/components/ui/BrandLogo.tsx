'use client';

import Link from 'next/link';
import GoldCoinLogo from './GoldCoinLogo';

interface BrandLogoProps {
  size?: number;
  textSize?: string;
  href?: string;
  showAdmin?: boolean;
  className?: string;
}

export default function BrandLogo({ size = 36, textSize = 'text-xl md:text-2xl', href, showAdmin = false, className = '' }: BrandLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <GoldCoinLogo size={size} />
      <div className="flex items-baseline">
        <span className="font-bold text-white">Golden</span>
        <span className="font-bold text-gold-500">Prime</span>
        {showAdmin && <span className="text-xs text-gray-500 ml-1.5 font-normal">Admin</span>}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className={`flex items-center gap-2.5 hover:opacity-80 transition-opacity ${className}`}>{content}</Link>;
  }
  return content;
}
