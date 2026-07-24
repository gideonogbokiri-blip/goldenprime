-- Run this in Supabase SQL Editor to create tables needed for Vercel deployment
-- https://supabase.com/dashboard/project/aiieutuxceyknyhubkzf/sql/new

-- User settings table (replaces local JSON file)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES users(id),
  bank_details JSONB DEFAULT '{}',
  card_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_settings_referral_code ON user_settings(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_settings_referred_by ON user_settings(referred_by);

-- P2P orders table (replaces local JSON file)
CREATE TABLE IF NOT EXISTS p2p_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  coin TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  price_per_unit NUMERIC(20, 8) NOT NULL,
  total_usd NUMERIC(20, 2) NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
  filled_amount NUMERIC(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p2p_orders_user_id ON p2p_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_status ON p2p_orders(status);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_coin ON p2p_orders(coin);
CREATE INDEX IF NOT EXISTS idx_p2p_orders_type ON p2p_orders(type);

-- P2P trades table (replaces local JSON file)
CREATE TABLE IF NOT EXISTS p2p_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES p2p_orders(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coin TEXT NOT NULL,
  amount NUMERIC(20, 8) NOT NULL,
  price_per_unit NUMERIC(20, 8) NOT NULL,
  total_usd NUMERIC(20, 2) NOT NULL,
  payment_method TEXT DEFAULT 'bank_transfer',
  status TEXT DEFAULT 'escrow' CHECK (status IN ('escrow', 'completed', 'disputed')),
  buyer_confirmed BOOLEAN DEFAULT FALSE,
  seller_confirmed BOOLEAN DEFAULT FALSE,
  dispute_reason TEXT,
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_p2p_trades_buyer_id ON p2p_trades(buyer_id);
CREATE INDEX IF NOT EXISTS idx_p2p_trades_seller_id ON p2p_trades(seller_id);
CREATE INDEX IF NOT EXISTS idx_p2p_trades_status ON p2p_trades(status);
CREATE INDEX IF NOT EXISTS idx_p2p_trades_order_id ON p2p_trades(order_id);

-- RLS policies (allow all for authenticated users, matching existing schema pattern)
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE p2p_trades ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN CREATE POLICY "Allow all on user_settings" ON user_settings FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all on p2p_orders" ON p2p_orders FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE POLICY "Allow all on p2p_trades" ON p2p_trades FOR ALL USING (true); EXCEPTION WHEN duplicate_object THEN null; END $$;
