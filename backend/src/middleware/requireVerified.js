const supabase = require('../config/supabase');

async function requireVerified(req, res, next) {
  try {
    if (req.user?.role === 'admin') return next();

    const { data: user } = await supabase
      .from('users')
      .select('is_verified')
      .eq('id', req.user.id)
      .maybeSingle();

    if (!user || !user.is_verified) {
      return res.status(403).json({
        error: 'Please verify your email to continue.',
        needsVerification: true,
      });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = requireVerified;