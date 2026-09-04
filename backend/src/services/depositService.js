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
  const [btc, eth, usdt, network, cw] = await Promise.all([
    Setting.get('btc_wallet', null),
    Setting.get('eth_wallet', null),
    Setting.get('usdt_wallet', null),
    Setting.get('wallet_network', 'Ethereum (ERC-20)'),
    Setting.get('crypto_wallet', {}),
  ]);

  const c = cw && typeof cw === 'object' ? cw : {};

  return {
    bitcoin: { address: btc || c.bitcoin?.address || c.btc || '', network: 'Bitcoin (BTC)' },
    ethereum: { address: eth || c.ethereum?.address || c.eth || '', network: 'Ethereum (ERC-20)' },
    usdt: { address: usdt || c.usdt || '', network },
  };
}

async function requestDeposit(userId, { amount, method, referenceCode, slip }) {
  const minDeposit = Number(await Setting.get('min_deposit', 500)) || 500;
  const maxDeposit = Number(await Setting.get('max_deposit', 50000)) || 50000;

  if (!amount || amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });
  if (amount < minDeposit) throw Object.assign(new Error(`Minimum deposit is $${minDeposit}`), { status: 400 });
  if (amount > maxDeposit) throw Object.assign(new Error(`Maximum deposit is $${maxDeposit}`), { status: 400 });
  const method_ = method === 'bank_transfer' ? 'crypto' : method;
  if (method_ !== 'crypto') {
    throw Object.assign(new Error('Invalid method. Use crypto'), { status: 400 });
  }

  const user = await supabase.from('users').select('email, first_name, last_name').eq('id', userId).single();
  const userName = `${user.data.first_name || ''} ${user.data.last_name || ''}`.trim() || user.data.email;

  const cryptoWallet = await getCryptoWallet();

  const tx = await Transaction.create({
    userId,
    type: 'deposit',
    currency: 'USD',
    amount,
    usdValue: amount,
    status: 'pending',
    metadata: {
      method: method_,
      userName,
      userEmail: user.data.email,
      referenceCode: referenceCode || null,
      slip: slip || null,
      cryptoWallet,
      requestedAt: new Date().toISOString(),
    },
  });

  return {
    transaction: tx,
    instructions: {
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
  const crypto = await getCryptoWallet();
  return { crypto };
}

async function getPublicFeed(limit = 20) {
  const { data, error } = await supabase
    .from('transactions')
    .select('id, amount, created_at, metadata')
    .eq('type', 'deposit')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(tx => {
    const email = tx.metadata?.userEmail || '';
    const name = tx.metadata?.userName || '';
    const displayName = name || (email ? email.charAt(0) + '***@' + email.split('@')[1] : 'Anonymous');
    return {
      id: tx.id,
      amount: parseFloat(tx.amount),
      displayName,
      created_at: tx.created_at,
    };
  });
}

module.exports = {
  requestDeposit,
  getMyDeposits,
  getPendingDeposits,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getPaymentInstructions,
  getPublicFeed,
};
