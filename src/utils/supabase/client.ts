import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) || '';
  const key = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) || '';
  
  if (!url || !key) {
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: [], error: null })
          })
        })
      })
    } as any;
  }

  return createBrowserClient(url, key)
}
