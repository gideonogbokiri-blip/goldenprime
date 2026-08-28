'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import { FloatingTokens, AuthCard } from '@/components/ui/AuthLayout';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props}
    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-gold-500/50 text-sm text-white placeholder-zinc-500 transition-all hover:border-white/[0.12]" />
);

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Missing reset token.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'This reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-8 text-center gap-3">
        <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-emerald-400 font-semibold">Password updated!</p>
        <p className="text-zinc-400 text-sm">You can now sign in with your new password.</p>
        <Link href="/login" className="mt-2 w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all text-center">
          Sign In
        </Link>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Input type={showPassword ? 'text' : 'password'} placeholder="New password" required value={password}
          onChange={(e) => setPassword(e.target.value)} style={{ paddingRight: '3rem' }} />
        <button type="button" onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
          {showPassword ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      <Input type={showPassword ? 'text' : 'password'} placeholder="Confirm new password" required value={confirm}
        onChange={(e) => setConfirm(e.target.value)} />
      <button type="submit" disabled={loading}
        className="w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10 disabled:opacity-50">
        {loading ? 'Resetting...' : 'Reset Password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      <FloatingTokens />
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <BrandLogo size={32} />
          </div>
          <Suspense fallback={<div className="text-center text-zinc-500 text-sm py-10">Loading...</div>}>
            <AuthCard title="Set a New Password" subtitle="Choose a strong password for your account">
              <ResetPasswordForm />
            </AuthCard>
          </Suspense>
        </motion.div>
      </div>
    </main>
  );
}
