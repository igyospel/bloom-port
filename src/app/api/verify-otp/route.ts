import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request): Promise<Response> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  try {
    const { email, code, purpose, name } = await req.json();

    if (!email || !code || !purpose) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, code, purpose' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    if (!/^\d{6}$/.test(code)) {
      return new Response(JSON.stringify({ error: 'Invalid code format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
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
      return new Response(JSON.stringify({ error: 'Invalid or expired code. Please try again.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    // Mark OTP as used immediately
    await supabase
      .from('otp_codes')
      .update({ used: true })
      .eq('id', otpRecord.id);

    // Get or create the user
    const userName = name || otpRecord.name || email.toLowerCase().split('@')[0];

    // Check if user already exists
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('List users error:', listError);
      return new Response(JSON.stringify({ error: 'Authentication error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    let authUserId: string | null = null;
    const existingUser = (users as any[]).find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      authUserId = existingUser.id;
      // Update name if provided on signup
      if (purpose === 'signup' && userName) {
        await supabase.auth.admin.updateUserById(authUserId!, {
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
        return new Response(JSON.stringify({ error: 'Failed to create account' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
        });
      }

      authUserId = newUser.id;

      // Create profile
      await supabase.from('profiles').upsert({
        id: authUserId,
        name: userName,
        email: email.toLowerCase(),
      });
    }

    // Generate a magic link token to exchange for a session on the frontend
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      console.error('Generate link error:', linkError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        hashed_token: linkData.properties.hashed_token,
        user: {
          email: email.toLowerCase(),
          name: userName,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      }
    );
  } catch (err: any) {
    console.error('Verify OTP error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
    });
  }
}
