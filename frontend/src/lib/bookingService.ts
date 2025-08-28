// src/lib/bookingService.ts - Booking API service
import { toast } from '@/hooks/use-toast'

// Types
export interface Booking {
  id: string
  bookingRef: string
  location: string
  startAt: string
  endAt: string
  specialRequests?: string
  seatNumbers: string[]
  pax: number
  students: number
  members: number
  tutors: number
  totalCost: number
  totalAmount: number
  memberType: string
  bookedForEmails: string[]
  promoCodeId?: string
  discountAmount?: number
  confirmedPayment: boolean
  isUpcoming?: boolean
  isOngoing?: boolean
  isCompleted?: boolean
  isToday?: boolean
  durationHours?: number
  timeUntilBooking?: string
  status?: string
  User?: {
    name: string
    email: string
    memberType: string
  }
  PromoCode?: {
    code: string
    discountAmount: number
  }
}

export interface CreateBookingPayload {
  userId: string
  location: string
  startAt: string
  endAt: string
  specialRequests?: string
  seatNumbers: string[]
  pax: number
  students: number
  members: number
  tutors: number
  totalCost: number
  totalAmount: number
  memberType: string
  bookedForEmails: string[]
  promoCodeId?: string
  discountAmount?: number
}

export interface UpdateBookingPayload {
  startAt?: string
  endAt?: string
  location?: string
  specialRequests?: string
  totalAmount?: number
}

export interface CancelBookingPayload {
  reason: string
  refundAmount: number
}

export interface BookingFilters {
  page?: number
  limit?: number
  search?: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'today'
  location?: string
  dateFrom?: string
  dateTo?: string
  memberType?: string
  paymentStatus?: 'paid' | 'unpaid'
  sortBy?: 'startAt' | 'totalAmount' | 'createdAt' | 'bookingRef'
  sortOrder?: 'asc' | 'desc'
}

export interface BookingResponse {
  success?: boolean
  message?: string
  error?: string
  booking?: Booking
  bookings?: Booking[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  summary?: {
    totalBookings: number
    upcomingBookings: number
    ongoingBookings: number
    completedBookings: number
    totalRevenue: number
    pendingPayments: number
  }
  analytics?: any
  dashboard?: any
  promoCodeApplied?: boolean
}

export interface SeatAvailabilityResponse {
  bookedSeats: string[]
}

export interface UserStatsResponse {
  userId: string
  upcomingBookings: number
  pastBookings: number
}

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<BookingResponse> => {
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
const buildQueryString = (filters: BookingFilters): string => {
  const params = new URLSearchParams()
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value.toString())
    }
  })
  
  return params.toString()
}

// User/Client APIs
export const createBooking = async (payload: CreateBookingPayload): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Create Booking Error:', error)
    return {
      success: false,
      error: 'Failed to create booking',
      message: 'Failed to create booking'
    }
  }
}

export const getAllBookings = async (): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/all`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get All Bookings Error:', error)
    return {
      success: false,
      error: 'Failed to fetch bookings',
      message: 'Failed to fetch bookings'
    }
  }
}

export const getBookingById = async (id: string): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/getById/${id}`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get Booking Error:', error)
    return {
      success: false,
      error: 'Failed to fetch booking',
      message: 'Failed to fetch booking'
    }
  }
}

export const confirmBookingPayment = async (bookingId: string): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/confirmBooking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookingId }),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Confirm Payment Error:', error)
    return {
      success: false,
      error: 'Failed to confirm payment',
      message: 'Failed to confirm payment'
    }
  }
}

export const getBookedSeats = async (location: string, startAt: string, endAt: string): Promise<SeatAvailabilityResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/getBookedSeats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location, startAt, endAt }),
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get Booked Seats Error:', error)
    return { bookedSeats: [] }
  }
}

export const getUserStats = async (userId: string): Promise<UserStatsResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/userStats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Get User Stats Error:', error)
    return { userId, upcomingBookings: 0, pastBookings: 0 }
  }
}

// Admin APIs
export const getAdminBookings = async (filters: BookingFilters = {}): Promise<BookingResponse> => {
  try {
    const queryString = buildQueryString(filters)
    const url = `${API_BASE}/booking/admin/all${queryString ? `?${queryString}` : ''}`
    
    const response = await fetch(url)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get Admin Bookings Error:', error)
    return {
      success: false,
      error: 'Failed to fetch admin bookings',
      message: 'Failed to fetch admin bookings'
    }
  }
}

export const getBookingAnalytics = async (period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/admin/analytics?period=${period}`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get Analytics Error:', error)
    return {
      success: false,
      error: 'Failed to fetch analytics',
      message: 'Failed to fetch analytics'
    }
  }
}

export const getDashboardSummary = async (): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/admin/dashboard`)
    return await handleResponse(response)
  } catch (error) {
    console.error('Get Dashboard Error:', error)
    return {
      success: false,
      error: 'Failed to fetch dashboard',
      message: 'Failed to fetch dashboard'
    }
  }
}

export const updateAdminBooking = async (id: string, payload: UpdateBookingPayload): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Update Booking Error:', error)
    return {
      success: false,
      error: 'Failed to update booking',
      message: 'Failed to update booking'
    }
  }
}

export const cancelAdminBooking = async (id: string, payload: CancelBookingPayload): Promise<BookingResponse> => {
  try {
    const response = await fetch(`${API_BASE}/booking/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    
    return await handleResponse(response)
  } catch (error) {
    console.error('Cancel Booking Error:', error)
    return {
      success: false,
      error: 'Failed to cancel booking',
      message: 'Failed to cancel booking'
    }
  }
}

// Utility functions
export const calculateDuration = (startAt: string, endAt: string): number => {
  const start = new Date(startAt)
  const end = new Date(endAt)
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60))
}

export const formatBookingDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

export const getBookingStatus = (booking: Booking): string => {
  if (booking.isToday) return 'today'
  if (booking.isUpcoming) return 'upcoming'
  if (booking.isOngoing) return 'ongoing'
  if (booking.isCompleted) return 'completed'
  return 'unknown'
}

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'today': return 'bg-blue-100 text-blue-800'
    case 'upcoming': return 'bg-green-100 text-green-800'
    case 'ongoing': return 'bg-yellow-100 text-yellow-800'
    case 'completed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
