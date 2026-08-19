const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const Setting = require('../models/Setting');
const supabase = require('../config/supabase');

async function getBankDetails() {
  return Setting.get('bank_details', {
    bank_name: 'Guaranty Trust Bank (GTBank)',
    account_number: '0123456789',
    account_name: 'GoldenPrime Investments Ltd',
    sort_code: '058',
    reference_note: 'Use your email as payment reference',
  });
}

async function getCryptoWallet() {
  return Setting.get('crypto_wallet', {
    bitcoin: { address: 'bc1qgoldenprime000000000000000000000', network: 'Bitcoin (BTC)' },
    ethereum: { address: '0xGoldenPrime0000000000000000000000000', network: 'Ethereum (ERC-20)' },
    usdt: { address: '0xGoldenPrimeUSDT000000000000000000000', network: 'Ethereum (ERC-20)' },
  });
}

async function requestDeposit(userId, { amount, method, referenceCode, slip }) {
  const minDeposit = Number(await Setting.get('min_deposit', 10)) || 10;
  const maxDeposit = Number(await Setting.get('max_deposit', 50000)) || 50000;

  if (!amount || amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });
  if (amount < minDeposit) throw Object.assign(new Error(`Minimum deposit is $${minDeposit}`), { status: 400 });
  if (amount > maxDeposit) throw Object.assign(new Error(`Maximum deposit is $${maxDeposit}`), { status: 400 });
  if (!['bank_transfer', 'crypto'].includes(method)) {
    throw Object.assign(new Error('Invalid method. Use bank_transfer or crypto'), { status: 400 });
  }

  const user = await supabase.from('users').select('email, first_name, last_name').eq('id', userId).single();
  const userName = `${user.data.first_name || ''} ${user.data.last_name || ''}`.trim() || user.data.email;

  const bankDetails = await getBankDetails();
  const cryptoWallet = await getCryptoWallet();

  const tx = await Transaction.create({
    userId,
    type: 'deposit',
    currency: 'USD',
    amount,
    usdValue: amount,
    status: 'pending',
    metadata: {
      method,
      userName,
      userEmail: user.data.email,
      referenceCode: referenceCode || null,
      slip: slip || null,
      bankDetails: method === 'bank_transfer' ? bankDetails : null,
      cryptoWallet: method === 'crypto' ? cryptoWallet : null,
      requestedAt: new Date().toISOString(),
    },
  });

  return {
    transaction: tx,
    instructions: method === 'bank_transfer'
      ? {
          ...bankDetails,
          amount,
          reference: referenceCode || user.data.email,
          note: `Transfer $${amount} to the account above. Use "${referenceCode || user.data.email}" as your payment reference.`,
        }
      : {
          ...cryptoWallet,
          amount,
          note: `Send $${amount} worth of crypto to the address for your chosen network.`,
        },
  };
}

async function getMyDeposits(userId, { limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'deposit')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

async function getPendingDeposits({ limit = 50, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, users:user_id(email, first_name, last_name)')
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return data || [];
}

async function getAllDeposits({ limit = 50, offset = 0, status = null } = {}) {
  let query = supabase
    .from('transactions')
    .select('*, users:user_id(email, first_name, last_name)')
    .eq('type', 'deposit');
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function approveDeposit(txId, adminId, notes) {
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchErr || !tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  if (tx.type !== 'deposit') throw Object.assign(new Error('Not a deposit transaction'), { status: 400 });
  if (tx.status !== 'pending') throw Object.assign(new Error('Deposit already processed'), { status: 400 });

  await Wallet.updateBalance(tx.user_id, 'USD', parseFloat(tx.amount));

  const { error: updateErr } = await supabase
    .from('transactions')
    .update({
      status: 'completed',
      metadata: {
        ...tx.metadata,
        approvedBy: adminId,
        approvedAt: new Date().toISOString(),
        adminNotes: notes || null,
      },
    })
    .eq('id', txId);

  if (updateErr) throw updateErr;

  if (tx.metadata?.userEmail) {
    try {
      const { sendDepositApprovedEmail } = require('./emailService');
      await sendDepositApprovedEmail(tx.metadata.userEmail, parseFloat(tx.amount).toFixed(2));
    } catch (err) {
      console.error('Failed to send deposit approval email:', err.message);
    }
  }

  return { ...tx, status: 'completed' };
}

async function rejectDeposit(txId, adminId, reason) {
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchErr || !tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  if (tx.type !== 'deposit') throw Object.assign(new Error('Not a deposit transaction'), { status: 400 });
  if (tx.status !== 'pending') throw Object.assign(new Error('Deposit already processed'), { status: 400 });

  const { error: updateErr } = await supabase
    .from('transactions')
    .update({
      status: 'rejected',
      metadata: {
        ...tx.metadata,
        rejectedBy: adminId,
        rejectedAt: new Date().toISOString(),
        rejectionReason: reason || 'No reason provided',
      },
    })
    .eq('id', txId);

  if (updateErr) throw updateErr;

  return { ...tx, status: 'rejected' };
}

async function getPaymentInstructions() {
  const bank = await getBankDetails();
  const crypto = await getCryptoWallet();
  return { bank, crypto };
}

module.exports = {
  requestDeposit,
  getMyDeposits,
  getPendingDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getPaymentInstructions,
};
