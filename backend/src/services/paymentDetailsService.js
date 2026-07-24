const UserSettings = require('../models/UserSettings');

const PLATFORM_BANK = {
  bank_name: 'Guaranty Trust Bank (GTBank)',
  account_number: '0123456789',
  account_name: 'GoldenPrime Investments Ltd',
  sort_code: '058',
};

async function saveBankDetails(userId, { bankName, accountNumber, accountName, sortCode }) {
  const existing = await UserSettings.get(userId);
  const currentBank = existing?.bank_details || {};

  await UserSettings.upsert(userId, {
    bank_details: {
      bankName: bankName || currentBank.bankName,
      accountNumber: accountNumber || currentBank.accountNumber,
      accountName: accountName || currentBank.accountName,
      sortCode: sortCode || currentBank.sortCode,
      savedAt: new Date().toISOString(),
    },
  });

  return { message: 'Bank details saved' };
}

async function getBankDetails(userId) {
  const settings = await UserSettings.get(userId);
  return settings?.bank_details || null;
}

async function saveCardDetails(userId, { cardNumber, cardHolder, expiryMonth, expiryYear, bankName }) {
  const existing = await UserSettings.get(userId);
  const currentCard = existing?.card_details || {};

  const last4 = cardNumber ? cardNumber.slice(-4) : '****';

  await UserSettings.upsert(userId, {
    card_details: {
      last4,
      cardHolder: cardHolder || currentCard.cardHolder,
      expiryMonth: expiryMonth || currentCard.expiryMonth,
      expiryYear: expiryYear || currentCard.expiryYear,
      bankName: bankName || currentCard.bankName,
      savedAt: new Date().toISOString(),
    },
  });

  return { message: 'Card details saved', last4 };
}

async function getCardDetails(userId) {
  const settings = await UserSettings.get(userId);
  return settings?.card_details || null;
}

function getPlatformBankDetails() {
  return PLATFORM_BANK;
}

module.exports = {
  saveBankDetails,
  getBankDetails,
  saveCardDetails,
  getCardDetails,
  getPlatformBankDetails,
};
