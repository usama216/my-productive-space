// src/lib/userService.ts - User Management API service
// 
// API Endpoint Structure:
// - GET    /api/booking/admin/users          - Get all users (with filters)
// - GET    /api/booking/admin/users/:id      - Get user by ID
// - PUT    /api/booking/admin/users/:id      - Update user
// - DELETE /api/booking/admin/users/:id      - Delete user
// - POST   /api/booking/admin/users/:id/suspend   - Suspend user
// - POST   /api/booking/admin/users/:id/activate  - Activate user
// - PUT    /api/booking/admin/users/:id/verify    - Update student verification status
// - GET    /api/booking/admin/users/dashboard     - Get user statistics
// - GET    /api/booking/admin/users/analytics    - Get user analytics

// Types
export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  memberType: string
  contactNumber: string | null
  studentVerificationStatus: 'NA' | 'PENDING' | 'VERIFIED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  studentVerificationImageUrl: string | null
  stats?: {
    totalBookings: number
    confirmedBookings: number
    totalSpent: number
  }
}

export interface UserFilters {
  page?: number
  limit?: number
  search?: string
  memberType?: string
  studentVerificationStatus?: string // Added for admin filtering
  sortBy?: 'createdAt' | 'name' | 'email'
  sortOrder?: 'asc' | 'desc'
  includeStats?: boolean
}

export interface UserResponse {
  success?: boolean
  message?: string
  error?: string
  user?: User
  users?: User[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary?: {
    totalUsers: number
    memberTypeBreakdown: {
      MEMBER: number
      STUDENT: number
    }
  }
}

export interface UpdateUserPayload {
  firstName?: string
  lastName?: string
  memberType?: string
  contactNumber?: string
  studentVerificationStatus?: 'NA' | 'PENDING' | 'VERIFIED' | 'REJECTED'
}

import { authenticatedFetch } from './apiClient'

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://productive-space-backend.vercel.app/api'

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<UserResponse> => {
  try {
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP ${response.status}`,
        message: data.message || data.error || `HTTP ${response.status}`
      }
    }
    
    return {
      success: true,
      ...data
    }
  } catch (error) {
    console.error('API Response Error:', error)
    return {
      success: false,
      error: 'Failed to parse response',
      message: 'Failed to parse response'
    }
  }
}

// Helper function to build query string
const buildQueryString = (filters: UserFilters): string => {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })
  
  return params.toString()
}

// Admin APIs
export const getAllUsers = async (filters: UserFilters = {}): Promise<UserResponse> => {
  try {
    const queryString = buildQueryString(filters)
    const url = `${API_BASE}/booking/admin/users${queryString ? `?${queryString}` : ''}`
    
    const response = await authenticatedFetch(url)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get All Users Error:', error)
    return {
      success: false,
      error: 'Failed to fetch users',
      message: 'Failed to fetch users'
    }
  }
}

export const getUserById = async (id: string): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/${id}`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get User Error:', error)
    return {
      success: false,
      error: 'Failed to fetch user',
      message: 'Failed to fetch user'
    }
  }
}

export const updateUser = async (id: string, payload: UpdateUserPayload): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Update User Error:', error)
    return {
      success: false,
      error: 'Failed to update user',
      message: 'Failed to update user'
    }
  }
}

export const suspendUser = async (id: string, reason: string): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Suspend User Error:', error)
    return {
      success: false,
      error: 'Failed to suspend user',
      message: 'Failed to suspend user'
    }
  }
}

export const activateUser = async (id: string): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/${id}/activate`, {
      method: 'POST',
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Activate User Error:', error)
    return {
      success: false,
      error: 'Failed to activate user',
      message: 'Failed to activate user'
    }
  }
}

export const deleteUser = async (id: string): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/${id}`, {
      method: 'DELETE',
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Delete User Error:', error)
    return {
      success: false,
      error: 'Failed to delete user',
      message: 'Failed to delete user'
    }
  }
}

export const getUserStats = async (): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/dashboard`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get User Stats Error:', error)
    return {
      success: false,
      error: 'Failed to fetch user stats',
      message: 'Failed to fetch user stats'
    }
  }
}

export const getUserAnalytics = async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/analytics?period=${period}`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get User Analytics Error:', error)
    return {
      success: false,
      error: 'Failed to fetch user analytics',
      message: 'Failed to fetch user analytics'
    }
  }
}

export const updateStudentVerification = async (
  id: string,
  status: 'VERIFIED' | 'REJECTED',
  rejectionReason?: string
): Promise<UserResponse> => {
  try {
    const response = await authenticatedFetch(`${API_BASE}/booking/admin/users/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({
        studentVerificationStatus: status,
        ...(status === 'REJECTED' && rejectionReason ? { rejectionReason } : {})
      }),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Update Student Verification Error:', error)
    return {
      success: false,
      error: 'Failed to update student verification',
      message: 'Failed to update student verification'
    }
  }
}

// Utility functions
export const formatUserDate = (dateString: string): string => {
  // Ensure dates are treated as UTC by adding 'Z' if not present
  const utcDateString = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  return new Date(utcDateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

// Removed unused utility functions

export const getMemberTypeColor = (memberType: string): string => {
  switch (memberType?.toUpperCase()) {
    case 'STUDENT': return 'bg-blue-100 text-blue-800'
    case 'MEMBER': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getVerificationStatusColor = (status: string): string => {
  switch (status) {
    case 'VERIFIED': return 'bg-green-100 text-green-800'
    case 'PENDING': return 'bg-yellow-100 text-yellow-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    case 'NA': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export const getVerificationStatusText = (status: string): string => {
  switch (status) {
    case 'VERIFIED': return 'Verified'
    case 'PENDING': return 'Pending'
    case 'REJECTED': return 'Rejected'
    case 'NA': return 'Not Applicable'
    default: return 'Unknown'
  }
}
