import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

export async function POST(req: Request): Promise<Response> {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';

  try {
    const { email, name, purpose } = await req.json();

    if (!email || !purpose) {
      return new Response(JSON.stringify({ error: 'Missing required fields: email, purpose' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    // Init Supabase admin client
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

    // Rate limiting: max 3 OTP requests per email per 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from('otp_codes')
      .select('*', { count: 'exact', head: true })
      .eq('email', email.toLowerCase())
      .gte('created_at', tenMinutesAgo);

    if ((count ?? 0) >= 3) {
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait before requesting another code.' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Delete previous unused codes for this email
    await supabase
      .from('otp_codes')
      .delete()
      .eq('email', email.toLowerCase())
      .eq('used', false);

    // Insert new OTP
    const { error: insertError } = await supabase.from('otp_codes').insert({
      email: email.toLowerCase(),
      code,
      purpose,
      name: name || null,
      expires_at: expiresAt,
      used: false,
    });

    if (insertError) {
      console.error('Insert OTP error:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to generate verification code' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    // Send email via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    const resend = new Resend(resendApiKey);

    const isLogin = purpose === 'login';
    const greeting = name ? `Hi ${name}` : 'Hi there';

    const { error: emailError } = await resend.emails.send({
      from: 'Bloomport <noreply@bloomport.fun>',
      to: email,
      subject: isLogin ? 'Your Bloomport sign-in code' : 'Verify your Bloomport account',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background:#000000;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#000000;min-height:100vh;">
    <tr>
      <td align="center" style="padding:48px 16px;">
        <table width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:40px;">
              <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Bloomport</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:40px 36px;">

              <!-- Icon -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <div style="display:inline-block;width:56px;height:56px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:14px;line-height:56px;text-align:center;font-size:24px;">✉️</div>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;text-align:center;line-height:1.3;">
                ${isLogin ? 'Your sign-in code' : 'Verify your email'}
              </p>
              <p style="margin:0 0 32px;font-size:14px;color:rgba(255,255,255,0.45);text-align:center;line-height:1.6;">
                ${greeting}! Use the code below to ${isLogin ? 'sign in to your Bloomport account' : 'complete your Bloomport registration'}.
              </p>

              <!-- OTP Code -->
              <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:28px 24px;text-align:center;margin-bottom:28px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.35);text-transform:uppercase;letter-spacing:0.15em;">Verification Code</p>
                <p style="margin:0;font-size:42px;font-weight:700;color:#ffffff;letter-spacing:10px;font-family:'Courier New',monospace;">${code}</p>
              </div>

              <!-- Expiry note -->
              <p style="margin:0 0 24px;font-size:13px;color:rgba(255,255,255,0.35);text-align:center;">
                This code expires in <strong style="color:rgba(255,255,255,0.6);">10 minutes</strong>.
              </p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 24px;">

              <!-- Security notice -->
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.25);text-align:center;line-height:1.6;">
                If you didn't request this code, you can safely ignore this email.<br>
                Your account is not at risk.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.2);">
                © 2026 Bloomport · <a href="https://bloomport.fun" style="color:rgba(255,255,255,0.3);text-decoration:none;">bloomport.fun</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(JSON.stringify({ error: 'Failed to send verification email' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
      });
    }

    return new Response(JSON.stringify({ success: true, message: 'Verification code sent to your email' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
    });
  } catch (err: any) {
    console.error('Send OTP fail:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': allowedOrigin },
    });
  }
}
