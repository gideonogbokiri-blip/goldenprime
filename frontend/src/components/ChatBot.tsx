'use client';

import { useState, useRef, useEffect } from 'react';
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
  'hello': 'Hello! Welcome to GoldenPrime. I\'m here to help you with any questions about the platform. How can I assist you?',
  'hi': 'Hey there! How can I help you with GoldenPrime today?',
  'thanks': 'You\'re welcome! Is there anything else I can help you with?',
  'thank you': 'My pleasure! Feel free to ask if you have more questions.',
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, answer] of Object.entries(FAQ)) {
    if (lower.includes(key)) return answer;
  }
  if (lower.includes('gpg') || lower.includes('coin') || lower.includes('gold')) {
    return FAQ['what is gpg'];
  }
  if (lower.includes('buy') || lower.includes('purchase') || lower.includes('invest')) {
    return FAQ['how to buy'];
  }
  if (lower.includes('trade') || lower.includes('sell') || lower.includes('swap')) {
    return FAQ['how to trade'];
  }
  if (lower.includes('refer') || lower.includes('invite') || lower.includes('friend')) {
    return FAQ['referral'];
  }
  if (lower.includes('tier') || lower.includes('level') || lower.includes('rank')) {
    return FAQ['tiers'];
  }
  if (lower.includes('depos') || lower.includes('fund') || lower.includes('add money')) {
    return FAQ['deposit'];
  }
  if (lower.includes('kyc') || lower.includes('verify') || lower.includes('identity')) {
    return FAQ['kyc'];
  }
  if (lower.includes('safe') || lower.includes('security') || lower.includes('2fa') || lower.includes('password')) {
    return FAQ['security'];
  }
  if (lower.includes('price') || lower.includes('worth') || lower.includes('value')) {
    return FAQ['price'];
  }
  if (lower.includes('when') || lower.includes('launch') || lower.includes('date')) {
    return FAQ['launch'];
  }
  return 'I\'m not sure about that. Try asking about GPG, buying, trading, referrals, deposits, KYC, security, or the platform launch. Type "help" to see what I can assist with!';
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      text: 'Hi! I\'m the GoldenPrime assistant. How can I help you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const answer = findAnswer(input);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        text: answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold-500 rounded-full shadow-lg shadow-gold-500/30 flex items-center justify-center text-black text-2xl font-bold hover:bg-gold-400 transition-colors"
      >
        {isOpen ? '\u2715' : '\u{1F4AC}'}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-gold-500/20 to-zinc-900 border-b border-zinc-800 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-gold-500/20 rounded-full flex items-center justify-center text-sm font-bold text-gold-500">GP</div>
              <div>
                <p className="text-sm font-semibold">GoldenPrime Assistant</p>
                <p className="text-xs text-green-500">Online</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-gold-500/20 text-gold-500 rounded-br-sm'
                      : 'bg-zinc-800 text-gray-300 rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEnd} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              {['What is GPG?', 'How to buy?', 'Referrals', 'Help'].map((q) => (
                <button key={q} onClick={() => { setInput(q); setTimeout(sendMessage, 100); }}
                  className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-full text-gray-400 hover:text-white hover:border-gold-500/50 transition-colors">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-zinc-800 p-3 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gold-500 transition-colors"
              />
              <button onClick={sendMessage}
                className="bg-gold-500 text-black w-9 h-9 rounded-xl flex items-center justify-center font-bold hover:bg-gold-400 transition-colors">
                &#8593;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
