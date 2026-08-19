'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

type Tab = 'overview' | 'users' | 'deposits' | 'withdrawals' | 'transactions' | 'kyc' | 'chats' | 'settings' | 'logs';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
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

  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [approveId, setApproveId] = useState('');

  const [fundUserId, setFundUserId] = useState<any>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundNote, setFundNote] = useState('');

  const [activeChatUser, setActiveChatUser] = useState<any>(null);
  const [chatReply, setChatReply] = useState('');
  const [chatCredit, setChatCredit] = useState('');

  const [settingsForm, setSettingsForm] = useState<any>({});

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    loadTab('overview');
  }, [router]);

  const loadTab = async (t: Tab) => {
    setTab(t);
    setLoading(true);
    try {
      if (t === 'overview') setStats((await adminAPI.getDashboard()).data);
      else if (t === 'users') setUsers((await adminAPI.getUsers()).data.users);
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
      alert(`Credited $${fundAmount}`);
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
    if (!message && !(amount > 0)) { alert('Type a reply or enter a credit amount.'); return; }
    try {
      const res = await adminAPI.adminReply(activeChatUser.userId, {
        message: message || undefined,
        creditAmount: amount > 0 ? amount : undefined,
        creditNote: amount > 0 ? `Credited from chat by admin` : undefined,
      });
      if (res.data.credit) alert(`Credited $${chatCredit}`);
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'withdrawals', label: 'Withdrawals' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'kyc', label: 'KYC' },
    { id: 'chats', label: 'Chats' },
    { id: 'settings', label: 'Settings' },
    { id: 'logs', label: 'Logs' },
  ];

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 py-4 flex justify-between items-center">
        <BrandLogo size={32} href="/dashboard" showAdmin />
        <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
      </nav>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">Admin Panel</h2>
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => loadTab(t.id)}
              className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${tab === t.id ? 'bg-gold-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            {tab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"><p className="text-gray-400 text-sm mb-1">Total Users</p><p className="text-2xl md:text-3xl font-bold text-gold-500">{stats.totalUsers}</p></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"><p className="text-gray-400 text-sm mb-1">Total Transactions</p><p className="text-2xl md:text-3xl font-bold">{stats.totalTransactions}</p></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"><p className="text-gray-400 text-sm mb-1">Pending KYC</p><p className="text-2xl md:text-3xl font-bold text-yellow-500">{stats.kycPending}</p></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"><p className="text-gray-400 text-sm mb-1">Approved KYC</p><p className="text-2xl md:text-3xl font-bold text-green-500">{stats.kycApproved}</p></div>
              </div>
            )}

            {tab === 'users' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-sm border-b border-zinc-800">
                    <th className="p-4">Email</th><th className="p-4 hidden md:table-cell">Name</th><th className="p-4">USD Balance</th><th className="p-4 hidden md:table-cell">Role</th><th className="p-4">Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-zinc-800/50">
                        <td className="p-4">{u.email}</td>
                        <td className="p-4 hidden md:table-cell">{u.first_name} {u.last_name}</td>
                        <td className="p-4 font-mono text-gold-400">${parseFloat(u.usdBalance || 0).toFixed(2)}</td>
                        <td className="p-4 hidden md:table-cell"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-gold-500/20 text-gold-500' : 'bg-zinc-800 text-gray-400'}`}>{u.role}</span></td>
                        <td className="p-4 flex flex-wrap gap-2">
                          <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs">
                            <option value="user">User</option><option value="admin">Admin</option>
                          </select>
                          <button onClick={() => { setFundUserId(u.id); setFundAmount(''); setFundNote(''); }} className="text-xs bg-gold-500 text-black px-3 py-1 rounded font-semibold hover:bg-gold-400">Fund</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {tab === 'deposits' && (
              <div className="space-y-4">
                {deposits.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 text-center text-gray-400">No deposit requests</div>
                ) : deposits.map((d) => {
                  const meta = d.metadata || {};
                  return (
                    <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl font-bold text-gold-500">${parseFloat(d.amount).toFixed(2)}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'completed' ? 'bg-green-500/20 text-green-500' : d.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{d.status}</span>
                          </div>
                          <p className="text-sm text-gray-400">User: <span className="text-white">{d.users?.email || 'N/A'}</span></p>
                          <p className="text-sm text-gray-400">Method: {meta.method === 'crypto' ? 'Crypto Transfer' : meta.method === 'admin_manual' ? 'Admin Manual Credit' : 'Bank Transfer'}</p>
                          {meta.referenceCode && <p className="text-sm text-gray-400">Reference: {meta.referenceCode}</p>}
                          {meta.slip && (
                            <div className="mt-3">
                              <p className="text-xs text-gray-400 mb-1">Payment slip:</p>
                              <img src={meta.slip} alt="Payment slip" className="max-h-64 rounded-lg border border-zinc-700 cursor-pointer" onClick={() => window.open(meta.slip, '_blank')} />
                            </div>
                          )}
                          {meta.approvedBy && <p className="text-xs text-green-500 mt-1">Approved with notes: {meta.adminNotes || 'none'}</p>}
                          {meta.rejectionReason && <p className="text-xs text-red-400 mt-1">Rejected: {meta.rejectionReason}</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(d.created_at).toLocaleString()}</p>
                        </div>
                        {d.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            {approveId === d.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Notes" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-full sm:w-40" />
                                <button onClick={() => handleApproveDeposit(d.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setApproveId(''); setApproveNotes(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : rejectId === d.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-full sm:w-40" />
                                <button onClick={handleRejectDeposit} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => setApproveId(d.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Approve</button>
                                <button onClick={() => setRejectId(d.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
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

            {tab === 'withdrawals' && (
              <div className="space-y-4">
                {withdrawals.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 text-center text-gray-400">No withdrawal requests</div>
                ) : withdrawals.map((w) => {
                  const meta = w.metadata || {};
                  return (
                    <div key={w.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl font-bold text-gold-500">${parseFloat(w.amount).toFixed(2)}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${w.status === 'completed' ? 'bg-green-500/20 text-green-500' : w.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{w.status}</span>
                          </div>
                          <p className="text-sm text-gray-400">User: <span className="text-white">{w.users?.email || 'N/A'}</span></p>
                          <p className="text-sm text-gray-400">Bank: <span className="text-white">{meta.bankName || 'N/A'}</span></p>
                          <p className="text-sm text-gray-400">Account: <span className="text-white font-mono">{meta.accountNumber || 'N/A'}</span> ({meta.accountName || 'N/A'})</p>
                          {meta.adminNotes && <p className="text-xs text-green-500 mt-1">Approved notes: {meta.adminNotes}</p>}
                          {meta.rejectionReason && <p className="text-xs text-red-400 mt-1">Rejected: {meta.rejectionReason}</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(w.created_at).toLocaleString()}</p>
                        </div>
                        {w.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            {approveId === w.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Notes" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-full sm:w-40" />
                                <button onClick={() => handleApproveWithdrawal(w.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setApproveId(''); setApproveNotes(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : rejectId === w.id ? (
                              <div className="flex flex-wrap gap-2">
                                <input type="text" placeholder="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-full sm:w-40" />
                                <button onClick={handleRejectWithdrawal} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-2">
                                <button onClick={() => setApproveId(w.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Approve</button>
                                <button onClick={() => setRejectId(w.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
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

            {tab === 'transactions' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-sm border-b border-zinc-800">
                    <th className="p-4">User</th><th className="p-4">Type</th><th className="p-4 hidden md:table-cell">Currency</th><th className="p-4">Amount</th><th className="p-4 hidden md:table-cell">USD</th><th className="p-4">Status</th><th className="p-4 hidden md:table-cell">Date</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800/50">
                        <td className="p-4">{tx.users?.email || 'N/A'}</td>
                        <td className="p-4 capitalize">{tx.type.replace('_', ' ')}</td>
                        <td className="p-4 hidden md:table-cell">{tx.currency}</td>
                        <td className="p-4 font-mono">{parseFloat(tx.amount).toFixed(2)}</td>
                        <td className="p-4 hidden md:table-cell">${tx.usd_value || 'N/A'}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${tx.status === 'completed' ? 'bg-green-500/20 text-green-500' : tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>{tx.status}</span></td>
                        <td className="p-4 text-gray-400 hidden md:table-cell">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}

            {tab === 'kyc' && (
              <div className="space-y-4">
                {kycList.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 text-center text-gray-400">No KYC requests</div>
                ) : kycList.map((k) => (
                  <div key={k.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      <div>
                        <p className="font-semibold">{k.full_name}</p>
                        <p className="text-sm text-gray-400">{k.users?.email}</p>
                        <p className="text-sm text-gray-400">Doc: {k.document_type} - {k.document_number}</p>
                        <p className="text-sm text-gray-400">Country: {k.country} | DOB: {k.date_of_birth}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${k.status === 'approved' ? 'bg-green-500/20 text-green-500' : k.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{k.status}</span>
                        {k.status === 'pending' && (
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => handleApproveKYC(k.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Approve</button>
                            <button onClick={() => setRejectId(k.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {rejectId === k.id && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <input type="text" placeholder="Rejection reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm" />
                        <button onClick={handleRejectKYC} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Submit</button>
                        <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-4 py-2 rounded-lg text-sm text-gray-400">Cancel</button>
                      </div>
                    )}
                    {k.rejection_reason && <p className="mt-2 text-sm text-red-400">Reason: {k.rejection_reason}</p>}
                  </div>
                ))}
              </div>
            )}

            {tab === 'chats' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-zinc-800 font-semibold text-sm">User Conversations</div>
                  {threads.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No conversations yet</div>
                  ) : threads.map((t) => (
                    <button key={t.userId} onClick={() => openChat(t)}
                      className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors ${activeChatUser?.userId === t.userId ? 'bg-zinc-800/60' : ''}`}>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-sm">{t.name || t.email}</p>
                        {t.unread > 0 && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{t.unread}</span>}
                      </div>
                      <p className="text-xs text-gray-400 truncate">{t.email}</p>
                      <p className="text-xs text-zinc-500 truncate mt-1">{t.lastMessage || '(no message)'}</p>
                    </button>
                  ))}
                </div>

                <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl flex flex-col min-h-[500px]">
                  {!activeChatUser ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm p-6">Select a user to view the conversation</div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-zinc-800">
                        <p className="font-semibold text-sm">{threads.find(t => t.userId === activeChatUser.userId)?.name || activeChatUser.name || activeChatUser.email}</p>
                        <p className="text-xs text-gray-400">{activeChatUser.email}</p>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {chatMessages.length === 0 ? (
                          <div className="text-center text-gray-400 text-sm py-8">No messages yet</div>
                        ) : chatMessages.map((m) => (
                          <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] px-3.5 py-2.5 text-sm rounded-2xl ${m.sender === 'user' ? 'bg-gold-500/15 border border-gold-500/20 text-gold-200 rounded-br-md' : 'bg-zinc-800 border border-zinc-700 text-gray-300 rounded-bl-md'}`}>
                              {m.message && <p>{m.message}</p>}
                              {m.attachment && <img src={m.attachment} alt="Attachment" className="mt-1.5 rounded-lg max-h-48 cursor-pointer" onClick={() => window.open(m.attachment, '_blank')} />}
                              <p className="text-[10px] text-zinc-500 mt-1">{new Date(m.created_at).toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-zinc-800 p-3 space-y-2">
                        <div className="flex gap-2">
                          <input type="text" value={chatReply} onChange={(e) => setChatReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendAdminReply()} placeholder="Reply as admin..." className="flex-1 px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                          <button onClick={sendAdminReply} className="bg-gold-500 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gold-400">Send</button>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="number" min="1" value={chatCredit} onChange={(e) => setChatCredit(e.target.value)} placeholder="Credit amount ($)" className="w-40 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500 transition-colors" />
                          <button onClick={sendAdminReply} className="text-xs bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 px-3 py-2 rounded-lg font-semibold hover:bg-emerald-500/25">Credit Wallet</button>
                          <p className="text-[10px] text-zinc-500">Send a message and/or credit this user&apos;s wallet.</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {tab === 'settings' && (
              <div className="max-w-2xl space-y-4">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 space-y-4">
                  <h3 className="font-semibold">Broker Settings</h3>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Expected Profit Rate (% per month)</label>
                    <input type="number" step="0.1" min="0" value={settingsForm.expectedProfitRate} onChange={(e) => setSettingsForm({ ...settingsForm, expectedProfitRate: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Min Deposit ($)</label>
                      <input type="number" min="1" value={settingsForm.minDeposit} onChange={(e) => setSettingsForm({ ...settingsForm, minDeposit: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Max Deposit ($)</label>
                      <input type="number" min="1" value={settingsForm.maxDeposit} onChange={(e) => setSettingsForm({ ...settingsForm, maxDeposit: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm focus:outline-none focus:border-gold-500" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Bank Details (JSON)</label>
                    <textarea rows={5} value={settingsForm.bankDetails} onChange={(e) => setSettingsForm({ ...settingsForm, bankDetails: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-gold-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Crypto Wallet (JSON)</label>
                    <textarea rows={5} value={settingsForm.cryptoWallet} onChange={(e) => setSettingsForm({ ...settingsForm, cryptoWallet: e.target.value })} className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-mono focus:outline-none focus:border-gold-500" />
                  </div>
                  <button onClick={saveSettings} className="bg-gold-500 text-black px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-gold-400">Save Settings</button>
                </div>
              </div>
            )}

            {tab === 'logs' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-sm border-b border-zinc-800">
                    <th className="p-4">Admin</th><th className="p-4">Action</th><th className="p-4 hidden md:table-cell">Target</th><th className="p-4 hidden md:table-cell">Details</th><th className="p-4 hidden md:table-cell">Time</th>
                  </tr></thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-zinc-800/50">
                        <td className="p-4">{log.users?.email || 'System'}</td>
                        <td className="p-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs">{log.action}</span></td>
                        <td className="p-4 text-gray-400 hidden md:table-cell">{log.target_type}: {log.target_id?.slice(0, 8)}...</td>
                        <td className="p-4 text-gray-400 text-xs font-mono hidden md:table-cell">{log.details ? JSON.stringify(log.details) : '-'}</td>
                        <td className="p-4 text-gray-400 hidden md:table-cell">{new Date(log.created_at).toLocaleString()}</td>
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
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-4" onClick={() => setFundUserId(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Fund User Wallet</h3>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
              <input type="number" min="1" placeholder="Amount" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-lg font-mono focus:outline-none focus:border-gold-500" />
            </div>
            <input type="text" placeholder="Note (optional)" value={fundNote} onChange={(e) => setFundNote(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm mb-4 focus:outline-none focus:border-gold-500" />
            <div className="flex gap-2">
              <button onClick={handleFundWallet} className="flex-1 bg-gold-500 text-black py-3 rounded-lg font-semibold text-sm hover:bg-gold-400">Credit Wallet</button>
              <button onClick={() => setFundUserId(null)} className="px-4 py-3 border border-zinc-700 rounded-lg text-sm text-gray-400 hover:bg-zinc-800">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}