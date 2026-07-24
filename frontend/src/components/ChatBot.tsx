'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

const FAQ: Record<string, string> = {
  'what is goldenprime': 'GoldenPrime (GP) is a crypto investment platform. We offer GoldenPrime Gold Coin (GPG), a tokenized gold coin priced at $50 per coin. You can preorder GPG, trade P2P, and earn referral rewards.',
  'what is gpg': 'GoldenPrime Gold Coin (GPG) is our native token. Each GPG coin is priced at $50 USD during the pre-order phase. The total supply is 1,000,000 GPG coins, with a launch date of October 1, 2026.',
  'how to buy': 'To buy GPG: 1) Create an account, 2) Fund your wallet via bank transfer or card, 3) Go to the Preorder page, 4) Enter the amount and confirm. You can also trade P2P on the Trade page.',
  'how to trade': 'Go to the Trade page to access P2P trading. You can create buy or sell orders for GPG, BTC, ETH, SOL, USDT, and USDC. Orders are matched via our escrow system for safe trades.',
  'referral': 'GoldenPrime has a tiered referral system! Share your referral code. You earn GPG rewards per referral: Bronze (0.0001 GPG), Silver (0.0002, 5+ referrals), Gold (0.0005, 15+), Platinum (0.001, 50+).',
  'referral code': 'Your referral code is on the Dashboard or Referrals page. Share it with friends. When they register using your code, you both earn rewards!',
  'tiers': 'We have 4 referral tiers: Bronze (0-4 referrals, 0.0001 GPG each), Silver (5-14, 0.0002), Gold (15-49, 0.0005), Platinum (50+, 0.001). Tier upgrades happen automatically!',
  'deposit': 'Fund your wallet from the Wallet page. We support bank transfers and card payments. Admin will verify your payment and credit your USD balance.',
  'kyc': 'KYC verification helps us keep the platform secure. Submit your identity document from the KYC page. Verification typically takes 24-48 hours.',
  'security': 'GoldenPrime uses industry-standard security: JWT authentication, rate limiting, encrypted passwords, and optional 2FA (coming soon). Visit the Security page to manage your settings.',
  'wallet': 'Your wallet shows your USD balance and all crypto holdings. Fund it via bank transfer or card, then use the balance to buy GPG or trade P2P.',
  'price': 'GPG is currently priced at $50 per coin during the pre-order phase. After launch on October 1, 2026, the price will be determined by market demand.',
  'launch': 'GoldenPrime Gold Coin (GPG) launches on October 1, 2026. Preorders are open now at $50 per coin.',
  'help': 'I can help with: GPG info, how to buy/trade, referrals, deposits, KYC, security, and general platform questions. Just ask!',
  'hello': "Hello! Welcome to GoldenPrime. I'm here to help you with any questions about the platform. How can I assist you?",
  'hi': 'Hey there! How can I help you with GoldenPrime today?',
  'thanks': "You're welcome! Is there anything else I can help you with?",
  'thank you': 'My pleasure! Feel free to ask if you have more questions.',
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, answer] of Object.entries(FAQ)) {
    if (lower.includes(key)) return answer;
  }
  if (lower.includes('gpg') || lower.includes('coin') || lower.includes('gold')) return FAQ['what is gpg'];
  if (lower.includes('buy') || lower.includes('purchase') || lower.includes('invest')) return FAQ['how to buy'];
  if (lower.includes('trade') || lower.includes('sell') || lower.includes('swap')) return FAQ['how to trade'];
  if (lower.includes('refer') || lower.includes('invite') || lower.includes('friend')) return FAQ['referral'];
  if (lower.includes('tier') || lower.includes('level') || lower.includes('rank')) return FAQ['tiers'];
  if (lower.includes('depos') || lower.includes('fund') || lower.includes('add money')) return FAQ['deposit'];
  if (lower.includes('kyc') || lower.includes('verify') || lower.includes('identity')) return FAQ['kyc'];
  if (lower.includes('safe') || lower.includes('security') || lower.includes('2fa') || lower.includes('password')) return FAQ['security'];
  if (lower.includes('price') || lower.includes('worth') || lower.includes('value')) return FAQ['price'];
  if (lower.includes('when') || lower.includes('launch') || lower.includes('date')) return FAQ['launch'];
  return 'I\'m not sure about that. Try asking about GPG, buying, trading, referrals, deposits, KYC, security, or the platform launch. Type "help" to see what I can assist with!';
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: "Hi! I'm the GoldenPrime assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const processMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const answer = findAnswer(text);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 600);
  }, []);

  const sendMessage = () => {
    processMessage(input);
    setInput('');
  };

  const handleQuickReply = (question: string) => {
    setInput('');
    processMessage(question);
  };

  return (
    <>
      {/* Floating Button */}
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
      </motion.button>

      {/* Chat Window */}
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
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 shrink-0 border-b border-zinc-800"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, #09090b 100%)' }}>
              <GPLogo size={36} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">GoldenPrime Assistant</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-emerald-400">Online</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-white transition-colors p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'bot' && (
                    <div className="shrink-0 mr-2 mt-1">
                      <GPLogo size={22} />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gold-500/15 text-gold-200 rounded-2xl rounded-br-md border border-gold-500/20'
                      : 'bg-zinc-900 text-gray-300 rounded-2xl rounded-bl-md border border-zinc-800'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Quick Replies */}
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap shrink-0">
              {['What is GPG?', 'How to buy?', 'Referrals', 'Help'].map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickReply(q)}
                  className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full text-zinc-400 hover:text-gold-400 hover:border-gold-500/40 transition-all whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 p-3 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-gold-500/50 transition-colors min-w-0"
              />
              <button
                onClick={sendMessage}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-black shrink-0 transition-all hover:scale-105 active:scale-95"
                style={{
                  background: input.trim()
                    ? 'linear-gradient(135deg, #FFD700 0%, #D4AF37 100%)'
                    : '#27272a',
                  color: input.trim() ? 'black' : '#52525b',
                }}
              >
                <SendIcon />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
