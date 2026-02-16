'use client'

import { supabase } from "./lib/supabase"


export default function Login() {
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={signInWithGoogle}
        className="px-6 py-3 bg-black text-white rounded-lg"
      >
        Sign in with Google
      </button>
    </div>
  )
}
