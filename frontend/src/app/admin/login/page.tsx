'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import { AuthCard } from '@/components/ui/AuthLayout';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props}
    className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-gold-500/50 text-sm text-white placeholder-zinc-500 transition-all hover:border-white/[0.12]" />
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      if (res.data.user?.role !== 'admin') {
        setError('This account does not have admin access.');
        setLoading(false);
        return;
      }
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      router.push('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/[0.04] via-transparent to-transparent pointer-events-none" />
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <BrandLogo size={32} />
          </div>
          <AuthCard title="Admin Login" subtitle="Restricted access — GoldenPrime staff only">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold-500 bg-gold-500/10 border border-gold-500/20 rounded-lg px-3 py-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Admin Portal
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm text-center">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input type="email" placeholder="Admin email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="relative">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Password" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ paddingRight: '3rem' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10 disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In to Admin'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => router.push('/forgot-password')}
                className="text-sm text-zinc-500 hover:text-gold-400 transition-colors">Forgot your password?</button>
            </div>

            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
              <Link href="/login" className="text-sm text-zinc-500 hover:text-gold-400 transition-colors">User Login</Link>
            </div>
          </AuthCard>
        </motion.div>
      </div>
    </main>
  );
}
