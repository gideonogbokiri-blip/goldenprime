const Setting = require('../models/Setting');

function normalize(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9\s$%]/g, ' ').replace(/\s+/g, ' ').trim();
}

function has(text, words) {
  return words.some((w) => text.includes(w));
}

function pick(replies) {
  return replies[Math.floor(Math.random() * replies.length)];
}

async function buildContext() {
  const [rate, minDep, maxDep, bank, crypto] = await Promise.all([
    Setting.get('expected_profit_rate', 3),
    Setting.get('min_deposit', 10),
    Setting.get('max_deposit', 50000),
    Setting.get('bank_details', {}),
    Setting.get('crypto_wallet', {}),
  ]);
  return {
    rate: Number(rate) || 3,
    minDep: Number(minDep) || 10,
    maxDep: Number(maxDep) || 50000,
    bank,
    crypto,
  };
}

const GREETINGS = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'hai', 'how are you'];

async function getReply(message) {
  const text = normalize(message);
  const ctx = await buildContext();

  // Small talk & greetings
  if (has(text, GREETINGS)) {
    return pick([
      'Hello! Welcome to GoldenPrime. I am your AI assistant. I can help you with deposits, withdrawals, expected profits, referrals, KYC, and more. How can I help today?',
      'Hi there! GoldenPrime assistant here. Ask me about depositing funds, your expected profits, how referrals work, or anything else about the platform.',
    ]);
  }

  if (has(text, ['thank', 'thanks', 'thx', 'appreciate', 'cool', 'great', 'awesome', 'nice'])) {
    return pick([
      "You're welcome! Is there anything else I can help you with?",
      "Happy to help! Feel free to ask if you need anything else about GoldenPrime.",
    ]);
  }

  if (has(text, ['bye', 'goodbye', 'see you', 'talk later'])) {
    return "Goodbye! If you need anything else, just open this chat anytime. Have a great day!";
  }

  // Who are you / capabilities
  if (has(text, ['who are you', 'what are you', 'your name', 'are you a bot', 'are you real', 'what can you do', 'help me'])) {
    return `I'm the GoldenPrime AI assistant! I'm available 24/7 to answer questions about the platform, such as how to deposit, expected profit, withdrawals, referrals, KYC, and account verification. If you need a human, an admin can also step in through this chat.`;
  }

  // Expected profit
  if (has(text, ['profit', 'return', 'interest', 'earn', 'expected', 'how much will i make', 'apy', 'percent', '%', 'roi'])) {
    return pick([
      `GoldenPrime aims to deliver an expected profit rate of approximately ${ctx.rate}% on funded accounts. Exact returns can vary based on market conditions and package type. For specific numbers, reach out to our admin through this chat.`,
      `Our target return is around ${ctx.rate}%. To learn what profit you could earn on a specific amount, tell me an amount and I can give you an estimate.`,
    ]);
  }

  // Deposit
  if (has(text, ['deposit', 'fund', 'add money', 'top up', 'payment slip', 'make payment', 'pay'])) {
    const bankName = typeof ctx.bank?.bank_name === 'string' ? ctx.bank.bank_name : '';
    const account = typeof ctx.bank?.account_number === 'string' ? ctx.bank.account_number : '';
    const holder = typeof ctx.bank?.account_name === 'string' ? ctx.bank.account_name : '';
    let bankInfo = '';
    if (bankName && account) {
      bankInfo = ` The current payment details are: ${holder ? holder + ', ' : ''}${bankName || ''} Account ${account}. Please use the exact reference code shown on the deposit page and upload your payment slip so we can match your payment.`;
    }
    return `To deposit, go to the Deposit page, choose an amount between $${ctx.minDep} and $${ctx.maxDep}, and follow the payment instructions.${bankInfo} After paying, upload your payment slip in the chat or on the deposit page and an admin will approve it to credit your wallet.`;
  }

  // Withdraw
  if (has(text, ['withdraw', 'cash out', 'take out money', 'withdrawal', 'get money out'])) {
    return `To withdraw, go to your Wallet page and submit a withdrawal with your bank details (bank name, account name, and account number). Withdrawals are reviewed and approved by an admin, then transferred to your bank. The minimum to withdraw and processing time depend on your account tier — our admin can confirm exact details for your account.`;
  }

  // Referral
  if (has(text, ['refer', 'referral', 'invite', 'share link', 'earn friends', 'friend'])) {
    return `GoldenPrime offers a referral program! You get a unique referral link on your Referrals page. When a friend signs up using your link and funds their account, you earn a USD reward that is credited to your wallet. Share your link to grow your earnings — you can track your referrals in the Referrals section.`;
  }

  // KYC
  if (has(text, ['kyc', 'verify identity', 'id card', 'document', 'verification document', 'passport'])) {
    return `To complete KYC, go to the KYC/Verification page and upload a valid ID document (such as a passport or national ID). Our admin reviews and approves your submission. Once approved, your account is fully verified and you unlock more features and higher limits.`;
  }

  // Email verification
  if (has(text, ['verify email', 'email verification', 'confirm email', 'did not get email', 'verification link', 'verify my'])) {
    return `When you registered, a verification email was sent to your inbox. Click the "Verify Email" button in that message to activate your account. If you didn't receive it, check your spam folder or use the "Resend verification" option — you can also ask me to have our admin resend it.`;
  }

  // Reset password
  if (has(text, ['reset password', 'forgot password', 'change password', 'login problem', 'can\'t login', 'cannot login'])) {
    return `If you forgot your password, use the "Forgot your password?" link on the login page. A password reset link will be emailed to you (check your inbox and spam folder). If you're having trouble logging in another way, let an admin know through this chat.`;
  }

  // Trading / gold / packages
  if (has(text, ['trade', 'trading', 'gold', 'coin', 'invest', 'package', 'buy gold', 'preorder'])) {
    return `GoldenPrime lets you invest across digital gold and other assets. You can buy gold, place pre-orders, and trade through your dashboard. Each investment carries market-based returns. For live pricing and available packages, check the Trade and Preorder pages — our admin can also guide you on the best package for your goals.`;
  }

  // Balance / wallet
  if (has(text, ['balance', 'my money', 'wallet', 'how much', 'account balance', 'por'])) {
    return `Your current wallet balance, transactions, and profit are all available on your Dashboard and Wallet pages. If you expected a credit that hasn't appeared, or you want a detailed statement, an admin can assist you right here in this chat.`;
  }

  // Human / agent / contact / support
  if (has(text, ['human', 'agent', 'person', 'real person', 'speak to', 'talk to', 'customer service', 'representative', 'admin'])) {
    return `I'll make sure an admin sees your message and responds shortly. You're currently connected to GoldenPrime support — a member of our team will reply to you in this chat as soon as possible.`;
  }

  // Fallback / default
  return pick([
    `Thanks for your message! I'm still learning about that topic. Could you rephrase it, or ask me about depositing funds, expected profits, withdrawals, referrals, KYC, or verification?`,
    `I want to make sure I give you the right answer. You can ask me about how to deposit, what profit to expect, how withdrawals work, referrals, KYC, or email verification. A human admin can also assist if you prefer.`,
    `I'm not 100% sure on that one. Try asking about deposits, expected profit, withdrawals, referrals, KYC, or account verification — or I can connect you with an admin for a detailed answer.`,
  ]);
}

module.exports = { getReply };
