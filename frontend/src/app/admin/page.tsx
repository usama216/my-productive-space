// src/app/admin/page.tsx
'use client'

import { useState } from 'react'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Clock,
  Mail,
  FileText,
  Settings,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Navbar from '@/components/Navbar'
import {FooterSection} from '@/components/landing-page-sections/FooterSection'
import AdminHeader from '@/components/admin/AdminHeader'
import AdminStats from '@/components/admin/AdminStats'
import AdminTabs from '@/components/admin/AdminTabs'
import CancellationReviewModal from '@/components/admin/CancellationReviewModal'
import UserVerificationModal from '@/components/admin/UserVerificationModal'



// Mock data types
interface CancellationRequest {
  id: string
  bookingReference: string
  userEmail: string
  userName: string
  locationName: string
  bookingDate: string
  bookingTime: string
  totalAmount: number
  reason: string
  requestDate: string
  refundAmount: number
  status: 'pending' | 'processed' | 'rejected'
}

interface UserAccount {
  id: string
  email: string
  name: string
  memberType: 'student' | 'professional' | 'freelancer'
  verificationStatus: 'pending' | 'verified' | 'rejected'
  joinDate: string
  totalBookings: number
  totalSpent: number
}

// Mock data
const mockCancellations: CancellationRequest[] = [
  {
    id: '1',
    bookingReference: 'BK001236',
    userEmail: 'john.doe@example.com',
    userName: 'John Doe',
    locationName: 'Ang Mo Kio',
    bookingDate: '2024-11-20',
    bookingTime: '14:00 - 18:00',
    totalAmount: 7.50,
    reason: 'Emergency meeting',
    requestDate: '2024-11-19',
    refundAmount: 7.50,
    status: 'pending'
  },
  {
    id: '2',
    bookingReference: 'BK001237',
    userEmail: 'jane.smith@example.com',
    userName: 'Jane Smith',
    locationName: 'Bukit Panjang',
    bookingDate: '2024-12-15',
    bookingTime: '09:00 - 17:00',
    totalAmount: 10.50,
    reason: 'Sick leave',
    requestDate: '2024-12-14',
    refundAmount: 10,
    status: 'pending'
  }
]

const mockUsers: UserAccount[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    memberType: 'professional',
    verificationStatus: 'verified',
    joinDate: '2024-01-15',
    totalBookings: 5,
    totalSpent: 1200
  },
  {
    id: '2',
    email: 'jane.student@university.edu',
    name: 'Jane Student',
    memberType: 'student',
    verificationStatus: 'pending',
    joinDate: '2024-02-20',
    totalBookings: 2,
    totalSpent: 150
  }
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [cancellations, setCancellations] = useState<CancellationRequest[]>(mockCancellations)
  const [users, setUsers] = useState<UserAccount[]>(mockUsers)
  const [selectedCancellation, setSelectedCancellation] = useState<CancellationRequest | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Handle cancellation approval
  const handleCancellationAction = async (cancellation: CancellationRequest, action: 'approve' | 'reject') => {
    setIsLoading(true)
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setCancellations(prev => prev.map(c => 
      c.id === cancellation.id 
        ? { ...c, status: action === 'approve' ? 'processed' : 'rejected' }
        : c
    ))
    
    console.log(`Cancellation ${action}d:`, cancellation.id)
    console.log(`Email sent to: ${cancellation.userEmail}`)
    
    if (action === 'approve') {
      alert(`Refund of $${cancellation.refundAmount} approved for ${cancellation.bookingReference}. Email sent to customer.`)
    } else {
      alert(`Cancellation rejected for ${cancellation.bookingReference}. Email sent to customer.`)
    }
    
    setSelectedCancellation(null)
    setIsLoading(false)
  }

  // Handle user verification
  const handleUserVerification = async (user: UserAccount, action: 'verify' | 'reject') => {
    setIsLoading(true)
    
    // mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, verificationStatus: action === 'verify' ? 'verified' : 'rejected' }
        : u
    ))
    
    console.log(`User ${action}ed:`, user.id)
    alert(`User ${user.name} has been ${action}ed. Email notification sent.`)
    
    setSelectedUser(null)
    setIsLoading(false)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      processed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      verified: 'bg-green-100 text-green-800'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  // Filter cancellations
  const filteredCancellations = cancellations.filter(c => {
    const matchesSearch = c.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.bookingReference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus
    return matchesSearch && matchesFilter
  })

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || u.verificationStatus === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-32 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdminHeader />
        {/* <AdminStats cancellations={cancellations} users={users} /> */}
        

        
        <AdminTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          cancellations={cancellations}
          users={users}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          setSelectedCancellation={setSelectedCancellation}
          setSelectedUser={setSelectedUser}
          StatusBadge={StatusBadge}
          filteredCancellations={filteredCancellations}
          filteredUsers={filteredUsers}
        />
      </div>

      <CancellationReviewModal
        selectedCancellation={selectedCancellation}
        setSelectedCancellation={setSelectedCancellation}
        handleCancellationAction={handleCancellationAction}
        isLoading={isLoading}
      />

      <UserVerificationModal
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        handleUserVerification={handleUserVerification}
        isLoading={isLoading}
      />

      <FooterSection />
    </div>
  )

  // return (
  //   <div className="min-h-screen bg-gray-50">
  //     <Navbar />
      
  //     <div className="pt-32 pb-12">
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  //         {/* Header */}
  //         <div className="mb-8">
  //           <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
  //           <p className="text-gray-600">Manage bookings, users, and cancellations</p>
  //         </div>

  //         {/* Quick Stats */}
  //         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
  //           <Card>
  //             <CardContent className="p-4 text-center">
  //               <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
  //               <p className="text-2xl font-bold">{cancellations.filter(c => c.status === 'pending').length}</p>
  //               <p className="text-sm text-gray-600">Pending Cancellations</p>
  //             </CardContent>
  //           </Card>
  //           <Card>
  //             <CardContent className="p-4 text-center">
  //               <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
  //               <p className="text-2xl font-bold">{users.filter(u => u.verificationStatus === 'pending').length}</p>
  //               <p className="text-sm text-gray-600">Pending Verifications</p>
  //             </CardContent>
  //           </Card>
  //           <Card>
  //             <CardContent className="p-4 text-center">
  //               <Calendar className="w-8 h-8 mx-auto mb-2 text-green-600" />
  //               <p className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.totalBookings, 0)}</p>
  //               <p className="text-sm text-gray-600">Total Bookings</p>
  //             </CardContent>
  //           </Card>
  //           <Card>
  //             <CardContent className="p-4 text-center">
  //               <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-600" />
  //               <p className="text-2xl font-bold">${users.reduce((sum, u) => sum + u.totalSpent, 0)}</p>
  //               <p className="text-sm text-gray-600">Total Revenue</p>
  //             </CardContent>
  //           </Card>
  //         </div>

  //         {/* Main Content */}
  //         <Tabs value={activeTab} onValueChange={setActiveTab}>
  //           <TabsList className="grid w-full grid-cols-4">
  //             <TabsTrigger value="overview">Overview</TabsTrigger>
  //             <TabsTrigger value="cancellations">
  //               Cancellations 
  //               {cancellations.filter(c => c.status === 'pending').length > 0 && (
  //                 <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
  //                   {cancellations.filter(c => c.status === 'pending').length}
  //                 </span>
  //               )}
  //             </TabsTrigger>
  //             <TabsTrigger value="users">
  //               Users
  //               {users.filter(u => u.verificationStatus === 'pending').length > 0 && (
  //                 <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
  //                   {users.filter(u => u.verificationStatus === 'pending').length}
  //                 </span>
  //               )}
  //             </TabsTrigger>
  //             <TabsTrigger value="settings">Settings</TabsTrigger>
  //           </TabsList>

  //           {/* Overview Tab */}
  //           <TabsContent value="overview" className="space-y-6">
  //             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  //               {/* Recent Cancellations */}
  //               <Card>
  //                 <CardHeader>
  //                   <CardTitle className="flex items-center">
  //                     <AlertTriangle className="w-5 h-5 mr-2" />
  //                     Recent Cancellations
  //                   </CardTitle>
  //                 </CardHeader>
  //                 <CardContent>
  //                   {cancellations.slice(0, 3).map(cancellation => (
  //                     <div key={cancellation.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
  //                       <div>
  //                         <p className="font-medium text-sm">{cancellation.bookingReference}</p>
  //                         <p className="text-xs text-gray-600">{cancellation.userName}</p>
  //                       </div>
  //                       <div className="text-right">
  //                         <StatusBadge status={cancellation.status} />
  //                         <p className="text-xs text-gray-600 mt-1">${cancellation.refundAmount}</p>
  //                       </div>
  //                     </div>
  //                   ))}
  //                   <Button 
  //                     variant="outline" 
  //                     className="w-full mt-4"
  //                     onClick={() => setActiveTab('cancellations')}
  //                   >
  //                     View All Cancellations
  //                   </Button>
  //                 </CardContent>
  //               </Card>

  //               {/* Pending Verifications */}
  //               <Card>
  //                 <CardHeader>
  //                   <CardTitle className="flex items-center">
  //                     <Clock className="w-5 h-5 mr-2" />
  //                     Pending Verifications
  //                   </CardTitle>
  //                 </CardHeader>
  //                 <CardContent>
  //                   {users.filter(u => u.verificationStatus === 'pending').slice(0, 3).map(user => (
  //                     <div key={user.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
  //                       <div>
  //                         <p className="font-medium text-sm">{user.name}</p>
  //                         <p className="text-xs text-gray-600">{user.email}</p>
  //                       </div>
  //                       <div className="text-right">
  //                         <Badge className="bg-blue-100 text-blue-800 capitalize">
  //                           {user.memberType}
  //                         </Badge>
  //                         <p className="text-xs text-gray-600 mt-1">
  //                           {new Date(user.joinDate).toLocaleDateString()}
  //                         </p>
  //                       </div>
  //                     </div>
  //                   ))}
  //                   <Button 
  //                     variant="outline" 
  //                     className="w-full mt-4"
  //                     onClick={() => setActiveTab('users')}
  //                   >
  //                     View All Users
  //                   </Button>
  //                 </CardContent>
  //               </Card>
  //             </div>
  //           </TabsContent>

  //           {/* Cancellations Tab */}
  //           <TabsContent value="cancellations">
  //             <Card>
  //               <CardHeader>
  //                 <div className="flex justify-between items-center">
  //                   <CardTitle>Cancellation Requests</CardTitle>
  //                   <div className="flex space-x-2">
  //                     <div className="relative">
  //                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
  //                       <Input
  //                         placeholder="Search cancellations..."
  //                         value={searchTerm}
  //                         onChange={(e) => setSearchTerm(e.target.value)}
  //                         className="pl-10 w-64"
  //                       />
  //                     </div>
  //                     <Select value={filterStatus} onValueChange={setFilterStatus}>
  //                       <SelectTrigger className="w-32">
  //                         <SelectValue />
  //                       </SelectTrigger>
  //                       <SelectContent>
  //                         <SelectItem value="all">All Status</SelectItem>
  //                         <SelectItem value="pending">Pending</SelectItem>
  //                         <SelectItem value="processed">Processed</SelectItem>
  //                         <SelectItem value="rejected">Rejected</SelectItem>
  //                       </SelectContent>
  //                     </Select>
  //                   </div>
  //                 </div>
  //               </CardHeader>
  //               <CardContent>
  //                 <div className="space-y-4">
  //                   {filteredCancellations.map(cancellation => (
  //                     <div key={cancellation.id} className="border rounded-lg p-4">
  //                       <div className="flex justify-between items-start mb-3">
  //                         <div>
  //                           <h4 className="font-semibold">{cancellation.bookingReference}</h4>
  //                           <p className="text-sm text-gray-600">{cancellation.userName} ({cancellation.userEmail})</p>
  //                         </div>
  //                         <StatusBadge status={cancellation.status} />
  //                       </div>
                        
  //                       <div className="grid grid-cols-2 gap-4 text-sm mb-3">
  //                         <div>
  //                           <p><strong>Location:</strong> {cancellation.locationName}</p>
  //                           <p><strong>Date:</strong> {new Date(cancellation.bookingDate).toLocaleDateString()}</p>
  //                         </div>
  //                         <div>
  //                           <p><strong>Time:</strong> {cancellation.bookingTime}</p>
  //                           <p><strong>Amount:</strong> ${cancellation.totalAmount}</p>
  //                         </div>
  //                       </div>
                        
  //                       <p className="text-sm text-gray-600 mb-3">
  //                         <strong>Reason:</strong> {cancellation.reason}
  //                       </p>
                        
  //                       <div className="flex justify-between items-center">
  //                         <span className="text-sm font-medium text-green-600">
  //                           Refund Amount: ${cancellation.refundAmount}
  //                         </span>
                          
  //                         {cancellation.status === 'pending' && (
  //                           <div className="space-x-2">
  //                             <Button 
  //                               size="sm" 
  //                               variant="outline"
  //                               onClick={() => setSelectedCancellation(cancellation)}
  //                             >
  //                               Review
  //                             </Button>
  //                           </div>
  //                         )}
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </CardContent>
  //             </Card>
  //           </TabsContent>

  //           {/* Users Tab */}
  //           <TabsContent value="users">
  //             <Card>
  //               <CardHeader>
  //                 <div className="flex justify-between items-center">
  //                   <CardTitle>User Management</CardTitle>
  //                   <div className="flex space-x-2">
  //                     <div className="relative">
  //                       <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
  //                       <Input
  //                         placeholder="Search users..."
  //                         value={searchTerm}
  //                         onChange={(e) => setSearchTerm(e.target.value)}
  //                         className="pl-10 w-64"
  //                       />
  //                     </div>
  //                     <Select value={filterStatus} onValueChange={setFilterStatus}>
  //                       <SelectTrigger className="w-32">
  //                         <SelectValue />
  //                       </SelectTrigger>
  //                       <SelectContent>
  //                         <SelectItem value="all">All Status</SelectItem>
  //                         <SelectItem value="pending">Pending</SelectItem>
  //                         <SelectItem value="verified">Verified</SelectItem>
  //                         <SelectItem value="rejected">Rejected</SelectItem>
  //                       </SelectContent>
  //                     </Select>
  //                   </div>
  //                 </div>
  //               </CardHeader>
  //               <CardContent>
  //                 <div className="space-y-4">
  //                   {filteredUsers.map(user => (
  //                     <div key={user.id} className="border rounded-lg p-4">
  //                       <div className="flex justify-between items-start mb-3">
  //                         <div>
  //                           <h4 className="font-semibold">{user.name}</h4>
  //                           <p className="text-sm text-gray-600">{user.email}</p>
  //                         </div>
  //                         <div className="flex space-x-2">
  //                           <StatusBadge status={user.verificationStatus} />
  //                           <Badge className="bg-blue-100 text-blue-800 capitalize">
  //                             {user.memberType}
  //                           </Badge>
  //                         </div>
  //                       </div>
                        
  //                       <div className="grid grid-cols-3 gap-4 text-sm mb-3">
  //                         <div>
  //                           <p><strong>Join Date:</strong> {new Date(user.joinDate).toLocaleDateString()}</p>
  //                         </div>
  //                         <div>
  //                           <p><strong>Total Bookings:</strong> {user.totalBookings}</p>
  //                         </div>
  //                         <div>
  //                           <p><strong>Total Spent:</strong> ${user.totalSpent}</p>
  //                         </div>
  //                       </div>
                        
  //                       {user.verificationStatus === 'pending' && (
  //                         <div className="flex justify-end space-x-2">
  //                           <Button 
  //                             size="sm" 
  //                             variant="outline"
  //                             onClick={() => setSelectedUser(user)}
  //                           >
  //                             Review Verification
  //                           </Button>
  //                         </div>
  //                       )}
  //                     </div>
  //                   ))}
  //                 </div>
  //               </CardContent>
  //             </Card>
  //           </TabsContent>

  //           {/* Settings Tab */}
  //           <TabsContent value="settings">
  //             <Card>
  //               <CardHeader>
  //                 <CardTitle className="flex items-center">
  //                   <Settings className="w-5 h-5 mr-2" />
  //                   Admin Settings
  //                 </CardTitle>
  //               </CardHeader>
  //               <CardContent>
  //                 <div className="space-y-6">
  //                   <Alert>
  //                     <AlertTriangle className="h-4 w-4" />
  //                     <AlertDescription>
  //                       <strong>Demo Mode:</strong> This is a demonstration of the admin dashboard. 
  //                       In production, this would include real settings for email templates, 
  //                       cancellation policies, pricing rules, and system configuration.
  //                     </AlertDescription>
  //                   </Alert>
                    
  //                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  //                     <Card>
  //                       <CardHeader>
  //                         <CardTitle className="text-lg">Email Templates</CardTitle>
  //                       </CardHeader>
  //                       <CardContent>
  //                         <p className="text-sm text-gray-600 mb-4">
  //                           Manage email templates for cancellations, confirmations, and verifications.
  //                         </p>
  //                         <Button variant="outline" className="w-full">
  //                           <Mail className="w-4 h-4 mr-2" />
  //                           Manage Templates
  //                         </Button>
  //                       </CardContent>
  //                     </Card>
                      
  //                     <Card>
  //                       <CardHeader>
  //                         <CardTitle className="text-lg">Cancellation Policies</CardTitle>
  //                       </CardHeader>
  //                       <CardContent>
  //                         <p className="text-sm text-gray-600 mb-4">
  //                           Configure cancellation rules and refund percentages.
  //                         </p>
  //                         <Button variant="outline" className="w-full">
  //                           <FileText className="w-4 h-4 mr-2" />
  //                           Edit Policies
  //                         </Button>
  //                       </CardContent>
  //                     </Card>
  //                   </div>
  //                 </div>
  //               </CardContent>
  //             </Card>
  //           </TabsContent>
  //         </Tabs>
  //       </div>
  //     </div>

  //     {/* Cancellation Review Modal */}
  //     <Dialog open={!!selectedCancellation} onOpenChange={() => setSelectedCancellation(null)}>
  //       <DialogContent className="max-w-2xl">
  //         <DialogHeader>
  //           <DialogTitle>Review Cancellation Request</DialogTitle>
  //         </DialogHeader>
          
  //         {selectedCancellation && (
  //           <div className="space-y-4">
  //             <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
  //               <div>
  //                 <p><strong>Booking:</strong> {selectedCancellation.bookingReference}</p>
  //                 <p><strong>Customer:</strong> {selectedCancellation.userName}</p>
  //                 <p><strong>Email:</strong> {selectedCancellation.userEmail}</p>
  //                 <p><strong>Location:</strong> {selectedCancellation.locationName}</p>
  //               </div>
  //               <div>
  //                 <p><strong>Date:</strong> {new Date(selectedCancellation.bookingDate).toLocaleDateString()}</p>
  //                 <p><strong>Time:</strong> {selectedCancellation.bookingTime}</p>
  //                 <p><strong>Original Amount:</strong> ${selectedCancellation.totalAmount}</p>
  //                 <p><strong>Refund Amount:</strong> ${selectedCancellation.refundAmount}</p>
  //               </div>
  //             </div>
              
  //             <div>
  //               <p><strong>Cancellation Reason:</strong></p>
  //               <div className="p-3 bg-gray-50 rounded-md mt-2">
  //                 <p className="text-sm">{selectedCancellation.reason}</p>
  //               </div>
  //             </div>
              
  //             <div>
  //               <p><strong>Request Date:</strong> {new Date(selectedCancellation.requestDate).toLocaleDateString()}</p>
  //             </div>

  //             <Alert>
  //               <AlertDescription>
  //                 Approving this cancellation will process a refund of ${selectedCancellation.refundAmount} 
  //                 and send an email notification to the customer.
  //               </AlertDescription>
  //             </Alert>

  //             <div className="flex space-x-3">
  //               <Button 
  //                 variant="outline" 
  //                 onClick={() => setSelectedCancellation(null)}
  //                 className="flex-1"
  //               >
  //                 Close
  //               </Button>
  //               <Button 
  //                 variant="destructive" 
  //                 onClick={() => handleCancellationAction(selectedCancellation, 'reject')}
  //                 disabled={isLoading}
  //                 className="flex-1"
  //               >
  //                 {isLoading ? 'Processing...' : 'Reject'}
  //               </Button>
  //               <Button 
  //                 onClick={() => handleCancellationAction(selectedCancellation, 'approve')}
  //                 disabled={isLoading}
  //                 className="flex-1 bg-green-600 hover:bg-green-700"
  //               >
  //                 {isLoading ? 'Processing...' : 'Approve Refund'}
  //               </Button>
  //             </div>
  //           </div>
  //         )}
  //       </DialogContent>
  //     </Dialog>

  //     {/* User Verification Modal */}
  //     <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
  //       <DialogContent>
  //         <DialogHeader>
  //           <DialogTitle>User Verification</DialogTitle>
  //         </DialogHeader>
          
  //         {selectedUser && (
  //           <div className="space-y-4">
  //             <div className="p-4 bg-gray-50 rounded-lg">
  //               <p><strong>Name:</strong> {selectedUser.name}</p>
  //               <p><strong>Email:</strong> {selectedUser.email}</p>
  //               <p><strong>Member Type:</strong> {selectedUser.memberType}</p>
  //               <p><strong>Join Date:</strong> {new Date(selectedUser.joinDate).toLocaleDateString()}</p>
  //             </div>
              
  //             {selectedUser.memberType === 'student' && (
  //               <Alert>
  //                 <AlertDescription>
  //                   Student verification requires manual review of uploaded documents (student ID, enrollment certificate).
  //                   Verify the documents before approving.
  //                 </AlertDescription>
  //               </Alert>
  //             )}

  //             <div className="flex space-x-3">
  //               <Button 
  //                 variant="outline" 
  //                 onClick={() => setSelectedUser(null)}
  //                 className="flex-1"
  //               >
  //                 Close
  //               </Button>
  //               <Button 
  //                 variant="destructive" 
  //                 onClick={() => handleUserVerification(selectedUser, 'reject')}
  //                 disabled={isLoading}
  //                 className="flex-1"
  //               >
  //                 {isLoading ? 'Processing...' : 'Reject'}
  //               </Button>
  //               <Button 
  //                 onClick={() => handleUserVerification(selectedUser, 'verify')}
  //                 disabled={isLoading}
  //                 className="flex-1 bg-green-600 hover:bg-green-700"
  //               >
  //                 {isLoading ? 'Processing...' : 'Verify User'}
  //               </Button>
  //             </div>
  //           </div>
  //         )}
  //       </DialogContent>
  //     </Dialog>

  //   <FooterSection />
          
  //   </div>
  // )
}