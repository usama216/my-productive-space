// src/hooks/useAuth.ts - Client-side auth hook with local storage
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'

interface DatabaseUser {
  id: string
  email: string
  name?: string
  firstName?: string
  lastName?: string
  memberType?: 'STUDENT' | 'MEMBER' | 'TUTOR' | 'ADMIN'
  contactNumber?: string
  studentVerificationStatus?: 'NA' | 'PENDING' | 'VERIFIED'
  studentVerificationImageUrl?: string
  studentVerificationDate?: string
  studentRejectionReason?: string | null
  createdAt?: string
  updatedAt?: string
}

// Local storage keys
const STORAGE_KEYS = {
  AUTH_USER: 'auth_user',
  DATABASE_USER: 'database_user'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [databaseUser, setDatabaseUser] = useState<DatabaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user data from local storage
  const loadFromStorage = () => {
    try {
      const storedAuthUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
      const storedDatabaseUser = localStorage.getItem(STORAGE_KEYS.DATABASE_USER)
      
      if (storedAuthUser) {
        setUser(JSON.parse(storedAuthUser))
      }
      
      if (storedDatabaseUser) {
        setDatabaseUser(JSON.parse(storedDatabaseUser))
      }
    } catch (error) {
      console.error('Error loading from local storage:', error)
    }
  }

  // Save user data to local storage
  const saveToStorage = (authUser: User | null, dbUser: DatabaseUser | null) => {
    try {
      if (authUser) {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(authUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER)
      }
      
      if (dbUser) {
        localStorage.setItem(STORAGE_KEYS.DATABASE_USER, JSON.stringify(dbUser))
      } else {
        localStorage.removeItem(STORAGE_KEYS.DATABASE_USER)
      }
    } catch (error) {
      console.error('Error saving to local storage:', error)
    }
  }

  // Create mock database user from auth user (for demo purposes)
  const createMockDatabaseUser = (authUser: User): DatabaseUser => {
    const fullName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User'
    const nameParts = fullName.split(' ')
    
    return {
      id: authUser.id, // Use auth ID as database ID for now
      email: authUser.email || '',
      name: fullName,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      memberType: 'MEMBER', // Default to MEMBER
      contactNumber: authUser.user_metadata?.phone || '',
      studentVerificationStatus: 'NA', // Default to NA
      createdAt: authUser.created_at,
      updatedAt: authUser.updated_at
    }
  }

  // Fetch actual database user
  const fetchDatabaseUser = async (authUser: User): Promise<DatabaseUser> => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (error || !data) {
        console.error('Error fetching database user:', error)
        return createMockDatabaseUser(authUser)
      }

      return {
        id: data.id,
        email: data.email,
        name: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        memberType: data.memberType,
        contactNumber: data.contactNumber,
        studentVerificationStatus: data.studentVerificationStatus,
        studentVerificationImageUrl: data.studentVerificationImageUrl,
        studentVerificationDate: data.studentVerificationDate,
        studentRejectionReason: data.studentRejectionReason,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    } catch (error) {
      console.error('Error fetching database user:', error)
      return createMockDatabaseUser(authUser)
    }
  }

  useEffect(() => {
    let isMounted = true
    
    // Load initial data from storage
    const storedAuthUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER)
    const storedDatabaseUser = localStorage.getItem(STORAGE_KEYS.DATABASE_USER)
    
    if (storedAuthUser && storedDatabaseUser) {
      try {
        setUser(JSON.parse(storedAuthUser))
        setDatabaseUser(JSON.parse(storedDatabaseUser))
        // If we have cached data, set loading to false immediately
        setLoading(false)
      } catch (error) {
        console.error('Error loading from local storage:', error)
      }
    }
    
    // Get initial session and refresh data in background
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user && isMounted) {
          const dbUser = await fetchDatabaseUser(session.user)
          setUser(session.user)
          setDatabaseUser(dbUser)
          saveToStorage(session.user, dbUser)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return
        
        if (session?.user) {
          const dbUser = await fetchDatabaseUser(session.user)
          setUser(session.user)
          setDatabaseUser(dbUser)
          saveToStorage(session.user, dbUser)
        } else {
          setUser(null)
          setDatabaseUser(null)
          saveToStorage(null, null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Helper function to check if user is logged in
  const isLoggedIn = !!user && !!databaseUser

  // Function to refresh database user data
  const refreshDatabaseUser = async () => {
    if (!user) return

    try {
      const dbUser = await fetchDatabaseUser(user)
      console.log('Refreshing database user with fresh data:', dbUser)
      setDatabaseUser(dbUser)
      saveToStorage(user, dbUser)
    } catch (error) {
      console.error('Error refreshing database user:', error)
    }
  }

  // Function to refresh auth user data
  const refreshAuthUser = async () => {
    try {
      const { data: { user: refreshedUser } } = await supabase.auth.getUser()
      if (refreshedUser) {
        console.log('Refreshing auth user with fresh data:', refreshedUser)
        setUser(refreshedUser)
        // Also refresh database user to keep them in sync
        await refreshDatabaseUser()
      }
    } catch (error) {
      console.error('Error refreshing auth user:', error)
    }
  }

  return { 
    user, 
    databaseUser,
    loading,
    // Provide both IDs for flexibility
    userId: databaseUser?.id || user?.id, // Prefer database user ID, fallback to auth ID
    authUserId: user?.id, // Always available if authenticated
    // Login status check
    isLoggedIn,
    // Refresh functions
    refreshDatabaseUser,
    refreshAuthUser
  }
}