'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, UserRole } from '@/types'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User | null>
  signUp: (email: string, password: string, fullName: string, phone: string, role: UserRole) => Promise<{ user: SupabaseUser | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUser(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        if (session) {
          fetchUser(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUser = async (userId: string): Promise<User | null> => {
    console.log(`fetchUser called for userId: ${userId}`);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      console.log("Fetched user data:", data);
      setUser(data)
      return data
    } catch (error) {
      console.error('Error fetching user:', error)
      setUser(null)
      return null
    }
  }

  const signIn = async (email: string, password: string): Promise<User | null> => {
    console.log(`signIn called with email: ${email}`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Supabase signInWithPassword response:", { data, error });

    if (error) {
        console.error("Supabase signInWithPassword error:", error);
        throw error
    }

    if (data.user) {
      console.log("User authenticated, attempting to fetch user data...");
      const fetchedUser = await fetchUser(data.user.id)
      console.log("fetchUser call completed in signIn");
      return fetchedUser
    } else {
        console.log("No user data returned from signInWithPassword, but no error either.");
        return null
    }
  }

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    phone: string,
    role: UserRole
  ): Promise<{ user: SupabaseUser | null }> => {
    try {
      console.log('Attempting sign up with:', {
        email,
        password: password.length + ' characters',
        fullName,
        phone,
        role
      })

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email,
            full_name: fullName
          }
        }
      })

      if (authError) {
        console.error('Auth error details:', {
          message: authError.message,
          status: authError.status,
          name: authError.name
        })
        throw authError
      }

      console.log('Auth data:', authData)

      if (authData.user) {
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              id: authData.user.id,
              email,
              full_name: fullName,
              phone,
              role
            }
          ])

        if (insertError) {
          console.error('Insert error details:', {
            message: insertError.message,
            code: insertError.code,
            details: insertError.details
          })
          throw insertError
        }
      }

      return { user: authData.user }
    } catch (error: any) {
      console.error('Error during sign up:', {
        message: error.message,
        status: error.status,
        name: error.name,
        stack: error.stack
      })
      throw error
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
