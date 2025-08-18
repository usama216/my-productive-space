// src/app/dashboard/page.tsx
'use client'

import { useState } from 'react'
import {
  User,
  Calendar,
  CreditCard,
  Settings,
  History,
  Edit,
  Trash2,
  MapPin,
  Clock,
  Users,
  AlertTriangle,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  Gift,
  Package
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Navbar from '@/components/Navbar'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import { EntitlementHistory } from '@/components/dashboard/EntitlementHistory'

// Mock data types
interface Booking {
  id: string
  locationName: string
  locationAddress: string
  date: string
  startTime: string
  endTime: string
  numberOfPeople: number
  selectedSeats: string[]
  totalAmount: number
  status: 'confirmed' | 'cancelled' | 'completed'
  canEdit: boolean
  canCancel: boolean
  bookingReference: string
}

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  contactNumber: string
  memberType: 'student' | 'professional' | 'freelancer'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  joinDate: string
}

// Mock data
const mockUser: UserProfile = {
  id: '1',
  email: 'john.doe@example.com',
  firstName: 'John',
  lastName: 'Doe',
  contactNumber: '+65 9123 4567',
  memberType: 'professional',
  verificationStatus: 'verified',
  joinDate: '2024-01-15'
}

// Add this after your existing imports and before the mockUser declaration
const mockActivePackages = [
  { 
    id: 'pkg1', 
    name: '20-Day Pass', 
    total_passes: 20, 
    passes_used: 4,
    purchased_at: '2025-01-15T00:00:00Z',
    expires_at: '2025-09-15T23:59:59Z',
    package_type: 'full-day',
    is_expired: false
  },
  { 
    id: 'pkg2', 
    name: '15-Half-Day Pass', 
    total_passes: 15, 
    passes_used: 3,
    purchased_at: '2025-01-20T00:00:00Z',
    expires_at: '2025-09-20T23:59:59Z',
    package_type: 'half-day',
    is_expired: false
  },
  { 
    id: 'pkg3', 
    name: 'Student Semester Bundle', 
    total_passes: 20, 
    passes_used: 8,
    purchased_at: '2025-01-10T00:00:00Z',
    expires_at: '2025-09-10T23:59:59Z',
    package_type: 'study-hour',
    is_expired: false
  }
]

const mockBookings: Booking[] = [
  {
    id: '1',
    locationName: 'Bukit Panjang',
    locationAddress: '123 Bukit Panjang Plaza, Singapore 670123',
    date: '2024-12-28',
    startTime: '09:00',
    endTime: '17:00',
    numberOfPeople: 2,
    selectedSeats: ['S1', 'S2'],
    totalAmount: 40.00,
    status: 'confirmed',
    canEdit: true,
    canCancel: true,
    bookingReference: 'BK001234'
  },
  {
    id: '2',
    locationName: 'Kovan',
    locationAddress: '456 Kovan Road, Singapore 560456',
    date: '2024-12-15',
    startTime: '10:00',
    endTime: '16:00',
    numberOfPeople: 1,
    selectedSeats: ['S5'],
    totalAmount: 18.00,
    status: 'completed',
    canEdit: false,
    canCancel: false,
    bookingReference: 'BK001235'
  },
  {
    id: '3',
    locationName: 'Ang Mo Kio',
    locationAddress: '789 Ang Mo Kio Avenue 3, Singapore 560789',
    date: '2025-04-20',
    startTime: '14:00',
    endTime: '18:00',
    numberOfPeople: 3,
    selectedSeats: ['S7', 'S8', 'S9'],
    totalAmount: 25.90,
    status: 'cancelled',
    canEdit: false,
    canCancel: false,
    bookingReference: 'BK001236'
  }
]

export default function UAMDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [user, setUser] = useState<UserProfile>(mockUser)
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Get upcoming and past bookings
  const upcomingBookings = bookings.filter(b =>
    new Date(b.date) >= new Date() && b.status === 'confirmed'
  )
  const pastBookings = bookings.filter(b =>
    new Date(b.date) < new Date() || b.status === 'completed' || b.status === 'cancelled'
  )

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Profile updated:', user)
    alert('Profile updated successfully!')
    setEditingProfile(false)
    setIsLoading(false)
  }

  // Handle booking cancellation
  const handleCancelBooking = async (booking: Booking) => {
    setIsLoading(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update booking status
    setBookings(prev => prev.map(b =>
      b.id === booking.id
        ? { ...b, status: 'cancelled' as const, canEdit: false, canCancel: false }
        : b
    ))

    console.log('Booking cancelled:', booking.id)
    console.log('Admin email notification sent for cancellation')
    alert(`Booking ${booking.bookingReference} cancelled successfully! Admin has been notified for refund processing.`)
    setCancellingBooking(null)
    setIsLoading(false)
  }

  // Handle booking edit
  const handleEditBooking = async (booking: Booking) => {
    setIsLoading(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Booking edit request:', booking)
    alert('Booking edit request submitted! You will be redirected to the booking page.')
    setEditingBooking(null)
    setIsLoading(false)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      pending: 'bg-yellow-100 text-yellow-800'
    }

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const BookingCard = ({ booking, showActions = true }: { booking: Booking, showActions?: boolean }) => (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h4 className="font-semibold text-lg">{booking.locationName}</h4>
            <p className="text-sm text-gray-600 mb-2">{booking.locationAddress}</p>
            <p className="text-sm text-gray-500">Ref: {booking.bookingReference}</p>
          </div>
          <StatusBadge status={booking.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-gray-400" />
            <span>{booking.startTime} - {booking.endTime}</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-400" />
            <span>{booking.numberOfPeople} people</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
            <span>Seats: {booking.selectedSeats.join(', ')}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex justify-between items-center">
          <span className="font-semibold text-lg">${booking.totalAmount}</span>

          {showActions && booking.status === 'confirmed' && (
            <div className="space-x-2">
              {booking.canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingBooking(booking)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
              {booking.canCancel && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setCancellingBooking(booking)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600">Manage your bookings and account settings</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{upcomingBookings.length}</p>
                <p className="text-sm text-gray-600">Upcoming Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <History className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{pastBookings.length}</p>
                <p className="text-sm text-gray-600">Past Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">${bookings.reduce((sum, b) => sum + b.totalAmount, 0)}</p>
                <p className="text-sm text-gray-600">Total Spent</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <User className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold capitalize">{user.memberType}</p>
                <p className="text-sm text-gray-600">Member Type</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="passes">Passes & Vouchers</TabsTrigger>

            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Bookings Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Upcoming Bookings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {upcomingBookings.length > 0 ? (
                      upcomingBookings.slice(0, 2).map(booking => (
                        <BookingCard key={booking.id} booking={booking} showActions={false} />
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">No upcoming bookings</p>
                    )}
                    {upcomingBookings.length > 2 && (
                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setActiveTab('upcoming')}
                      >
                        View All Upcoming Bookings
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Account Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Email Verified</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Member Status</span>
                      <div className="flex items-center">
                        {user.verificationStatus === 'verified' ? (
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mr-2" />
                        )}
                        <span className="capitalize">{user.verificationStatus}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Member Since</span>
                      <span>{new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => setActiveTab('profile')}
                    >
                      Edit Profile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <p className="text-sm text-gray-600">
                    Manage your account information and membership type
                  </p>
                </CardHeader>
                <CardContent>
                  {editingProfile ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={user.firstName}
                            onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={user.lastName}
                            onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user.email}
                          onChange={(e) => setUser({ ...user, email: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="contactNumber">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          value={user.contactNumber}
                          onChange={(e) => setUser({ ...user, contactNumber: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="memberType">Member Type</Label>
                        <Select
                          value={user.memberType}
                          onValueChange={(value: 'student' | 'professional' | 'freelancer') =>
                            setUser({ ...user, memberType: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="freelancer">Freelancer</SelectItem>
                          </SelectContent>
                        </Select>
                        {user.memberType === 'student' && (
                          <p className="text-xs text-amber-600 mt-1">
                            Changing to student requires document verification
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setEditingProfile(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                          {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>First Name</Label>
                          <p className="text-sm text-gray-600">{user.firstName}</p>
                        </div>
                        <div>
                          <Label>Last Name</Label>
                          <p className="text-sm text-gray-600">{user.lastName}</p>
                        </div>
                      </div>

                      <div>
                        <Label>Email</Label>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>

                      <div>
                        <Label>Contact Number</Label>
                        <p className="text-sm text-gray-600">{user.contactNumber}</p>
                      </div>

                      <div>
                        <Label>Member Type</Label>
                        <p className="text-sm text-gray-600 capitalize">{user.memberType}</p>
                      </div>

                      <div>
                        <Label>Verification Status</Label>
                        <p className="text-sm text-gray-600 capitalize">{user.verificationStatus}</p>
                      </div>

                      <Button
                        onClick={() => setEditingProfile(true)}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Upcoming Bookings Tab */}
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Bookings</CardTitle>
                  <p className="text-sm text-gray-600">
                    You can edit bookings up to 5 hours before the start time
                  </p>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length > 0 ? (
                    upcomingBookings.map(booking => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                      <p className="text-gray-600 mb-4">Ready to book your next co-working session?</p>
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        Book Now
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              {/* Booking History */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking History</CardTitle>
                  <p className="text-sm text-gray-600">
                    Your past and cancelled bookings
                  </p>
                </CardHeader>
                <CardContent>
                  {pastBookings.length > 0 ? (
                    pastBookings.map(booking => (
                      <BookingCard key={booking.id} booking={booking} showActions={false} />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <History className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No booking history</h3>
                      <p className="text-gray-600">Your completed and cancelled bookings will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            {/* Passes & Vouchers Tab */}
            <TabsContent value="passes" className="space-y-6">
              {/* Active Passes Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Active Passes
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Your currently available passes and their usage
                  </p>
                </CardHeader>
                <CardContent>
                  {mockActivePackages.length > 0 ? (
                    <div className="space-y-4">
                      {mockActivePackages.map((pkg) => {
                        const remaining = pkg.total_passes - pkg.passes_used
                        return (
                          <Card key={pkg.id} className="bg-green-50 border-green-200">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-lg">
                                      {pkg.package_type === 'full-day' ? '🌅' : pkg.package_type === 'half-day' ? '🌤️' : '📚'}
                                    </span>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-lg text-green-800">{pkg.name}</h4>
                                    <p className="text-sm text-green-700">
                                      {remaining} of {pkg.total_passes} passes remaining
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                                <div className="flex items-center text-green-700">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>Purchased: {new Date(pkg.purchased_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-green-700">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>Expires: {new Date(pkg.expires_at).toLocaleDateString()}</span>
                                </div>
                              </div>

                              {/* Usage Progress Bar */}
                              <div className="mb-3">
                                <div className="flex justify-between text-xs text-green-700 mb-1">
                                  <span>Usage Progress</span>
                                  <span>{Math.round((pkg.passes_used / pkg.total_passes) * 100)}%</span>
                                </div>
                                <div className="w-full bg-green-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-green-600"
                                    style={{ width: `${(pkg.passes_used / pkg.total_passes) * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              <p className="text-sm text-green-700">
                                Code: {pkg.package_type}_user123
                              </p>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No active passes</h3>
                      <p className="text-gray-600">Purchase passes to unlock member benefits</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Usage History */}
              <EntitlementHistory />
            </TabsContent>


          </Tabs>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      <Dialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Cancel Booking
            </DialogTitle>
          </DialogHeader>

          {cancellingBooking && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Cancellation Policy:</strong>
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>Cancellations made more than 24 hours before booking: Full refund</li>
                    <li>Cancellations made 6-24 hours before booking: 50% refund</li>
                    <li>Cancellations made less than 6 hours before booking: No refund</li>
                    <li>All refunds are processed manually by admin within 3-5 business days</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Booking Details:</h4>
                <p><strong>Location:</strong> {cancellingBooking.locationName}</p>
                <p><strong>Date:</strong> {new Date(cancellingBooking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {cancellingBooking.startTime} - {cancellingBooking.endTime}</p>
                <p><strong>Amount:</strong> ${cancellingBooking.totalAmount}</p>
                <p><strong>Reference:</strong> {cancellingBooking.bookingReference}</p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setCancellingBooking(null)}
                  className="flex-1"
                >
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelBooking(cancellingBooking)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Modal */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Edit className="w-5 h-5 mr-2" />
              Edit Booking
            </DialogTitle>
          </DialogHeader>

          {editingBooking && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  <strong>Edit Policy:</strong> Bookings can only be edited up to 5 hours before the start time.
                  You'll be redirected to the booking page to make changes.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">Current Booking:</h4>
                <p><strong>Location:</strong> {editingBooking.locationName}</p>
                <p><strong>Date:</strong> {new Date(editingBooking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {editingBooking.startTime} - {editingBooking.endTime}</p>
                <p><strong>People:</strong> {editingBooking.numberOfPeople}</p>
                <p><strong>Seats:</strong> {editingBooking.selectedSeats.join(', ')}</p>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setEditingBooking(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditBooking(editingBooking)}
                  disabled={isLoading}
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                >
                  {isLoading ? 'Processing...' : 'Continue to Edit'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <FooterSection />
    </div>
  )
}