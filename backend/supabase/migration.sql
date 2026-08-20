-- =============================================================
-- GoldenPrime migration: broker platform + wipe
-- RUN THIS IN Supabase Dashboard > SQL Editor
-- 1) Creates `settings` and `chat_messages` tables
-- 2) Seeds default broker settings
-- 3) Wipes all existing user data, keeping ADMIN accounts
-- =============================================================

-- ---------- 1. Settings table (key/value broker config) ----------
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default broker settings (admin can change these from the Admin Panel)
INSERT INTO public.settings (key, value) VALUES
  ('expected_profit_rate', '3'::jsonb),           -- 3% per month on balance
  ('min_deposit', '10'::jsonb),
  ('max_deposit', '50000'::jsonb),
  ('bank_details', '{"bank_name":"Guaranty Trust Bank (GTBank)","account_number":"0123456789","account_name":"GoldenPrime Investments Ltd","sort_code":"058","reference_note":"Use your email as payment reference"}'::jsonb),
  ('crypto_wallet', '{"bitcoin":{"address":"bc1qgoldenprime000000000000000000000","network":"Bitcoin (BTC)"},"ethereum":{"address":"0xGoldenPrime0000000000000000000000000","network":"Ethereum (ERC-20)"},"usdt":{"address":"0xGoldenPrimeUSDT000000000000000000000","network":"Ethereum (ERC-20)"}}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- ---------- 2. Chat messages table ----------
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL DEFAULT 'user' CHECK (sender IN ('user', 'admin')),
  message TEXT,
  attachment TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON public.chat_messages (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON public.chat_messages (user_id, read);

-- ---------- 3. Wipe all existing user data (keeps admin accounts) ----------
-- Child tables first, then users that are not admins.
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'p2p_trades','p2p_orders','chat_messages',
    'transactions','wallets','user_settings',
    'kyc','admin_logs'
  ])
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=t) THEN
      EXECUTE format('TRUNCATE public.%I CASCADE', t);
    END IF;
  END LOOP;
END $$;

-- Keep only admin-role accounts (your admin login stays working)
DELETE FROM public.users WHERE role <> 'admin';

-- Ensure admins are marked verified so they can use the panel
UPDATE public.users SET is_verified = true WHERE role = 'admin';
