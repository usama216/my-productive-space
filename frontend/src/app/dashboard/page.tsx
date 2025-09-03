// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
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
  Package,
  Loader2,
  AlertCircle,
  BarChart3,
  Star
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
import { PromoCodeHistory } from '@/components/dashboard/PromoCodeHistory'
import { UserBookings } from '@/components/dashboard/UserBookings'
import { UserPromoCodes } from '@/components/dashboard/UserPromoCodes'
import { UserPackages } from '@/components/dashboard/UserPackages'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getUserProfile, updateUserProfile, UserProfile, formatUserName, getMemberTypeDisplayName, getVerificationStatusDisplayName, getVerificationStatusColor } from '@/lib/userProfileService'

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
  status: 'confirmed' | 'cancelled' | 'completed' | 'pending'
  bookingReference: string
  canEdit: boolean
  canCancel: boolean
}

export default function Dashboard() {
  const { user: authUser, databaseUser } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(false)
    const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    memberType: 'MEMBER' as 'STUDENT' | 'MEMBER' | 'TUTOR'
  })

  // Sample data for testing (fallback)
  const sampleUserData = {
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    contactNumber: '+1 (555) 123-4567',
    memberType: 'MEMBER' as const,
    studentVerificationStatus: 'NA' as const
  }

  // Debug: Log user data
  console.log('Auth User:', authUser)
  console.log('Database User:', databaseUser)

  // Load user profile data
  const loadUserProfile = async () => {
    if (!authUser?.id) return
    
    setIsLoadingProfile(true)
    try {
      const profile = await getUserProfile(authUser.id)
      if (profile) {
        setUserProfile(profile)
        setEditFormData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          contactNumber: profile.contactNumber,
          memberType: profile.memberType
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Handle edit profile
  const handleEditProfile = () => {
    setIsEditingProfile(true)
  }

  // Handle save profile changes
  const handleSaveProfile = async () => {
    if (!authUser?.id || !userProfile) return
    
    setIsLoadingProfile(true)
    try {
      const updatedProfile = await updateUserProfile(authUser.id, editFormData)
      if (updatedProfile) {
        setUserProfile(updatedProfile)
        setIsEditingProfile(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setIsLoadingProfile(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (userProfile) {
      setEditFormData({
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        contactNumber: userProfile.contactNumber,
        memberType: userProfile.memberType
      })
    }
    setIsEditingProfile(false)
  }

  // Load user profile when component mounts or authUser changes
  useEffect(() => {
    loadUserProfile()
  }, [authUser?.id])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // Handle booking cancellation
  const handleCancelBooking = async (booking: Booking) => {
    setIsLoading(true)

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    console.log('Booking cancellation request:', booking)
    alert('Booking cancelled successfully!')
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
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-32 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, {databaseUser?.name || 'User'}!
                </p>
              </div>
              {/* <div className="flex items-center space-x-4">
                <Button onClick={() => router.push('/book-now')} className="bg-orange-500 hover:bg-orange-600">
                  Book Now
                </Button>
                <Button variant="outline" onClick={() => router.push('/buy-pass')}>
                  Buy Passes
                </Button>
              </div> */}
            </div>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="mybookings">My Bookings</TabsTrigger>
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="passes">Passes</TabsTrigger>
              <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
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
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming bookings</h3>
                      <p className="text-gray-600 mb-4">You don't have any upcoming bookings at the moment.</p>
                      <Button onClick={() => router.push('/book-now')}>
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">0</div>
                        <div className="text-sm text-blue-600">Total Bookings</div>
                    </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">0</div>
                        <div className="text-sm text-green-600">Hours Used</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <div className="space-y-6">
                {/* Profile Header */}
              <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Profile Information
                    </CardTitle>
                                      <p className="text-sm text-gray-600">
                      Manage your account information and preferences
                    </p>
                    {isLoadingProfile && (
                      <Alert className="mt-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <AlertDescription>
                          Loading profile data...
                        </AlertDescription>
                      </Alert>
                    )}
                    {!userProfile && !isLoadingProfile && (
                      <Alert className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Showing sample data. Real user data will be displayed when available.
                        </AlertDescription>
                      </Alert>
                    )}
                </CardHeader>
                  <CardContent className="space-y-6">
                    {/* User Avatar and Basic Info */}
                    <div className="flex items-center space-x-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {userProfile ? formatUserName(userProfile) : (databaseUser?.name || authUser?.user_metadata?.full_name || sampleUserData.name)}
                        </h3>
                        <p className="text-gray-600">{userProfile?.email || authUser?.email || sampleUserData.email}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {userProfile ? getMemberTypeDisplayName(userProfile.memberType) : (databaseUser?.memberType || sampleUserData.memberType)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={userProfile ? getVerificationStatusColor(userProfile.studentVerificationStatus) : 
                              (databaseUser?.studentVerificationStatus || sampleUserData.studentVerificationStatus) === 'VERIFIED' 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : (databaseUser?.studentVerificationStatus || sampleUserData.studentVerificationStatus) === 'PENDING'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-gray-50 text-gray-700 border-gray-200'
                            }
                          >
                            {userProfile ? getVerificationStatusDisplayName(userProfile.studentVerificationStatus) :
                             (databaseUser?.studentVerificationStatus || sampleUserData.studentVerificationStatus) === 'VERIFIED' ? 'Verified Student' :
                             (databaseUser?.studentVerificationStatus || sampleUserData.studentVerificationStatus) === 'PENDING' ? 'Verification Pending' :
                             'Not Verified'}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleEditProfile}
                        disabled={isLoadingProfile}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                      </Button>
                    </div>

                    {/* Detailed Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                        <div>
                          <Label htmlFor="firstName">First Name</Label>
                                                  <Input
                          id="firstName"
                          value={isEditingProfile ? editFormData.firstName : (userProfile?.firstName || databaseUser?.firstName || authUser?.user_metadata?.full_name?.split(' ')[0] || sampleUserData.firstName)}
                          disabled={!isEditingProfile}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="mt-1"
                        />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={isEditingProfile ? editFormData.lastName : (userProfile?.lastName || databaseUser?.lastName || authUser?.user_metadata?.full_name?.split(' ').slice(1).join(' ') || sampleUserData.lastName)}
                            disabled={!isEditingProfile}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          value={authUser?.email || ''}
                          disabled
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Contact Number</Label>
                        <Input
                          id="phone"
                          value={isEditingProfile ? editFormData.contactNumber : (userProfile?.contactNumber || databaseUser?.contactNumber || authUser?.user_metadata?.phone || sampleUserData.contactNumber)}
                          disabled={!isEditingProfile}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="memberType">Member Type</Label>
                        <Select 
                          disabled={!isEditingProfile} 
                          value={isEditingProfile ? editFormData.memberType : (userProfile?.memberType || databaseUser?.memberType || sampleUserData.memberType)}
                          onValueChange={(value) => setEditFormData(prev => ({ ...prev, memberType: value as 'STUDENT' | 'MEMBER' | 'TUTOR' }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="TUTOR">Tutor</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>
                        <div>
                        <Label htmlFor="verificationStatus">Student Verification</Label>
                        <Select disabled value={userProfile?.studentVerificationStatus || databaseUser?.studentVerificationStatus || sampleUserData.studentVerificationStatus}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NA">Not Applicable</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="VERIFIED">Verified</SelectItem>
                          </SelectContent>
                        </Select>
                        </div>
                      </div>

                    {/* Edit Profile Actions */}
                    {isEditingProfile && (
                      <div className="pt-6 border-t">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={handleCancelEdit}
                            disabled={isLoadingProfile}
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleSaveProfile}
                            disabled={isLoadingProfile}
                          >
                            {isLoadingProfile ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Saving...
                              </>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Account Statistics */}
                    {/* <div className="pt-6 border-t">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <Calendar className="w-8 h-8 text-blue-600 mr-3" />
                      <div>
                              <p className="text-sm text-blue-600 font-medium">Total Bookings</p>
                              <p className="text-2xl font-bold text-blue-700">0</p>
                      </div>
                      </div>
                      </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <Clock className="w-8 h-8 text-green-600 mr-3" />
                      <div>
                              <p className="text-sm text-green-600 font-medium">Hours Used</p>
                              <p className="text-2xl font-bold text-green-700">0</p>
                      </div>
                    </div>
                    </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <div className="flex items-center">
                            <Gift className="w-8 h-8 text-purple-600 mr-3" />
                                <div>
                              <p className="text-sm text-purple-600 font-medium">Promo Codes Used</p>
                              <p className="text-2xl font-bold text-purple-700">0</p>
                                </div>
                              </div>
                              </div>
                            </div>
                            </div> */}
                </CardContent>
              </Card>

                
                      </div>
            </TabsContent>

            {/* Passes Tab - User Packages */}
            <TabsContent value="passes" className="space-y-6">
              <UserPackages userId={authUser?.id || ''} />
            </TabsContent>

            {/* Promo Codes Tab */}
            <TabsContent value="promocodes" className="space-y-6">
              <UserPromoCodes userId={authUser?.id || ''} />
            </TabsContent>

            {/* My Bookings Tab */}
            <TabsContent value="mybookings" className="space-y-6">
              <UserBookings />
            </TabsContent>

          </Tabs>
        </div>
      </div>

      {/* Cancellation Dialog */}
      <Dialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          {cancellingBooking && (
            <div className="space-y-4">
              <p>Are you sure you want to cancel this booking?</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{cancellingBooking.locationName}</h4>
                <p className="text-sm text-gray-600">{cancellingBooking.locationAddress}</p>
                <p className="text-sm text-gray-500">
                  {new Date(cancellingBooking.date).toLocaleDateString()} at {cancellingBooking.startTime} - {cancellingBooking.endTime}
                </p>
                <p className="text-sm text-gray-500">Ref: {cancellingBooking.bookingReference}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCancellingBooking(null)}>
                  Keep Booking
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelBooking(cancellingBooking)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cancel Booking'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={!!editingBooking} onOpenChange={() => setEditingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="space-y-4">
              <p>You will be redirected to the booking page to make changes.</p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold">{editingBooking.locationName}</h4>
                <p className="text-sm text-gray-600">{editingBooking.locationAddress}</p>
                <p className="text-sm text-gray-500">
                  {new Date(editingBooking.date).toLocaleDateString()} at {editingBooking.startTime} - {editingBooking.endTime}
                </p>
                <p className="text-sm text-gray-500">Ref: {editingBooking.bookingReference}</p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingBooking(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEditBooking(editingBooking)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Edit Booking'}
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