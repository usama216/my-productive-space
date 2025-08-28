// src/components/dashboard/UserBookings.tsx - User booking dashboard
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Calendar, Clock, MapPin, Users, DollarSign, CheckCircle, XCircle, Edit, GraduationCap, AlertTriangle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  Booking, 
  getAllBookings, 
  getUserStats,
  updateAdminBooking,
  formatBookingDate,
  getBookingStatus,
  getStatusColor,
  calculateDuration
} from '@/lib/bookingService'

export function UserBookings() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState({ upcomingBookings: 0, pastBookings: 0 })
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')
  
  // Edit booking state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editFormData, setEditFormData] = useState({
    startAt: '',
    endAt: '',
    location: '',
    specialRequests: '',
    totalAmount: 0
  })
  
  // Membership conversion state
  const [isMembershipDialogOpen, setIsMembershipDialogOpen] = useState(false)
  const [membershipFormData, setMembershipFormData] = useState({
    currentType: '',
    targetType: '',
    reason: '',
    documents: [] as File[]
  })

  // Load user bookings
  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await getAllBookings()
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
      setUserStats(stats)
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
    new Date(booking.startAt) > new Date() && !booking.isCompleted
  )
  
  const pastBookings = bookings.filter(booking => 
    new Date(booking.endAt) < new Date() || booking.isCompleted
  )

  const currentBookings = bookings.filter(booking => {
    const now = new Date()
    const start = new Date(booking.startAt)
    const end = new Date(booking.endAt)
    return now >= start && now <= end
  })

  // Check if booking can be edited (≥5 hours in advance)
  const canEditBooking = (booking: Booking): boolean => {
    const now = new Date()
    const bookingStart = new Date(booking.startAt)
    const hoursDifference = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60)
    return hoursDifference >= 5
  }

  // Handle edit booking
  const handleEdit = (booking: Booking) => {
    if (!canEditBooking(booking)) {
      toast({
        title: "Cannot Edit",
        description: "Bookings can only be edited 5 hours or more in advance",
        variant: "destructive",
      })
      return
    }
    
    setEditingBooking(booking)
    setEditFormData({
      startAt: booking.startAt.slice(0, 16), // Format for datetime-local input
      endAt: booking.endAt.slice(0, 16),
      location: booking.location,
      specialRequests: booking.specialRequests || '',
      totalAmount: booking.totalAmount
    })
    setIsEditDialogOpen(true)
  }

  // Handle update booking
  const handleUpdate = async () => {
    if (!editingBooking) return
    
    setIsSubmitting(true)
    try {
      const payload = {
        startAt: new Date(editFormData.startAt).toISOString(),
        endAt: new Date(editFormData.endAt).toISOString(),
        location: editFormData.location,
        specialRequests: editFormData.specialRequests,
        totalAmount: editFormData.totalAmount
      }

      const response = await updateAdminBooking(editingBooking.id, payload)
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingBooking(null)
        loadBookings()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Update Error:', error)
      toast({
        title: "Error",
        description: "Failed to update booking",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle membership conversion
  const handleMembershipConversion = async () => {
    try {
      // This would call an API to request membership conversion
      // For now, just show a success message
      toast({
        title: "Request Submitted",
        description: "Your membership conversion request has been submitted. We'll review and get back to you within 24 hours.",
      })
      setIsMembershipDialogOpen(false)
      setMembershipFormData({
        currentType: '',
        targetType: '',
        reason: '',
        documents: []
      })
    } catch (error) {
      console.error('Membership Conversion Error:', error)
      toast({
        title: "Error",
        description: "Failed to submit membership conversion request",
        variant: "destructive",
      })
    }
  }

  // Get current tab bookings
  const getCurrentTabBookings = () => {
    switch (activeTab) {
      case 'upcoming':
        return upcomingBookings
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
        <p className="text-gray-600">Manage your study space bookings</p>
      </div>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Important Notice:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li><strong>No Cancellations:</strong> Bookings cannot be cancelled once confirmed</li>
              <li><strong>No Refunds:</strong> Payment is non-refundable</li>
              <li><strong>Edit Policy:</strong> Bookings can only be edited 5+ hours in advance</li>
              <li><strong>Extra Charges:</strong> Changes may incur additional fees</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium">Current</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentBookings.length}</div>
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
              ${bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-gray-50" onClick={() => setIsMembershipDialogOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">Convert</div>
            <p className="text-xs text-muted-foreground">
              Member → Student
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Upcoming ({upcomingBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'past'
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
            {activeTab === 'upcoming' ? 'Upcoming Bookings' : 'Past Bookings'}
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
                {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
              </p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'upcoming' 
                  ? 'Book a study space to get started' 
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
                      </div>
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

      {/* Edit Booking Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            {isSubmitting && (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Updating...</span>
              </div>
            )}
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editStartAt">Start Time *</Label>
                <Input
                  id="editStartAt"
                  type="datetime-local"
                  value={editFormData.startAt}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, startAt: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editEndAt">End Time *</Label>
                <Input
                  id="editEndAt"
                  type="datetime-local"
                  value={editFormData.endAt}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, endAt: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editLocation">Location *</Label>
                <Input
                  id="editLocation"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="editTotalAmount">Total Amount *</Label>
                <Input
                  id="editTotalAmount"
                  type="number"
                  step="0.01"
                  value={editFormData.totalAmount}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="editSpecialRequests">Special Requests</Label>
              <Textarea
                id="editSpecialRequests"
                value={editFormData.specialRequests}
                onChange={(e) => setEditFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                placeholder="Any special requirements..."
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? 'Updating...' : 'Update Booking'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Membership Conversion Dialog */}
      <Dialog open={isMembershipDialogOpen} onOpenChange={setIsMembershipDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GraduationCap className="h-5 w-5" />
              <span>Membership Conversion Request</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Important Information:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Membership conversion from Member to Student requires verification</li>
                    <li>You'll need to provide student ID or enrollment documents</li>
                    <li>Processing time: 24-48 hours</li>
                    <li>Student members get access to student-specific discounts</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currentType">Current Membership Type</Label>
                <Select 
                  value={membershipFormData.currentType} 
                  onValueChange={(value) => setMembershipFormData(prev => ({ ...prev, currentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select current type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetType">Target Membership Type</Label>
                <Select 
                  value={membershipFormData.targetType} 
                  onValueChange={(value) => setMembershipFormData(prev => ({ ...prev, targetType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="conversionReason">Reason for Conversion</Label>
              <Textarea
                id="conversionReason"
                value={membershipFormData.reason}
                onChange={(e) => setMembershipFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please explain why you want to convert your membership..."
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsMembershipDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleMembershipConversion}
                disabled={!membershipFormData.currentType || !membershipFormData.targetType || !membershipFormData.reason}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Submit Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
