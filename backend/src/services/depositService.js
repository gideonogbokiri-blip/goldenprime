const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const supabase = require('../config/supabase');

const BANK_DETAILS = {
  bank_name: 'Guaranty Trust Bank (GTBank)',
  account_number: '0123456789',
  account_name: 'GoldenPrime Investments Ltd',
  sort_code: '058',
  reference_note: 'Use your email as payment reference',
};

const CRYPTO_WALLET = {
  bitcoin: { address: 'bc1qgoldenprime000000000000000000000', network: 'Bitcoin (BTC)' },
  ethereum: { address: '0xGoldenPrime0000000000000000000000000', network: 'Ethereum (ERC-20)' },
  usdt: { address: '0xGoldenPrimeUSDT000000000000000000000', network: 'Ethereum (ERC-20)' },
};

async function requestDeposit(userId, { amount, method, referenceCode }) {
  if (!amount || amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });
  if (amount < 10) throw Object.assign(new Error('Minimum deposit is $10'), { status: 400 });
  if (amount > 50000) throw Object.assign(new Error('Maximum deposit is $50,000'), { status: 400 });
  if (!['bank_transfer', 'crypto'].includes(method)) {
    throw Object.assign(new Error('Invalid method. Use bank_transfer or crypto'), { status: 400 });
  }

  const user = await supabase.from('users').select('email, first_name, last_name').eq('id', userId).single();
  const userName = `${user.data.first_name || ''} ${user.data.last_name || ''}`.trim() || user.data.email;

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
      bankDetails: method === 'bank_transfer' ? BANK_DETAILS : null,
      cryptoWallet: method === 'crypto' ? CRYPTO_WALLET : null,
      requestedAt: new Date().toISOString(),
    },
  });

  return {
    transaction: tx,
    instructions: method === 'bank_transfer'
      ? {
          ...BANK_DETAILS,
          amount,
          reference: referenceCode || user.data.email,
          note: `Transfer $${amount} to the account above. Use "${referenceCode || user.data.email}" as your payment reference.`,
        }
      : {
          ...CRYPTO_WALLET,
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

function getPaymentInstructions() {
  return { bank: BANK_DETAILS, crypto: CRYPTO_WALLET };
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
