// src/app/book-now/BookingClient.tsx
'use client'

import { SeatPicker, SeatMeta, OverlayMeta, TableMeta, LabelMeta } from '@/components/book-now-sections/SeatPicker'
import { EntitlementTabs } from '@/components/book-now-sections/EntitlementTabs'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { isSameDay, endOfDay, parseISO, addMonths, addDays, setHours, setMinutes } from 'date-fns'
import { MapPin, Clock, Users, Calendar, CreditCard, Shield, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'


import { PeopleSelector } from '@/components/PeopleSelector'
import Navbar from '@/components/Navbar'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'

import { StudentValidation } from '@/components/book-now-sections/StudentValidation'

import PaymentStep from '@/components/book-now/PaymentStep'
import { useAuth } from '@/hooks/useAuth'
import { getApiUrl } from '@/lib/config'

// Test voucher constants
const TEST_VOUCHERS = {
  'SAVE20': {
    id: 'promo_save20',
    code: 'SAVE20',
    discount_type: 'percentage',
    discount_value: 20, // 20% off
    expires_at: '2025-12-31T23:59:59Z',
    max_uses_per_user: 3,
    max_uses_total: 1000,
    description: '20% off your booking',
    is_active: true
  },
  'SAVE30': {
    id: 'promo_save30',
    code: 'SAVE30',
    discount_type: 'percentage',
    discount_value: 30, // 30% off
    expires_at: '2025-12-31T23:59:59Z',
    max_uses_per_user: 3,
    max_uses_total: 1000,
    description: '30% off your booking',
    is_active: true
  },
  'GET15OFF': {
    id: 'promo_get15off',
    code: 'GET15OFF',
    discount_type: 'fixed_amount',
    discount_value: 15, // $15 off
    expires_at: '2025-12-31T23:59:59Z',
    max_uses_per_user: 1,
    max_uses_total: 500,
    description: '$15 off your booking',
    is_active: true
  }
} as const;

// Helper function to calculate discount
function calculateDiscount(
  originalPrice: number,
  voucher: typeof TEST_VOUCHERS[keyof typeof TEST_VOUCHERS]
): { discountAmount: number; finalPrice: number } {
  let discountAmount = 0;

  if (voucher.discount_type === 'percentage') {
    discountAmount = (originalPrice * voucher.discount_value) / 100;
  } else if (voucher.discount_type === 'fixed_amount') {
    discountAmount = Math.min(voucher.discount_value, originalPrice); // Don't exceed original price
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    discountAmount: Math.round(discountAmount * 100) / 100, // Round to 2 decimal places
    finalPrice: Math.round(finalPrice * 100) / 100
  };
}

// Location data with pricing
const locations = [
  { id: 'bukit', name: 'Bukit Panjang', price: 25, address: '123 Bukit Panjang Plaza, Singapore 670123' },
  { id: 'kovan', name: 'Kovan', price: 30, address: '456 Kovan Road, Singapore 560456' },
  { id: 'amk', name: 'Ang Mo Kio', price: 28, address: '789 Ang Mo Kio Avenue 3, Singapore 560789' }
]

export default function BookingClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  // Auth state
  const { user, loading: isLoadingAuth } = useAuth()

  const [entitlementMode, setEntitlementMode] = useState<'package' | 'promo'>('package')
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [promoCode, setPromoCode] = useState<string>('')
  const [promoValid, setPromoValid] = useState<boolean>(false)
  const [appliedVoucher, setAppliedVoucher] = useState<typeof TEST_VOUCHERS[keyof typeof TEST_VOUCHERS] | null>(null)

  const [selectedSeats, setSelectedSeats] = useState<string[]>([])


  const [studentsValidated, setStudentsValidated] = useState(false)
  const [validatedStudents, setValidatedStudents] = useState<any[]>([])
  useEffect(() => {
  if (searchParams.get('step') === '3') {
    setBookingStep(3)
  }
}, [searchParams])
  // A quick demo layout matching your SVG coords:
  const DEMO_LAYOUT: SeatMeta[] = [
    // ← Left column (near T1–T4)
    { id: 'S1', x: 120, y: 80, shape: 'circle', size: 20 },
    { id: 'S2', x: 120, y: 160, shape: 'circle', size: 20 },
    { id: 'S3', x: 120, y: 260, shape: 'circle', size: 20 },
    { id: 'S4', x: 120, y: 310, shape: 'circle', size: 20 },
    { id: 'S5', x: 120, y: 400, shape: 'circle', size: 20 },
    { id: 'S6', x: 120, y: 450, shape: 'circle', size: 20 },

    // ← Right column (near T5–T9)
    { id: 'S7', x: 300, y: 90, shape: 'circle', size: 20 },
    { id: 'S8', x: 300, y: 170, shape: 'circle', size: 20 },
    { id: 'S9', x: 300, y: 220, shape: 'circle', size: 20 },
    { id: 'S12', x: 300, y: 400, shape: 'circle', size: 20 },
    { id: 'S13', x: 300, y: 460, shape: 'circle', size: 20 },

    // ← Center column (near T7 & bottom T10/T10a)
    { id: 'S10', x: 260, y: 280, shape: 'circle', size: 20 },
    { id: 'S11', x: 260, y: 330, shape: 'circle', size: 20 },
    { id: 'S14', x: 260, y: 520, shape: 'circle', size: 20 },
    { id: 'S15', x: 260, y: 570, shape: 'circle', size: 20 },
  ]
  const DEMO_TABLES: TableMeta[] = [
    // Left‐column rectangles (T1, T2, T4)
    { id: 'T1', shape: 'rect', x: 80, y: 80, width: 40, height: 80 },
    { id: 'T2', shape: 'rect', x: 80, y: 160, width: 40, height: 80 },
    { id: 'T4', shape: 'rect', x: 80, y: 425, width: 40, height: 100 },

    // Left‐column circle (T3)
    { id: 'T3', shape: 'circle', x: 60, y: 285, radius: 40 },

    // Right‐column rectangles (T5, T6, T8, T9)
    { id: 'T5', shape: 'rect', x: 340, y: 90, width: 40, height: 80 },
    { id: 'T6', shape: 'rect', x: 340, y: 195, width: 40, height: 100 },
    { id: 'T8', shape: 'rect', x: 340, y: 400, width: 40, height: 60 },
    { id: 'T9', shape: 'rect', x: 340, y: 460, width: 40, height: 60 },

    // Right‐column circle (T7)
    { id: 'T7', shape: 'circle', x: 320, y: 300, radius: 40 },

    // Bottom‐center rectangle (T10 & T10a)
    { id: 'T10', shape: 'rect', x: 320, y: 520, width: 100, height: 40 },
    { id: 'T10a', shape: 'rect', x: 320, y: 560, width: 100, height: 40 },
  ]

  const DEMO_LABELS: LabelMeta[] = [
    // seats number tag
    { id: 'lbl-S1', text: 'S1', x: 120, y: 80 },
    { id: 'lbl-S2', text: 'S2', x: 120, y: 160 },
    { id: 'lbl-S3', text: 'S3', x: 120, y: 260 },
    { id: 'lbl-S4', text: 'S4', x: 120, y: 310 },
    { id: 'lbl-S5', text: 'S5', x: 120, y: 400 },
    { id: 'lbl-S6', text: 'S6', x: 120, y: 450 },
    { id: 'lbl-S7', text: 'S7', x: 300, y: 90 },
    { id: 'lbl-S8', text: 'S8', x: 300, y: 170 },
    { id: 'lbl-S9', text: 'S9', x: 300, y: 220 },
    { id: 'lbl-S10', text: 'S10', x: 260, y: 280 },
    { id: 'lbl-S11', text: 'S11', x: 260, y: 330 },
    { id: 'lbl-S12', text: 'S12', x: 300, y: 400 },
    { id: 'lbl-S13', text: 'S13', x: 300, y: 460 },
    { id: 'lbl-S14', text: 'S14', x: 260, y: 520 },
    { id: 'lbl-S15', text: 'S15', x: 260, y: 570 },

    // …and so on S4–S15…

    // tables
    { id: 'lbl-T1', text: 'T1', x: 80, y: 80 },
    { id: 'lbl-T2', text: 'T2', x: 80, y: 160 },
    { id: 'lbl-T3', text: 'T3', x: 60, y: 285 },
    { id: 'lbl-T4', text: 'T4', x: 80, y: 425 },
    { id: 'lbl-T5', text: 'T5', x: 340, y: 90 },
    { id: 'lbl-T6', text: 'T6', x: 340, y: 195 },
    { id: 'lbl-T7', text: 'T7', x: 320, y: 300 },
    { id: 'lbl-T8', text: 'T8', x: 340, y: 400 },
    { id: 'lbl-T9', text: 'T9', x: 340, y: 460 },
    { id: 'lbl-T10', text: 'T10', x: 320, y: 520 },
    { id: 'lbl-T10a', text: 'T10a', x: 320, y: 560 },
    // …etc for T4–T10a…
  ]

  const OVERLAYS: OverlayMeta[] = [
    { id: 'door', src: '/seat_booking_img/door.png', x: 0, y: 0, width: 60, height: 50 },
    { id: 'legend', src: '/seat_booking_img/legend_img.png', x: 135, y: 0, width: 150, height: 100 },
    { id: 'pantry', src: '/seat_booking_img/pantry.png', x: 0, y: 515, width: 100, height: 80 },
    { id: 'toilet', src: '/seat_booking_img/toilet.png', x: 100, y: 535, width: 80, height: 60 },
    // left-wall monitors
    { id: 'monitor_left1', src: '/seat_booking_img/monitor_L.png', x: 20, y: 60, width: 16, height: 24 },
    { id: 'monitor_left2', src: '/seat_booking_img/monitor_L.png', x: 20, y: 140, width: 16, height: 24 },
    { id: 'monitor_left3', src: '/seat_booking_img/monitor_L.png', x: 20, y: 415, width: 16, height: 24 },

    // right-wall monitors
    { id: 'monitor_right1', src: '/seat_booking_img/monitor_R.png', x: 365, y: 185, width: 16, height: 24 },
    { id: 'monitor_right2', src: '/seat_booking_img/monitor_R.png', x: 360, y: 285, width: 16, height: 24 },
    { id: 'monitor_right3', src: '/seat_booking_img/monitor_R.png', x: 380, y: 520, width: 16, height: 24 },
    // and so on for each monitor, smiley‐face PNG, etc.
  ]
  // Add state for breakdown
  const [peopleBreakdown, setPeopleBreakdown] = useState<{
    coWorkers: number
    coTutors: number
    coStudents: number
    total: number
  }>({
    coWorkers: 1,
    coTutors: 0,
    coStudents: 0,
    total: 1
  })



  // Booking form state
  const [location, setLocation] = useState<string>('')
  const [people, setPeople] = useState<number>(1)

  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // Additional booking details
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [bookingStep, setBookingStep] = useState(1) // 1: Details, 2: Payment, 3: Confirmation

  // Calculate max date (2 months from today)
  const maxBookingDate = addMonths(new Date(), 2)

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push('/login')
    }
  }, [user, isLoadingAuth, router])

  // Pre-fill user information when user changes
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata as any
      if (metadata) {
        setCustomerName(`${metadata.firstName || ''} ${metadata.lastName || ''}`.trim())
        setCustomerEmail(user.email || '')
        setCustomerPhone(metadata.contactNumber || '')
      }
    }
  }, [user])

  // Prefill form with data from landing page
  useEffect(() => {
    // 1) pull raw strings
    const locStr = searchParams.get('location')
    const peopleParam = searchParams.get('people')
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')

    // 2) parse your breakdown
    // Get breakdown parameters
    // parse breakdown from URL
    const cW = parseInt(searchParams.get('coWorkers') ?? '1', 10)
    const cT = parseInt(searchParams.get('coTutors') ?? '0', 10)
    const cS = parseInt(searchParams.get('coStudents') ?? '0', 10)
    const total = cW + cT + cS

    // Set location with a small delay to ensure Select component is ready
    if (locStr) {
      setLocation(locStr)
      // Force a re-render if needed
      setTimeout(() => {
        setLocation(locStr)
      }, 100)
    }

    // set booking fields
    if (peopleParam) setPeople(parseInt(peopleParam))
    if (locStr) setLocation(locStr)
    if (startStr) setStartDate(parseISO(startStr))
    if (endStr) setEndDate(parseISO(endStr))

    setPeopleBreakdown({ coWorkers: cW, coTutors: cT, coStudents: cS, total })
    setPeople(total)


    // // Set breakdown if any of the parameters do not exist
    // if (!coWorkers || !coTutors || !coStudents) {
    //   const newBreakdown = {
    //     coWorkers: coWorkersParam ? parseInt(coWorkersParam) : 1,
    //     coTutors: coTutorsParam ? parseInt(coTutorsParam) : 0,
    //     coStudents: coStudentsParam ? parseInt(coStudentsParam) : 0,
    //     total: 0
    //   }
    //   newBreakdown.total = newBreakdown.coWorkers + newBreakdown.coTutors + newBreakdown.coStudents
    //   setPeopleBreakdown(newBreakdown)

    //   // Set people count to match breakdown total when loading from URL
    //   setPeople(newBreakdown.total)
    // }
    // else{
    //   setPeopleBreakdown({ coWorkers: cW, coTutors: cT, coStudents: cS, total })
    //   setPeople(total)

    // }
  }, [searchParams])



  // useEffect(() => {
  //   if (peopleBreakdown.total !== people) {
  //     setPeople(peopleBreakdown.total)
  //   }
  // }, [peopleBreakdown.total, people])
  const handlePeopleChange = (newPeople: number) => {
    setPeople(newPeople)
    if (peopleBreakdown.total !== newPeople) {
      setPeopleBreakdown(prev => ({
        ...prev,
        total: newPeople,
        coWorkers: Math.max(1, newPeople - prev.coTutors - prev.coStudents)
      }))
    }
  }

  const handleBreakdownChange = (newBreakdown: typeof peopleBreakdown) => {
    setPeopleBreakdown(newBreakdown)
    if (people !== newBreakdown.total) {
      setPeople(newBreakdown.total)
    }
  }

  const handleStartChange = (date: Date | null) => {
    setStartDate(date)
    // Clear end date when start date changes to force reselection
    setEndDate(null)
  }

  const handleEndChange = (date: Date | null) => {
    setEndDate(date)
  }

  // Get constraints for end date selection
  const getEndDateConstraints = () => {
    if (!startDate) return { minDate: new Date(), maxDate: maxBookingDate }

    // End date can be same day or next day
    const minEndDate = startDate
    const maxEndDate = addDays(startDate, 1) // Allow booking until next day

    return {
      minDate: minEndDate,
      maxDate: maxEndDate > maxBookingDate ? maxBookingDate : maxEndDate
    }
  }

  // Get time constraints for end time selection
  const getEndTimeConstraints = () => {
    // return block @start
    if (!startDate || !endDate) {
      return {
        minTime: setHours(setMinutes(new Date(), 0), 0),
        maxTime: setHours(setMinutes(new Date(), 59), 23)
      }
    }

    // Minimum end time is start time + 30 minutes
    const minEndTime = new Date(startDate.getTime() + 30 * 60 * 1000)

    // If end date is same day as start date
    if (isSameDay(startDate, endDate)) {
      return {
        minTime: minEndTime, // Must be at least 30 minutes after start time
        maxTime: setHours(setMinutes(endDate, 59), 23) // Until 11:59 PM same day
      }
    }

    // If end date is next day
    const nextDay = addDays(startDate, 1)
    if (isSameDay(endDate, nextDay)) {
      return {
        minTime: setHours(setMinutes(endDate, 0), 0), // From 12:00 AM next day
        maxTime: setHours(setMinutes(endDate, 0), 12) // Until 12:00 PM next day
      }
    }

    return {
      minTime: setHours(setMinutes(new Date(), 0), 0),
      maxTime: setHours(setMinutes(new Date(), 59), 23)
    }
  }

  // Get constraints when no end date is selected yet (for initial filtering)
  const getInitialEndTimeConstraints = () => {
    if (!startDate) return {
      minTime: setHours(setMinutes(new Date(), 0), 0),
      maxTime: setHours(setMinutes(new Date(), 59), 23)
    }

    // Minimum end time is start time + 30 minutes
    const minEndTime = new Date(startDate.getTime() + 30 * 60 * 1000) // Add 30 minutes

    // For today's date, start from the start time + 30 min
    const today = new Date()
    if (isSameDay(startDate, today)) {
      return {
        minTime: minEndTime,
        maxTime: setHours(setMinutes(today, 59), 23)
      }
    }

    // For future dates, still need 30 min minimum
    return {
      minTime: minEndTime,
      maxTime: setHours(setMinutes(new Date(), 59), 23)
    }
  }



  // Get minimum start time
  const getStartTimeConstraints = () => {
    const selectedDate = startDate || new Date()
    const today = new Date()

    // If booking for today, minimum time is current time
    if (isSameDay(selectedDate, today)) {
      return {
        minTime: new Date(),
        maxTime: setHours(setMinutes(new Date(), 59), 23) // Until 11:59 PM
      }
    }

    // For future dates, allow full day
    return {
      minTime: setHours(setMinutes(new Date(), 0), 0), // From 12:00 AM
      maxTime: setHours(setMinutes(new Date(), 59), 23) // Until 11:59 PM
    }
  }




  // Validate booking constraints
  const validateBookingConstraints = () => {
    if (!startDate || !endDate) return { isValid: false, message: 'Please select both start and end times' }

    // Validate booking time constraints
    if (endDate <= startDate) {
      return { isValid: false, message: 'End time must be after start time' }
    }

    // Check if it is a valid cross-day booking
    const timeDifferenceHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    const daysDifference = Math.floor(timeDifferenceHours / 24)

    if (daysDifference > 1) {
      return {
        isValid: false,
        message: 'Bookings can only span maximum 2 days from start date to end date (e.g., 11 PM today to 12 PM tomorrow)'
      }
    }

    // If it's a next-day booking, validate time constraints
    if (daysDifference === 1) {
      const startHour = startDate.getHours()
      const endHour = endDate.getHours()

      // Business rule: Cross-day bookings only allowed from 5 PM to 12 PM next day
      if (startHour < 17 || endHour > 12) {
        return {
          isValid: false,
          message: 'Cross-day bookings are only allowed from 5 PM to 12 PM next day'
        }
      }
    }

    return { isValid: true, message: '' }
  }


  //

  // memoize to keep identity stable
  const handleStudentValidationChange = useCallback((allValid: boolean, students: any[]) => {
    setStudentsValidated(allValid)
    setValidatedStudents(students)
    console.log('Student validation changed:', { allValid, students })
  }, [])



  const selectedLocation = locations.find(loc => loc.id === location)
  const totalHours = startDate && endDate ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60))) : 0
  const baseSubtotal = selectedLocation ? selectedLocation.price * totalHours * people : 0

  // Calculate discount if voucher is applied
  const discountInfo = appliedVoucher ? calculateDiscount(baseSubtotal, appliedVoucher) : null
  const subtotal = discountInfo ? discountInfo.finalPrice : baseSubtotal
  const discountAmount = discountInfo ? discountInfo.discountAmount : 0

  const tax = subtotal * 0.09 // 9% tax
  const total = subtotal + tax

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Double-check user is logged in
    if (!user) {
      router.push('/login')
      return
    }

    // Validate seat selection
    if (selectedSeats.length !== people) {
      alert(`Please select exactly ${people} seat${people !== 1 ? 's' : ''} for your booking.`)
      return
    }

    // Validate booking constraints
    const validation = validateBookingConstraints()
    if (!validation.isValid) {
      alert(validation.message)
      return
    }

    setIsLoading(true)

    try {
      // Prepare booking payload
      const locationData = locations.find(loc => loc.id === location)
      const memberType = peopleBreakdown.coStudents > 0 ? 'STUDENT' : 
                        peopleBreakdown.coTutors > 0 ? 'TUTOR' : 'MEMBER'
      
      const bookingPayload = {
        userId: user.id,
        location: locationData?.name || location,
        startAt: startDate?.toISOString(),
        endAt: endDate?.toISOString(),
        specialRequests: specialRequests || null,
        seatNumbers: selectedSeats,
        pax: people,
        students: peopleBreakdown.coStudents,
        members: peopleBreakdown.coWorkers,
        tutors: peopleBreakdown.coTutors,
        totalCost: total,
        discountId: appliedVoucher?.id || null,
        totalAmount: total,
        memberType: memberType,
        // memberType: 'STUDENT',
        bookedForEmails: [customerEmail],
        confirmedPayment: false,
         bookingRef: `BOOK${Date.now().toString().slice(-6)}`,
        paymentId: null,
        bookedAt: new Date().toISOString()
      }

      // Call the create booking API
      const apiUrl = `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/booking/create`;

      // Call the create booking API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create booking')
      }

      const result = await response.json()
      console.log('Booking created successfully:', result)
      
      // Store booking data for payment step
      // You might want to store this in state or context
      localStorage.setItem('currentBooking', JSON.stringify(result.booking))
      
      // Move to payment step
      setBookingStep(2)
      
    } catch (error) {
      console.error('Error creating booking:', error)
      alert(`Failed to create booking: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }


  // Get constraints for the DatePicker components
  const { minDate: endMinDate, maxDate: endMaxDate } = getEndDateConstraints()
  const endTimeConstraints = endDate ? getEndTimeConstraints() : getInitialEndTimeConstraints()

  const isFormValid =
    location &&
    people &&
    startDate &&
    endDate &&
    customerName &&
    customerEmail &&
    customerPhone &&
    (peopleBreakdown.coStudents === 0 || studentsValidated) && // Only require validation if there are students
    selectedSeats.length === people &&
    user;

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Guest Warning Alert */}
          {!user && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Sign In Required</AlertTitle>
              <AlertDescription className="text-orange-700">
                You must be signed in as a member to make bookings.
                <Button
                  variant="link"
                  className="px-2 text-orange-600 hover:text-orange-800"
                  onClick={() => router.push('/login')}
                >
                  Sign in now
                </Button>
                to continue with your booking.
              </AlertDescription>
            </Alert>
          )}
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Complete Your Booking</h1>
            <p className="text-lg text-gray-600">Secure your co-working space in just a few steps</p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              {[
                { step: 1, title: 'Details', icon: Calendar },
                { step: 2, title: 'Payment', icon: CreditCard },
                { step: 3, title: 'Confirmation', icon: Shield }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${bookingStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {bookingStep > step ? '✓' : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${bookingStep >= step ? 'text-orange-500' : 'text-gray-500'
                    }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Booking Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingStep === 1 && (
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      {/* Workspace Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Select value={location} onValueChange={setLocation} disabled={!user}>
                            <SelectTrigger className={!user ? "bg-gray-50" : ""}>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map(loc => (
                                <SelectItem key={loc.id} value={loc.id}>
                                  {loc.name} - ${loc.price}/hour
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Number of People</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className={`w-full justify-start ${!user ? "bg-gray-50" : ""}`} disabled={!user}>
                                <Users className="w-4 h-4 mr-2" />
                                {people} {people === 1 ? 'Person' : 'People'}
                                {peopleBreakdown.coTutors > 0 || peopleBreakdown.coStudents > 0 ? (
                                  <span className="ml-2 text-xs text-gray-500">
                                    ({peopleBreakdown.coWorkers}💼 {peopleBreakdown.coTutors}👩‍🏫 {peopleBreakdown.coStudents}🎓)
                                  </span>
                                ) : null}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="start" className="w-auto">
                              <PeopleSelector
                                value={people}
                                min={1}
                                max={20}
                                onChange={handlePeopleChange}
                                showBreakdown={true}
                                onBreakdownChange={handleBreakdownChange}
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      {/* Date & Time Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label>Start Date & Time</Label>
                          {/* Get minimum start time constraints */}
                          <DatePicker
                            selected={startDate}
                            onChange={handleStartChange}
                            selectsStart
                            startDate={startDate}
                            endDate={endDate}
                            showTimeSelect
                            timeIntervals={15}
                            dateFormat="MMM d, yyyy h:mm aa"
                            placeholderText="Select start time"
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!user ? "bg-gray-50" : ""}`}
                            minDate={new Date()}
                            maxDate={maxBookingDate}
                            {...getStartTimeConstraints()}
                            disabled={!user}
                          />
                        </div>

                        <div>
                          <Label>End Date & Time</Label>
                          {/* Get end time constraints */}
                          <DatePicker
                            selected={endDate}
                            onChange={handleEndChange}
                            selectsEnd
                            startDate={startDate}
                            endDate={endDate}
                            minDate={endMinDate}
                            maxDate={endMaxDate}
                            showTimeSelect
                            timeIntervals={15}
                            dateFormat="MMM d, yyyy h:mm aa"
                            placeholderText="Select end time"
                            className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent ${!user ? "bg-gray-50" : ""}`}
                            disabled={!startDate || !user}
                            {...endTimeConstraints}
                          />
                          {startDate && (
                            <p className="text-xs text-gray-500 mt-1">
                              💡 You can book across days (e.g., 11 PM today to 1 AM tomorrow)
                            </p>
                          )}
                        </div>
                      </div>
                      {peopleBreakdown.coStudents > 0 && user && (
                        <div>
                          <StudentValidation
                            numberOfStudents={peopleBreakdown.coStudents}
                            onValidationChange={handleStudentValidationChange}
                          />
                        </div>
                      )}

                      {/* Customer Information */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter your full name"
                              required
                              disabled={!user}
                              className={!user ? "bg-gray-50" : ""}
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                              disabled={!user}
                              className={!user ? "bg-gray-50" : ""}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter your phone number"
                              required
                              disabled={!user}
                              className={!user ? "bg-gray-50" : ""}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Special Requests */}
                      <div>
                        <Label htmlFor="requests">Special Requests (Optional)</Label>
                        <Textarea
                          id="requests"
                          value={specialRequests}
                          onChange={(e) => setSpecialRequests(e.target.value)}
                          placeholder="Any special requirements or requests?"
                          rows={3}
                          disabled={!user}
                          className={!user ? "bg-gray-50" : ""}
                        />
                      </div>
                      {/* seat selection */}
                      {user && (
                        <div>
                          <Label>Select Your Seat(s)</Label>
                          <p className="text-sm text-gray-600 mb-2">
                            Please select exactly {people} seat{people !== 1 ? 's' : ''} for your booking.
                          </p>
                          <SeatPicker
                            layout={DEMO_LAYOUT}
                            tables={DEMO_TABLES}
                            labels={DEMO_LABELS}
                            bookedSeats={[]}
                            overlays={OVERLAYS}
                            maxSeats={people} //Pass the number of people as max seats
                            onSelectionChange={setSelectedSeats}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-sm text-gray-600">
                              Selected: {selectedSeats.join(', ') || 'none'}
                            </p>
                            {selectedSeats.length !== people && (
                              <p className="text-sm text-orange-600">
                                {selectedSeats.length < people
                                  ? `Please select ${people - selectedSeats.length} more seat${people - selectedSeats.length !== 1 ? 's' : ''}`
                                  : `Please deselect ${selectedSeats.length - people} seat${selectedSeats.length - people !== 1 ? 's' : ''}`
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      )}



                      {/* ── ENTITLEMENT TABS ───────────────────────────── */}
                      {user && (
                        <EntitlementTabs
                          mode={entitlementMode}
                          onChange={(mode, val) => {
                            setEntitlementMode(mode)
                            if (mode === 'package') {
                              setSelectedPackage(val)
                              setPromoCode('')
                              setPromoValid(false)
                              setAppliedVoucher(null)
                            } else {
                              setPromoCode(val)
                              setPromoValid(!!val)
                              setSelectedPackage('')
                              // Set applied voucher if valid promo code
                              const voucher = Object.values(TEST_VOUCHERS).find(v => v.code === val)
                              setAppliedVoucher(voucher || null)
                            }
                          }}
                          selectedPackage={selectedPackage}
                          promoCode={promoCode}
                          promoValid={promoValid}
                          testVouchers={TEST_VOUCHERS}
                        />
                      )}
                      {/* ──────────────────────────────────────────────── */}

                      <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={
                          !isFormValid ||
                          (entitlementMode === 'package' && !selectedPackage) ||
                          (entitlementMode === 'promo' && !promoValid) ||
                          isLoading ||
                          !user
                        }
                      >
                        {!user
                          ? 'Sign In Required'
                          : selectedSeats.length !== people
                            ? `Select ${people} Seat${people !== 1 ? 's' : ''} to Continue`
                            : (isLoading ? 'Processing...' : 'Continue to Payment')
                        }
                      </Button>

                      {!user && (
                        <p className="text-center text-sm text-gray-600 mt-2">
                          <Button
                            type="button"
                            variant="link"
                            className="text-orange-600 hover:text-orange-800 p-0"
                            onClick={() => router.push('/login')}
                          >
                            Sign in
                          </Button>
                          {' '}to make your booking
                        </p>
                      )}
                    </form>
                  )}

                  {bookingStep === 2 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium">Payment Information</h3>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-4">
                          hitpay demo integration here...
                          <PaymentStep
                            subtotal={subtotal}
                            tax={tax}
                            total={total}
                            discountAmount={discountAmount}
                            appliedVoucher={appliedVoucher}
                            selectedPackage={selectedPackage}
                            customer={{ name: customerName, email: customerEmail, phone: customerPhone }}
                            onBack={() => setBookingStep(1)}
                            onComplete={() => setBookingStep(3)}
                          />
                        </p>
                        <Button
                          onClick={() => setBookingStep(3)}
                          className="w-full bg-orange-500 hover:bg-orange-600"
                        >
                          Complete Booking (Demo)
                        </Button>
                      </div>
                    </div>

                  )}

                  {bookingStep === 3 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h3>
                      <p className="text-gray-600 mb-6">
                        Your booking has been confirmed. You will receive a confirmation email shortly.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-left">
                        <p className="text-sm text-gray-600">Booking Reference: #BK{Date.now().toString().slice(-6)}</p>
                      </div>
                      <Button
                        onClick={() => router.push('/dashboard')}
                        className="mt-6 bg-orange-500 hover:bg-orange-600"
                      >
                        View My Bookings
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user && (
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4 text-center">
                      <p className="text-sm text-orange-800 font-medium">Member Booking</p>
                      <p className="text-xs text-orange-700 mt-1">Sign in to view pricing</p>
                    </div>
                  )}
                  {selectedLocation && user && (
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="font-medium">{selectedLocation.name}</p>
                          <p className="text-sm text-gray-600">{selectedLocation.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span>{people} {people === 1 ? 'Person' : 'People'}</span>
                      </div>

                      {startDate && endDate && (
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm">
                              {startDate.toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                              {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {totalHours > 0 && user && (
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Rate (${selectedLocation?.price}/hour)</span>
                        <span>${selectedLocation?.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Duration</span>
                        <span>{totalHours} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>People</span>
                        <span>{people}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Base Subtotal</span>
                        <span>${baseSubtotal}</span>
                      </div>

                      {/* Show discount if applied */}
                      {appliedVoucher && discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount ({appliedVoucher.code})</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}

                      {selectedPackage && (
                        <div className="flex justify-between text-blue-600">
                          <span>Package Applied</span>
                          <span>Pass Used</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${subtotal}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>GST (9%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  )
}