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
          
          if (!bookingData.confirmedPayment) {
            toast({
              title: "Cannot Reschedule",
              description: "Only paid bookings can be rescheduled",
              variant: "destructive"
            })
            router.push('/dashboard')
            return
          }
        } else {
          toast({
            title: "Error",
            description: response.error || "Failed to load booking details",
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
      <div className="max-w-4xl mx-auto px-4 py-8">
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
                      Choose {booking.pax} seat{booking.pax > 1 ? 's' : ''} for your booking
                    </p>
                    
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 20 }, (_, i) => `S${i + 1}`).map(seat => {
                        const isAvailable = availableSeats.includes(seat)
                        const isSelected = selectedSeats.includes(seat)
                        const isOccupied = occupiedSeats.includes(seat)
                        
                        return (
                          <button
                            key={seat}
                            type="button"
                            onClick={() => isAvailable && handleSeatSelection(seat)}
                            disabled={!isAvailable}
                            className={`
                              p-2 text-sm rounded border transition-colors
                              ${isSelected 
                                ? 'bg-orange-600 text-white border-orange-600' 
                                : isAvailable 
                                  ? 'bg-white border-gray-300 hover:border-orange-300 hover:bg-orange-50'
                                  : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                              }
                            `}
                          >
                            {seat}
                          </button>
                        )
                      })}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {selectedSeats.length} / {booking.pax} seats
                    </p>
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
