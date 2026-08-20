import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    if (!error.response && typeof window !== 'undefined') {
      error.message = 'Network error. Please check your connection and try again.';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; referralCode?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  verifyEmail: (token: string) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email: string) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  getMe: () => api.get('/auth/me'),
};

export const walletAPI = {
  getWallets: () => api.get('/wallet'),
  getTransactions: (limit?: number, offset?: number) =>
    api.get('/wallet/transactions', { params: { limit, offset } }),
  withdraw: (data: { amount: number; bankName: string; accountNumber: string; accountName: string }) =>
    api.post('/wallet/withdraw', data),
};

export const depositAPI = {
  request: (data: { amount: number; method: string; referenceCode?: string; slip?: string }) =>
    api.post('/deposits/request', data),
  my: (limit?: number) => api.get('/deposits/my', { params: { limit } }),
  instructions: () => api.get('/deposits/instructions'),
  feed: (limit?: number) => api.get('/deposits/feed', { params: { limit } }),
};

export const chatAPI = {
  getMessages: () => api.get('/chat/messages'),
  sendMessage: (data: { message?: string; attachment?: string }) => api.post('/chat/messages', data),
  markRead: () => api.post('/chat/read'),
};

export const settingsAPI = {
  getPublic: () => api.get('/settings'),
};

export const tradingAPI = {
  getPortfolio: () => api.get('/trading/portfolio'),
  buy: (coinId: string, amount: number) => api.post('/trading/buy', { coinId, amount }),
  sell: (coinId: string, amount: number) => api.post('/trading/sell', { coinId, amount }),
};

export const goldAPI = {
  getCoinInfo: () => api.get('/gold/coin'),
  preorder: (data: { amount: number; paymentMethod: string; bankName?: string; accountNumber?: string; accountName?: string; cardHolder?: string; cardLast4?: string; expiryMonth?: string; expiryYear?: string }) =>
    api.post('/gold/preorder', data),
  getMyPreorders: (limit?: number) => api.get('/gold/my', { params: { limit } }),
  getPortfolio: () => api.get('/gold/portfolio'),
  getReferralInfo: () => api.get('/gold/referral'),
  getLeaderboard: () => api.get('/gold/leaderboard'),
  getBankDetails: () => api.get('/gold/bank-details'),
  getCardDetails: () => api.get('/gold/card-details'),
  getTierInfo: () => api.get('/gold/tier'),
  getAllTiers: () => api.get('/gold/tiers'),
};

export const kycAPI = {
  submit: (data: any) => api.post('/kyc/submit', data),
  getStatus: () => api.get('/kyc/status'),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (search?: string) => api.get('/admin/users', { params: { search } }),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  getTransactions: (status?: string, type?: string) => api.get('/admin/transactions', { params: { status, type } }),
  updateTransactionStatus: (id: string, status: string) => api.put(`/admin/transactions/${id}/status`, { status }),
  getKYC: (status?: string) => api.get('/admin/kyc', { params: { status } }),
  approveKYC: (id: string) => api.put(`/admin/kyc/${id}/approve`),
  rejectKYC: (id: string, reason: string) => api.put(`/admin/kyc/${id}/reject`, { reason }),
  getLogs: () => api.get('/admin/logs'),
  getDeposits: (status?: string) => api.get('/admin/deposits', { params: { status } }),
  approveDeposit: (id: string, notes?: string) => api.put(`/admin/deposits/${id}/approve`, { notes }),
  rejectDeposit: (id: string, reason: string) => api.put(`/admin/deposits/${id}/reject`, { reason }),
  getPreorders: (status?: string) => api.get('/admin/preorders', { params: { status } }),
  approvePreorder: (id: string, notes?: string) => api.put(`/admin/preorders/${id}/approve`, { notes }),
  rejectPreorder: (id: string, reason: string) => api.put(`/admin/preorders/${id}/reject`, { reason }),
  getUserPaymentDetails: (userId: string) => api.get(`/admin/user/${userId}/payment-details`),
  fundWallet: (userId: string, amount: number, note?: string) =>
    api.post(`/admin/users/${userId}/fund`, { amount, note }),
  getWithdrawals: (status?: string) => api.get('/admin/withdrawals', { params: { status } }),
  approveWithdrawal: (id: string, notes?: string) => api.put(`/admin/withdrawals/${id}/approve`, { notes }),
  rejectWithdrawal: (id: string, reason: string) => api.put(`/admin/withdrawals/${id}/reject`, { reason }),
  getSettings: () => api.get('/admin/settings'),
  saveSettings: (data: any) => api.put('/admin/settings', data),
  getChatThreads: () => api.get('/admin/chat/threads'),
  getChatConversation: (userId: string) => api.get(`/admin/chat/users/${userId}/messages`),
  adminReply: (userId: string, data: { message?: string; creditAmount?: number; creditNote?: string }) =>
    api.post(`/admin/chat/users/${userId}/messages`, data),
};

export const p2pAPI = {
  getOrderBook: (coin: string) => api.get(`/p2p/orderbook/${coin}`),
  createOrder: (data: { type: string; coin: string; amount: number; pricePerUnit: number; paymentMethod?: string; notes?: string }) =>
    api.post('/p2p/orders', data),
  cancelOrder: (id: string) => api.delete(`/p2p/orders/${id}`),
  takeOrder: (id: string, amount: number) => api.post(`/p2p/orders/${id}/take`, { amount }),
  getMyOrders: (status?: string) => api.get('/p2p/my-orders', { params: { status } }),
  getMyTrades: (status?: string) => api.get('/p2p/my-trades', { params: { status } }),
  getTrade: (id: string) => api.get(`/p2p/trades/${id}`),
  confirmTrade: (id: string) => api.post(`/p2p/trades/${id}/confirm`),
  disputeTrade: (id: string, reason: string) => api.post(`/p2p/trades/${id}/dispute`, { reason }),
  sendMessage: (id: string, message: string) => api.post(`/p2p/trades/${id}/message`, { message }),
};

export default api;
