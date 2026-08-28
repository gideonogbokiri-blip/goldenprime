'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAPI, authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

type Tab = 'overview' | 'users' | 'deposits' | 'withdrawals' | 'transactions' | 'kyc' | 'chats' | 'settings' | 'logs';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [threads, setThreads] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [approveId, setApproveId] = useState('');

  const [fundUserId, setFundUserId] = useState<any>(null);
  const [fundUserName, setFundUserName] = useState('');
  const [fundAmount, setFundAmount] = useState('');
  const [fundNote, setFundNote] = useState('');

  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [chatReply, setChatReply] = useState('');
  const [chatCredit, setChatCredit] = useState('');

  const [settingsForm, setSettingsForm] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/admin/login'); return; }
    authAPI.getMe().then((r) => {
      if (r.data.user?.role !== 'admin') {
        router.push('/admin/login');
        return;
      }
      setIsAdmin(true);
      loadTab('overview');
    }).catch(() => { router.push('/admin/login'); });
  }, [router]);

  const loadTab = async (t: Tab) => {
    setTab(t);
    setLoading(true);
    try {
      if (t === 'overview') setStats((await adminAPI.getDashboard()).data);
      else if (t === 'users') setUsers((await adminAPI.getUsers(searchQuery || undefined)).data.users);
      else if (t === 'transactions') setTransactions((await adminAPI.getTransactions()).data.transactions);
      else if (t === 'deposits') setDeposits((await adminAPI.getDeposits()).data.deposits);
      else if (t === 'withdrawals') setWithdrawals((await adminAPI.getWithdrawals()).data.withdrawals);
      else if (t === 'kyc') setKycList((await adminAPI.getKYC()).data.kyc);
      else if (t === 'logs') setLogs((await adminAPI.getLogs()).data.logs);
      else if (t === 'chats') setThreads((await adminAPI.getChatThreads()).data.threads);
      else if (t === 'settings') {
        const s = (await adminAPI.getSettings()).data.settings;
        setSettings(s);
        setSettingsForm({
          expectedProfitRate: s.expected_profit_rate ?? 3,
          minDeposit: s.min_deposit ?? 10,
          maxDeposit: s.max_deposit ?? 50000,
          bankDetails: typeof s.bank_details === 'string' ? s.bank_details : JSON.stringify(s.bank_details || {}, null, 2),
          cryptoWallet: typeof s.crypto_wallet === 'string' ? s.crypto_wallet : JSON.stringify(s.crypto_wallet || {}, null, 2),
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const searchUsers = async () => {
    setLoading(true);
    try { setUsers((await adminAPI.getUsers(searchQuery || undefined)).data.users); } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApproveDeposit = async (id: string) => {
    try {
      await adminAPI.approveDeposit(id, approveNotes);
      setApproveId(''); setApproveNotes(''); loadTab('deposits');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRejectDeposit = async () => {
    if (!rejectId || !rejectReason) return;
    try {
      await adminAPI.rejectDeposit(rejectId, rejectReason);
      setRejectId(''); setRejectReason(''); loadTab('deposits');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await adminAPI.approveWithdrawal(id, approveNotes);
      setApproveId(''); setApproveNotes(''); loadTab('withdrawals');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRejectWithdrawal = async () => {
    if (!rejectId || !rejectReason) return;
    try {
      await adminAPI.rejectWithdrawal(rejectId, rejectReason);
      setRejectId(''); setRejectReason(''); loadTab('withdrawals');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleApproveKYC = async (id: string) => {
    try { await adminAPI.approveKYC(id); loadTab('kyc'); } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRejectKYC = async () => {
    if (!rejectId || !rejectReason) return;
    try { await adminAPI.rejectKYC(rejectId, rejectReason); setRejectId(''); setRejectReason(''); loadTab('kyc'); } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try { await adminAPI.updateUserRole(userId, role); loadTab('users'); } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleFundWallet = async () => {
    if (!fundUserId || !fundAmount) return;
    try {
      await adminAPI.fundWallet(fundUserId, parseFloat(fundAmount), fundNote || undefined);
      alert(`Credited $${fundAmount} to user wallet`);
      setFundUserId(null); setFundAmount(''); setFundNote(''); loadTab('users');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const openChat = async (u: any) => {
    setActiveChatUser(u);
    setChatMessages((await adminAPI.getChatConversation(u.userId)).data.messages || []);
  };

  const sendAdminReply = async () => {
    if (!activeChatUser) return;
    const message = chatReply.trim();
    const amount = parseFloat(chatCredit);
    if (!message && !(amount > 0)) return;
    try {
      await adminAPI.adminReply(activeChatUser.userId, {
        message: message || undefined,
        creditAmount: amount > 0 ? amount : undefined,
        creditNote: amount > 0 ? `Credited by admin` : undefined,
      });
      setChatReply(''); setChatCredit('');
      setChatMessages((await adminAPI.getChatConversation(activeChatUser.userId)).data.messages || []);
      setThreads((await adminAPI.getChatThreads()).data.threads || []);
    } catch (err: any) { alert(err.response?.data?.error || 'Failed to send'); }
  };

  const saveSettings = async () => {
    try {
      const bankDetails = JSON.parse(settingsForm.bankDetails || '{}');
      const cryptoWallet = JSON.parse(settingsForm.cryptoWallet || '{}');
      await adminAPI.saveSettings({
        expected_profit_rate: Number(settingsForm.expectedProfitRate),
        min_deposit: Number(settingsForm.minDeposit),
        max_deposit: Number(settingsForm.maxDeposit),
        bank_details: bankDetails,
        crypto_wallet: cryptoWallet,
      });
      alert('Settings saved');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Invalid JSON in one of the fields.');
    }
  };

  const tabs: { id: Tab; label: string; icon: JSX.Element }[] = [
    { id: 'overview', label: 'Overview', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
    { id: 'users', label: 'Users', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
    { id: 'deposits', label: 'Deposits', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg> },
    { id: 'withdrawals', label: 'Withdrawals', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg> },
    { id: 'transactions', label: 'Transactions', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
    { id: 'kyc', label: 'KYC', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: 'chats', label: 'Chats', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
    { id: 'settings', label: 'Settings', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { id: 'logs', label: 'Logs', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> },
  ];

  const pendingDeposits = deposits.filter((d: any) => d.status === 'pending').length;
  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending').length;
  const pendingKyc = kycList.filter((k: any) => k.status === 'pending').length;
  const verifiedUsers = users.filter((u: any) => u.is_verified).length;

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 h-14 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <BrandLogo size={24} href="/dashboard" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold-500 bg-gold-500/10 px-2 py-0.5 rounded">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs text-zinc-400 hover:text-white transition-colors">User Dashboard</Link>
          <button onClick={handleLogout} className="text-xs text-zinc-500 hover:text-white transition-colors">Sign Out</button>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-lg md:text-xl font-bold">Admin Dashboard</h1>
          <p className="text-[11px] text-zinc-600 hidden sm:block">Manage users, deposits, and platform settings</p>
        </div>

        <div className="flex gap-1 mb-6 overflow-x-auto pb-1 scrollbar-hide">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => loadTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-gold-500 text-black shadow-lg shadow-gold-500/15' : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}>
              {t.icon}
              {t.label}
              {t.id === 'deposits' && pendingDeposits > 0 && <span className="ml-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{pendingDeposits}</span>}
              {t.id === 'withdrawals' && pendingWithdrawals > 0 && <span className="ml-0.5 w-4 h-4 rounded-full bg-yellow-500 text-black text-[9px] font-bold flex items-center justify-center">{pendingWithdrawals}</span>}
              {t.id === 'kyc' && pendingKyc > 0 && <span className="ml-0.5 w-4 h-4 rounded-full bg-yellow-500 text-black text-[9px] font-bold flex items-center justify-center">{pendingKyc}</span>}
            </button>
          ))}
        </div>

        {!isAdmin ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ─── OVERVIEW ─── */}
            {tab === 'overview' && stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatBox label="Total Users" value={stats.totalUsers} icon="users" />
                <StatBox label="Total Transactions" value={stats.totalTransactions} icon="tx" />
                <StatBox label="Pending KYC" value={stats.kycPending} icon="kyc" alert />
                <StatBox label="Approved KYC" value={stats.kycApproved} icon="kyc-ok" />
              </div>
            )}

            {/* ─── USERS ─── */}
            {tab === 'users' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input type="text" placeholder="Search by email or name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                    className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                  <button onClick={searchUsers} className="bg-zinc-800 border border-zinc-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-zinc-700 transition-colors">Search</button>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                      <th className="p-4">User</th>
                      <th className="p-4 hidden md:table-cell">Name</th>
                      <th className="p-4">Balance</th>
                      <th className="p-4 hidden lg:table-cell">Email Verified</th>
                      <th className="p-4 hidden md:table-cell">Role</th>
                      <th className="p-4">Actions</th>
                    </tr></thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                            <p className="font-medium text-white">{u.email}</p>
                            <p className="text-[11px] text-zinc-500 md:hidden">{u.first_name} {u.last_name}</p>
                          </td>
                          <td className="p-4 text-zinc-400 hidden md:table-cell">{u.first_name || '-'} {u.last_name || '-'}</td>
                          <td className="p-4 font-mono text-gold-400 font-semibold">${parseFloat(u.usdBalance || 0).toFixed(2)}</td>
                          <td className="p-4 hidden lg:table-cell">
                            {u.is_verified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-500 text-[11px] font-semibold">Not verified</span>
                            )}
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-gold-500">
                              <option value="user">User</option><option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4">
                            <button onClick={() => { setFundUserId(u.id); setFundUserName(u.email); setFundAmount(''); setFundNote(''); }}
                              className="text-xs bg-gold-500/15 border border-gold-500/30 text-gold-400 px-3 py-1.5 rounded-lg font-semibold hover:bg-gold-500/25 transition-colors">
                              Fund Wallet
                            </button>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-zinc-500 text-sm">No users found</td></tr>
                      )}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── DEPOSITS ─── */}
            {tab === 'deposits' && (
              <div className="space-y-3">
                {deposits.length === 0 ? (
                  <EmptyState message="No deposit requests yet" />
                ) : deposits.map((d) => {
                  const meta = d.metadata || {};
                  return (
                    <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <p className="text-xl font-bold text-gold-400">${parseFloat(d.amount).toFixed(2)}</p>
                            <StatusBadge status={d.status} />
                          </div>
                          <p className="text-sm text-zinc-400">
                            <span className="text-zinc-300 font-medium">{d.users?.email || 'Unknown'}</span>
                            {' '}&bull;{' '}
                            {meta.method === 'crypto' ? 'Crypto' : meta.method === 'admin_manual' ? 'Admin Credit' : 'Bank Transfer'}
                          </p>
                          {meta.referenceCode && <p className="text-xs text-zinc-500">Ref: {meta.referenceCode}</p>}
                          {meta.slip && (
                            <div className="mt-2">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Payment Slip</p>
                              <img src={meta.slip} alt="Slip" className="max-h-52 rounded-lg border border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors" onClick={() => window.open(meta.slip, '_blank')} />
                            </div>
                          )}
                          {meta.adminNotes && <p className="text-xs text-emerald-400">Notes: {meta.adminNotes}</p>}
                          {meta.rejectionReason && <p className="text-xs text-red-400">Rejected: {meta.rejectionReason}</p>}
                          <p className="text-[11px] text-zinc-600">{new Date(d.created_at).toLocaleString()}</p>
                        </div>
                        {d.status === 'pending' && (
                          <div className="flex flex-col gap-2 shrink-0">
                            {approveId === d.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Notes" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40 focus:outline-none focus:border-gold-500" />
                                <button onClick={() => handleApproveDeposit(d.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">Confirm</button>
                                <button onClick={() => { setApproveId(''); setApproveNotes(''); }} className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
                              </div>
                            ) : rejectId === d.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40 focus:outline-none focus:border-gold-500" />
                                <button onClick={handleRejectDeposit} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-400 transition-colors">Reject</button>
                                <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => setApproveId(d.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">Approve</button>
                                <button onClick={() => setRejectId(d.id)} className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500/25 transition-colors">Reject</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── WITHDRAWALS ─── */}
            {tab === 'withdrawals' && (
              <div className="space-y-3">
                {withdrawals.length === 0 ? (
                  <EmptyState message="No withdrawal requests yet" />
                ) : withdrawals.map((w) => {
                  const meta = w.metadata || {};
                  return (
                    <div key={w.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-3">
                            <p className="text-xl font-bold text-gold-400">${parseFloat(w.amount).toFixed(2)}</p>
                            <StatusBadge status={w.status} />
                          </div>
                          <p className="text-sm text-zinc-400"><span className="text-zinc-300 font-medium">{w.users?.email || 'Unknown'}</span></p>
                          <p className="text-xs text-zinc-500">Bank: {meta.bankName || 'N/A'} &bull; Acc: {meta.accountNumber || 'N/A'} ({meta.accountName || 'N/A'})</p>
                          {meta.adminNotes && <p className="text-xs text-emerald-400">Approved: {meta.adminNotes}</p>}
                          {meta.rejectionReason && <p className="text-xs text-red-400">Rejected: {meta.rejectionReason}</p>}
                          <p className="text-[11px] text-zinc-600">{new Date(w.created_at).toLocaleString()}</p>
                        </div>
                        {w.status === 'pending' && (
                          <div className="flex flex-col gap-2 shrink-0">
                            {approveId === w.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Notes" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40 focus:outline-none focus:border-gold-500" />
                                <button onClick={() => handleApproveWithdrawal(w.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">Confirm</button>
                                <button onClick={() => { setApproveId(''); setApproveNotes(''); }} className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
                              </div>
                            ) : rejectId === w.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40 focus:outline-none focus:border-gold-500" />
                                <button onClick={handleRejectWithdrawal} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-400 transition-colors">Reject</button>
                                <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-3 py-2 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => setApproveId(w.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">Approve</button>
                                <button onClick={() => setRejectId(w.id)} className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500/25 transition-colors">Reject</button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ─── TRANSACTIONS ─── */}
            {tab === 'transactions' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                    <th className="p-4">User</th><th className="p-4">Type</th><th className="p-4 hidden md:table-cell">Currency</th><th className="p-4">Amount</th><th className="p-4 hidden md:table-cell">USD Value</th><th className="p-4">Status</th><th className="p-4 hidden md:table-cell">Date</th>
                  </tr></thead>
                  <tbody>
                    {transactions.length === 0 ? (
                      <tr><td colSpan={7} className="p-8 text-center text-zinc-500 text-sm">No transactions yet</td></tr>
                    ) : transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-zinc-300">{tx.users?.email || 'N/A'}</td>
                        <td className="p-4"><span className="bg-zinc-800 px-2 py-0.5 rounded text-xs capitalize">{tx.type.replace(/_/g, ' ')}</span></td>
                        <td className="p-4 text-zinc-500 hidden md:table-cell">{tx.currency}</td>
                        <td className="p-4 font-mono text-zinc-300">{parseFloat(tx.amount).toFixed(2)}</td>
                        <td className="p-4 hidden md:table-cell font-mono text-zinc-400">${tx.usd_value || '-'}</td>
                        <td className="p-4"><StatusBadge status={tx.status} /></td>
                        <td className="p-4 text-zinc-500 text-xs hidden md:table-cell">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {/* ─── KYC ─── */}
            {tab === 'kyc' && (
              <div className="space-y-3">
                {kycList.length === 0 ? (
                  <EmptyState message="No KYC requests" />
                ) : kycList.map((k) => (
                  <div key={k.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div className="space-y-1">
                        <p className="font-semibold text-white">{k.full_name}</p>
                        <p className="text-sm text-zinc-400">{k.users?.email}</p>
                        <p className="text-xs text-zinc-500">Doc: {k.document_type} &bull; {k.document_number}</p>
                        <p className="text-xs text-zinc-500">Country: {k.country} &bull; DOB: {k.date_of_birth}</p>
                        {k.rejection_reason && <p className="text-xs text-red-400 mt-1">Rejected: {k.rejection_reason}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={k.status} />
                        {k.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveKYC(k.id)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-400 transition-colors">Approve</button>
                            <button onClick={() => setRejectId(k.id)} className="bg-red-500/15 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-500/25 transition-colors">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {rejectId === k.id && (
                      <div className="mt-3 flex gap-2">
                        <input type="text" placeholder="Rejection reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500" />
                        <button onClick={handleRejectKYC} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Submit</button>
                        <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-4 py-2 text-sm text-zinc-500 hover:text-white transition-colors">Cancel</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ─── CHATS ─── */}
            {tab === 'chats' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Conversations</div>
                  <div className="max-h-[600px] overflow-y-auto">
                    {threads.length === 0 ? (
                      <div className="p-8 text-center text-zinc-500 text-sm">No conversations yet</div>
                    ) : threads.map((t) => (
                      <button key={t.userId} onClick={() => openChat(t)}
                        className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${activeChatUser?.userId === t.userId ? 'bg-zinc-800/60 border-l-2 border-l-gold-500' : ''}`}>
                        <div className="flex justify-between items-center">
                          <p className="font-medium text-sm text-white truncate">{t.name || t.email}</p>
                          {t.unread > 0 && <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{t.unread}</span>}
                        </div>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{t.lastMessage || '(no message)'}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col min-h-[500px]">
                  {!activeChatUser ? (
                    <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm p-6">Select a conversation</div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-zinc-800">
                        <p className="font-semibold text-sm text-white">{activeChatUser.name || activeChatUser.email}</p>
                        <p className="text-[11px] text-zinc-500">{activeChatUser.email}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-zinc-500 text-sm py-8">No messages yet</div>
                        ) : chatMessages.map((m) => (
                          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-3.5 py-2.5 text-sm rounded-2xl ${
                              m.sender === 'user'
                                ? 'bg-gold-500/15 border border-gold-500/20 text-gold-200 rounded-br-md'
                                : 'bg-zinc-800 border border-zinc-700 text-zinc-300 rounded-bl-md'
                            }`}>
                              {m.message && <p>{m.message}</p>}
                              {m.attachment && <img src={m.attachment} alt="Attachment" className="mt-1.5 rounded-lg max-h-48 cursor-pointer" onClick={() => window.open(m.attachment, '_blank')} />}
                              <p className="text-[10px] text-zinc-500 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-zinc-800 p-3 space-y-2">
                        <div className="flex gap-2">
                          <input type="text" value={chatReply} onChange={(e) => setChatReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAdminReply()}
                            placeholder="Reply..." className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                          <button onClick={sendAdminReply} className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-400 transition-colors">Send</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" min="1" value={chatCredit} onChange={(e) => setChatCredit(e.target.value)} placeholder="Credit ($)"
                            className="w-32 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                          <button onClick={sendAdminReply} className="text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-3 py-2 rounded-lg font-semibold hover:bg-emerald-500/25 transition-colors">Credit Wallet</button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ─── SETTINGS ─── */}
            {tab === 'settings' && (
              <div className="max-w-2xl space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Platform Settings</h3>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Expected Profit Rate (% per month)</label>
                    <input type="number" step="0.1" min="0" value={settingsForm.expectedProfitRate} onChange={(e) => setSettingsForm({ ...settingsForm, expectedProfitRate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                    <p className="text-[11px] text-zinc-600 mt-1">Applied to all user balances monthly</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1.5">Min Deposit ($)</label>
                      <input type="number" min="1" value={settingsForm.minDeposit} onChange={(e) => setSettingsForm({ ...settingsForm, minDeposit: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 block mb-1.5">Max Deposit ($)</label>
                      <input type="number" min="1" value={settingsForm.maxDeposit} onChange={(e) => setSettingsForm({ ...settingsForm, maxDeposit: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Bank Details (JSON)</label>
                    <textarea rows={4} value={settingsForm.bankDetails} onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-gold-500 transition-colors" />
                    <p className="text-[11px] text-zinc-600 mt-1">Shown to users on deposit page</p>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 block mb-1.5">Crypto Wallet (JSON)</label>
                    <textarea rows={4} value={settingsForm.cryptoWallet} onChange={(e) => setSettingsForm({ ...settingsForm, cryptoWallet: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-gold-500 transition-colors" />
                    <p className="text-[11px] text-zinc-600 mt-1">Crypto addresses shown to users for deposits</p>
                  </div>
                  <button onClick={saveSettings} className="bg-gold-500 text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors">Save Settings</button>
                </div>
              </div>
            )}

            {/* ─── LOGS ─── */}
            {tab === 'logs' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-zinc-500 text-xs uppercase tracking-wider border-b border-zinc-800">
                    <th className="p-4">Admin</th><th className="p-4">Action</th><th className="p-4 hidden md:table-cell">Target</th><th className="p-4 hidden lg:table-cell">Details</th><th className="p-4 hidden md:table-cell">Time</th>
                  </tr></thead>
                  <tbody>
                    {logs.length === 0 ? (
                      <tr><td colSpan={5} className="p-8 text-center text-zinc-500 text-sm">No activity logs</td></tr>
                    ) : logs.map((log) => (
                      <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="p-4 text-zinc-300">{log.users?.email || 'System'}</td>
                        <td className="p-4"><span className="bg-zinc-800 border border-zinc-700 px-2 py-0.5 rounded text-xs font-mono">{log.action}</span></td>
                        <td className="p-4 text-zinc-500 hidden md:table-cell">{log.target_type}: {log.target_id?.slice(0, 8)}...</td>
                        <td className="p-4 text-zinc-500 text-xs font-mono hidden lg:table-cell truncate max-w-[300px]">{log.details ? JSON.stringify(log.details) : '-'}</td>
                        <td className="p-4 text-zinc-600 text-xs hidden md:table-cell">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Fund Wallet Modal */}
      {fundUserId && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setFundUserId(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-1">Fund Wallet</h3>
            <p className="text-xs text-zinc-500 mb-5">{fundUserName}</p>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">$</span>
              <input type="number" min="1" placeholder="Amount" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-lg font-mono focus:outline-none focus:border-gold-500 transition-colors" />
            </div>
            <input type="text" placeholder="Note (optional)" value={fundNote} onChange={(e) => setFundNote(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm mb-5 focus:outline-none focus:border-gold-500 transition-colors" />
            <div className="flex gap-2">
              <button onClick={handleFundWallet} className="flex-1 bg-gold-500 text-black py-3 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-colors">Credit ${fundAmount || '0'}</button>
              <button onClick={() => setFundUserId(null)} className="px-4 py-3 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatBox({ label, value, icon, alert = false }: { label: string; value: number; icon: string; alert?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 hover:border-zinc-700 transition-colors">
      <p className="text-zinc-500 text-xs font-medium mb-2">{label}</p>
      <p className={`text-2xl md:text-3xl font-bold ${alert ? 'text-yellow-500' : 'text-gold-400'}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-500/15 text-emerald-400',
    approved: 'bg-emerald-500/15 text-emerald-400',
    pending: 'bg-yellow-500/15 text-yellow-400',
    rejected: 'bg-red-500/15 text-red-400',
    failed: 'bg-red-500/15 text-red-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles[status] || 'bg-zinc-700/50 text-zinc-400'}`}>
      {status}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
      </div>
      <p className="text-zinc-400 text-sm">{message}</p>
    </div>
  );
}
