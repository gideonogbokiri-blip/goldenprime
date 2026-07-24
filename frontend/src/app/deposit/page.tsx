'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DepositRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/preorder'); }, [router]);
  return <main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-gold-500">Redirecting...</div></main>;
}
