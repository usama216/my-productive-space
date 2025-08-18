import { createSlice, PayloadAction } from '@reduxjs/toolkit'

// User metadata interface based on your Supabase response
export interface UserMetadata {
  contactNumber: string
  email: string
  email_verified: boolean
  firstName: string
  lastName: string
  memberType: 'student' | 'professional' | 'freelancer'
  phone_verified: boolean
  sub: string
}

// User interface based on your Supabase response
export interface User {
  id: string
  aud: string
  role: string
  email: string
  email_confirmed_at: string
  phone: string
  confirmed_at: string
  last_sign_in_at: string
  app_metadata: {
    provider: string
    providers: string[]
  }
  user_metadata: UserMetadata
  identities: Array<{
    identity_id: string
    id: string
    user_id: string
    identity_data: UserMetadata
    provider: string
    last_sign_in_at: string
    created_at: string
    updated_at: string
    email: string
  }>
  created_at: string
  updated_at: string
  is_anonymous: boolean
}

// Auth state interface
export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  expiresAt: number | null
  isAuthenticated: boolean
  loading: boolean
}

// Initial state
const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isAuthenticated: false,
  loading: true, // Start with loading true
}

// User slice
export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Set user data after successful login
    setUser: (state, action: PayloadAction<{
      user: User
      accessToken: string
      refreshToken: string
      expiresAt: number
    }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.refreshToken = action.payload.refreshToken
      state.expiresAt = action.payload.expiresAt
      state.isAuthenticated = true
      state.loading = false
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    // Update user metadata
    updateUserMetadata: (state, action: PayloadAction<Partial<UserMetadata>>) => {
      if (state.user) {
        state.user.user_metadata = {
          ...state.user.user_metadata,
          ...action.payload,
        }
      }
    },

    // Clear user data on logout
    clearUser: (state) => {
      state.user = null
      state.accessToken = null
      state.refreshToken = null
      state.expiresAt = null
      state.isAuthenticated = false
      state.loading = false
    },

    // Refresh access token
    refreshAccessToken: (state, action: PayloadAction<{
      accessToken: string
      expiresAt: number
    }>) => {
      state.accessToken = action.payload.accessToken
      state.expiresAt = action.payload.expiresAt
    },
  },
})

// Export actions
export const {
  setUser,
  setLoading,
  updateUserMetadata,
  clearUser,
  refreshAccessToken,
} = userSlice.actions

// Export selectors
export const selectUser = (state: { user: AuthState }) => state.user.user
export const selectIsAuthenticated = (state: { user: AuthState }) => state.user.isAuthenticated
export const selectAccessToken = (state: { user: AuthState }) => state.user.accessToken
export const selectUserLoading = (state: { user: AuthState }) => state.user.loading
export const selectUserId = (state: { user: AuthState }) => state.user.user?.id
export const selectUserEmail = (state: { user: AuthState }) => state.user.user?.email

// Export reducer
export default userSlice.reducer
