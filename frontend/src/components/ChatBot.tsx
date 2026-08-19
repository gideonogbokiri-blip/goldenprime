'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatAPI } from '@/lib/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  message: string | null;
  attachment: string | null;
  created_at: string;
}

function compressImage(file: File, maxSize = 900, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function GPLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-black shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8960F 100%)',
        boxShadow: '0 0 12px rgba(212,175,55,0.4)',
        fontSize: size * 0.3,
      }}
    >
      GP
    </div>
  );
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState<string | null>(null);
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthenticated(!!localStorage.getItem('accessToken'));
    }
  }, []);

  const loadMessages = useCallback(async (markRead = false) => {
    try {
      const res = await chatAPI.getMessages();
      setMessages(res.data.messages || []);
      setUnread(res.data.unread || 0);
      if (markRead && (res.data.unread || 0) > 0) {
        await chatAPI.markRead();
        setUnread(0);
      }
    } catch (err) {
      /* not authenticated or network error */
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    if (isOpen) {
      setLoading(true);
      loadMessages(true).finally(() => setLoading(false));
      messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, authenticated, loadMessages]);

  useEffect(() => {
    if (!authenticated) return;
    const timer = setInterval(() => {
      if (!isOpen) loadMessages(false);
    }, 15000);
    return () => clearInterval(timer);
  }, [authenticated, isOpen, loadMessages]);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please attach an image (e.g. a payment slip).');
      return;
    }
    try {
      setAttachment(await compressImage(file));
    } catch {
      alert('Could not read that image. Try another one.');
    }
    e.target.value = '';
  };

  const sendMessage = async () => {
    const text = input.trim();
    if ((!text && !attachment) || sending) return;

    setSending(true);
    const temp: ChatMessage = {
      id: 'temp-' + Date.now(),
      sender: 'user',
      message: text || null,
      attachment,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    setInput('');
    setAttachment(null);

    try {
      await chatAPI.sendMessage({ message: text || undefined, attachment: attachment || undefined });
      await loadMessages(false);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Message failed to send. Try again.');
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
    } finally {
      setSending(false);
    }
  };

  if (!authenticated) return null;

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 z-[9999] w-14 h-14 rounded-full flex items-center justify-center text-black shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 50%, #B8960F 100%)',
          boxShadow: '0 4px 20px rgba(212,175,55,0.4), 0 0 40px rgba(212,175,55,0.15)',
        }}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <CloseIcon />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <ChatIcon />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[11px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed z-[9998] bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col
              bottom-24 right-4 left-4
              md:bottom-24 md:right-6 md:left-auto md:w-[400px]"
            style={{ maxHeight: 'min(75vh, 560px)' }}
          >
            <div className="px-4 py-3 flex items-center gap-3 shrink-0 border-b border-zinc-800"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, #09090b 100%)' }}>
              <GPLogo size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">GoldenPrime Support</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-emerald-400">Admin will respond shortly</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-1">
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-zinc-950">
              {loading ? (
                <div className="text-center py-10 text-zinc-500 text-sm">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <ChatIcon />
                  </div>
                  <p className="text-zinc-400 text-sm mb-1">Send us a message</p>
                  <p className="text-zinc-600 text-xs">Ask questions or attach a payment slip — our admin will reply here.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'admin' && (
                      <div className="shrink-0 mr-2 mt-1">
                        <GPLogo size={22} />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-gold-500/15 text-gold-200 rounded-2xl rounded-br-md border border-gold-500/20'
                        : 'bg-zinc-900 text-gray-300 rounded-2xl rounded-bl-md border border-zinc-800'
                    }`}>
                      {msg.message && <p>{msg.message}</p>}
                      {msg.attachment && (
                        <img
                          src={msg.attachment}
                          alt="Attachment"
                          className="mt-1.5 rounded-lg max-h-48 w-full object-cover cursor-pointer"
                          onClick={() => msg.attachment && window.open(msg.attachment, '_blank')}
                        />
                      )}
                      <p className="text-[10px] text-zinc-500 mt-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEnd} />
            </div>

            {attachment && (
              <div className="px-3 pb-2 shrink-0">
                <div className="relative inline-block">
                  <img src={attachment} alt="Payment slip preview" className="h-20 rounded-lg border border-zinc-700" />
                  <button onClick={() => setAttachment(null)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs flex items-center justify-center hover:text-white">
                    ✕
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">Payment slip attached — send to submit</p>
              </div>
            )}

            <div className="border-t border-zinc-800 p-3 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500/50 transition-colors min-w-0"
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 shrink-0 hover:text-gold-400 transition-colors"
                aria-label="Attach payment slip"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>
              <button
                onClick={sendMessage}
                disabled={sending || (!input.trim() && !attachment)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-black shrink-0 transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
                style={{
                  background: input.trim() || attachment
                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                    : '#27272a',
                  color: input.trim() || attachment ? 'black' : '#52525b',
                }}
              >
                {sending ? (
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
                ) : (
                  <SendIcon />
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}