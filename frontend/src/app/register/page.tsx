'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';
import { FloatingTokens, AuthCard } from '@/components/ui/AuthLayout';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refParam = searchParams.get('ref');
  const [step, setStep] = useState<'info' | 'password'>('info');
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

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.firstName.trim()) { setError('First name is required'); return; }
    if (!form.lastName.trim()) { setError('Last name is required'); return; }
    setStep('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (!passwordValid) { setError('Password does not meet all requirements'); return; }
    setLoading(true);
    try {
      const res = await authAPI.register({
        email: form.email, password: form.password, firstName: form.firstName,
        lastName: form.lastName, referralCode: form.referralCode || undefined,
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      if (status === 409) setError('An account with this email already exists. Sign in instead.');
      else if (!err.response) setError('Network error. Try again.');
      else setError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.error || 'Registration failed.');
    } finally { setLoading(false); }
  };

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props}
      className="w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl focus:outline-none focus:border-gold-500/50 text-sm text-white placeholder-zinc-500 transition-all hover:border-white/[0.12]" />
  );

  return (
    <main className="min-h-screen flex flex-col bg-zinc-950 relative overflow-hidden">
      <FloatingTokens />

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <BrandLogo size={32} />
          </div>

          <AuthCard title="Create Account" subtitle={step === 'info' ? 'Start your journey with GoldenPrime' : 'Secure your account'}>
            {refParam && (
              <div className="bg-gold-500/10 border border-gold-500/20 rounded-xl px-4 py-3 mb-4 text-sm text-gold-400 text-center">
                Referred by <span className="font-bold">{refParam}</span> — earn GPG rewards!
              </div>
            )}

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/25 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                {error}
              </motion.div>
            )}

            {step === 'info' ? (
              <form onSubmit={handleInfoSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input type="text" placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
                  <Input type="text" placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
                </div>
                <Input type="email" placeholder="Email address" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input type="text" placeholder="Referral code (optional)" value={form.referralCode} onChange={(e) => setForm({ ...form, referralCode: e.target.value })} />
                <button type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-sm bg-gold-500 text-black hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10">
                  Continue
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })} required
                    style={{ paddingRight: '3rem' }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>

                {form.password.length > 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-1.5">
                    {[
                      { key: 'length', label: '8+ characters' }, { key: 'upper', label: 'Uppercase' },
                      { key: 'lower', label: 'Lowercase' }, { key: 'number', label: 'A number' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`flex items-center gap-1.5 text-xs ${passwordChecks[key as keyof typeof passwordChecks] ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {passwordChecks[key as keyof typeof passwordChecks] ? (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : <div className="w-2.5 h-2.5 rounded-full border border-current" />}
                        {label}
                      </div>
                    ))}
                  </motion.div>
                )}

                <Input type="password" placeholder="Confirm Password" value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-red-400 text-xs">Passwords do not match</p>
                )}

                <button type="submit" disabled={loading || !passwordValid}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: !passwordValid ? '#27272a' : 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)', color: passwordValid ? 'black' : '#52525b' }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                      Creating account...
                    </span>
                  ) : 'Create Account'}
                </button>

                <button type="button" onClick={() => setStep('info')}
                  className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-1">
                  Back
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-white/[0.06] text-center">
              <p className="text-zinc-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-gold-500 hover:text-gold-400 font-medium transition-colors">Sign In</Link>
              </p>
            </div>
          </AuthCard>

          <p className="text-center text-zinc-600 text-xs mt-4 px-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="flex items-center gap-2 text-sm text-zinc-500"><svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>Loading...</div></main>}>
      <RegisterForm />
    </Suspense>
  );
}
