// src/lib/utils.ts - Required utility function
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Timezone conversion utilities for GMT+8 (Singapore time)
export function convertUTCToGMT8(utcDate: string | Date): Date {
  const date = new Date(utcDate)
  // Get the UTC time and add 8 hours to convert to GMT+8
  const gmt8Time = new Date(date.getTime() + (8 * 60 * 60 * 1000))
  return gmt8Time
}

export function formatToGMT8(utcDate: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const gmt8Date = convertUTCToGMT8(utcDate)
  
  // Default options for Singapore timezone
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options
  }
  
  return gmt8Date.toLocaleString('en-SG', defaultOptions)
}

export function formatDateToGMT8(utcDate: string | Date): string {
  return formatToGMT8(utcDate, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTimeToGMT8(utcDate: string | Date): string {
  return formatToGMT8(utcDate, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDateTimeToGMT8(utcDate: string | Date): string {
  return formatToGMT8(utcDate, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Get current time in GMT+8
export function getCurrentGMT8Time(): Date {
  const now = new Date()
  return convertUTCToGMT8(now)
}

// Convert GMT+8 time back to UTC for database storage
export function convertGMT8ToUTC(gmt8Date: Date): Date {
  // Subtract 8 hours to convert from GMT+8 to UTC
  const utcTime = new Date(gmt8Date.getTime() - (8 * 60 * 60 * 1000))
  return utcTime
}

// Generate a unique booking reference
export function generateBookingRef(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `BOOK${timestamp}${random}`.toUpperCase()
}

// Generate a UUID-like ID for bookings
export function generateBookingId(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `${timestamp}-${random}`
}