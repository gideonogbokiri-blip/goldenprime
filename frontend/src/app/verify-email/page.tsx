'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import { AuthCard } from '@/components/ui/AuthLayout';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }
    authAPI.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err: any) => {
        setStatus('error');
        setError(err.response?.data?.error || 'This verification link is invalid or expired.');
      });
  }, [token]);

  const handleResend = async () => {
    if (!email.trim()) return;
    setResending(true);
    try {
      await authAPI.resendVerification(email);
      setResent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not resend. Try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden px-4">
      <div className="w-full max-w-sm relative z-10">
        <div className="flex justify-center mb-6">
          <BrandLogo size={32} />
        </div>
        <AuthCard title="Email Verification" subtitle="Confirm your email address">
          {status === 'loading' && (
            <div className="flex flex-col items-center py-8 gap-3">
              <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#D4AF37" strokeWidth="3" opacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-gray-400 text-sm">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-6 text-center gap-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-emerald-400 font-semibold">Email verified successfully!</p>
              <p className="text-gray-400 text-sm">Your account is now fully activated. You can sign in.</p>
              <Link href="/login"
                className="mt-2 w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all text-center">
                Sign In
              </Link>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-4">
              <div className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm text-center">
                {error}
              </div>
              <input
                type="email"
                placeholder="Enter your email to resend"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-gold-500/50 text-sm text-white placeholder-zinc-500 mb-3"
              />
              <button
                onClick={handleResend}
                disabled={resending || !email.trim()}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 disabled:opacity-40 transition-all">
                {resent ? 'Sent! Check your inbox' : resending ? 'Sending...' : 'Resend Verification Email'}
              </button>
              <Link href="/login" className="block text-center text-sm text-zinc-500 hover:text-gold-400 mt-4 transition-colors">
                Back to Sign In
              </Link>
            </motion.div>
          )}
        </AuthCard>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-sm text-zinc-500">Loading...</div></main>}>
      <VerifyEmailForm />
    </Suspense>
  );
}