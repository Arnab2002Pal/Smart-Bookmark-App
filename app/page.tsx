'use client'

import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth state (handles multi-tab sync)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    })

    // Check existing session once
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        router.replace('/dashboard')
      } else {
        setLoading(false)
      }
    }

    checkSession()

    return () => subscription.unsubscribe()
  }, [router])

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-400 animate-pulse">
          Checking session...
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-screen px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-10 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-3 tracking-tight">
          Smart Bookmark
        </h1>
        <p className="text-gray-300 mb-8 text-sm">
          Save, manage & sync your links in real-time
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition-all duration-200"
        >
          Continue with Google
        </button>
      </div>
    </div>
  )
}
