// Package Application Service for Booking
// Handles package discount calculations and application logic

export interface PackageDiscount {
  packageId: string
  packageName: string
  packageType: 'HALF_DAY' | 'FULL_DAY' | 'SEMESTER_BUNDLE'
  targetRole: 'STUDENT' | 'MEMBER' | 'TUTOR'
  discountHours: number
  appliedHours: number
  remainingHours: number
  discountAmount: number
  finalPrice: number
}

export interface BookingCalculation {
  totalHours: number
  basePrice: number
  packageDiscount?: PackageDiscount
  finalPrice: number
  skipPayment: boolean
}

export interface UserPackage {
  id: string
  packageId: string
  packageName: string
  packageType: 'HALF_DAY' | 'FULL_DAY' | 'SEMESTER_BUNDLE'
  targetRole: 'STUDENT' | 'MEMBER' | 'TUTOR'
  remainingCount: number
  totalCount: number
  expiresAt: string
}

// Package hour limits per day
const PACKAGE_HOUR_LIMITS = {
  'HALF_DAY': 4,
  'FULL_DAY': 8,
  'SEMESTER_BUNDLE': 4
} as const

// Hourly rates by role
const HOURLY_RATES = {
  'STUDENT': 5.00,
  'MEMBER': 6.00,
  'TUTOR': 4.00
} as const

/**
 * Calculate package discount for booking
 */
export function calculatePackageDiscount(
  totalHours: number,
  userPackages: UserPackage[],
  userRole: 'STUDENT' | 'MEMBER' | 'TUTOR',
  hourlyRate: number
): BookingCalculation {
  // Find applicable packages for user role
  const applicablePackages = userPackages.filter(
    pkg => pkg.targetRole === userRole && pkg.remainingCount > 0
  )

  if (applicablePackages.length === 0) {
    return {
      totalHours,
      basePrice: totalHours * hourlyRate,
      finalPrice: totalHours * hourlyRate,
      skipPayment: false
    }
  }

  // Sort packages by discount priority (Full Day > Half Day/Semester)
  const sortedPackages = applicablePackages.sort((a, b) => {
    const aLimit = PACKAGE_HOUR_LIMITS[a.packageType]
    const bLimit = PACKAGE_HOUR_LIMITS[b.packageType]
    return bLimit - aLimit // Higher limit first
  })

  // Apply the best package
  const bestPackage = sortedPackages[0]
  const discountHours = PACKAGE_HOUR_LIMITS[bestPackage.packageType]
  const appliedHours = Math.min(totalHours, discountHours)
  const remainingHours = Math.max(0, totalHours - appliedHours)
  const discountAmount = appliedHours * hourlyRate
  const finalPrice = remainingHours * hourlyRate

  const packageDiscount: PackageDiscount = {
    packageId: bestPackage.id,
    packageName: bestPackage.packageName,
    packageType: bestPackage.packageType,
    targetRole: bestPackage.targetRole,
    discountHours,
    appliedHours,
    remainingHours,
    discountAmount,
    finalPrice
  }

  return {
    totalHours,
    basePrice: totalHours * hourlyRate,
    packageDiscount,
    finalPrice,
    skipPayment: finalPrice === 0
  }
}

/**
 * Get user's available packages for booking
 */
export async function getUserPackagesForBooking(
  userId: string,
  userRole: 'STUDENT' | 'MEMBER' | 'TUTOR'
): Promise<UserPackage[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/user-packages/${userId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch user packages')
    }

    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch user packages')
    }

    // Filter packages for user role and active status
    return data.packages.filter((pkg: any) => 
      pkg.targetRole === userRole && 
      pkg.remainingCount > 0 &&
      new Date(pkg.expiresAt) > new Date()
    )
  } catch (error) {
    console.error('Error fetching user packages:', error)
    return []
  }
}

/**
 * Apply package to booking
 */
export async function applyPackageToBooking(
  bookingId: string,
  packageId: string,
  appliedHours: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/booking/apply-package`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        bookingId,
        packageId,
        appliedHours
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to apply package')
    }

    const data = await response.json()
    return { success: data.success }
  } catch (error) {
    console.error('Error applying package:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to apply package' 
    }
  }
}

/**
 * Calculate total hours for booking
 */
export function calculateTotalHours(
  duration: number, // in hours
  seats: number
): number {
  return duration * seats
}

/**
 * Get hourly rate for user role
 */
export function getHourlyRate(userRole: 'STUDENT' | 'MEMBER' | 'TUTOR'): number {
  return HOURLY_RATES[userRole]
}

/**
 * Format package discount display
 */
export function formatPackageDiscount(discount: PackageDiscount): string {
  const { packageName, appliedHours, remainingHours, discountAmount, finalPrice } = discount
  
  if (remainingHours === 0) {
    return `${packageName} applied - ${appliedHours} hours covered ($${discountAmount.toFixed(2)} saved)`
  } else {
    return `${packageName} applied - ${appliedHours} hours covered, ${remainingHours} hours remaining ($${discountAmount.toFixed(2)} saved, $${finalPrice.toFixed(2)} to pay)`
  }
}
