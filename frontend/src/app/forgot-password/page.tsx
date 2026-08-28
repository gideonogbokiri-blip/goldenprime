'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import { FloatingTokens, AuthCard } from '@/components/ui/AuthLayout';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props}
    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-gold-500/50 text-sm text-white placeholder-zinc-500 transition-all hover:border-white/[0.12]" />
);

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      <FloatingTokens />
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <BrandLogo size={32} />
          </div>
          <AuthCard title="Reset Password" subtitle="Enter your email to receive a reset link">
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm text-center">
                {error}
              </motion.div>
            )}

            {sent ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 text-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="text-emerald-400 font-semibold">Reset email sent!</p>
                <p className="text-zinc-400 text-sm">If an account exists for <span className="text-white">{email}</span>, a password reset link has been sent. Check your inbox (and spam folder).</p>
                <Link href="/login" className="mt-2 w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all text-center">
                  Back to Sign In
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <p className="text-zinc-400 text-xs mb-1">We&apos;ll email you a secure link to reset your password.</p>
                <Input type="email" placeholder="Email address" required value={email}
                  onChange={(e) => setEmail(e.target.value)} />
                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
              <p className="text-zinc-500 text-sm">
                Remembered it?{' '}
                <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">Sign In</Link>
              </p>
            </div>
          </AuthCard>
        </motion.div>
      </div>
    </main>
  );
}
