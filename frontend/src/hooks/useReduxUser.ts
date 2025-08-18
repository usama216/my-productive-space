import { useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '@/store/store'
import {
  selectUser,
  selectIsAuthenticated,
  selectAccessToken,
  selectUserLoading,
  selectUserId,
  selectUserEmail,
  setUser,
  setLoading,
  updateUserMetadata,
  clearUser,
  refreshAccessToken,
} from '@/store/slices/userSlice'

export const useReduxUser = () => {
  const dispatch = useDispatch()
  
  // Selectors
  const user = useSelector(selectUser)
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const accessToken = useSelector(selectAccessToken)
  const loading = useSelector(selectUserLoading)
  const userId = useSelector(selectUserId)
  const userEmail = useSelector(selectUserEmail)

  // Actions - wrapped with useCallback to prevent infinite loops
  const loginUser = useCallback((userData: {
    user: any
    accessToken: string
    refreshToken: string
    expiresAt: number
  }) => {
    dispatch(setUser(userData))
  }, [dispatch])

  const logoutUser = useCallback(() => {
    dispatch(clearUser())
  }, [dispatch])

  const updateUser = useCallback((metadata: any) => {
    dispatch(updateUserMetadata(metadata))
  }, [dispatch])

  const setUserLoading = useCallback((loadingState: boolean) => {
    dispatch(setLoading(loadingState))
  }, [dispatch])

  const refreshToken = useCallback((tokenData: {
    accessToken: string
    expiresAt: number
  }) => {
    dispatch(refreshAccessToken(tokenData))
  }, [dispatch])

  return {
    // State
    user,
    isAuthenticated,
    accessToken,
    loading,
    userId,
    userEmail,
    
    // Actions
    loginUser,
    logoutUser,
    updateUser,
    setUserLoading,
    refreshToken,
  }
}
