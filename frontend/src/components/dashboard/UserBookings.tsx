// src/components/dashboard/UserBookings.tsx - User booking dashboard
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calendar, Clock, MapPin, Users, DollarSign, CheckCircle, XCircle, Edit, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Booking,
  getUserBookings,
  getUserStats,
  formatBookingDate,
  getBookingStatus,
  getStatusColor,
  calculateDuration
} from '@/lib/bookingService'

export function UserBookings() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({ upcomingBookings: 0, ongoingBookings: 0, pastBookings: 0 })
  const [activeTab, setActiveTab] = useState<'upcoming' | 'ongoing' | 'past'>('upcoming')





  // Load user bookings
  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await getUserBookings()
      if (response.success && response.bookings) {
        setBookings(response.bookings)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load bookings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Load Bookings Error:', error)
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Load user statistics
  const loadUserStats = async () => {
    try {
      // For demo purposes, using a mock userId - in real app, get from auth context
      const mockUserId = '123e4567-e89b-12d3-a456-426614174000'
      const stats = await getUserStats(mockUserId)
      setUserStats({
        upcomingBookings: stats.upcomingBookings || 0,
        ongoingBookings: stats.ongoingBookings || 0,
        pastBookings: stats.pastBookings || 0
      })
    } catch (error) {
      console.error('Load User Stats Error:', error)
    }
  }

  useEffect(() => {
    loadBookings()
    loadUserStats()
  }, [])

  // Filter bookings by status
  const upcomingBookings = bookings.filter(booking =>
    booking.status === 'upcoming' || (new Date(booking.startAt) > new Date() && !booking.isCompleted && !booking.isOngoing)
  )

  const ongoingBookings = bookings.filter(booking =>
    booking.status === 'ongoing' || booking.isOngoing || (() => {
      const now = new Date()
      const start = new Date(booking.startAt)
      const end = new Date(booking.endAt)
      return now >= start && now <= end && !booking.isCompleted
    })()
  )

  const pastBookings = bookings.filter(booking =>
    booking.status === 'completed' || booking.isCompleted || (new Date(booking.endAt) < new Date() && !booking.isOngoing)
  )

  // Update stats when bookings change
  useEffect(() => {
    setUserStats({
      upcomingBookings: upcomingBookings.length,
      ongoingBookings: ongoingBookings.length,
      pastBookings: pastBookings.length
    })
  }, [upcomingBookings.length, ongoingBookings.length, pastBookings.length])

  const currentBookings = ongoingBookings

  // Check if booking can be edited (≥5 hours in advance)
  const canEditBooking = (booking: Booking): boolean => {
    const now = new Date()
    const bookingStart = new Date(booking.startAt)
    const hoursDifference = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursDifference >= 5
  }

  // Handle edit booking - navigate to book-now page
  const handleEdit = (booking: Booking) => {
    if (!canEditBooking(booking)) {
      toast({
        title: "Cannot Edit",
        description: "Bookings can only be edited 5 hours or more in advance",
        variant: "destructive",
      })
      return
    }

    // Navigate to book-now page with existing booking data
    // This will allow users to modify timing, dates, and seats
    // but not change member type
    const bookingData = encodeURIComponent(JSON.stringify({
      id: booking.id,
      startAt: booking.startAt,
      endAt: booking.endAt,
      location: booking.location,
      specialRequests: booking.specialRequests || '',
      totalAmount: booking.totalAmount,
      memberType: booking.User?.memberType || 'working_adult',
      isEditing: true
    }))

    window.location.href = `/book-now?edit=${bookingData}`
  }





  // Get current tab bookings
  const getCurrentTabBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings
      case 'ongoing':
        return ongoingBookings
      case 'past':
        return pastBookings
      default:
        return []
    }
  }

  const currentTabBookings = getCurrentTabBookings()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">My Bookings</h2>
      </div>



      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.upcomingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Future bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ongoing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ongoingBookings.length}</div>
            <p className="text-xs text-muted-foreground">
              Active now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.pastBookings}</div>
            <p className="text-xs text-muted-foreground">
              Completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${bookings
                .filter(booking => booking.confirmedPayment) // Only include confirmed payments
                .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
                .toFixed(2)}
            </div>
          
          </CardContent>
        </Card>



      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'upcoming'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('ongoing')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'ongoing'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Ongoing ({ongoingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${activeTab === 'past'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }`}
        >
          Past ({pastBookings.length})
        </button>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'upcoming' ? 'Upcoming Bookings' : 
             activeTab === 'ongoing' ? 'Ongoing Bookings' : 'Past Bookings'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : currentTabBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">
                {activeTab === 'upcoming' ? 'No upcoming bookings' : 
                 activeTab === 'ongoing' ? 'No ongoing bookings' : 'No past bookings'}
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'upcoming'
                  ? 'Book a study space to get started'
                  : activeTab === 'ongoing'
                  ? 'Your active bookings will appear here'
                  : 'Your completed bookings will appear here'
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTabBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-mono font-bold">{booking.bookingRef}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{booking.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{formatBookingDate(booking.startAt)}</div>
                        <div className="text-gray-500">to {formatBookingDate(booking.endAt)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {calculateDuration(booking.startAt, booking.endAt)} hours
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">${booking.totalAmount}</div>

                        {/* {booking.discountAmount && booking.discountAmount > 0 && (
    <div className="text-xs text-green-600">
      -${booking.discountAmount} off
    </div>
  )}

  {booking.PromoCode?.code && (
    <div className="text-xs text-blue-600">
      {booking.PromoCode.code} applied
    </div>
  )} */}
                      </div>

                      {/* <div className="text-sm">
                        <div className="font-medium">${booking.totalAmount}</div>
                        {booking.discountAmount && booking.discountAmount > 0 && (
                          <div className="text-xs text-green-600">
                            -${booking.discountAmount} off
                          </div>
                        )}
                        {booking.PromoCode && (
                          <div className="text-xs text-blue-600">
                            {booking.PromoCode.code} applied
                          </div>
                        )}
                      </div> */}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(getBookingStatus(booking))}>
                        {getBookingStatus(booking)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.confirmedPayment ? (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Paid</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-sm">Unpaid</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {activeTab === 'upcoming' && canEditBooking(booking) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(booking)}
                          className="hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}

                      {activeTab === 'upcoming' && !canEditBooking(booking) && (
                        <div className="text-sm text-gray-500">
                          <AlertTriangle className="h-4 w-4 inline mr-1" />
                          Cannot edit
                        </div>
                      )}

                      {activeTab === 'ongoing' && (
                        <div className="text-sm text-green-600 font-medium">
                          <Clock className="h-4 w-4 inline mr-1" />
                          In Progress
                        </div>
                      )}

                      {activeTab === 'past' && (
                        <div className="text-sm text-gray-500">
                          Completed
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Special Requests Display */}
      {currentTabBookings.some(booking => booking.specialRequests) && (
        <Card>
          <CardHeader>
            <CardTitle>Special Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentTabBookings
                .filter(booking => booking.specialRequests)
                .map(booking => (
                  <div key={booking.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{booking.bookingRef}</div>
                        <div className="text-sm text-gray-600">{booking.specialRequests}</div>
                      </div>
                      <Badge variant="outline">{booking.location}</Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}








    </div>
  )
}
