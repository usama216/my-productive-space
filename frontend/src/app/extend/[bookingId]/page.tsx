'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  CreditCard,
  Shield
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SeatPicker, SeatMeta, OverlayMeta, TableMeta, LabelMeta } from '@/components/book-now-sections/SeatPicker'
import PaymentStep from '@/components/book-now/PaymentStep'
import { useAuth } from '@/hooks/useAuth'
import { getAllPricingForLocation } from '@/lib/pricingService'
import { 
  toLocalTime,
  formatLocalDate,
  formatLocalDateOnly,
  formatLocalTimeOnly 
} from '@/lib/timezoneUtils'

export default function ExtendBookingPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  
  const bookingId = params.bookingId as string
  
  // Check for payment confirmation from URL
  const [searchParams] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search)
    }
    return new URLSearchParams()
  })
  
  // Check if this is a payment confirmation
  const isPaymentConfirmation = searchParams.get('step') === '3' && searchParams.get('extension') === 'true'
  const paymentId = searchParams.get('paymentId') || searchParams.get('reference')
  const status = searchParams.get('status')
  
  // Get extension data from URL parameters
  const urlExtensionHours = searchParams.get('extensionHours')
  const urlExtensionCost = searchParams.get('extensionCost')
  const urlNewEndAt = searchParams.get('newEndAt')
  const urlSeatNumbers = searchParams.get('seatNumbers')
  const urlOriginalEndAt = searchParams.get('originalEndAt')
  
  // Debug URL parameters
  console.log('URL params:', { isPaymentConfirmation, paymentId, status })
  console.log('Extension params:', { urlExtensionHours, urlExtensionCost, urlNewEndAt, urlSeatNumbers })
  console.log('All search params:', Object.fromEntries(searchParams.entries()))
  
  // State
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availableSeats, setAvailableSeats] = useState<string[]>([])
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [checkingSeats, setCheckingSeats] = useState(false)
  const [requiresSeatSelection, setRequiresSeatSelection] = useState(false)
  const [currentStep, setCurrentStep] = useState(isPaymentConfirmation ? 3 : 1) // 1: Time Selection, 2: Payment, 3: Confirmation
  const [extensionConfirmed, setExtensionConfirmed] = useState(false)
  const [originalBooking, setOriginalBooking] = useState<any>(null)
  const [originalEndTime, setOriginalEndTime] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'payNow' | 'creditCard'>('payNow')
  const [paymentTotal, setPaymentTotal] = useState(0)
  
  // Form state
  const [originalEndDate, setOriginalEndDate] = useState<Date | null>(null)
  const [newEndDate, setNewEndDate] = useState<Date | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [extendedHours, setExtendedHours] = useState(0)
  const [extensionCost, setExtensionCost] = useState(0)

  // Pricing state
  const [pricing, setPricing] = useState({
    student: { oneHourRate: 4.00, overOneHourRate: 3.00 },
    member: { oneHourRate: 5.00, overOneHourRate: 4.00 },
    tutor: { oneHourRate: 6.00, overOneHourRate: 5.00 }
  })

  // Seat layout configuration (same as book-now page)
  const DEMO_LAYOUT: SeatMeta[] = [
    { id: 'S1', x: 120, y: 80, shape: 'circle', size: 20 },
    { id: 'S2', x: 120, y: 160, shape: 'circle', size: 20 },
    { id: 'S3', x: 120, y: 260, shape: 'circle', size: 20 },
    { id: 'S4', x: 120, y: 310, shape: 'circle', size: 20 },
    { id: 'S5', x: 120, y: 400, shape: 'circle', size: 20 },
    { id: 'S6', x: 120, y: 450, shape: 'circle', size: 20 },
    { id: 'S7', x: 300, y: 90, shape: 'circle', size: 20 },
    { id: 'S8', x: 300, y: 170, shape: 'circle', size: 20 },
    { id: 'S9', x: 300, y: 220, shape: 'circle', size: 20 },
    { id: 'S12', x: 300, y: 400, shape: 'circle', size: 20 },
    { id: 'S13', x: 300, y: 460, shape: 'circle', size: 20 },
    { id: 'S10', x: 260, y: 280, shape: 'circle', size: 20 },
    { id: 'S11', x: 260, y: 330, shape: 'circle', size: 20 },
    { id: 'S14', x: 260, y: 520, shape: 'circle', size: 20 },
    { id: 'S15', x: 260, y: 570, shape: 'circle', size: 20 },
  ]

  const DEMO_TABLES: TableMeta[] = [
    { id: 'T1', shape: 'rect', x: 80, y: 80, width: 40, height: 80 },
    { id: 'T2', shape: 'rect', x: 80, y: 160, width: 40, height: 80 },
    { id: 'T4', shape: 'rect', x: 80, y: 425, width: 40, height: 100 },
    { id: 'T3', shape: 'circle', x: 60, y: 285, radius: 40 },
    { id: 'T5', shape: 'rect', x: 340, y: 90, width: 40, height: 80 },
    { id: 'T6', shape: 'rect', x: 340, y: 195, width: 40, height: 100 },
    { id: 'T8', shape: 'rect', x: 340, y: 400, width: 40, height: 60 },
    { id: 'T9', shape: 'rect', x: 340, y: 460, width: 40, height: 60 },
    { id: 'T7', shape: 'circle', x: 320, y: 300, radius: 40 },
    { id: 'T10', shape: 'rect', x: 320, y: 520, width: 100, height: 40 },
    { id: 'T10a', shape: 'rect', x: 320, y: 560, width: 100, height: 40 },
  ]

  const DEMO_LABELS: LabelMeta[] = [
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
  ]

  const OVERLAYS: OverlayMeta[] = [
    { id: 'door', src: '/seat_booking_img/door.png', x: 0, y: 0, width: 60, height: 50 },
    { id: 'legend', src: '/seat_booking_img/legend_img.png', x: 135, y: 0, width: 150, height: 100 },
    { id: 'pantry', src: '/seat_booking_img/pantry.png', x: 0, y: 515, width: 100, height: 80 },
    { id: 'toilet', src: '/seat_booking_img/toilet.png', x: 100, y: 535, width: 80, height: 60 },
    { id: 'monitor_left1', src: '/seat_booking_img/monitor_L.png', x: 20, y: 60, width: 16, height: 24 },
    { id: 'monitor_left2', src: '/seat_booking_img/monitor_L.png', x: 20, y: 140, width: 16, height: 24 },
    { id: 'monitor_left3', src: '/seat_booking_img/monitor_L.png', x: 20, y: 415, width: 16, height: 24 },
    { id: 'monitor_right1', src: '/seat_booking_img/monitor_R.png', x: 365, y: 185, width: 16, height: 24 },
    { id: 'monitor_right2', src: '/seat_booking_img/monitor_R.png', x: 360, y: 285, width: 16, height: 24 },
    { id: 'monitor_right3', src: '/seat_booking_img/monitor_R.png', x: 380, y: 520, width: 16, height: 24 },
  ]

  // Filter function to only allow 15-minute intervals and times after original end time
  const filterTime = (time: Date): boolean => {
    const minutes = time.getMinutes()
    // Only allow :00, :15, :30, :45
    if (minutes % 15 !== 0) return false
    
    // If original end date exists, only allow times after it
    if (originalEndDate && newEndDate) {
      // Check if the SELECTED date (newEndDate) is the same as original end date
      const selectedDateIsSameDay = 
        newEndDate.getFullYear() === originalEndDate.getFullYear() &&
        newEndDate.getMonth() === originalEndDate.getMonth() &&
        newEndDate.getDate() === originalEndDate.getDate()
      
      if (selectedDateIsSameDay) {
        // Only allow times after the original end time (on same day)
        return time.getTime() > originalEndDate.getTime()
      }
      
      // If selected date is a different day (future), allow all times
      return true
    }
    
    return true
  }

  // Load booking details and pricing
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load booking details
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/booking/${bookingId}`)
        if (!response.ok) {
          throw new Error('Failed to load booking')
        }
        
        const data = await response.json()
        if (data.success && data.booking) {
          const bookingData = data.booking
          setBooking(bookingData)
          setOriginalBooking(bookingData) // Store original booking data
          
          // Debug booking data
          console.log('Booking loaded:', bookingData)
          
          // If booking is already confirmed and we're on confirmation step, set extension as confirmed
          if (bookingData.confirmedPayment && currentStep === 3) {
            setExtensionConfirmed(true)
          }
          
          // Set original end date and pre-fill new end date
          // Convert UTC time from API to local time
          const originalEnd = toLocalTime(bookingData.endAt)
          setOriginalEndDate(originalEnd)
          setNewEndDate(originalEnd)
          
          // Store the original end time from the booking (before any extension)
          // This will be used to calculate the actual extension hours
          // Only set if booking is not already confirmed (to preserve original end time)
          if (!originalEndTime && !bookingData.confirmedPayment) {
            setOriginalEndTime(bookingData.endAt)
          }
          setSelectedSeats(bookingData.seatNumbers || [])
          
          // Check if extension is allowed (skip check if this is payment confirmation)
          if (!bookingData.confirmedPayment && !isPaymentConfirmation) {
            toast({
              title: "Cannot Extend",
              description: "Only paid bookings can be extended",
              variant: "destructive"
            })
          
            return
          }
        } else {
          throw new Error('Booking not found')
        }
        
        // Load pricing
        const allPricing = await getAllPricingForLocation('Kovan')
        setPricing(allPricing)
        
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive"
        })
        // router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      loadData()
    }
  }, [bookingId, router, toast])

  // Handle payment confirmation
  useEffect(() => {
    const handlePaymentConfirmation = async () => {
      if (isPaymentConfirmation && paymentId && status === 'completed' && booking && !extensionConfirmed) {
        try {
          console.log('Processing payment confirmation for extension:', { paymentId, status, bookingId })
          console.log('Extension data:', { newEndDate, selectedSeats, extendedHours, extensionCost })
          
          // Get extension data from URL parameters or state
          const extensionData = {
            newEndAt: urlNewEndAt || newEndDate?.toISOString() || booking.endAt,
            seatNumbers: urlSeatNumbers ? JSON.parse(urlSeatNumbers) : (selectedSeats.length > 0 ? selectedSeats : booking.seatNumbers),
            extensionHours: parseFloat(urlExtensionHours) || extendedHours || 0,
            extensionCost: parseFloat(urlExtensionCost) || extensionCost || 0,
            originalEndAt: urlOriginalEndAt || originalEndTime || booking.endAt
          }
          
          // Set original end time from URL if available
          if (urlOriginalEndAt && !originalEndTime) {
            setOriginalEndTime(urlOriginalEndAt)
          }
          
          console.log('Using extension data:', extensionData)
          
          // Call backend to confirm extension payment
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/booking/confirm-extension-payment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              bookingId: bookingId,
              paymentId: paymentId,
              extensionData: extensionData
            })
          })

          if (response.ok) {
            const result = await response.json()
            if (result.success) {
              console.log('Extension confirmed successfully:', result)
              setExtensionConfirmed(true)
              setCurrentStep(3)
              
              // Handle already confirmed case
              if (result.alreadyConfirmed) {
                toast({
                  title: "Extension Already Confirmed",
                  description: "This booking extension has already been confirmed successfully.",
                })
                // Update booking with confirmed data and set original end time
                setBooking(result.booking)
                if (result.originalEndTime) {
                  setOriginalEndTime(result.originalEndTime)
                }
                return
              }
              
              // Calculate actual extension hours from booking data
              // Use the stored originalEndTime (before extension) or fall back to current booking endAt
              const originalEnd = originalEndTime ? toLocalTime(originalEndTime) : toLocalTime(booking.endAt)
              const newEndTime = toLocalTime(result.booking.endAt)
              const actualExtensionHours = (newEndTime.getTime() - originalEnd.getTime()) / (1000 * 60 * 60)
              
              console.log('Extension calculation:', {
                originalEndTime: originalEnd.toISOString(),
                newEndTime: newEndTime.toISOString(),
                actualExtensionHours: actualExtensionHours
              })
              
              // Update booking data with new end time (keep original payment status)
              setBooking(prev => ({
                ...prev,
                endAt: result.booking.endAt,
                seatNumbers: result.booking.seatNumbers,
                totalCost: result.booking.totalCost,
                totalAmount: result.booking.totalAmount,
                // Don't change confirmedPayment - keep original status
                // paymentId: paymentId // Don't change original payment ID
              }))
              
              toast({
                title: "Extension Confirmed",
                description: `Your booking has been extended by ${actualExtensionHours.toFixed(2)} hours`,
              })
            } else {
              throw new Error(result.message || 'Failed to confirm extension')
            }
          } else {
            const errorData = await response.json()
            throw new Error(errorData.message || 'Failed to confirm extension payment')
          }
        } catch (error) {
          console.error('Error confirming extension payment:', error)
          
          // Check if it's already confirmed error
          if (error instanceof Error && (error.message.includes('already confirmed') || error.message.includes('duplicate') || error.message.includes('already exists') || error.message.includes('Extension already confirmed'))) {
            toast({
              title: "Extension Already Confirmed",
              description: "This booking extension has already been confirmed successfully.",
            })
            setExtensionConfirmed(true)
            setCurrentStep(3)
          } else {
            toast({
              title: "Extension Failed",
              description: error instanceof Error ? error.message : "Failed to confirm extension",
              variant: "destructive"
            })
            setCurrentStep(1)
          }
        }
      }
    }

    handlePaymentConfirmation()
  }, [isPaymentConfirmation, paymentId, status, booking, extensionConfirmed, bookingId, newEndDate, selectedSeats, extendedHours, extensionCost, toast, urlExtensionHours, urlExtensionCost, urlNewEndAt, urlSeatNumbers, urlOriginalEndAt, originalEndTime])

  // Calculate extension cost when end date changes
  useEffect(() => {
    if (originalEndDate && newEndDate && booking) {
      const hoursDiff = (newEndDate.getTime() - originalEndDate.getTime()) / (1000 * 60 * 60)
      setExtendedHours(Math.max(0, hoursDiff))
      
      if (hoursDiff > 0) {
        // Determine member type for pricing
        const memberType = booking.memberType || 'MEMBER'
        const rate = hoursDiff === 1 ? 
          pricing[memberType.toLowerCase() as keyof typeof pricing]?.oneHourRate || 5.00 :
          pricing[memberType.toLowerCase() as keyof typeof pricing]?.overOneHourRate || 4.00
        
        setExtensionCost(hoursDiff * rate * booking.pax)
      } else {
        setExtensionCost(0)
      }
    }
  }, [originalEndDate, newEndDate, booking, pricing])

  // Check seat availability when end date changes
  useEffect(() => {
    const checkSeatAvailability = async () => {
      if (!newEndDate || !booking || !originalEndDate) {
        return
      }

      // Only check if extending beyond original end time
      if (newEndDate <= originalEndDate) {
        setRequiresSeatSelection(false)
        setAvailableSeats([])
        setOccupiedSeats([])
        return
      }

      try {
        setCheckingSeats(true)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/booking/getBookedSeats`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            location: booking.location,
            startAt: originalEndDate.toISOString().replace('T', ' ').replace('Z', ''),
            endAt: newEndDate.toISOString().replace('T', ' ').replace('Z', '')
          })
        })

        if (response.ok) {
          const data = await response.json()
          setAvailableSeats(data.availableSeats || [])
          setOccupiedSeats(data.bookedSeats || [])
          
          // Check if original seats are still available
          const originalSeats = booking.seatNumbers || []
          const conflictingSeats = originalSeats.filter(seat => 
            data.bookedSeats?.includes(seat)
          )
          
          if (conflictingSeats.length > 0) {
            setRequiresSeatSelection(true)
            setSelectedSeats([])
          } else {
            setRequiresSeatSelection(false)
            setSelectedSeats(originalSeats)
          }
        }
      } catch (error) {
        console.error('Error checking seat availability:', error)
      } finally {
        setCheckingSeats(false)
      }
    }

    // Debounce the seat check
    const timeoutId = setTimeout(checkSeatAvailability, 500)
    return () => clearTimeout(timeoutId)
  }, [newEndDate, booking, originalEndDate])

  const handleSubmit = async () => {
    if (!newEndDate || !booking) {
      toast({
        title: "Missing Information",
        description: "Please select new end time",
        variant: "destructive"
      })
      return
    }

    if (newEndDate <= originalEndDate!) {
      toast({
        title: "Invalid Extension",
        description: "New end time must be after current end time",
        variant: "destructive"
      })
      return
    }

    if (requiresSeatSelection && selectedSeats.length !== booking.pax) {
      toast({
        title: "Seat Selection Required",
        description: `Please select ${booking.pax} seat${booking.pax > 1 ? 's' : ''} for the extended time`,
        variant: "destructive"
      })
      return
    }

    if (extensionCost <= 0) {
      toast({
        title: "Invalid Extension",
        description: "Extension cost must be greater than 0",
        variant: "destructive"
      })
      return
    }

    // Move to payment step instead of directly extending
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePaymentMethodChange = (method: 'payNow' | 'creditCard', newTotal: number) => {
    setSelectedPaymentMethod(method)
    setPaymentTotal(newTotal)
  }

  const handlePaymentComplete = async () => {
    // This function is no longer needed as payment confirmation is handled by useEffect
    // when user returns from payment gateway
    console.log('Payment completed, waiting for confirmation...')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
          <p className="text-gray-600 mb-4">The booking you're trying to extend doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Extend Booking</h1>
          <p className="text-gray-600 mt-2">
            Extend your booking time. You'll be charged for the additional time.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            {[
              { step: 1, title: 'Time Selection', icon: Clock },
              { step: 2, title: 'Payment', icon: CreditCard },
              { step: 3, title: 'Confirmation', icon: Shield }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step ? '✓' : <Icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  currentStep >= step ? 'text-orange-500' : 'text-gray-500'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Extension Details */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Booking Info */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Current Booking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-medium">Reference:</span>
                    <span className="ml-2 font-mono">{booking.bookingRef}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{booking.location}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <div>
                      <div>{formatLocalDate(toLocalTime(booking.startAt))}</div>
                      <div className="text-gray-500">to {formatLocalDate(toLocalTime(booking.endAt))}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{booking.pax} people</span>
                  </div>
                  
                  {booking.seatNumbers && booking.seatNumbers.length > 0 && (
                    <div className="text-sm">
                      <div className="flex items-center mb-2">
                        <span className="font-medium">Current Seats:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {booking.seatNumbers.map((seat: string, index: number) => (
                          <Badge key={index} variant="outline">
                            {seat}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Extension Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Extend Booking Time</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Time Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label>Current End Time (Fixed)</Label>
                      <Input
                        value={originalEndDate ? formatLocalDate(originalEndDate) : ''}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <div>
                      <Label>New End Time *</Label>
                      <DatePicker
                        selected={newEndDate}
                        onChange={setNewEndDate}
                        showTimeSelect
                        timeIntervals={15}
                        filterTime={filterTime}
                        dateFormat="MMM d, yyyy h:mm aa"
                        placeholderText="Select new end time"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        minDate={originalEndDate || new Date()}
                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}
                        minTime={
                          newEndDate && originalEndDate &&
                          newEndDate.toDateString() === originalEndDate.toDateString()
                            ? originalEndDate  // Same day: start from original end time
                            : new Date(new Date().setHours(0, 0, 0, 0))  // Different day: start from midnight
                        }
                        maxTime={new Date(new Date().setHours(23, 45, 0, 0))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        ⏰ You can only select times after the current end time
                      </p>
                    </div>
                  </div>

                  {/* Timezone Note */}
                  <div className="flex flex-col gap-1">
                    <p className='text-orange-600 border border-orange-600 rounded-md p-1 px-4 text-xs inline-block'>All times are displayed in Singapore timezone (GMT+8)</p>
                  </div>

                  {/* Extension Summary */}
                  {extendedHours > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h3 className="font-medium text-blue-800 mb-2">Extension Summary</h3>
                      <div className="space-y-1 text-sm text-blue-700">
                        <div>Extended by: {extendedHours.toFixed(2)} hours</div>
                        <div>Cost per hour: ${booking.memberType === 'STUDENT' ? '4.00' : booking.memberType === 'TUTOR' ? '6.00' : '5.00'}</div>
                        <div className="font-medium">Total extension cost: ${extensionCost.toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  {/* Seat Availability Status */}
                  {checkingSeats && (
                    <div className="flex items-center text-sm text-orange-600">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Checking seat availability...
                    </div>
                  )}

                  {requiresSeatSelection && !checkingSeats && extendedHours > 0 && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your original seats are not available for the extended time. Please select different seats.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!requiresSeatSelection && !checkingSeats && extendedHours > 0 && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your original seats are available for the extended time.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Seat Selection */}
                  {requiresSeatSelection && !checkingSeats && extendedHours > 0 && (
                    <div>
                      <Label>Select Seats for Extended Time</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose {booking.pax} seat{booking.pax > 1 ? 's' : ''} for the extended time.
                        <span className="ml-2 text-blue-600">
                          ({DEMO_LAYOUT.length - occupiedSeats.length} seats available)
                        </span>
                      </p>
                      
                      <SeatPicker
                        layout={DEMO_LAYOUT}
                        tables={DEMO_TABLES}
                        labels={DEMO_LABELS}
                        bookedSeats={occupiedSeats}
                        overlays={OVERLAYS}
                        maxSeats={booking.pax}
                        onSelectionChange={setSelectedSeats}
                      />
                      
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-600">
                          Selected: {selectedSeats.join(', ') || 'none'}
                        </p>
                        {selectedSeats.length !== booking.pax && (
                          <p className="text-sm text-orange-600">
                            {selectedSeats.length < booking.pax
                              ? `Please select ${booking.pax - selectedSeats.length} more seat${booking.pax - selectedSeats.length !== 1 ? 's' : ''}`
                              : `Please deselect ${selectedSeats.length - booking.pax} seat${selectedSeats.length - booking.pax !== 1 ? 's' : ''}`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/dashboard')}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    
                    <Button 
                      onClick={handleSubmit}
                      disabled={
                        submitting || 
                        checkingSeats || 
                        extendedHours <= 0 || 
                        (requiresSeatSelection && selectedSeats.length !== booking.pax)
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === 2 && booking && (
          <div className="mt-6">
            <PaymentStep
              subtotal={extensionCost}
              total={extensionCost}
              discountAmount={0}
              appliedVoucher={null}
              selectedPackage={null}
              customer={{
                name: user?.name || user?.fullName || 'User',
                email: user?.email || 'user@example.com',
                phone: user?.phone || user?.phoneNumber || '+65 1234 5678'
              }}
              bookingId={bookingId}
              onBack={() => setCurrentStep(1)}
              onComplete={handlePaymentComplete}
              onPaymentMethodChange={handlePaymentMethodChange}
              onCreateBooking={async () => {
                // For extension, we don't need to create a new booking
                // Just return the existing booking ID
                return bookingId
              }}
              onBookingCreated={(bookingId) => {
                console.log('Extension booking ID:', bookingId)
              }}
              isExtension={true}
              extensionData={{
                newEndAt: newEndDate?.toISOString() || '',
                seatNumbers: selectedSeats,
                extensionHours: extendedHours,
                extensionCost: extensionCost,
                originalEndAt: originalEndTime || booking?.endAt || ''
              }}
            />
          </div>
        )}

        {/* Confirmation Step */}
        {currentStep === 3 && booking && (
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Extension Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Booking Extended Successfully</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>Your booking has been extended by {(() => {
                      if (booking && booking.endAt && originalEndTime) {
                        const originalEnd = toLocalTime(originalEndTime)
                        const newEndTime = toLocalTime(booking.endAt)
                        const actualHours = (newEndTime.getTime() - originalEnd.getTime()) / (1000 * 60 * 60)
                        return actualHours.toFixed(2)
                      } else if (booking && booking.endAt && originalEndDate) {
                        const originalEnd = originalEndDate // Already in local time
                        const newEndTime = toLocalTime(booking.endAt)
                        const actualHours = (newEndTime.getTime() - originalEnd.getTime()) / (1000 * 60 * 60)
                        return actualHours.toFixed(2)
                      }
                      return extendedHours.toFixed(2)
                    })()} hours</div>
                    <div>New end time: {booking?.endAt ? formatLocalDate(toLocalTime(booking.endAt)) : (newEndDate ? formatLocalDate(newEndDate) : '')}</div>
                    <div>Extension cost: ${(() => {
                      if (booking && booking.totalAmount && originalBooking) {
                        return (booking.totalAmount - originalBooking.totalAmount).toFixed(2)
                      }
                      return extensionCost.toFixed(2)
                    })()}</div>
                    {booking?.extensionamounts && booking.extensionamounts.length > 0 && (
                      <div>Total actual cost: ${(() => {
                        const originalCost = originalBooking?.totalCost || 0
                        const extensionTotal = booking.extensionamounts.reduce((sum: number, amount: number) => sum + amount, 0)
                        return (originalCost + extensionTotal).toFixed(2)
                      })()}</div>
                    )}
                    {paymentId && (
                      <div>Payment ID: {paymentId}</div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
