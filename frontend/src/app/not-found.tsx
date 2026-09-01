'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import BrandLogo from '@/components/ui/BrandLogo';

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center relative z-10"
      >
        <div className="flex justify-center mb-6">
          <BrandLogo size={48} />
        </div>
        <h1 className="text-7xl font-bold text-gold-500 mb-4">404</h1>
        <p className="text-xl text-zinc-400 mb-2">Page not found</p>
        <p className="text-sm text-zinc-600 mb-8">The page you are looking for does not exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors text-sm font-medium"
          >
            Go Back
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 rounded-xl bg-gold-500 text-black hover:bg-gold-400 transition-colors text-sm font-semibold"
          >
            Dashboard
          </button>
        </div>
      </motion.div>
    </main>
  );
}
