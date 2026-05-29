import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/app'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Create a URL and strip the query params before redirecting
      const nextUrl = new URL(next, request.url)
      
      // We clear query params (especially `code` which was already used) to keep URL clean
      nextUrl.searchParams.delete('code')
      
      return NextResponse.redirect(nextUrl)
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed`)
}
