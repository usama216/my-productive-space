// src/components/admin/BookingManagement.tsx - Admin booking management
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Calendar, Users, DollarSign, Clock, MapPin, Eye, Edit, Trash2, Filter, BarChart3, FileText, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  Booking, 
  BookingFilters, 
  getAdminBookings, 
  getDashboardSummary, 
  getBookingAnalytics, 
  updateAdminBooking, 
  cancelAdminBooking,
  formatBookingDate,
  getBookingStatus,
  getStatusColor,
  calculateDuration
} from '@/lib/bookingService'

export function BookingManagement() {
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [filters, setFilters] = useState<BookingFilters>({
    page: 1,
    limit: 20,
    sortBy: 'startAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
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

  // Load dashboard data
  const loadDashboard = async () => {
    try {
      const response = await getDashboardSummary()
      if (response.success && response.dashboard) {
        setDashboardData(response.dashboard)
      }
    } catch (error) {
      console.error('Dashboard Error:', error)
    }
  }

  // Load analytics data
  const loadAnalytics = async () => {
    try {
      const response = await getBookingAnalytics('month')
      if (response.success && response.analytics) {
        setAnalyticsData(response.analytics)
      }
    } catch (error) {
      console.error('Analytics Error:', error)
    }
  }

  // Load bookings
  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await getAdminBookings(filters)
      if (response.success) {
        setBookings(response.bookings || [])
        if (response.pagination) {
          setPagination(response.pagination)
        }
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

  useEffect(() => {
    loadDashboard()
    loadAnalytics()
  }, [])

  useEffect(() => {
    loadBookings()
  }, [filters])

  // Handle filter changes
  const handleFilterChange = (key: keyof BookingFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      page: 1 // Reset to first page when filters change
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  // Handle edit booking
  const handleEdit = (booking: Booking) => {
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

  // Export to Excel
  const exportToExcel = async () => {
    try {
      // Call the same API but with limit 1000 to get all records
      const exportFilters = { ...filters, limit: 1000, page: 1 }
      const response = await getAdminBookings(exportFilters)
      
      if (response.success && response.bookings) {
        // Convert bookings data to CSV format
        const csvData = convertBookingsToCSV(response.bookings)
        downloadCSV(csvData, 'bookings-export.csv')
        
        toast({
          title: "Success",
          description: `Exported ${response.bookings.length} bookings to Excel`,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to export bookings",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error exporting bookings:', error)
      toast({
        title: "Error",
        description: "Failed to export bookings",
        variant: "destructive",
      })
    }
  }

  const convertBookingsToCSV = (bookings: Booking[]): string => {
    const headers = [
      'ID',
      'Booking Ref',
      'User Email',
      'Start Time',
      'End Time',
      'Duration (hours)',
      'Location',
      'Member Type',
      'Special Requests',
      'Total Amount',
      'Status',
      'Payment Status',
      'Pax',
      'Students',
      'Members',
      'Tutors'
    ]
    
    const rows = bookings.map(booking => [
      booking.id,
      booking.bookingRef,
      booking.bookedForEmails?.[0] || 'N/A',
      formatBookingDate(booking.startAt),
      formatBookingDate(booking.endAt),
      calculateDuration(booking.startAt, booking.endAt),
      booking.location,
      booking.memberType,
      booking.specialRequests || '',
      booking.totalAmount,
      getBookingStatus(booking),
      booking.confirmedPayment ? 'PAID' : 'UNPAID',
      booking.pax,
      booking.students,
      booking.members,
      booking.tutors
    ])
    
    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')
  }

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Handle cancel booking
  const handleCancel = async (booking: Booking, reason: string, refundAmount: number) => {
    try {
      const response = await cancelAdminBooking(booking.id, { reason, refundAmount })
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking cancelled successfully",
        })
        loadBookings()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to cancel booking",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Cancel Error:', error)
      toast({
        title: "Error",
        description: "Failed to cancel booking",
        variant: "destructive",
      })
    }
  }

  // Format date for datetime-local input
  const formatDateForInput = (dateString: string): string => {
    return dateString.slice(0, 16)
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <p className="text-gray-600">Manage all bookings and view analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={loadAnalytics}
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Refresh Analytics</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={exportToExcel}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export to Excel</span>
          </Button>
        </div>
      </div>

      {/* Dashboard Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.today?.bookings || 0}</div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.today?.bookings === 0 ? 'No bookings today' : 'Active today'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.upcoming?.count || 0}</div>
            <p className="text-xs text-muted-foreground">
              Future bookings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.thisMonth?.revenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData?.pending?.amount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Booking ref, location, user..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
                              <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Room A, Room B..."
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentStatus">Payment Status</Label>
                              <Select value={filters.paymentStatus || 'all'} onValueChange={(value) => handleFilterChange('paymentStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={filters.sortBy || 'startAt'} onValueChange={(value) => handleFilterChange('sortBy', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startAt">Start Time</SelectItem>
                  <SelectItem value="totalAmount">Amount</SelectItem>
                  <SelectItem value="createdAt">Created</SelectItem>
                  <SelectItem value="bookingRef">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="limit">Items per page:</Label>
              <Select value={filters.limit?.toString() || '20'} onValueChange={(value) => handleFilterChange('limit', parseInt(value))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ page: 1, limit: 20, sortBy: 'startAt', sortOrder: 'desc' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Bookings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading bookings...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    {/* <TableHead>Actions</TableHead> */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div className="font-mono font-bold">{booking.bookingRef}</div>
                      </TableCell>
                                             <TableCell>
                         <div>
                           <div className="font-medium">
                             {booking.bookedForEmails?.[0]?.split('@')[0] || 'N/A'}
                           </div>
                           <div className="text-sm text-gray-500">
                             {booking.bookedForEmails?.[0] || 'N/A'}
                           </div>
                           <Badge variant="outline" className="text-xs">
                             {booking.memberType || 'N/A'}
                           </Badge>
                         </div>
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(getBookingStatus(booking))}>
                          {getBookingStatus(booking)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={booking.confirmedPayment ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {booking.confirmedPayment ? 'Paid' : 'Unpaid'}
                        </Badge>
                      </TableCell>
                      {/* <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(booking)}
                            className="hover:bg-blue-50"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="hover:bg-red-50 text-red-600 border-red-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                                <AlertDialogDescription>
                                  <div className="space-y-4">
                                    <p>Are you sure you want to cancel "{booking.bookingRef}"?</p>
                                    <div className="space-y-2">
                                      <Label htmlFor="cancelReason">Reason for cancellation</Label>
                                      <Input
                                        id="cancelReason"
                                        placeholder="e.g., Room maintenance, User request..."
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <Label htmlFor="refundAmount">Refund Amount</Label>
                                      <Input
                                        id="refundAmount"
                                        type="number"
                                        placeholder="0.00"
                                        onChange={(e) => setEditFormData(prev => ({ ...prev, totalAmount: parseFloat(e.target.value) || 0 }))}
                                      />
                                    </div>
                                  </div>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancel(
                                    booking, 
                                    editFormData.specialRequests, 
                                    editFormData.totalAmount
                                  )}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Cancel Booking
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell> */}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
    </div>
  )
}
