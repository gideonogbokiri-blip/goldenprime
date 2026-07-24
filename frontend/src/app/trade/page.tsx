'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { p2pAPI, goldAPI } from '@/lib/api';
import { fireGoldConfetti } from '@/lib/confetti';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StaggerContainer, StaggerItem } from '@/components/ui/Animations';

const COINS = [
  { symbol: 'GPG', name: 'GoldenPrime Gold', icon: '\u{1FA99}', color: 'text-gold-500' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '\u26CF\uFE0F', color: 'text-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', icon: '\u{1F538}', color: 'text-blue-400' },
  { symbol: 'SOL', name: 'Solana', icon: '\u{1F48E}', color: 'text-purple-400' },
  { symbol: 'USDT', name: 'Tether', icon: '\u{1F4B1}', color: 'text-green-500' },
  { symbol: 'USDC', name: 'USD Coin', icon: '\u{1F4B3}', color: 'text-blue-500' },
];

type Tab = 'orderbook' | 'create' | 'myorders' | 'trades' | 'history';

export default function TradePage() {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState('GPG');
  const [activeTab, setActiveTab] = useState<Tab>('orderbook');
  const [orderBook, setOrderBook] = useState<any>(null);
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [myTrades, setMyTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [user, setUser] = useState<any>(null);

  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [notes, setNotes] = useState('');

  const [takeAmount, setTakeAmount] = useState('');
  const [takingOrder, setTakingOrder] = useState<any>(null);

  const [activeTrade, setActiveTrade] = useState<any>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [disputeReason, setDisputeReason] = useState('');

  const [expandedTrade, setExpandedTrade] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    loadData();
  }, [router, selectedCoin]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookRes, ordersRes, tradesRes, userRes] = await Promise.all([
        p2pAPI.getOrderBook(selectedCoin).catch(() => ({ data: { buyOrders: [], sellOrders: [], stats: {}, marketPrice: 0 } })),
        p2pAPI.getMyOrders().catch(() => ({ data: [] })),
        p2pAPI.getMyTrades().catch(() => ({ data: [] })),
        (await import('@/lib/api')).authAPI.getMe().catch(() => ({ data: { user: null } })),
      ]);
      setOrderBook(bookRes.data);
      setMyOrders(ordersRes.data);
      setMyTrades(tradesRes.data);
      setUser(userRes.data.user);
      if (!price && bookRes.data.marketPrice) {
        setPrice(bookRes.data.marketPrice.toString());
      }
    } catch {}
    setLoading(false);
  }, [selectedCoin, price]);

  useEffect(() => {
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleCreateOrder = async () => {
    const amt = parseFloat(amount);
    const prc = parseFloat(price);
    if (!amt || amt <= 0 || !prc || prc <= 0) {
      setMessage({ type: 'error', text: 'Enter valid amount and price' });
      return;
    }
    setTradeLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await p2pAPI.createOrder({ type: orderType, coin: selectedCoin, amount: amt, pricePerUnit: prc, paymentMethod, notes });
      setMessage({ type: 'success', text: `${orderType === 'buy' ? 'Buy' : 'Sell'} order created!` });
      setAmount('');
      setNotes('');
      loadData();
      setActiveTab('myorders');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to create order' });
    }
    setTradeLoading(false);
  };

  const handleTakeOrder = async (order: any) => {
    setTakingOrder(order);
    setTakeAmount(order.amount.toString());
  };

  const confirmTakeOrder = async () => {
    if (!takingOrder) return;
    setTradeLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await p2pAPI.takeOrder(takingOrder.id, parseFloat(takeAmount));
      setMessage({ type: 'success', text: 'Trade initiated! Both parties must confirm to complete.' });
      setTakingOrder(null);
      setTakeAmount('');
      fireGoldConfetti();
      loadData();
      setActiveTab('trades');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to take order' });
    }
    setTradeLoading(false);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await p2pAPI.cancelOrder(orderId);
      setMessage({ type: 'success', text: 'Order cancelled' });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to cancel' });
    }
  };

  const handleConfirmTrade = async (tradeId: string) => {
    try {
      const res = await p2pAPI.confirmTrade(tradeId);
      setMessage({ type: 'success', text: res.data.message });
      if (res.data.trade?.status === 'completed') fireGoldConfetti();
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to confirm' });
    }
  };

  const handleDispute = async (tradeId: string) => {
    if (!disputeReason) return;
    try {
      await p2pAPI.disputeTrade(tradeId, disputeReason);
      setMessage({ type: 'success', text: 'Dispute filed. Admin will review.' });
      setDisputeReason('');
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to dispute' });
    }
  };

  const handleSendMessage = async (tradeId: string) => {
    if (!chatMessage.trim()) return;
    try {
      await p2pAPI.sendMessage(tradeId, chatMessage);
      setChatMessage('');
      const res = await p2pAPI.getTrade(tradeId);
      setActiveTrade(res.data);
    } catch {}
  };

  const coinInfo = COINS.find(c => c.symbol === selectedCoin);
  const stats = orderBook?.stats || {};
  const totalMyOpen = myOrders.filter(o => o.status === 'open').length;
  const totalActiveTrades = myTrades.filter(t => t.status === 'escrow').length;

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
          <Link href="/preorder" className="text-gray-400 hover:text-white text-sm">Preorder</Link>
          <span className="text-gold-500 font-semibold text-sm">Trade</span>
          <Link href="/wallet" className="text-gray-400 hover:text-white text-sm">Wallet</Link>
          <span className="text-gray-400 text-sm">{user?.email}</span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
            {message.text}
          </motion.div>
        )}

        {/* Coin Selector */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          {COINS.map((c) => (
            <motion.button key={c.symbol} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCoin(c.symbol)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                selectedCoin === c.symbol
                  ? 'bg-gold-500/20 border-2 border-gold-500 text-gold-500'
                  : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-600 text-gray-400'
              }`}>
              <span>{c.icon}</span>
              <span>{c.symbol}</span>
            </motion.button>
          ))}
        </div>

        {/* Market Stats Bar */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Market Price</p>
                <p className={`text-lg font-bold ${coinInfo?.color}`}>${orderBook?.marketPrice?.toLocaleString() || '0.00'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total Trades</p>
                <p className="text-lg font-bold">{stats.totalTrades || 0}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">24h Volume</p>
                <p className="text-lg font-bold">${stats.totalVolume?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">24h High</p>
                <p className="text-lg font-bold text-green-500">${stats.high24h?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">24h Low</p>
                <p className="text-lg font-bold text-red-500">${stats.low24h?.toLocaleString() || '0'}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab Bar */}
        <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-6">
          {([
            { id: 'orderbook' as Tab, label: 'Order Book', badge: null },
            { id: 'create' as Tab, label: 'Create Order', badge: null },
            { id: 'myorders' as Tab, label: 'My Orders', badge: totalMyOpen || null },
            { id: 'trades' as Tab, label: 'Active Trades', badge: totalActiveTrades || null },
            { id: 'history' as Tab, label: 'History', badge: null },
          ]).map((tab) => (
            <motion.button key={tab.id} whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                activeTab === tab.id ? 'bg-gold-500 text-black' : 'text-gray-400 hover:text-white hover:bg-zinc-800'
              }`}>
              {tab.label}
              {tab.badge && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{tab.badge}</span>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ORDER BOOK */}
          {activeTab === 'orderbook' && (
            <motion.div key="orderbook" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {loading ? (
                <div className="grid grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Buy Orders (Bids) */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                      <h3 className="font-semibold text-green-500">Buy Orders (Bids)</h3>
                      <span className="text-xs text-gray-400">{orderBook?.buyOrders?.length || 0} orders</span>
                    </div>
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {(!orderBook?.buyOrders || orderBook.buyOrders.length === 0) ? (
                        <p className="text-gray-500 text-sm text-center py-8">No buy orders yet. Be the first!</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500 text-xs">
                              <th className="text-left px-2 py-1">Price</th>
                              <th className="text-right px-2 py-1">Amount</th>
                              <th className="text-right px-2 py-1">Total</th>
                              <th className="text-right px-2 py-1">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderBook.buyOrders.map((order: any) => (
                              <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="px-2 py-2 text-green-500 font-mono font-bold">${order.price_per_unit.toLocaleString()}</td>
                                <td className="px-2 py-2 text-right font-mono">{order.amount} {order.coin}</td>
                                <td className="px-2 py-2 text-right text-gray-400 font-mono">${order.total_usd.toLocaleString()}</td>
                                <td className="px-2 py-2 text-right">
                                  {order.user_id !== user?.id && (
                                    <button onClick={() => handleTakeOrder({ ...order, type: 'sell' })}
                                      className="bg-green-500/20 text-green-500 px-3 py-1 rounded text-xs font-semibold hover:bg-green-500/30 transition-colors">
                                      Sell to
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>

                  {/* Sell Orders (Asks) */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                      <h3 className="font-semibold text-red-500">Sell Orders (Asks)</h3>
                      <span className="text-xs text-gray-400">{orderBook?.sellOrders?.length || 0} orders</span>
                    </div>
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {(!orderBook?.sellOrders || orderBook.sellOrders.length === 0) ? (
                        <p className="text-gray-500 text-sm text-center py-8">No sell orders yet. Be the first!</p>
                      ) : (
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-gray-500 text-xs">
                              <th className="text-left px-2 py-1">Price</th>
                              <th className="text-right px-2 py-1">Amount</th>
                              <th className="text-right px-2 py-1">Total</th>
                              <th className="text-right px-2 py-1">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderBook.sellOrders.map((order: any) => (
                              <tr key={order.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="px-2 py-2 text-red-500 font-mono font-bold">${order.price_per_unit.toLocaleString()}</td>
                                <td className="px-2 py-2 text-right font-mono">{order.amount} {order.coin}</td>
                                <td className="px-2 py-2 text-right text-gray-400 font-mono">${order.total_usd.toLocaleString()}</td>
                                <td className="px-2 py-2 text-right">
                                  {order.user_id !== user?.id && (
                                    <button onClick={() => handleTakeOrder({ ...order, type: 'buy' })}
                                      className="bg-red-500/20 text-red-500 px-3 py-1 rounded text-xs font-semibold hover:bg-red-500/30 transition-colors">
                                      Buy from
                                    </button>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* CREATE ORDER */}
          {activeTab === 'create' && (
            <motion.div key="create" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-xl mx-auto">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Create {coinInfo?.name} Order</h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setOrderType('buy')}
                    className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                      orderType === 'buy' ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-zinc-700 hover:border-zinc-500'
                    }`}>
                    Buy {selectedCoin}
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setOrderType('sell')}
                    className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                      orderType === 'sell' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-zinc-700 hover:border-zinc-500'
                    }`}>
                    Sell {selectedCoin}
                  </motion.button>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Amount ({selectedCoin})</label>
                    <input type="number" min="0" step="any" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-lg focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Price per {selectedCoin} (USD)</label>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-lg focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                  {amount && price && (
                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total</span>
                        <span className="font-bold font-mono">${(parseFloat(amount) * parseFloat(price)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors">
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="card">Debit/Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Notes (optional)</label>
                    <input type="text" placeholder="Any special instructions..." value={notes} onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors" />
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleCreateOrder} disabled={tradeLoading}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50 ${
                    orderType === 'buy'
                      ? 'bg-green-500 text-black hover:bg-green-400'
                      : 'bg-red-500 text-white hover:bg-red-400'
                  }`}>
                  {tradeLoading ? 'Creating...' : `Create ${orderType === 'buy' ? 'Buy' : 'Sell'} Order`}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* MY ORDERS */}
          {activeTab === 'myorders' && (
            <motion.div key="myorders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="font-semibold">My Orders</h3>
                </div>
                <div className="p-4">
                  {myOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 mb-4">No orders yet</p>
                      <button onClick={() => setActiveTab('create')} className="bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors">
                        Create Your First Order
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myOrders.map((order) => (
                        <div key={order.id} className={`flex justify-between items-center p-4 rounded-lg border transition-colors ${
                          order.status === 'open' ? 'border-zinc-700 bg-zinc-800/30' : 'border-zinc-800 bg-zinc-900/50'
                        }`}>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              order.type === 'buy' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                            }`}>{order.type}</span>
                            <div>
                              <p className="font-semibold">{order.amount} {order.coin} @ ${order.price_per_unit.toLocaleString()}</p>
                              <p className="text-sm text-gray-400">Total: ${order.total_usd.toLocaleString()} &middot; {order.payment_method.replace('_', ' ')}</p>
                              <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              order.status === 'open' ? 'bg-yellow-500/20 text-yellow-500' :
                              order.status === 'filled' ? 'bg-blue-500/20 text-blue-500' :
                              order.status === 'cancelled' ? 'bg-gray-500/20 text-gray-500' : 'bg-zinc-700 text-gray-400'
                            }`}>{order.status}</span>
                            {order.status === 'open' && (
                              <button onClick={() => handleCancelOrder(order.id)}
                                className="text-red-500 hover:text-red-400 text-xs font-semibold">Cancel</button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ACTIVE TRADES */}
          {activeTab === 'trades' && (
            <motion.div key="trades" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="font-semibold">Active Trades (Escrow)</h3>
                </div>
                <div className="p-4">
                  {myTrades.filter(t => t.status === 'escrow').length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No active trades</p>
                  ) : (
                    <div className="space-y-4">
                      {myTrades.filter(t => t.status === 'escrow').map((trade) => {
                        const isBuyer = trade.buyer_id === user?.id;
                        const myConfirmed = isBuyer ? trade.buyer_confirmed : trade.seller_confirmed;
                        return (
                          <div key={trade.id} className="border border-zinc-700 rounded-lg overflow-hidden">
                            <div className="flex justify-between items-center p-4 bg-zinc-800/50">
                              <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                  isBuyer ? 'bg-blue-500/20 text-blue-500' : 'bg-purple-500/20 text-purple-500'
                                }`}>{isBuyer ? 'Buying' : 'Selling'}</span>
                                <div>
                                  <p className="font-semibold">{trade.amount} {trade.coin} @ ${trade.price_per_unit.toLocaleString()}</p>
                                  <p className="text-sm text-gray-400">Total: ${trade.total_usd.toLocaleString()} &middot; Escrow active</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded ${myConfirmed ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                  {myConfirmed ? 'You confirmed' : 'Awaiting your confirmation'}
                                </span>
                              </div>
                            </div>
                            <div className="p-4 flex gap-3">
                              <button onClick={() => handleConfirmTrade(trade.id)}
                                disabled={myConfirmed}
                                className={`px-6 py-2 rounded-lg font-semibold text-sm transition-colors ${
                                  myConfirmed ? 'bg-zinc-700 text-gray-500 cursor-not-allowed' : 'bg-green-500 text-black hover:bg-green-400'
                                }`}>
                                {myConfirmed ? 'Confirmed' : 'Confirm Release'}
                              </button>
                              <button onClick={() => setExpandedTrade(expandedTrade === trade.id ? null : trade.id)}
                                className="px-6 py-2 rounded-lg font-semibold text-sm border border-zinc-700 hover:bg-zinc-800 transition-colors">
                                {expandedTrade === trade.id ? 'Close Chat' : 'Chat'}
                              </button>
                              <button onClick={() => {
                                const reason = prompt('Why are you filing a dispute?');
                                if (reason) handleDispute(trade.id);
                              }}
                                className="px-6 py-2 rounded-lg font-semibold text-sm text-red-500 border border-red-500/30 hover:bg-red-500/10 transition-colors">
                                Dispute
                              </button>
                            </div>
                            {/* Chat */}
                            <AnimatePresence>
                              {expandedTrade === trade.id && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-zinc-700 overflow-hidden">
                                  <div className="p-4 max-h-64 overflow-y-auto space-y-2">
                                    {trade.messages?.length === 0 && <p className="text-gray-500 text-sm text-center">No messages yet</p>}
                                    {trade.messages?.map((msg: any) => (
                                      <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                          msg.sender_id === user?.id ? 'bg-gold-500/20 text-gold-500' : 'bg-zinc-800 text-gray-300'
                                        }`}>{msg.message}</div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="p-3 border-t border-zinc-700 flex gap-2">
                                    <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(trade.id)}
                                      placeholder="Type a message..." className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500" />
                                    <button onClick={() => handleSendMessage(trade.id)}
                                      className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors">Send</button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* HISTORY */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800">
                  <h3 className="font-semibold">Trade History</h3>
                </div>
                <div className="p-4">
                  {myTrades.length === 0 ? (
                    <p className="text-gray-500 text-center py-12">No trades yet</p>
                  ) : (
                    <div className="space-y-3">
                      {myTrades.map((trade) => {
                        const isBuyer = trade.buyer_id === user?.id;
                        return (
                          <div key={trade.id} className="flex justify-between items-center p-4 border border-zinc-800 rounded-lg">
                            <div className="flex items-center gap-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                trade.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                                trade.status === 'disputed' ? 'bg-red-500/20 text-red-500' :
                                'bg-yellow-500/20 text-yellow-500'
                              }`}>{trade.status}</span>
                              <div>
                                <p className="font-semibold">
                                  {isBuyer ? 'Bought' : 'Sold'} {trade.amount} {trade.coin} @ ${trade.price_per_unit.toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-400">${trade.total_usd.toLocaleString()} &middot; {trade.payment_method.replace('_', ' ')}</p>
                                <p className="text-xs text-gray-500">{new Date(trade.created_at).toLocaleString()}</p>
                              </div>
                            </div>
                            <span className={`text-sm font-mono ${isBuyer ? 'text-blue-500' : 'text-purple-500'}`}>
                              {isBuyer ? '-' : '+'}${trade.total_usd.toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAKE ORDER MODAL */}
        <AnimatePresence>
          {takingOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
              onClick={() => setTakingOrder(null)}>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">
                  {takingOrder.type === 'buy' ? 'Sell to' : 'Buy from'} Trader
                </h3>
                <div className="bg-zinc-800/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Price</span>
                    <span className="font-bold font-mono">${takingOrder.price_per_unit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Available</span>
                    <span className="font-bold">{takingOrder.amount} {takingOrder.coin}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Payment</span>
                    <span className="capitalize">{takingOrder.payment_method?.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-1 block">Amount to trade</label>
                  <input type="number" min="0" max={takingOrder.amount} step="any" value={takeAmount} onChange={(e) => setTakeAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-lg focus:outline-none focus:border-gold-500" />
                </div>
                {takeAmount && (
                  <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">You will {takingOrder.type === 'buy' ? 'receive' : 'pay'}</span>
                      <span className="font-bold text-gold-500">${(parseFloat(takeAmount) * takingOrder.price_per_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={confirmTakeOrder} disabled={tradeLoading}
                    className="flex-1 bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
                    {tradeLoading ? 'Processing...' : 'Confirm Trade'}
                  </motion.button>
                  <button onClick={() => setTakingOrder(null)} className="px-6 py-3 border border-zinc-700 rounded-lg font-semibold hover:bg-zinc-800">Cancel</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
