'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { kycAPI } from '@/lib/api';

export default function KYCPage() {
  const router = useRouter();
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    fullName: '', dateOfBirth: '', country: '',
    documentType: 'passport', documentNumber: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    kycAPI.getStatus().then((res) => { setKyc(res.data.kyc); setLoading(false); }).catch(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await kycAPI.submit(form);
      setMessage({ type: 'success', text: res.data.message });
      setKyc(res.data.kyc);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Submission failed' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-gold-500">Loading...</div></main>;

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-500', approved: 'text-green-500', rejected: 'text-red-500',
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-4 md:px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl md:text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white">Back to Dashboard</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <h2 className="text-2xl md:text-3xl font-semibold mb-2">Identity Verification</h2>
        <p className="text-gray-400 mb-4">Complete KYC to unlock full trading features and secure your account</p>
        <div className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-4 mb-6 md:mb-8 text-sm">
          <p className="text-gold-500 font-semibold mb-1">Why KYC?</p>
          <p className="text-gray-300">Your identity documents are securely stored for account recovery purposes. This helps us protect your investment and verify ownership in case you lose access to your account.</p>
        </div>

        {kyc ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-4">Verification Status</h3>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-2xl font-bold ${statusColors[kyc.status] || 'text-gray-400'}`}>
                {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-sm text-gray-400">Name</p><p>{kyc.full_name}</p></div>
              <div><p className="text-sm text-gray-400">Country</p><p>{kyc.country}</p></div>
              <div><p className="text-sm text-gray-400">Document</p><p className="capitalize">{kyc.document_type?.replace('_', ' ')}</p></div>
              <div><p className="text-sm text-gray-400">Number</p><p className="font-mono">{kyc.document_number}</p></div>
              <div><p className="text-sm text-gray-400">Submitted</p><p>{new Date(kyc.created_at).toLocaleDateString()}</p></div>
            </div>
            {kyc.rejection_reason && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4">
                <strong>Rejection reason:</strong> {kyc.rejection_reason}
              </div>
            )}
            {kyc.status === 'rejected' && (
              <button onClick={() => setKyc(null)} className="mt-4 bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold-400">Resubmit</button>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-6">Submit Documents</h3>
            {message.text && (
              <div className={`px-4 py-3 rounded-lg mb-4 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
                {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Full Legal Name (as on document)</label>
                <input type="text" placeholder="John Smith" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Date of Birth</label>
                <input type="date" required value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Country</label>
                <input type="text" placeholder="e.g. US, NG, GB" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Document Type</label>
                <select value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500">
                  <option value="passport">Passport</option>
                  <option value="drivers_license">Driver&apos;s License</option>
                  <option value="national_id">National ID</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Document Number</label>
                <input type="text" placeholder="AB123456" required value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })} className="w-full px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500" />
              </div>
              <div className="bg-zinc-800 rounded-lg p-4 text-sm text-gray-400">
                <p>Your document details are securely stored and used only for identity verification and account recovery purposes. We never share your data with third parties.</p>
              </div>
              <button type="submit" disabled={submitting} className="w-full bg-gold-500 text-black py-2.5 md:py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
