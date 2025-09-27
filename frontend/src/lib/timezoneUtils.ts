// Timezone utility functions for GMT+8 (Singapore timezone)
// This file provides consistent timezone handling across the entire application

export const SINGAPORE_TIMEZONE = 'Asia/Singapore'
export const GMT_OFFSET_HOURS = 8

/**
 * Convert UTC time to Singapore time (GMT+8)
 * @param utcDate - UTC date string or Date object
 * @returns Date object in Singapore timezone
 */
export function toSingaporeTime(utcDate: string | Date): Date {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate
  
  // Convert UTC to Singapore time (UTC + 8 hours)
  const singaporeTime = new Date(date.getTime() + (GMT_OFFSET_HOURS * 3600000))
  return singaporeTime
}

/**
 * Convert Singapore time to UTC for database storage
 * @param singaporeDate - Date object or string in Singapore time
 * @returns Date object in UTC
 */
export function toUTC(singaporeDate: string | Date): Date {
  const date = typeof singaporeDate === 'string' ? new Date(singaporeDate) : singaporeDate
  
  // Get the timezone offset and adjust
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000)
  const singaporeTime = new Date(utcTime + (GMT_OFFSET_HOURS * 3600000))
  
  // Convert back to UTC for database
  return new Date(singaporeTime.getTime() - (GMT_OFFSET_HOURS * 3600000))
}

/**
 * Format date for display in Singapore timezone
 * @param utcDate - UTC date from database
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string in Singapore timezone
 */
export function formatSingaporeDate(
  utcDate: string | Date, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string {
  // Ensure dates are treated as UTC by adding 'Z' if not present
  const dateStr = typeof utcDate === 'string' ? 
    (utcDate.endsWith('Z') ? utcDate : utcDate + 'Z') : 
    utcDate.toISOString()
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', options)
}

/**
 * Format date only (without time) in Singapore timezone
 * @param utcDate - UTC date from database
 * @returns Formatted date string
 */
export function formatSingaporeDateOnly(utcDate: string | Date): string {
  return formatSingaporeDate(utcDate, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format time only (without date) in Singapore timezone
 * @param utcDate - UTC date from database
 * @returns Formatted time string
 */
export function formatSingaporeTimeOnly(utcDate: string | Date): string {
  return formatSingaporeDate(utcDate, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get current time in Singapore timezone
 * @returns Current date in Singapore timezone
 */
export function getCurrentSingaporeTime(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: SINGAPORE_TIMEZONE }))
}

/**
 * Check if a date is in the past (based on Singapore time)
 * @param utcDate - UTC date from database
 * @returns True if date is in the past
 */
export function isPastInSingapore(utcDate: string | Date): boolean {
  const singaporeDate = toSingaporeTime(utcDate)
  const currentSingaporeTime = getCurrentSingaporeTime()
  return singaporeDate < currentSingaporeTime
}

/**
 * Check if a date is in the future (based on Singapore time)
 * @param utcDate - UTC date from database
 * @returns True if date is in the future
 */
export function isFutureInSingapore(utcDate: string | Date): boolean {
  const singaporeDate = toSingaporeTime(utcDate)
  const currentSingaporeTime = getCurrentSingaporeTime()
  return singaporeDate > currentSingaporeTime
}

/**
 * Calculate duration between two dates in Singapore timezone
 * @param startUtc - Start UTC date from database
 * @param endUtc - End UTC date from database
 * @returns Duration in hours
 */
export function calculateDurationSingapore(startUtc: string | Date, endUtc: string | Date): number {
  const startSingapore = toSingaporeTime(startUtc)
  const endSingapore = toSingaporeTime(endUtc)
  return Math.max(1, Math.ceil((endSingapore.getTime() - startSingapore.getTime()) / (1000 * 60 * 60)))
}

/**
 * Format booking date range for display
 * @param startUtc - Start UTC date from database
 * @param endUtc - End UTC date from database
 * @returns Formatted date range string
 */
export function formatBookingDateRange(startUtc: string | Date, endUtc: string | Date): string {
  // Ensure dates are treated as UTC by adding 'Z' if not present
  const startDateStr = typeof startUtc === 'string' ? 
    (startUtc.endsWith('Z') ? startUtc : startUtc + 'Z') : 
    startUtc.toISOString()
  const endDateStr = typeof endUtc === 'string' ? 
    (endUtc.endsWith('Z') ? endUtc : endUtc + 'Z') : 
    endUtc.toISOString()
  
  const startDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)
  
  // Use user's local timezone for display
  const startDateFormatted = startDate.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
  
  const startTimeFormatted = startDate.toLocaleTimeString('en-US', { 
    hour: '2-digit',
    minute: '2-digit'
  })
  
  const endTimeFormatted = endDate.toLocaleTimeString('en-US', { 
    hour: '2-digit',
    minute: '2-digit'
  })
  
  // Check if it's the same day in user's timezone
  const startDateOnly = startDate.toLocaleDateString()
  const endDateOnly = endDate.toLocaleDateString()
  const isSameDay = startDateOnly === endDateOnly
  
  if (isSameDay) {
    return `${startDateFormatted} ${startTimeFormatted} - ${endTimeFormatted}`
  } else {
    const endDateFormatted = endDate.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    return `${startDateFormatted} ${startTimeFormatted} - ${endDateFormatted} ${endTimeFormatted}`
  }
}

/**
 * Create a date picker date in Singapore timezone
 * @param utcDate - UTC date from database
 * @returns Date object suitable for date pickers
 */
export function toDatePickerDate(utcDate: string | Date): Date {
  const singaporeDate = toSingaporeTime(utcDate)
  return singaporeDate
}

/**
 * Convert date picker date to UTC for database storage
 * @param singaporeDate - Date from date picker (in Singapore time)
 * @returns UTC date for database
 */
export function fromDatePickerToUTC(datePickerDate: Date): Date {
  // The date picker gives us a date in the user's local timezone
  // We need to treat this as Singapore time and convert to UTC for storage
  
  // Get the components of the date picker date
  const year = datePickerDate.getFullYear()
  const month = datePickerDate.getMonth()
  const date = datePickerDate.getDate()
  const hours = datePickerDate.getHours()
  const minutes = datePickerDate.getMinutes()
  const seconds = datePickerDate.getSeconds()
  
  // Create a new date treating the picker date as Singapore time
  const singaporeTime = new Date(year, month, date, hours, minutes, seconds)
  
  // Convert Singapore time to UTC by subtracting 8 hours
  const utcTime = singaporeTime.getTime() - (GMT_OFFSET_HOURS * 3600000)
  return new Date(utcTime)
}

/**
 * Get time constraints for Singapore timezone
 * @returns Object with min/max dates for booking constraints
 */
export function getSingaporeTimeConstraints() {
  const nowSingapore = getCurrentSingaporeTime()
  const todaySingapore = new Date(nowSingapore)
  todaySingapore.setHours(0, 0, 0, 0)
  
  // Maximum booking date (30 days from now in Singapore time)
  const maxBookingDate = new Date(todaySingapore)
  maxBookingDate.setDate(maxBookingDate.getDate() + 30)
  
  return {
    minDate: todaySingapore,
    maxDate: maxBookingDate,
    currentTime: nowSingapore
  }
}
