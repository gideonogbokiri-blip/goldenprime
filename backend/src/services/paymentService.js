const Stripe = require('stripe');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');

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

async function createWithdrawRequest(userId, amountUsd) {
  const balance = await Wallet.getBalance(userId, 'USD');
  if (balance < amountUsd) {
    throw Object.assign(new Error('Insufficient USD balance'), { status: 400 });
  }

  await Wallet.updateBalance(userId, 'USD', -amountUsd);

  const tx = await Transaction.create({
    userId,
    type: 'withdrawal',
    currency: 'USD',
    amount: amountUsd,
    usdValue: amountUsd,
    metadata: { method: 'bank_transfer' },
  });

  return tx;
}

async function handleWebhook(event) {
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    return await confirmDeposit(paymentIntent.id);
  }
  return { success: true, ignored: true };
}

module.exports = { createDepositIntent, confirmDeposit, createWithdrawRequest, handleWebhook };
