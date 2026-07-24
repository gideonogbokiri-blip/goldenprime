const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const supabase = require('../config/supabase');

const GPG_PRICE = 50;
const GPG_SYMBOL = 'GPG';
const GPG_NAME = 'GoldenPrime Gold Coin';
const LAUNCH_DATE = '2026-10-01T00:00:00Z';
const TOTAL_SUPPLY = 1000000;

async function getCoinInfo() {
  const { count: totalPreordered } = await supabase
    .from('wallets')
    .select('id', { count: 'exact', head: true })
    .eq('currency', 'GPG')
    .gt('balance', 0);

  const totalSold = await supabase
    .from('wallets')
    .select('balance')
    .eq('currency', 'GPG');

  let totalAmount = 0;
  if (totalSold.data) {
    totalAmount = totalSold.data.reduce((sum, w) => sum + parseFloat(w.balance), 0);
  }

  return {
    name: GPG_NAME,
    symbol: GPG_SYMBOL,
    price: GPG_PRICE,
    launchDate: LAUNCH_DATE,
    totalSupply: TOTAL_SUPPLY,
    totalSold: totalAmount,
    remaining: TOTAL_SUPPLY - totalAmount,
    percentSold: ((totalAmount / TOTAL_SUPPLY) * 100).toFixed(2),
  };
}

async function preorder(userId, usdAmount, paymentMethod, paymentDetails = {}) {
  if (!usdAmount || usdAmount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });
  if (usdAmount < 50) throw Object.assign(new Error('Minimum preorder is $50 (1 GPG coin)'), { status: 400 });
  if (usdAmount > 100000) throw Object.assign(new Error('Maximum preorder is $100,000'), { status: 400 });

  const gpgAmount = usdAmount / GPG_PRICE;

  const user = await supabase.from('users').select('email, first_name, last_name').eq('id', userId).single();
  const userName = `${user.data.first_name || ''} ${user.data.last_name || ''}`.trim() || user.data.email;

  const tx = await Transaction.create({
    userId,
    type: 'preorder',
    currency: 'GPG',
    amount: gpgAmount,
    usdValue: usdAmount,
    status: 'pending',
    metadata: {
      coinName: GPG_NAME,
      coinSymbol: GPG_SYMBOL,
      pricePerCoin: GPG_PRICE,
      gpgAmount,
      paymentMethod,
      userName,
      userEmail: user.data.email,
      ...paymentDetails,
      requestedAt: new Date().toISOString(),
    },
  });

  return {
    transaction: tx,
    gpgAmount,
    usdAmount,
    pricePerCoin: GPG_PRICE,
    paymentMethod,
  };
}

async function approvePreorder(txId, adminId, notes) {
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchErr || !tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  if (tx.type !== 'preorder') throw Object.assign(new Error('Not a preorder transaction'), { status: 400 });
  if (tx.status !== 'pending') throw Object.assign(new Error('Preorder already processed'), { status: 400 });

  const gpgAmount = parseFloat(tx.amount);

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', tx.user_id)
    .eq('currency', 'GPG')
    .single();

  if (wallet) {
    const newBalance = parseFloat(wallet.balance) + gpgAmount;
    await supabase.from('wallets').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', wallet.id);
  } else {
    await supabase.from('wallets').insert({
      user_id: tx.user_id,
      currency: 'GPG',
      balance: gpgAmount,
    });
  }

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

async function rejectPreorder(txId, adminId, reason) {
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchErr || !tx) throw Object.assign(new Error('Transaction not found'), { status: 404 });
  if (tx.type !== 'preorder') throw Object.assign(new Error('Not a preorder transaction'), { status: 400 });
  if (tx.status !== 'pending') throw Object.assign(new Error('Preorder already processed'), { status: 400 });

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

async function getMyPreorders(userId, { limit = 20, offset = 0 } = {}) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('type', 'preorder')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data || [];
}

async function getAllPreorders({ limit = 50, offset = 0, status = null } = {}) {
  let query = supabase
    .from('transactions')
    .select('*, users:user_id(email, first_name, last_name)')
    .eq('type', 'preorder');
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getPortfolio(userId) {
  const { data: wallets } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId);

  const coinInfo = await getCoinInfo();
  const holdings = (wallets || [])
    .filter(w => parseFloat(w.balance) > 0)
    .map(w => {
      if (w.currency === 'GPG') {
        return {
          currency: 'GPG',
          name: GPG_NAME,
          balance: parseFloat(w.balance),
          currentPrice: GPG_PRICE,
          value: parseFloat(w.balance) * GPG_PRICE,
          type: 'gold_coin',
        };
      }
      if (w.currency === 'USD') {
        return {
          currency: 'USD',
          name: 'US Dollar',
          balance: parseFloat(w.balance),
          currentPrice: 1,
          value: parseFloat(w.balance),
          type: 'fiat',
        };
      }
      return {
        currency: w.currency,
        name: w.currency,
        balance: parseFloat(w.balance),
        currentPrice: 0,
        value: 0,
        type: 'other',
      };
    });

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  return { holdings, totalValue, coinInfo };
}

module.exports = {
  getCoinInfo,
  preorder,
  approvePreorder,
  rejectPreorder,
  getMyPreorders,
  getAllPreorders,
  getPortfolio,
  GPG_PRICE,
  GPG_SYMBOL,
};
