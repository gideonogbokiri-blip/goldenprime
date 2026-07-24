'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import { motion } from 'framer-motion';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', referralCode: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (refParam) setForm(prev => ({ ...prev, referralCode: refParam }));
  }, [refParam]);

  const passwordChecks = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
  };
  const passwordValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim()) { setError('First name is required'); return; }
    if (!form.lastName.trim()) { setError('Last name is required'); return; }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (!passwordValid) { setError('Password does not meet all requirements'); return; }
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
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-zinc-950 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold-500/[0.04] rounded-full blur-[100px]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <BrandLogo size={52} />
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-xl md:text-2xl font-bold mb-1">Create Account</h2>
          <p className="text-gray-400 text-sm mb-6">Start investing in GoldenPrime Gold Coin</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </motion.div>
          )}

          {refParam && (
            <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-gold-400">
              Referred by: <span className="font-bold">{refParam}</span> — You&apos;ll both earn GPG rewards!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="First Name *" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-gold-500/60 text-sm text-white placeholder-zinc-500 transition-colors" />
              <input type="text" placeholder="Last Name *" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-gold-500/60 text-sm text-white placeholder-zinc-500 transition-colors" />
            </div>
            <input type="email" placeholder="Email address *" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-gold-500/60 text-sm text-white placeholder-zinc-500 transition-colors" />

            {/* Password with visibility toggle */}
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} placeholder="Password *" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-gold-500/60 text-sm text-white placeholder-zinc-500 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>

            {/* Password requirements */}
            {form.password.length > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-2 gap-1.5 px-1">
                {[
                  { key: 'length', label: '8+ characters' },
                  { key: 'upper', label: 'Uppercase letter' },
                  { key: 'lower', label: 'Lowercase letter' },
                  { key: 'number', label: 'A number' },
                ].map(({ key, label }) => (
                  <div key={key} className={`flex items-center gap-1.5 text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    {passwordChecks[key as keyof typeof passwordChecks] ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <div className="w-3 h-3 rounded-full border border-current" />
                    )}
                    {label}
                  </div>
                ))}
              </motion.div>
            )}

            <input type="password" placeholder="Confirm Password *" required value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-gold-500/60 text-sm text-white placeholder-zinc-500 transition-colors" />

            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-red-400 text-xs px-1">Passwords do not match</p>
            )}

            <input type="text" placeholder="Referral Code (optional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
              className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700/80 rounded-xl focus:outline-none focus:border-gold-500/60 text-sm text-white placeholder-zinc-500 transition-colors" />

            <button type="submit" disabled={loading || !passwordValid}
              className="w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed text-black"
              style={{ background: passwordValid ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)' : '#27272a', color: passwordValid ? 'black' : '#52525b' }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                  Creating Account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-zinc-800/60 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account? <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">Sign In</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-gray-600 text-xs mt-4 px-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-gold-500 flex items-center gap-2"><svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Loading...</div></main>}>
      <RegisterForm />
    </Suspense>
  );
}
