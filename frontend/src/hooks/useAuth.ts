import { useState, useEffect } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface UseAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
        setError(error.message)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_OUT') {
          setError(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      setError(error.message)
      throw error
    }
    
    setLoading(false)
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    
    if (error) {
      setError(error.message)
      throw error
    }
    
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      setError(error.message)
      throw error
    }
    
    setLoading(false)
  }

  const signInWithProvider = async (provider: 'google' | 'github') => {
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/chat`
      }
    })
    
    if (error) {
      setError(error.message)
      throw error
    }
    
    setLoading(false)
  }

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithProvider,
    error
  }
}
