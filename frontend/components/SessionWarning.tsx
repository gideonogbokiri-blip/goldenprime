'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_WARNING_MS = 14 * 60 * 1000;
const TOKEN_CHECK_INTERVAL = 30 * 1000;

export default function SessionWarning() {
  const [show, setShow] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const check = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return setShow(false);

      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiresAt = payload.exp * 1000;
        const now = Date.now();
        const remaining = expiresAt - now;

        if (remaining <= 0) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return;
        }

        if (remaining <= SESSION_WARNING_MS) {
          setShow(true);
          setTimeLeft(Math.floor(remaining / 1000));
        } else {
          setShow(false);
        }
      } catch {}
    };

    check();
    const interval = setInterval(check, TOKEN_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) { window.location.href = '/login'; return; }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setShow(false);
      } else {
        window.location.href = '/login';
      }
    } catch {
      window.location.href = '/login';
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-0 left-0 right-0 z-[90] bg-yellow-500/10 border-b border-yellow-500/30 px-6 py-3"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-yellow-500 text-lg">&#9888;&#65039;</span>
              <span className="text-yellow-500 text-sm font-medium">
                Session expiring in {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="bg-yellow-500 text-black px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-yellow-400 transition-colors"
              >
                Extend Session
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/login';
                }}
                className="text-gray-400 hover:text-white text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
