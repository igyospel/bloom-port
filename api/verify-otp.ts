import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, code, purpose, name } = req.body as {
    email: string;
    code: string;
    purpose: 'login' | 'signup';
    name?: string;
  };

  if (!email || !code || !purpose) {
    return res.status(400).json({ error: 'Missing required fields: email, code, purpose' });
  }

  if (!/^\d{6}$/.test(code)) {
    return res.status(400).json({ error: 'Invalid code format' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Look up valid OTP
  const { data: otpRecord, error: lookupError } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (lookupError || !otpRecord) {
    return res.status(400).json({ error: 'Invalid or expired code. Please try again.' });
  }

  // Mark OTP as used immediately
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('id', otpRecord.id);

  // ── Get or create the user ──────────────────────────────────────────────
  const userName = name || otpRecord.name || email.toLowerCase().split('@')[0];

  // Check if user already exists
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('List users error:', listError);
    return res.status(500).json({ error: 'Authentication error' });
  }

  let authUserId: string | null = null;
  const existingUser = (users as any[]).find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existingUser) {
    authUserId = existingUser.id;
    // Update name if provided on signup
    if (purpose === 'signup' && userName) {
      await supabase.auth.admin.updateUserById(authUserId, {
        user_metadata: { name: userName },
      });
      await supabase
        .from('profiles')
        .upsert({ id: authUserId, name: userName, email: email.toLowerCase() });
    }
  } else {
    // Create new user
    const { data: { user: newUser }, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      email_confirm: true,
      user_metadata: { name: userName },
    });

    if (createError || !newUser) {
      console.error('Create user error:', createError);
      return res.status(500).json({ error: 'Failed to create account' });
    }

    authUserId = newUser.id;

    // Create profile
    await supabase.from('profiles').upsert({
      id: authUserId,
      name: userName,
      email: email.toLowerCase(),
    });
  }

  // ── Generate a magic link token to exchange for a session on the frontend ──
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: email.toLowerCase(),
  });

  if (linkError || !linkData?.properties?.hashed_token) {
    console.error('Generate link error:', linkError);
    return res.status(500).json({ error: 'Failed to create session' });
  }

  return res.status(200).json({
    success: true,
    hashed_token: linkData.properties.hashed_token,
    user: {
      email: email.toLowerCase(),
      name: userName,
    },
  });
}
