'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
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
  AlertCircle,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  CreditCard,
  DollarSign,
  ArrowRight
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getBookingForReschedule
} from '@/lib/rescheduleService'
import { SeatPicker, SeatMeta, OverlayMeta, TableMeta, LabelMeta } from '@/components/book-now-sections/SeatPicker'
import PaymentStep from '@/components/book-now/PaymentStep'
import {
  toSingaporeTime,
  formatSingaporeDate,
  formatSingaporeDateOnly,
  formatSingaporeTimeOnly,
  fromDatePickerToUTC,
  toLocalTime
} from '@/lib/timezoneUtils'
import { supabase } from '@/lib/supabaseClient'
import { calculatePaymentTotal, formatCurrency } from '@/lib/paymentUtils'

// Layout and seat configuration (same as extend page)
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

export default function ReschedulePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const bookingId = params.bookingId as string

  // State
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [apiLoading, setApiLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(() => {
    const step = searchParams.get('step')
    return step ? parseInt(step) : 1
  })
  const [submitting, setSubmitting] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const processedPaymentRef = useRef<string | null>(null)

  // Store API response data for confirmation display
  const [confirmationData, setConfirmationData] = useState<{
    booking: any
    originalTimes: { startAt: string; endAt: string }
  } | null>(null)

  // User info state
  const [userInfo, setUserInfo] = useState<{
    name: string
    email: string
    phone: string
  }>({
    name: '',
    email: '',
    phone: ''
  })

  // Step 1: Time Selection
  const [newStartDate, setNewStartDate] = useState<Date | null>(null)
  const [newEndDate, setNewEndDate] = useState<Date | null>(null)
  const [originalStartDate, setOriginalStartDate] = useState<Date | null>(null)
  const [originalEndDate, setOriginalEndDate] = useState<Date | null>(null)
  const [originalDuration, setOriginalDuration] = useState<number>(0)

  // Step 1: Seat Selection
  const [availableSeats, setAvailableSeats] = useState<string[]>([])
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [requiresSeatSelection, setRequiresSeatSelection] = useState(false)
  const [checkingSeats, setCheckingSeats] = useState(false)

  // Step 2: Payment
  const [rescheduleData, setRescheduleData] = useState<any>(null)
  const [costDifference, setCostDifference] = useState(0)
  const [needsPayment, setNeedsPayment] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [paymentTotal, setPaymentTotal] = useState(0)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'payNow' | 'creditCard'>('creditCard')

  // Step 3: Confirmation
  const [rescheduleConfirmed, setRescheduleConfirmed] = useState(false)

  // Pricing
  const pricing = {
    student: { oneHourRate: 4.00, overOneHourRate: 4.00 },
    member: { oneHourRate: 5.00, overOneHourRate: 5.00 },
    tutor: { oneHourRate: 6.00, overOneHourRate: 6.00 }
  }

  // Helper function to update URL with current step
  const updateStepInURL = (step: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set('step', step.toString())
    router.replace(url.pathname + url.search, { scroll: false })
  }

  // Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          setUserInfo({
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            email: user.email || '',
            phone: user.user_metadata?.phone || user.phone || ''
          })
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    fetchUserInfo()
  }, [])

  // Load booking data
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true)
        const response = await getBookingForReschedule(bookingId)

        if (response.success && response.booking) {
          const bookingData = response.booking
          setBooking(bookingData)

          // Set original dates from the booking's current times
          const startDate = toLocalTime(bookingData.startAt)
          const endDate = toLocalTime(bookingData.endAt)

          setOriginalStartDate(startDate)
          setOriginalEndDate(endDate)

          // Calculate original duration in hours
          const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
          setOriginalDuration(duration)

          // Set initial new dates to original dates
          setNewStartDate(startDate)
          setNewEndDate(endDate)

          // Set initial selected seats
          setSelectedSeats(bookingData.seatNumbers || [])

        } else {
          toast({
            title: "Booking Not Found",
            description: response.error || "Could not load booking details",
            variant: "destructive"
          })
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error loading booking:', error)
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive"
        })
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      loadBooking()
    }
  }, [bookingId, router, toast])

  // Handle payment return from gateway
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const step = searchParams.get('step')
      const isReschedule = searchParams.get('reschedule')
      const paymentReference = searchParams.get('reference')
      const paymentStatus = searchParams.get('status')

      console.log('🔍 Checking payment return:', { step, isReschedule, paymentReference, paymentStatus })

      // Check if this payment was already processed (from localStorage)
      const storedPaymentKey = localStorage.getItem(`reschedule_processed_${bookingId}`)
      if (storedPaymentKey && step === '3' && isReschedule === 'true' && paymentReference && paymentStatus === 'completed') {
        console.log('✅ Found stored payment key, setting processed state')
        processedPaymentRef.current = storedPaymentKey
      }

      const paymentKey = `${bookingId}-${paymentReference}-${paymentStatus}`

      // Check if this is a payment return (step=3, reschedule=true, completed)
      if (step === '3' && isReschedule === 'true' && paymentReference && paymentStatus === 'completed') {

        // If already processed, just show success without calling API again
        if (processedPaymentRef.current === paymentKey) {
          console.log('✅ Payment already processed, showing success state')
          setPaymentConfirmed(true)
          setRescheduleConfirmed(true)
          setCurrentStep(3)

          // Set the data from URL parameters for display
          const newStartAt = searchParams.get('newStartAt')
          const newEndAt = searchParams.get('newEndAt')
          const seatNumbers = searchParams.get('seatNumbers')
          const additionalCost = searchParams.get('additionalCost')
          const originalStartAt = searchParams.get('originalStartAt')
          const originalEndAt = searchParams.get('originalEndAt')

          if (newStartAt && newEndAt && seatNumbers && originalStartAt && originalEndAt && booking) {
            // Update states with URL data for display
            setNewStartDate(toLocalTime(newStartAt))
            setNewEndDate(toLocalTime(newEndAt))
            setSelectedSeats(JSON.parse(decodeURIComponent(seatNumbers)))
            setOriginalStartDate(toLocalTime(originalStartAt))
            setOriginalEndDate(toLocalTime(originalEndAt))
            setCostDifference(parseFloat(additionalCost || '0'))

            // Set confirmation data from URL + current booking
            setConfirmationData({
              booking: booking,
              originalTimes: {
                startAt: originalStartAt,
                endAt: originalEndAt
              }
            })
          }

          toast({
            title: "Reschedule Already Completed",
            description: "Your booking has been successfully rescheduled.",
          })
          return
        }

        // Process new payment
        if (!paymentProcessing) {
          setPaymentProcessing(true)
          processedPaymentRef.current = paymentKey

          // Store in localStorage to persist across refreshes
          localStorage.setItem(`reschedule_processed_${bookingId}`, paymentKey)

          console.log('✅ Payment completed, processing reschedule...', paymentKey)

          // Get reschedule data from URL
          const newStartAt = searchParams.get('newStartAt')
          const newEndAt = searchParams.get('newEndAt')
          const seatNumbers = searchParams.get('seatNumbers')
          const additionalCost = searchParams.get('additionalCost')
          const originalStartAt = searchParams.get('originalStartAt')
          const originalEndAt = searchParams.get('originalEndAt')

          if (newStartAt && newEndAt && seatNumbers) {
            const rescheduleDataFromUrl = {
              newStartAt,
              newEndAt,
              seatNumbers: JSON.parse(decodeURIComponent(seatNumbers)),
              additionalCost: parseFloat(additionalCost || '0'),
              originalStartAt,
              originalEndAt
            }

            console.log('📝 Reschedule data from URL:', rescheduleDataFromUrl)

            try {
              // Call confirm payment endpoint to update booking
              // Use bookingId as paymentId since we store bookingId in payment.bookingRef
              const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/reschedule/confirm-payment`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  bookingId,
                  paymentId: bookingId, // Use bookingId to lookup payment by bookingRef
                  rescheduleData: rescheduleDataFromUrl
                })
              })

              const result = await response.json()

              if (response.ok && result.success) {
                console.log('✅ Booking updated successfully after payment', result.alreadyCompleted ? '(already completed)' : '')
                setPaymentConfirmed(true)
                setRescheduleConfirmed(true)

                // Store confirmation data from API response
                if (result.booking && result.originalTimes) {
                  setConfirmationData({
                    booking: result.booking,
                    originalTimes: result.originalTimes
                  })

                  // Update booking state with NEW reschedule data
                  setBooking(result.booking)

                  // Update the dates to show the NEW rescheduled times
                  const newStart = toLocalTime(result.booking.startAt)
                  const newEnd = toLocalTime(result.booking.endAt)
                  setNewStartDate(newStart)
                  setNewEndDate(newEnd)

                  // Keep the original times from the response for display
                  const origStart = toLocalTime(result.originalTimes.startAt)
                  const origEnd = toLocalTime(result.originalTimes.endAt)
                  setOriginalStartDate(origStart)
                  setOriginalEndDate(origEnd)
                }

                toast({
                  title: result.alreadyCompleted ? "Reschedule Already Completed" : "Reschedule Completed!",
                  description: result.alreadyCompleted
                    ? "Your booking was already rescheduled successfully."
                    : "Your booking has been rescheduled and payment confirmed.",
                })
              } else {
                console.error('❌ Failed to update booking:', result)
                toast({
                  title: "Update Failed",
                  description: result.error || "Failed to update booking after payment",
                  variant: "destructive"
                })
              }
            } catch (error) {
              console.error('❌ Error processing payment return:', error)

              // Even if API fails, show success state with URL data
              console.log('⚠️ API failed but showing success with URL data')
              setPaymentConfirmed(true)
              setRescheduleConfirmed(true)
              setCurrentStep(3)

              // Set data from URL parameters as fallback
              if (newStartAt && newEndAt && seatNumbers && originalStartAt && originalEndAt) {
                setNewStartDate(toLocalTime(newStartAt))
                setNewEndDate(toLocalTime(newEndAt))
                setSelectedSeats(JSON.parse(decodeURIComponent(seatNumbers)))
                setOriginalStartDate(toLocalTime(originalStartAt))
                setOriginalEndDate(toLocalTime(originalEndAt))
                setCostDifference(parseFloat(additionalCost || '0'))

                // Set confirmation data from URL + current booking as fallback
                if (booking) {
                  setConfirmationData({
                    booking: booking,
                    originalTimes: {
                      startAt: originalStartAt,
                      endAt: originalEndAt
                    }
                  })
                }
              }

              toast({
                title: "Reschedule Completed",
                description: "Your booking has been rescheduled successfully.",
              })
            } finally {
              setPaymentProcessing(false) // Reset the flag
            }
          }
        }
      }
    }

    if (booking && !loading) {
      handlePaymentReturn()
    }
  }, [searchParams, booking, loading, bookingId, toast])

  // Calculate new end date when start date changes
  useEffect(() => {
    if (newStartDate && originalDuration > 0) {
      const calculatedEndDate = new Date(newStartDate.getTime() + (originalDuration * 60 * 60 * 1000))
      setNewEndDate(calculatedEndDate)
    }
  }, [newStartDate, originalDuration])

  // Calculate cost difference when dates change
  useEffect(() => {
    if (newStartDate && newEndDate && booking && originalStartDate && originalEndDate) {
      const newDuration = (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60)
      const originalDuration = (originalEndDate.getTime() - originalStartDate.getTime()) / (1000 * 60 * 60)



      // Calculate cost difference
      const memberType = booking.memberType?.toLowerCase() || 'member'
      const rate = newDuration === 1 ?
        pricing[memberType as keyof typeof pricing]?.oneHourRate || 5.00 :
        pricing[memberType as keyof typeof pricing]?.overOneHourRate || 5.00

      const originalCost = originalDuration * rate * booking.pax
      const newCost = newDuration * rate * booking.pax
      const difference = newCost - originalCost

      setCostDifference(difference)
      setNeedsPayment(difference > 0)
      setPaymentTotal(difference) // Initialize payment total with cost difference
    }
  }, [newStartDate, newEndDate, booking, originalStartDate, originalEndDate, pricing, booking?.pax, booking?.memberType, toast])

  // Debug payment total changes
  useEffect(() => {
    console.log('Payment total changed:', paymentTotal, 'Cost difference:', costDifference)
  }, [paymentTotal, costDifference])

  // Debug reschedule data
  useEffect(() => {
    console.log('Reschedule data changed:', rescheduleData)
  }, [rescheduleData])

  // Initialize payment total when cost difference changes
  useEffect(() => {
    if (costDifference > 0 && paymentTotal === 0) {
      // Initialize with credit card calculation (default selected method)
      const feeAmount = costDifference * 0.05
      const totalWithFee = costDifference + feeAmount
      console.log('Initial calculation - Credit card total:', costDifference, '+', feeAmount, '=', totalWithFee)
      setPaymentTotal(totalWithFee)
    }
  }, [costDifference, paymentTotal])

  // Check seat availability when dates change
  useEffect(() => {
    const checkSeatAvailability = async () => {
      if (!newStartDate || !newEndDate || !booking) {
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
            startAt: newStartDate.toISOString().replace('T', ' ').replace('Z', ''),
            endAt: newEndDate.toISOString().replace('T', ' ').replace('Z', ''),
            excludeBookingId: bookingId // Exclude current booking
          })
        })

        if (response.ok) {
          const data = await response.json()
          setAvailableSeats(data.availableSeats || [])
          
          // Filter out current booking's seats from occupied seats
          // Backend should exclude them, but double-check here
          const otherBookedSeats = (data.bookedSeats || []).filter(
            (seat: string) => !(booking.seatNumbers || []).includes(seat)
          )
          setOccupiedSeats(data.bookedSeats || [])

          // Check if original seats conflict with OTHER bookings (not current booking)
          const originalSeats = booking.seatNumbers || []
          const conflictingSeats = originalSeats.filter((seat: string) =>
            otherBookedSeats.includes(seat)
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
  }, [newStartDate, newEndDate, booking, bookingId])

  const handleStep1Submit = () => {
    if (!newStartDate || !newEndDate) {
      toast({
        title: "Missing Information",
        description: "Please select new start and end times",
        variant: "destructive"
      })
      return
    }

    // Check minimum increase of 1 hour (new duration must be at least 1 hour more than original)
    const newDuration = (newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60)
    const durationIncrease = newDuration - originalDuration
    
    if (durationIncrease < 1) {
      toast({
        title: "Minimum Duration Required",
        description: "Rescheduling requires at least 1 hour increase.",
        variant: "destructive"
      })
      return
    }

    if (requiresSeatSelection && selectedSeats.length !== booking.pax) {
      toast({
        title: "Seat Selection Required",
        description: `Please select ${booking.pax} seat${booking.pax > 1 ? 's' : ''} for the new time`,
        variant: "destructive"
      })
      return
    }

    // Check if duration decreased
    if (newDuration < originalDuration) {
      toast({
        title: "Cannot Decrease Time",
        description: "You cannot reschedule to a shorter duration. Please select a longer or equal duration.",
        variant: "destructive"
      })
      return
    }

    setRescheduleData({
      newStartAt: newStartDate.toISOString(),
      newEndAt: newEndDate.toISOString(),
      seatNumbers: selectedSeats,
      originalStartAt: originalStartDate!.toISOString(),
      originalEndAt: originalEndDate!.toISOString(),
      originalDuration,
      newDuration,
      costDifference,
      needsPayment
    })

    if (needsPayment) {
      setCurrentStep(2)
      updateStepInURL(2)
    } else {
      // No payment needed, update booking directly and go to confirmation
      console.log('🔄 No payment needed, calling handlePaymentSuccess directly...')
      handlePaymentSuccess(undefined, {
        newStartAt: newStartDate!.toISOString(),
        newEndAt: newEndDate!.toISOString(),
        seatNumbers: selectedSeats,
        originalStartAt: originalStartDate!.toISOString(),
        originalEndAt: originalEndDate!.toISOString(),
        additionalCost: costDifference,
        additionalHours: newDuration - originalDuration,
        newDuration,
        originalDuration,
        costDifference,
        needsPayment
      })
    }
  }

  const handlePaymentSuccess = async (paymentId?: string, customRescheduleData?: any) => {
    // Payment completed - now update booking with new schedule
    const dataToUse = customRescheduleData || rescheduleData
    setApiLoading(true)
    
    try {
      if (paymentId && dataToUse) {
        console.log('🔍 Payment completed, updating booking with new schedule...')

        // Update booking with new dates/times/seats AFTER payment confirmation
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/reschedule/confirm-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingId,
            paymentId,
            rescheduleData
          })
        })

        const result = await response.json()

        if (response.ok && result.success) {
          console.log('✅ Payment confirmed and booking updated with new schedule')
          setPaymentConfirmed(true)
          setCurrentStep(3)
          updateStepInURL(3)

          // Update local booking state with confirmed changes
          if (result.booking) {
            setBooking(result.booking)
            
            // Set confirmation data for display
            setConfirmationData({
              booking: result.booking,
              originalTimes: {
                startAt: result.originalTimes?.startAt || originalStartDate!.toISOString(),
                endAt: result.originalTimes?.endAt || originalEndDate!.toISOString()
              }
            })
          }

          toast({
            title: "Reschedule Completed!",
            description: "Your booking has been rescheduled and payment confirmed.",
          })
        } else {
          throw new Error(result.error || 'Failed to confirm reschedule')
        }
      } else {
        // No payment needed case - update booking directly
        console.log('✅ No payment needed, updating booking...')
        console.log('📤 Sending reschedule data:', {
          startAt: dataToUse?.newStartAt,
          endAt: dataToUse?.newEndAt,
          seatNumbers: dataToUse?.seatNumbers,
          rescheduleCost: 0
        })
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/reschedule/booking/${bookingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startAt: dataToUse?.newStartAt,
            endAt: dataToUse?.newEndAt,
            seatNumbers: dataToUse?.seatNumbers,
            rescheduleCost: 0
          })
        })

        const result = await response.json()
        console.log('📥 Backend response:', result)
        console.log('📊 Response status:', response.status, response.ok)

        if (response.ok && result.success) {
          console.log('✅ Booking updated successfully:', result.booking)
          setPaymentConfirmed(true)
          setCurrentStep(3)
          updateStepInURL(3)

          if (result.booking) {
            setBooking(result.booking)
            console.log('📅 Updated booking times:', {
              startAt: result.booking.startAt,
              endAt: result.booking.endAt
            })
            
            // Set confirmation data for display
            setConfirmationData({
              booking: result.booking,
              originalTimes: {
                startAt: originalStartDate!.toISOString(),
                endAt: originalEndDate!.toISOString()
              }
            })
          }

          toast({
            title: "Reschedule Completed!",
            description: "Your booking has been rescheduled successfully.",
          })
        } else {
          throw new Error(result.error || 'Failed to reschedule booking')
        }
      }
    } catch (error: any) {
      console.error('❌ Error in handlePaymentSuccess:', error)
      toast({
        title: "Reschedule Failed",
        description: error.message || "Failed to reschedule booking.",
        variant: "destructive"
      })
    } finally {
      setApiLoading(false)
    }
  }

  const handlePaymentMethodChange = (method: 'payNow' | 'creditCard', newTotal: number) => {
    console.log('PaymentStep callback triggered:', method, 'newTotal:', newTotal, 'costDifference:', costDifference)
    setSelectedPaymentMethod(method)
    setPaymentTotal(newTotal)
  }

  const handleSeatSelectionChange = useCallback((selectedSeats: string[]) => {
    console.log('Seat selection changed:', selectedSeats)
    setSelectedSeats(selectedSeats)
  }, [])

  const handleRescheduleConfirm = async () => {
    if (!rescheduleData) return

    console.log('🔄 Starting reschedule process for booking:', bookingId)
    console.log('Reschedule data:', rescheduleData)
    console.log('Cost difference:', costDifference)
    console.log('Payment confirmed:', paymentConfirmed)

    setSubmitting(true)

    try {
      // If payment was already confirmed, just show success
      if (paymentConfirmed) {
        setRescheduleConfirmed(true)
        toast({
          title: "Booking Rescheduled Successfully!",
          description: `Your booking has been rescheduled from ${formatSingaporeDate(originalStartDate!)} to ${formatSingaporeDate(newStartDate!)}`,
        })

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
        return
      }

      // If no payment needed, reschedule directly
      console.log('💰 No payment needed, proceeding with direct reschedule')
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/reschedule/booking/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startAt: rescheduleData.newStartAt,
          endAt: rescheduleData.newEndAt,
          seatNumbers: rescheduleData.seatNumbers,
          rescheduleCost: costDifference
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setRescheduleConfirmed(true)

        // Update booking data with new reschedule details
        if (result.booking) {
          setBooking(result.booking)
        }

        toast({
          title: "Booking Rescheduled Successfully!",
          description: `Your booking has been rescheduled from ${formatSingaporeDate(originalStartDate!)} to ${formatSingaporeDate(newStartDate!)}`,
        })

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        throw new Error(result.error || 'Failed to reschedule booking')
      }
    } catch (error: any) {
      console.error('Error rescheduling booking:', error)
      toast({
        title: "Reschedule Failed",
        description: error.message || "Failed to reschedule booking",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Booking not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reschedule Booking</h1>
            <p className="text-gray-600">Reference: {booking.bookingRef}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep >= 1 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="ml-2 font-medium">Select Time</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${currentStep >= 2 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="ml-2 font-medium">Payment</span>
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400" />
            <div className={`flex items-center ${currentStep >= 3 ? 'text-orange-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Step 1: Time Selection */}
        {currentStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Current Booking Info */}


            {/* New Time Selection */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Select New Time
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="newStartDate">New Start Time</Label>
                      <DatePicker
                        id="newStartDate"
                        selected={newStartDate}
                        onChange={(date) => setNewStartDate(date)}
                        showTimeSelect
                        timeFormat="h:mm aa"
                        timeIntervals={15}
                        dateFormat="dd MMM yyyy, h:mm aa"
                        minDate={new Date()}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholderText="Select new start time"
                      />
                    </div>

                    <div>
                      <Label htmlFor="newEndDate">New End Time</Label>
                      <DatePicker
                        id="newEndDate"
                        selected={newEndDate}
                        onChange={(date) => setNewEndDate(date)}
                        showTimeSelect
                        timeFormat="h:mm aa"
                        timeIntervals={15}
                        dateFormat="dd MMM yyyy, h:mm aa"
                        minDate={newStartDate || undefined}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholderText="Select new end time"
                      />
                    </div>
                  </div>

                  {/* Minimum Duration Increase Notice */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                    Rescheduling requires at least 1 hour.
                       </AlertDescription>
                  </Alert>

                  {/* Duration Info */}
                  {newStartDate && newEndDate && (
                    <Alert className={
                      (((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60)) - originalDuration) < 1 
                        ? "border-red-500 bg-red-50" 
                        : ""
                    }>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        New Duration: {((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60)).toFixed(2)} hours
                        <span className="block mt-1 text-gray-600 text-sm">
                          Original: {originalDuration.toFixed(2)} hours | Increase: {(((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60)) - originalDuration).toFixed(2)} hours
                        </span>
                        {costDifference > 0 && (
                          <span className="block mt-1 text-orange-600">
                            Additional cost: SGD ${costDifference.toFixed(2)}
                          </span>
                        )}
                        {costDifference < 0 && (
                          <span className="block mt-1 text-red-600">
                           New duration cannot be lesser than original duration. Please cancel and rebook
                          </span>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Seat Availability Status */}
                  {checkingSeats && (
                    <div className="flex items-center text-sm text-orange-600">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Checking seat availability...
                    </div>
                  )}
   <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                      Reschedule can only be done once.
                      </AlertDescription>
                    </Alert>
                  {requiresSeatSelection && !checkingSeats && (
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Your original seats are not available for the new time. Please select different seats.
                      </AlertDescription>
                    </Alert>
                  )}

                  {!requiresSeatSelection && !checkingSeats && newStartDate && newEndDate && (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your original seats are available for the new time.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Seat Selection */}
                  {requiresSeatSelection && !checkingSeats && (
                    <div>
                      <Label>Select Seats for New Time</Label>
                      <p className="text-sm text-gray-600 mb-3">
                        Choose {booking.pax} seat{booking.pax > 1 ? 's' : ''} for the new time.
                        <span className="ml-2 text-blue-600">
                          ({DEMO_LAYOUT.length - occupiedSeats.length} seats available)
                        </span>
                      </p>

                      {/* SeatPicker Container with proper constraints */}
                      <div className="w-full max-w-full overflow-hidden">
                        <div className="border rounded-lg p-4 bg-gray-50">
                          <SeatPicker
                            layout={DEMO_LAYOUT}
                            tables={DEMO_TABLES}
                            labels={DEMO_LABELS}
                            bookedSeats={occupiedSeats.filter((seat: string) => !booking.seatNumbers?.includes(seat))}
                            overlays={OVERLAYS}
                            maxSeats={booking.pax}
                            onSelectionChange={handleSeatSelectionChange}
                            initialSelectedSeats={booking.seatNumbers || []}
                          />
                        </div>
                      </div>

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
                      onClick={handleStep1Submit}
                      disabled={
                        submitting ||
                        checkingSeats ||
                        !newStartDate ||
                        !newEndDate ||
                        (requiresSeatSelection && selectedSeats.length !== booking.pax) ||
                        costDifference < 0 ||
                        // Disable if times haven't changed from original
                        (newStartDate?.getTime() === originalStartDate?.getTime() && 
                         newEndDate?.getTime() === originalEndDate?.getTime()) ||
                        // Disable if increase is less than 1 hour
                        (newStartDate && newEndDate && 
                         ((newEndDate.getTime() - newStartDate.getTime()) / (1000 * 60 * 60)) - originalDuration < 1)
                      }
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {costDifference > 0 ? 'Continue to Payment' : 'Continue to Confirmation'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Current Booking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{booking.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{formatSingaporeDate(originalStartDate!)} - {formatSingaporeDate(originalEndDate!)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{booking.pax} {booking.memberType?.toLowerCase()}(s)</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Seats: {booking.seatNumbers?.join(', ') || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Duration: {originalDuration.toFixed(1)} hours</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Payment Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Required
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PaymentStep
                    subtotal={costDifference}
                    total={paymentTotal || costDifference}
                    discountAmount={0}
                    appliedVoucher={null}
                    selectedPackage={undefined}
                    customer={{
                      name: userInfo.name || booking?.bookedForEmails?.[0]?.split('@')[0] || 'User',
                      email: userInfo.email || booking?.bookedForEmails?.[0] || 'user@example.com',
                      phone: userInfo.phone || booking?.phone || ''
                    }}
                    bookingId={bookingId}
                    onBack={() => {
                      setCurrentStep(1)
                      updateStepInURL(1)
                    }}
                    onComplete={handlePaymentSuccess}
                    onPaymentMethodChange={handlePaymentMethodChange}
                    onCreateBooking={async () => {
                      // For reschedule, don't update booking before payment
                      // Just return bookingId so payment can be created
                      // Booking will be updated AFTER payment is confirmed
                      console.log('💳 Creating payment for reschedule, booking will update after payment confirmation')
                      return bookingId
                    }}
                    onBookingCreated={(bookingId) => {
                      console.log('Reschedule payment initiated for booking:', bookingId)
                    }}
                    isReschedule={true}
                    rescheduleData={rescheduleData ? {
                      originalStartAt: originalStartDate!.toISOString(),
                      originalEndAt: originalEndDate!.toISOString(),
                      newStartAt: rescheduleData.newStartAt,
                      newEndAt: rescheduleData.newEndAt,
                      seatNumbers: rescheduleData.seatNumbers,
                      additionalHours: (rescheduleData.newDuration - rescheduleData.originalDuration),
                      additionalCost: costDifference
                    } : undefined}
                  />
                </CardContent>
              </Card>
            </div>
            {/* Reschedule Summary */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Reschedule Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-800">Booking Reference:</span>
                    <span className="ml-2 text-sm text-gray-600">{booking.bookingRef}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{booking.pax} {booking.memberType?.toLowerCase()}(s)</span>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">Original Duration:</span>
                        <span className="ml-2 text-gray-600">{originalDuration.toFixed(1)} hours</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">New Duration:</span>
                        <span className="ml-2 text-gray-600">{((newEndDate!.getTime() - newStartDate!.getTime()) / (1000 * 60 * 60)).toFixed(1)} hours</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">Time Change:</span>
                        <span className="ml-2 text-orange-600 font-medium">+{((newEndDate!.getTime() - newStartDate!.getTime()) / (1000 * 60 * 60) - originalDuration).toFixed(1)} hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">Original Time:</span>
                        <div className="text-xs text-gray-600 mt-1">{formatSingaporeDate(originalStartDate!)} - {formatSingaporeDate(originalEndDate!)}</div>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium text-gray-800">New Time:</span>
                        <div className="text-xs text-gray-600 mt-1">{formatSingaporeDate(newStartDate!)} - {formatSingaporeDate(newEndDate!)}</div>
                      </div>
                      {requiresSeatSelection ? (
                        <>
                          <div className="text-sm">
                            <span className="font-medium text-gray-800">Original Seats:</span>
                            <div className="text-xs text-gray-600 mt-1">{booking.seatNumbers?.join(', ') || 'N/A'}</div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-800">New Seats:</span>
                            <div className="text-xs text-gray-600 mt-1">
                              {rescheduleData.seatNumbers?.join(', ') || 'Not selected'}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-sm">
                          <span className="font-medium text-gray-800">Seats:</span>
                          <div className="text-xs text-gray-600 mt-1">{booking.seatNumbers?.join(', ') || 'N/A'}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 bg-orange-50 rounded-lg p-3">
                    <div className="text-sm font-medium text-orange-800 mb-2">Payment Breakdown</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-orange-700 text-sm font-medium">Subtotal:</span>
                        <span className="text-orange-700 text-sm font-medium">SGD ${costDifference.toFixed(2)}</span>
                      </div>
                      {selectedPaymentMethod === 'creditCard' && (() => {
                        const { fee } = calculatePaymentTotal(costDifference, 'creditCard')
                        return (
                          <div className="flex justify-between">
                            <span className="text-orange-700 text-sm font-medium">Credit Card Fee (5%):</span>
                            <span className="text-orange-700 text-sm font-medium">SGD ${formatCurrency(fee)}</span>
                          </div>
                        )
                      })()}
                      <div className="flex justify-between font-medium border-t border-orange-200 pt-1 mt-2">
                        <span className="text-orange-800 text-sm font-medium">Total payable:</span>
                        <span className="text-orange-900 text-sm font-medium">
                          SGD ${(() => {
                            const { total } = calculatePaymentTotal(costDifference, selectedPaymentMethod)
                            return formatCurrency(total)
                          })()}
                        </span>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="max-w-2xl mx-auto">
            {apiLoading ? (
              <Card>
                <CardContent className="space-y-6 py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin text-orange-600" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Updating Booking...</h3>
                    <p className="text-gray-600">Please wait while we update your booking details.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (confirmationData || booking) ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Reschedule Confirmed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Booking Rescheduled Successfully</h3>
                  <div className="space-y-1 text-sm text-green-700">
                    <div>Reference: {(confirmationData?.booking || booking)?.bookingRef}</div>
                    <div>Location: {(confirmationData?.booking || booking)?.location}</div>
                    <div>Original: {formatSingaporeDate(
                      confirmationData?.originalTimes?.startAt || originalStartDate?.toISOString() || ''
                    )} - {formatSingaporeDate(
                      confirmationData?.originalTimes?.endAt || originalEndDate?.toISOString() || ''
                    )}</div>
                    <div>New: {formatSingaporeDate(
                      confirmationData?.booking?.startAt || booking?.startAt || newStartDate?.toISOString() || ''
                    )} - {formatSingaporeDate(
                      confirmationData?.booking?.endAt || booking?.endAt || newEndDate?.toISOString() || ''
                    )}</div>
                  </div>
                </div>

                <div className="text-center">
                  {/* <p className="text-gray-600 mb-4">
                    Your booking has been successfully rescheduled. You will receive a confirmation email shortly.
                  </p> */}
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}