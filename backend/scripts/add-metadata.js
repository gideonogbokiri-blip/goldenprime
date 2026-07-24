require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const SQL = `
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  referral_code VARCHAR(20) UNIQUE,
  referred_by UUID REFERENCES users(id),
  bank_details JSONB,
  card_details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_referral_code ON user_settings(referral_code);
`;

(async () => {
  for (const fn of ['exec_sql', 'query', 'run_sql', 'execute']) {
    try {
      const { data, error } = await supabase.rpc(fn, { query: SQL });
      if (!error) {
        console.log('SUCCESS via', fn, data);
        return;
      }
    } catch (e) {}
  }
  
  // Try insert to check if table exists
  const { error } = await supabase.from('user_settings').select('id').limit(1);
  if (error && error.code === '42P01') {
    console.log('TABLE_MISSING');
  } else {
    console.log('TABLE_EXISTS');
  }
})();
