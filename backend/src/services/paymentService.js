const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const supabase = require('../config/supabase');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createDepositIntent(userId, amountUsd, currency = 'usd') {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amountUsd * 100),
    currency,
    metadata: { userId, type: 'deposit' },
  });

  await Transaction.create({
    userId,
    type: 'deposit',
    currency: 'USD',
    amount: amountUsd,
    usdValue: amountUsd,
    stripePaymentId: paymentIntent.id,
    metadata: { clientSecret: paymentIntent.client_secret },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

async function confirmDeposit(paymentIntentId) {
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== 'succeeded') {
    return { success: false, status: paymentIntent.status };
  }

  const tx = await Transaction.findByStripePaymentId(paymentIntentId);
  if (!tx || tx.status === 'completed') {
    return { success: true, alreadyProcessed: true };
  }

  await Transaction.updateStatus(tx.id, 'completed');
  await Wallet.updateBalance(tx.user_id, 'USD', parseFloat(tx.amount));

  return { success: true, amount: tx.amount };
}

async function createWithdrawRequest(userId, amountUsd, bankDetails = {}) {
  if (!amountUsd || amountUsd <= 0) {
    throw Object.assign(new Error('Invalid amount'), { status: 400 });
  }

  const balance = await Wallet.getBalance(userId, 'USD');
  if (balance < amountUsd) {
    throw Object.assign(new Error('Insufficient USD balance'), { status: 400 });
  }

  // Lock the funds at request time; admin approval releases the payment.
  await Wallet.updateBalance(userId, 'USD', -amountUsd);

  const tx = await Transaction.create({
    userId,
    type: 'withdrawal',
    currency: 'USD',
    amount: amountUsd,
    usdValue: amountUsd,
    status: 'pending',
    metadata: {
      method: 'bank_transfer',
      bankName: bankDetails.bankName || null,
      accountNumber: bankDetails.accountNumber || null,
      accountName: bankDetails.accountName || null,
      requestedAt: new Date().toISOString(),
    },
  });

  return tx;
}

async function approveWithdrawal(txId, adminId, notes) {
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchErr || !tx) throw Object.assign(new Error('Withdrawal not found'), { status: 404 });
  if (tx.type !== 'withdrawal') throw Object.assign(new Error('Not a withdrawal transaction'), { status: 400 });
  if (tx.status !== 'pending') throw Object.assign(new Error('Withdrawal already processed'), { status: 400 });

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

  const { data: user } = await supabase.from('users').select('email').eq('id', tx.user_id).maybeSingle();
  if (user?.email) {
    try {
      const { sendWithdrawalStatusEmail } = require('./emailService');
      await sendWithdrawalStatusEmail(user.email, { amount: parseFloat(tx.amount).toFixed(2), status: 'approved' });
    } catch (err) {
      console.error('Failed to send withdrawal email:', err.message);
    }
  }

  return { ...tx, status: 'completed' };
}

async function rejectWithdrawal(txId, adminId, reason) {
  const { data: tx, error: fetchErr } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', txId)
    .single();

  if (fetchErr || !tx) throw Object.assign(new Error('Withdrawal not found'), { status: 404 });
  if (tx.type !== 'withdrawal') throw Object.assign(new Error('Not a withdrawal transaction'), { status: 400 });
  if (tx.status !== 'pending') throw Object.assign(new Error('Withdrawal already processed'), { status: 400 });

  // Refund the locked funds back to the user's wallet
  await Wallet.updateBalance(tx.user_id, 'USD', parseFloat(tx.amount));

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

  const { data: user } = await supabase.from('users').select('email').eq('id', tx.user_id).maybeSingle();
  if (user?.email) {
    try {
      const { sendWithdrawalStatusEmail } = require('./emailService');
      await sendWithdrawalStatusEmail(user.email, {
        amount: parseFloat(tx.amount).toFixed(2),
        status: 'rejected',
        reason,
      });
    } catch (err) {
      console.error('Failed to send withdrawal email:', err.message);
    }
  }

  return { ...tx, status: 'rejected' };
}

async function handleWebhook(event) {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    return await confirmDeposit(paymentIntent.id);
  }
  return { success: true, ignored: true };
}

module.exports = { createDepositIntent, confirmDeposit, createWithdrawRequest, approveWithdrawal, rejectWithdrawal, handleWebhook };