const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/admin', async (req, res) => {
  try {
    const providedKey = req.headers['x-setup-key'];
    if (providedKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const email = 'goldenprimecypt@gmail.com';
    const password = 'Admin@1234';
    const passwordHash = await bcrypt.hash(password, 12);

    const existing = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let userId;
    if (existing.data) {
      const { data, error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash, role: 'admin', is_verified: true })
        .eq('id', existing.data.id)
        .select('id, email, role, is_verified')
        .single();
      if (error) throw error;
      userId = data.id;
    } else {
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: passwordHash,
          first_name: 'GoldenPrime',
          last_name: 'Admin',
          role: 'admin',
          is_verified: true,
        })
        .select('id, email, role, is_verified')
        .single();
      if (error) throw error;
      userId = data.id;
    }

    res.json({ ok: true, userId, email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
