import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // If next points to reset-password, forward all parameters directly to /reset-password
  // so the client-side Supabase SDK handles session restoration in browser storage.
  if (next.includes('reset-password') || next.startsWith('/reset-password')) {
    const forwardUrl = new URL(next.startsWith('/') ? `${origin}${next}` : `${origin}/${next}`);
    searchParams.forEach((value, key) => {
      if (key !== 'next') {
        forwardUrl.searchParams.set(key, value);
      }
    });
    return NextResponse.redirect(forwardUrl.toString());
  }

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const user = data.user;
      const meta = user.user_metadata || {};
      const fullName = meta.full_name || meta.name || user.email?.split('@')[0] || 'مستخدم جديد';
      const avatarUrl = meta.avatar_url || meta.picture || '';
      const email = user.email || '';

      try {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          const generatedUsername = (
            meta.user_name ||
            meta.preferred_username ||
            email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '')
          ).slice(0, 20);

          await supabase.from('profiles').insert({
            id: user.id,
            full_name: fullName,
            username: generatedUsername || `user_${user.id.slice(0, 8)}`,
            email: email,
            avatar_url: avatarUrl,
            email_verified: true,
            updated_at: new Date().toISOString(),
          });
        }
      } catch (err) {
        console.error('Error ensuring profile for OAuth user:', err);
      }

      const redirectUrl = next.startsWith('/') ? `${origin}${next}` : `${origin}/${next}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
}
