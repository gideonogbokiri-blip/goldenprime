'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import PasswordStrength from '@/components/ui/PasswordStrength';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (refParam) setForm(prev => ({ ...prev, referralCode: refParam }));
  }, [refParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        referralCode: form.referralCode || undefined,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">
          <span className="text-gold-500">Golden</span>Prime
        </h1>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
          <h2 className="text-2xl font-semibold mb-2">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">Start investing in GoldenPrime Gold Coin</p>
          {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>}
          {refParam && (
            <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg px-4 py-3 mb-4 text-sm text-gold-500">
              Referred by: <span className="font-bold">{refParam}</span> — You&apos;ll both earn rewards!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
              <input type="text" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
            </div>
            <input type="email" placeholder="Email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
            <input type="password" placeholder="Password (min 8 chars)" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
            <PasswordStrength password={form.password} />
            <input type="password" placeholder="Confirm Password" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
            <input type="text" placeholder="Referral Code (optional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
            <button type="submit" disabled={loading} className="w-full bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-gray-400 mt-6">
            Already have an account? <Link href="/login" className="text-gold-500 hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
