// src/components/admin/AdminTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertTriangle, Clock, Search, Settings, Mail, FileText } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PromoCodeManagement } from './PromoCodeManagement'
import { BookingManagement } from './BookingManagement'
import { UserManagement } from './UserManagement'

export default function AdminTabs({
  activeTab,
  setActiveTab,
  cancellations,
  users,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  setSelectedCancellation,
  setSelectedUser,
  StatusBadge,
  filteredCancellations,
  filteredUsers
}: {
  activeTab: string
  setActiveTab: (value: string) => void
  cancellations: any[]
  users: any[]
  searchTerm: string
  setSearchTerm: (value: string) => void
  filterStatus: string
  setFilterStatus: (value: string) => void
  setSelectedCancellation: (value: any) => void
  setSelectedUser: (value: any) => void
  StatusBadge: any
  filteredCancellations: any[]
  filteredUsers: any[]
}) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="cancellations">
          Cancellations
          {cancellations.filter(c => c.status === 'pending').length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {cancellations.filter(c => c.status === 'pending').length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="users">
          Users
          {users.filter(u => u.verificationStatus === 'pending').length > 0 && (
            <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
              {users.filter(u => u.verificationStatus === 'pending').length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="promocodes">Promo Codes</TabsTrigger>
        <TabsTrigger value="bookings">Bookings</TabsTrigger>
        <TabsTrigger value="user-management">User Management</TabsTrigger>
        {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Cancellations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Recent Cancellations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cancellations.slice(0, 3).map(cancellation => (
                <div key={cancellation.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{cancellation.bookingReference}</p>
                    <p className="text-xs text-gray-600">{cancellation.userName}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={cancellation.status} />
                    <p className="text-xs text-gray-600 mt-1">${cancellation.refundAmount}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('cancellations')}>
                View All Cancellations
              </Button>
            </CardContent>
          </Card>

          {/* Pending Verifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Pending Verifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {users.filter(u => u.verificationStatus === 'pending').slice(0, 3).map(user => (
                <div key={user.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={user.verificationStatus} />
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" onClick={() => setActiveTab('users')}>
                View All Users
              </Button>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Cancellations Tab */}
      <TabsContent value="cancellations">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Cancellation Requests</CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search cancellations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredCancellations.map(cancellation => (
                <div key={cancellation.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{cancellation.bookingReference}</h4>
                      <p className="text-sm text-gray-600">{cancellation.userName} ({cancellation.userEmail})</p>
                    </div>
                    <StatusBadge status={cancellation.status} />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedCancellation(cancellation)}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Users Tab */}
      <TabsContent value="users">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Management</CardTitle>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map(user => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                    <StatusBadge status={user.verificationStatus} />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setSelectedUser(user)}>
                    Review Verification
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Promo Codes Tab */}
      <TabsContent value="promocodes" className="space-y-4">
        <PromoCodeManagement />
      </TabsContent>

      {/* Bookings Tab */}
      <TabsContent value="bookings" className="space-y-4">
        <BookingManagement />
      </TabsContent>

      {/* User Management Tab */}
      <TabsContent value="user-management" className="space-y-4">
        <UserManagement />
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Admin Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                <strong>Demo Mode:</strong> Example admin settings section.
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Button variant="outline" className="w-full">
                <Mail className="w-4 h-4 mr-2" /> Manage Templates
              </Button>
              <Button variant="outline" className="w-full">
                <FileText className="w-4 h-4 mr-2" /> Edit Policies
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
