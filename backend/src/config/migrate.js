const fs = require('fs');
const path = require('path');

const sql = `
-- GoldenPrime Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expires TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency VARCHAR(20) NOT NULL,
  balance DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, currency)
);

CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON wallets(user_id);

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  currency VARCHAR(20) NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  usd_value DECIMAL(20, 2),
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_id VARCHAR(255),
  tx_hash VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Row Level Security (optional, for Supabase auth integration)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies: allow service role full access (backend uses anon key with service role)
CREATE POLICY "Service role can do everything on users" ON users FOR ALL USING (true);
CREATE POLICY "Service role can do everything on wallets" ON wallets FOR ALL USING (true);
CREATE POLICY "Service role can do everything on transactions" ON transactions FOR ALL USING (true);
`;

// Write SQL file
const outputPath = path.join(__dirname, 'schema.sql');
fs.writeFileSync(outputPath, sql);
console.log(`Schema written to: ${outputPath}`);
console.log('\nTo set up your database:');
console.log('1. Go to Supabase Dashboard > SQL Editor');
console.log('2. Paste the contents of schema.sql');
console.log('3. Click "Run"');
