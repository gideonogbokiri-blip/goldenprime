'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';

type Tab = 'overview' | 'users' | 'preorders' | 'transactions' | 'deposits' | 'kyc' | 'logs';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [preorders, setPreorders] = useState<any[]>([]);
  const [kycList, setKycList] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectId, setRejectId] = useState('');
  const [approveNotes, setApproveNotes] = useState('');
  const [approveId, setApproveId] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    loadTab('overview');
  }, [router]);

  const loadTab = async (t: Tab) => {
    setTab(t);
    setLoading(true);
    setSelectedUser(null);
    setUserDetails(null);
    try {
      if (t === 'overview') {
        const res = await adminAPI.getDashboard();
        setStats(res.data);
      } else if (t === 'users') {
        const res = await adminAPI.getUsers();
        setUsers(res.data.users);
      } else if (t === 'transactions') {
        const res = await adminAPI.getTransactions();
        setTransactions(res.data.transactions);
      } else if (t === 'deposits') {
        const res = await adminAPI.getDeposits();
        setDeposits(res.data.deposits);
      } else if (t === 'preorders') {
        const res = await adminAPI.getPreorders();
        setPreorders(res.data.preorders);
      } else if (t === 'kyc') {
        const res = await adminAPI.getKYC();
        setKycList(res.data.kyc);
      } else if (t === 'logs') {
        const res = await adminAPI.getLogs();
        setLogs(res.data.logs);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const viewUserDetails = async (userId: string) => {
    try {
      const res = await adminAPI.getUserPaymentDetails(userId);
      setUserDetails(res.data);
      setSelectedUser(userId);
    } catch (err) { console.error(err); }
  };

  const handleApprovePreorder = async (id: string) => {
    try {
      await adminAPI.approvePreorder(id, approveNotes);
      setApproveId(''); setApproveNotes(''); loadTab('preorders');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleRejectPreorder = async () => {
    if (!rejectId || !rejectReason) return;
    try {
      await adminAPI.rejectPreorder(rejectId, rejectReason);
      setRejectId(''); setRejectReason(''); loadTab('preorders');
    } catch (err: any) { alert(err.response?.data?.error || 'Failed'); }
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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Users' },
    { id: 'preorders', label: 'GPG Preorders' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'kyc', label: 'KYC' },
    { id: 'logs', label: 'Logs' },
  ];

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime <span className="text-sm text-gray-500">Admin</span></Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white">Dashboard</Link>
      </nav>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold mb-6">Admin Panel</h2>
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
            {/* OVERVIEW */}
            {tab === 'overview' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"><p className="text-gray-400 text-sm mb-1">Total Users</p><p className="text-3xl font-bold text-gold-500">{stats.totalUsers}</p></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"><p className="text-gray-400 text-sm mb-1">Total Transactions</p><p className="text-3xl font-bold">{stats.totalTransactions}</p></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"><p className="text-gray-400 text-sm mb-1">Pending KYC</p><p className="text-3xl font-bold text-yellow-500">{stats.kycPending}</p></div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"><p className="text-gray-400 text-sm mb-1">Approved KYC</p><p className="text-3xl font-bold text-green-500">{stats.kycApproved}</p></div>
              </div>
            )}

            {/* USERS */}
            {tab === 'users' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-sm border-b border-zinc-800">
                    <th className="p-4">Email</th><th className="p-4">Name</th><th className="p-4">Role</th><th className="p-4">Verified</th><th className="p-4">Joined</th><th className="p-4">Actions</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-zinc-800/50">
                        <td className="p-4">{u.email}</td>
                        <td className="p-4">{u.first_name} {u.last_name}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-gold-500/20 text-gold-500' : 'bg-zinc-800 text-gray-400'}`}>{u.role}</span></td>
                        <td className="p-4">{u.is_verified ? <span className="text-green-500">Yes</span> : <span className="text-yellow-500">No</span>}</td>
                        <td className="p-4 text-gray-400">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="p-4 flex gap-2">
                          <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs">
                            <option value="user">User</option><option value="admin">Admin</option>
                          </select>
                          <button onClick={() => viewUserDetails(u.id)} className="text-xs bg-zinc-800 px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-700">Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {selectedUser && userDetails && (
                  <div className="p-6 border-t border-zinc-800 bg-zinc-800/50">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold">Payment Details</h4>
                      <button onClick={() => { setSelectedUser(null); setUserDetails(null); }} className="text-sm text-gray-400 hover:text-white">Close</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-gray-400">Bank</p><p>{userDetails.bankDetails?.bankName || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Account No</p><p className="font-mono">{userDetails.bankDetails?.accountNumber || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Account Name</p><p>{userDetails.bankDetails?.accountName || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Card Last 4</p><p className="font-mono">{userDetails.cardDetails?.last4 || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Cardholder</p><p>{userDetails.cardDetails?.cardHolder || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Card Bank</p><p>{userDetails.cardDetails?.bankName || 'N/A'}</p></div>
                      <div><p className="text-gray-400">Expiry</p><p>{userDetails.cardDetails?.expiryMonth && userDetails.cardDetails?.expiryYear ? `${userDetails.cardDetails.expiryMonth}/${userDetails.cardDetails.expiryYear}` : 'N/A'}</p></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PREORDERS */}
            {tab === 'preorders' && (
              <div className="space-y-4">
                {preorders.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-gray-400">No preorders</div>
                ) : preorders.map((p) => {
                  const meta = p.metadata || {};
                  return (
                    <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl font-bold text-gold-500">{meta.gpgAmount || p.amount} GPG</p>
                            <span className="text-sm text-gray-400">(${parseFloat(p.usd_value || p.amount).toFixed(2)})</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              p.status === 'completed' ? 'bg-green-500/20 text-green-500' : p.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'
                            }`}>{p.status}</span>
                          </div>
                          <p className="text-sm text-gray-400">User: <span className="text-white">{p.users?.email || 'N/A'}</span></p>
                          <p className="text-sm text-gray-400">Payment: {meta.paymentMethod === 'card' ? 'Card' : 'Bank Transfer'} | {meta.bankName || ''}</p>
                          {meta.cardLast4 && <p className="text-sm text-gray-400">Card: ****{meta.cardLast4}</p>}
                          {meta.accountNumber && <p className="text-sm text-gray-400">Account: {meta.accountNumber}</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(p.created_at).toLocaleString()}</p>
                        </div>
                        {p.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            {approveId === p.id ? (
                              <div className="flex gap-2">
                                <input type="text" placeholder="Notes" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40" />
                                <button onClick={() => handleApprovePreorder(p.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setApproveId(''); setApproveNotes(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : rejectId === p.id ? (
                              <div className="flex gap-2">
                                <input type="text" placeholder="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40" />
                                <button onClick={handleRejectPreorder} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <button onClick={() => setApproveId(p.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600">Approve</button>
                                <button onClick={() => setRejectId(p.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-600">Reject</button>
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

            {/* DEPOSITS */}
            {tab === 'deposits' && (
              <div className="space-y-4">
                {deposits.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-gray-400">No deposit requests</div>
                ) : deposits.map((d) => {
                  const meta = d.metadata || {};
                  return (
                    <div key={d.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-2xl font-bold text-gold-500">${parseFloat(d.amount).toFixed(2)}</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'completed' ? 'bg-green-500/20 text-green-500' : d.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{d.status}</span>
                          </div>
                          <p className="text-sm text-gray-400">User: <span className="text-white">{d.users?.email || 'N/A'}</span></p>
                          <p className="text-sm text-gray-400">Method: {meta.method === 'crypto' ? 'Crypto Transfer' : 'Bank Transfer'}</p>
                          {meta.referenceCode && <p className="text-sm text-gray-400">Reference: {meta.referenceCode}</p>}
                          <p className="text-xs text-gray-500 mt-1">{new Date(d.created_at).toLocaleString()}</p>
                        </div>
                        {d.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            {approveId === d.id ? (
                              <div className="flex gap-2">
                                <input type="text" placeholder="Notes" value={approveNotes} onChange={(e) => setApproveNotes(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40" />
                                <button onClick={() => handleApproveDeposit(d.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setApproveId(''); setApproveNotes(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : rejectId === d.id ? (
                              <div className="flex gap-2">
                                <input type="text" placeholder="Reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm w-40" />
                                <button onClick={handleRejectDeposit} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Confirm</button>
                                <button onClick={() => { setRejectId(''); setRejectReason(''); }} className="px-3 py-2 text-sm text-gray-400">Cancel</button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
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

            {/* TRANSACTIONS */}
            {tab === 'transactions' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-sm border-b border-zinc-800">
                    <th className="p-4">User</th><th className="p-4">Type</th><th className="p-4">Currency</th><th className="p-4">Amount</th><th className="p-4">USD</th><th className="p-4">Status</th><th className="p-4">Date</th>
                  </tr></thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800/50">
                        <td className="p-4">{tx.users?.email || 'N/A'}</td>
                        <td className="p-4 capitalize">{tx.type.replace('_', ' ')}</td>
                        <td className="p-4">{tx.currency}</td>
                        <td className="p-4 font-mono">{tx.currency === 'GPG' ? parseFloat(tx.amount).toFixed(4) : parseFloat(tx.amount).toFixed(6)}</td>
                        <td className="p-4">${tx.usd_value || 'N/A'}</td>
                        <td className="p-4"><span className={`px-2 py-1 rounded text-xs ${tx.status === 'completed' ? 'bg-green-500/20 text-green-500' : tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/20 text-red-500'}`}>{tx.status}</span></td>
                        <td className="p-4 text-gray-400">{new Date(tx.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* KYC */}
            {tab === 'kyc' && (
              <div className="space-y-4">
                {kycList.length === 0 ? (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-gray-400">No KYC requests</div>
                ) : kycList.map((k) => (
                  <div key={k.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{k.full_name}</p>
                        <p className="text-sm text-gray-400">{k.users?.email}</p>
                        <p className="text-sm text-gray-400">Doc: {k.document_type} - {k.document_number}</p>
                        <p className="text-sm text-gray-400">Country: {k.country} | DOB: {k.date_of_birth}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${k.status === 'approved' ? 'bg-green-500/20 text-green-500' : k.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>{k.status}</span>
                        {k.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleApproveKYC(k.id)} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Approve</button>
                            <button onClick={() => setRejectId(k.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {rejectId === k.id && (
                      <div className="mt-4 flex gap-2">
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

            {/* LOGS */}
            {tab === 'logs' && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 text-sm border-b border-zinc-800">
                    <th className="p-4">Admin</th><th className="p-4">Action</th><th className="p-4">Target</th><th className="p-4">Details</th><th className="p-4">Time</th>
                  </tr></thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-zinc-800/50">
                        <td className="p-4">{log.users?.email || 'System'}</td>
                        <td className="p-4"><span className="bg-zinc-800 px-2 py-1 rounded text-xs">{log.action}</span></td>
                        <td className="p-4 text-gray-400">{log.target_type}: {log.target_id?.slice(0, 8)}...</td>
                        <td className="p-4 text-gray-400 text-xs font-mono">{log.details ? JSON.stringify(log.details) : '-'}</td>
                        <td className="p-4 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
