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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  Users, 
  Calendar,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  rescheduleBooking, 
  getAvailableSeatsForReschedule, 
  getBookingForReschedule,
  RescheduleRequest 
} from '@/lib/rescheduleService'
import { SeatPicker, SeatMeta, OverlayMeta, TableMeta, LabelMeta } from '@/components/book-now-sections/SeatPicker'

export default function ReschedulePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const bookingId = params.bookingId as string
  
  // State
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [availableSeats, setAvailableSeats] = useState<string[]>([])
  const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
  const [checkingSeats, setCheckingSeats] = useState(false)
  const [requiresSeatSelection, setRequiresSeatSelection] = useState(false)
  
  // Form state
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

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

  // Load booking details
  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true)
        const response = await getBookingForReschedule(bookingId)
        
        if (response.success && response.booking) {
          const bookingData = response.booking
          setBooking(bookingData)
          
          // Pre-fill form with current booking data
          const startDate = new Date(bookingData.startAt)
          const endDate = new Date(bookingData.endAt)
          
          setStartDate(startDate)
          setEndDate(endDate)
          setSelectedSeats(bookingData.seatNumbers || [])
          
          // Check if reschedule is allowed
          if (bookingData.rescheduleCount >= 1) {
            toast({
              title: "Cannot Reschedule",
              description: "This booking has already been rescheduled once",
              variant: "destructive"
            })
            router.push('/dashboard')
            return
          }
          
        //   if (!bookingData.confirmedPayment) {
        //     toast({
        //       title: "Cannot Reschedule",
        //       description: "Only paid bookings can be rescheduled",
        //       variant: "destructive"
        //     })
      
        //     return
        //   }
        // } else {
        //   toast({
        //     title: "Error",
        //     description: response.error || "Failed to load booking details",
        //     variant: "destructive"
        //   })
        //   router.push('/dashboard')
        }
      } catch (error) {
        console.error('Error loading booking:', error)
        toast({
          title: "Error",
          description: "Failed to load booking details",
          variant: "destructive"
        })
  
      } finally {
        setLoading(false)
      }
    }

    if (bookingId) {
      loadBooking()
    }
  }, [bookingId, router, toast])

  // Check seat availability when time changes
  useEffect(() => {
    const checkSeatAvailability = async () => {
      if (!startDate || !endDate || !booking) {
        return
      }

      try {
        setCheckingSeats(true)
        const startAt = startDate
        const endAt = endDate
        
        const response = await getAvailableSeatsForReschedule(
          bookingId,
          startAt.toISOString(),
          endAt.toISOString()
        )

        if (response.success) {
          setAvailableSeats(response.availableSeats || [])
          setOccupiedSeats(response.occupiedSeats || [])
          
          // Check if original seats are still available
          const originalSeats = booking.seatNumbers || []
          const conflictingSeats = originalSeats.filter(seat => 
            response.occupiedSeats?.includes(seat)
          )
          
          if (conflictingSeats.length > 0) {
            setRequiresSeatSelection(true)
            setFormData(prev => ({ ...prev, selectedSeats: [] }))
          } else {
            setRequiresSeatSelection(false)
            setFormData(prev => ({ ...prev, selectedSeats: originalSeats }))
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
  }, [startDate, endDate, booking, bookingId])

  const handleSeatSelection = (seat: string) => {
    setSelectedSeats(prev => {
      const isSelected = prev.includes(seat)
      if (isSelected) {
        return prev.filter(s => s !== seat)
      } else {
        return [...prev, seat]
      }
    })
  }

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please select date and time",
        variant: "destructive"
      })
      return
    }

    if (requiresSeatSelection && selectedSeats.length === 0) {
      toast({
        title: "Seat Selection Required",
        description: "Please select seats for the new time",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      
      const rescheduleData: RescheduleRequest = {
        startAt: startDate.toISOString(),
        endAt: endDate.toISOString(),
        seatNumbers: selectedSeats
      }

      const response = await rescheduleBooking(bookingId, rescheduleData)

      if (response.success) {
        toast({
          title: "Booking Rescheduled",
          description: "Your booking has been successfully rescheduled",
        })
        router.push('/dashboard')
      } else {
        toast({
          title: "Reschedule Failed",
          description: response.error || "Failed to reschedule booking",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error rescheduling booking:', error)
      toast({
        title: "Error",
        description: "Failed to reschedule booking",
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
          <p className="text-gray-600 mb-4">The booking you're trying to reschedule doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className=" mx-auto px-40 py-8">
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
          
          <h1 className="text-3xl font-bold text-gray-900">Reschedule Booking</h1>
          <p className="text-gray-600 mt-2">
            Change the time for your booking. You can only reschedule once per booking.
          </p>
        </div>

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
                    <div>{new Date(booking.startAt).toLocaleString()}</div>
                    <div className="text-gray-500">to {new Date(booking.endAt).toLocaleString()}</div>
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

          {/* Reschedule Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>New Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date and Time Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Start Date & Time</Label>
                    <DatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      placeholderText="Select start time"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      minDate={new Date()}
                      maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // 1 year from now
                    />
                  </div>

                  <div>
                    <Label>End Date & Time</Label>
                    <DatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate}
                      showTimeSelect
                      timeIntervals={15}
                      dateFormat="MMM d, yyyy h:mm aa"
                      placeholderText="Select end time"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Seat Availability Status */}
                {checkingSeats && (
                  <div className="flex items-center text-sm text-orange-600">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Checking seat availability...
                  </div>
                )}

                {requiresSeatSelection && !checkingSeats && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Your original seats are not available at the new time. Please select different seats.
                    </AlertDescription>
                  </Alert>
                )}

                {!requiresSeatSelection && !checkingSeats && startDate && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your original seats are available at the new time.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Seat Selection */}
                {requiresSeatSelection && !checkingSeats && (
                  <div>
                    <Label>Select Seats</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Choose {booking.pax} seat{booking.pax > 1 ? 's' : ''} for your booking.
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
                    disabled={submitting || checkingSeats || (requiresSeatSelection && selectedSeats.length !== booking.pax)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Rescheduling...
                      </>
                    ) : (
                      'Reschedule Booking'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
