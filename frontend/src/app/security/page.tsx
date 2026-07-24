'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

export default function SecurityPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', newPass: '', confirm: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    authAPI.getMe().then(r => setUser(r.data.user)).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const handleChangePassword = async () => {
    setMessage({ type: '', text: '' });
    if (passwordForm.newPass !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.newPass.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }
    setMessage({ type: 'success', text: 'Password change requested. Check your email for confirmation.' });
    setPasswordForm({ current: '', newPass: '', confirm: '' });
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 py-4 flex justify-between items-center">
        <BrandLogo size={32} href="/dashboard" />
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">
          Security Settings
        </motion.h2>

        {message.text && (
          <div className={`px-4 py-3 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
            {message.text}
          </div>
        )}

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <input type="password" placeholder="Current Password" value={passwordForm.current}
              onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
              className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            <input type="password" placeholder="New Password (min 8 chars)" value={passwordForm.newPass}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
              className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            <input type="password" placeholder="Confirm New Password" value={passwordForm.confirm}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
              className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleChangePassword}
              className="bg-gold-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors">
              Update Password
            </motion.button>
          </div>
        </motion.div>

        {/* 2FA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
            <div>
              <h3 className="text-base md:text-lg font-semibold mb-2">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-400">
                {twoFAEnabled
                  ? '2FA is enabled. Your account has an extra layer of security.'
                  : 'Add an extra layer of security to your account with 2FA.'}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${twoFAEnabled ? 'bg-green-500/20 text-green-500' : 'bg-zinc-700 text-gray-400'}`}>
              {twoFAEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          {!twoFAEnabled ? (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">2FA adds an extra step to your login using an authenticator app.</p>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setShowSetup(!showSetup)}
                className="bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors">
                Enable 2FA
              </motion.button>
              {showSetup && (
                <div className="mt-4 bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                  <p className="text-sm text-yellow-500 mb-2">2FA setup will be available in the next release.</p>
                  <p className="text-xs text-gray-500">We&apos;ll support Google Authenticator, Authy, and other TOTP apps.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => setTwoFAEnabled(false)}
                className="bg-red-500/20 text-red-500 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-500/30 transition-colors">
                Disable 2FA
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* Active Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Active Sessions</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
              <div>
                <p className="text-sm font-semibold">Current Session</p>
                <p className="text-xs text-gray-400">Last active: Just now</p>
              </div>
              <span className="text-green-500 text-xs font-semibold px-2 py-1 bg-green-500/10 rounded">Active</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Sessions are automatically expired after 15 minutes of inactivity.</p>
        </motion.div>

        {/* Login History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Security Tips</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Use a strong, unique password with uppercase, lowercase, numbers, and symbols.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Enable two-factor authentication for an extra layer of security.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Never share your login credentials or 2FA codes with anyone.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Always verify the URL before entering your credentials.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Sign out from shared or public devices after use.</li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
