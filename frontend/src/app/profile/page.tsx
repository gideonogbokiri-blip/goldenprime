'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI, goldAPI, kycAPI } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [kyc, setKyc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    Promise.all([
      authAPI.getMe().then(r => setUser(r.data.user)),
      goldAPI.getBankDetails().then(r => setBankDetails(r.data.bankDetails)),
      goldAPI.getCardDetails().then(r => setCardDetails(r.data.cardDetails)),
      kycAPI.getStatus().then(r => setKyc(r.data.kyc)).catch(() => {}),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main className="min-h-screen flex items-center justify-center bg-zinc-950"><div className="text-gold-500">Loading...</div></main>;

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-500', approved: 'text-green-500', rejected: 'text-red-500',
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white">Back to Dashboard</Link>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-semibold mb-8">My Profile</h2>

        {/* Account Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Role</p>
              <p className="font-semibold capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">KYC Status</p>
              <p className={`font-semibold ${statusColors[kyc?.status] || 'text-gray-400'}`}>
                {kyc ? kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1) : 'Not submitted'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Joined</p>
              <p className="font-semibold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Account Verified</p>
              <p className={`font-semibold ${user?.is_verified ? 'text-green-500' : 'text-yellow-500'}`}>
                {user?.is_verified ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Saved Bank Details</h3>
          {bankDetails ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Bank Name</p>
                <p className="font-semibold">{bankDetails.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Account Number</p>
                <p className="font-mono font-semibold">{bankDetails.accountNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Account Name</p>
                <p className="font-semibold">{bankDetails.accountName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Saved</p>
                <p className="text-sm text-gray-400">{bankDetails.savedAt ? new Date(bankDetails.savedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No bank details saved yet. They will be saved when you make your first bank transfer preorder.</p>
          )}
        </div>

        {/* Card Details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Saved Card Details</h3>
          {cardDetails ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Card</p>
                <p className="font-mono font-semibold">**** **** **** {cardDetails.last4}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Cardholder</p>
                <p className="font-semibold">{cardDetails.cardHolder}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Expires</p>
                <p className="font-semibold">{cardDetails.expiryMonth}/{cardDetails.expiryYear}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Bank</p>
                <p className="font-semibold">{cardDetails.bankName || 'N/A'}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No card details saved yet. They will be saved when you make your first card preorder.</p>
          )}
        </div>

        {/* KYC Status */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Identity Verification (KYC)</h3>
          {kyc ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-bold ${statusColors[kyc.status] || 'text-gray-400'}`}>
                  {kyc.status.charAt(0).toUpperCase() + kyc.status.slice(1)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-sm text-gray-400">Full Name</p><p>{kyc.full_name}</p></div>
                <div><p className="text-sm text-gray-400">Country</p><p>{kyc.country}</p></div>
                <div><p className="text-sm text-gray-400">Document Type</p><p className="capitalize">{kyc.document_type?.replace('_', ' ')}</p></div>
                <div><p className="text-sm text-gray-400">Document Number</p><p className="font-mono">{kyc.document_number}</p></div>
              </div>
              {kyc.rejection_reason && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                  Rejection reason: {kyc.rejection_reason}
                </div>
              )}
              {kyc.status === 'rejected' && (
                <Link href="/kyc" className="inline-block bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold-400 mt-2">Resubmit KYC</Link>
              )}
            </div>
          ) : (
            <div>
              <p className="text-gray-400 mb-4">You haven&apos;t submitted KYC yet. Complete verification to unlock full features.</p>
              <Link href="/kyc" className="inline-block bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold-400">Complete KYC</Link>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/preorder" className="bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-center">Preorder GPG</Link>
          <Link href="/referrals" className="border border-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors text-center">Referrals</Link>
          <Link href="/kyc" className="border border-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors text-center">KYC</Link>
          <Link href="/dashboard" className="border border-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors text-center">Dashboard</Link>
        </div>
      </div>
    </main>
  );
}
