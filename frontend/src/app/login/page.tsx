'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
          <span className="text-shimmer">Golden</span>Prime
        </h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-6">Sign In</h2>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.input
              whileFocus={{ borderColor: '#D4AF37' }}
              type="email"
              placeholder="Email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
            />
            <motion.input
              whileFocus={{ borderColor: '#D4AF37' }}
              type="password"
              placeholder="Password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>
          <div className="flex flex-col sm:flex-row justify-between gap-2 mt-4 text-sm">
            <Link href="/forgot-password" className="text-gold-500 hover:underline text-center sm:text-left">Forgot Password?</Link>
            <Link href="/register" className="text-gold-500 hover:underline text-center sm:text-right">Create Account</Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
