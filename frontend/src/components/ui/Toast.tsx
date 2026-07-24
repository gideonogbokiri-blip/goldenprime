'use client';

import { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message, duration }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm text-sm font-medium ${
                t.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                t.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                t.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' :
                'bg-blue-500/10 border-blue-500/50 text-blue-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span>
                  {t.type === 'success' ? '\u2705' : t.type === 'error' ? '\u274C' : t.type === 'warning' ? '\u26A0\uFE0F' : '\u2139\uFE0F'}
                </span>
                <span>{t.message}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
