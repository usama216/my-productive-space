// src/hooks/useAuth.ts - Client-side auth hook with Redux integration
import { useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useReduxUser } from './useReduxUser'

export function useAuth() {
  const { 
    user, 
    loading, 
    loginUser, 
    logoutUser, 
    setUserLoading
  } = useReduxUser()

  // Stabilize the functions to prevent infinite loops
  const stableLoginUser = useCallback(loginUser, [])
  const stableLogoutUser = useCallback(logoutUser, [])
  const stableSetUserLoading = useCallback(setUserLoading, [])

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (mounted) {
          if (session?.user) {
            // Store user data in Redux
            stableLoginUser({
              user: session.user,
              accessToken: session.access_token,
              refreshToken: session.refresh_token,
              expiresAt: session.expires_at || 0,
            })
          }
          // Always set loading to false after initial check
          stableSetUserLoading(false)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        if (mounted) {
          stableSetUserLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in - store in Redux
          stableLoginUser({
            user: session.user,
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at || 0,
          })
        } else if (event === 'SIGNED_OUT') {
          // User signed out - clear Redux
          stableLogoutUser()
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, []) // Remove dependencies to prevent infinite loops

  return { user, loading }
}