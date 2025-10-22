'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Loader2,
  FileText,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  TrendingUp,
  Wallet,
  Search,
  Filter
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { 
  getAllRefundRequests, 
  getAllUserCredits, 
  approveRefund, 
  rejectRefund, 
  getRefundStats,
  RefundTransaction,
  UserCredit
} from '@/lib/refundService'
import { 
  formatSingaporeDate, 
  formatSingaporeDateOnly,
  formatSingaporeTimeOnly
} from '@/lib/timezoneUtils'

export function RefundManagement() {
  const [refunds, setRefunds] = useState<RefundTransaction[]>([])
  const [credits, setCredits] = useState<UserCredit[]>([])
  const [stats, setStats] = useState({ totalRefunded: 0, totalTransactions: 0, averageRefund: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'refunds' | 'credits' | 'stats'>('credits')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedRefund, setSelectedRefund] = useState<RefundTransaction | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const { toast } = useToast()

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const [refundsData, creditsData, statsData] = await Promise.all([
        getAllRefundRequests(),
        getAllUserCredits(),
        getRefundStats()
      ])
      
      setRefunds(refundsData)
      setCredits(creditsData)
      setStats(statsData)
    } catch (err) {
      setError('Failed to load refund data')
      console.error('Error fetching data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApproveRefund = async (refundId: string) => {
    try {
      setIsApproving(true)
      const result = await approveRefund(refundId)
      
      toast({
        title: "Refund Approved",
        description: `Refund approved. Credit of ${formatCurrency(result.creditamount)} added to user account.`,
      })
      
      setSelectedRefund(null)
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve refund. Please try again.",
        variant: "destructive"
      })
      console.error('Error approving refund:', err)
    } finally {
      setIsApproving(false)
    }
  }

  const handleRejectRefund = async (refundId: string) => {
    try {
      setIsRejecting(true)
      await rejectRefund(refundId)
      
      toast({
        title: "Refund Rejected",
        description: "Refund request has been rejected.",
      })
      
      setSelectedRefund(null)
      fetchData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject refund. Please try again.",
        variant: "destructive"
      })
      console.error('Error rejecting refund:', err)
    } finally {
      setIsRejecting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-SG', {
      style: 'currency',
      currency: 'SGD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    // Handle dates that might have +00:00 timezone or Z suffix
    const date = new Date(dateString)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date'
    }
    
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Singapore'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'REQUESTED':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pending
        </Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Approved
        </Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Rejected
        </Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>
    }
  }

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = searchTerm === '' || 
      refund.Booking?.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.User?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || refund.refundstatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const filteredCredits = credits.filter(credit => {
    return searchTerm === '' || 
      credit.Booking?.bookingRef?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading credits...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchData} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">User Credits</h2>
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Refunded</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalRefunded)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Refund</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.averageRefund)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Tabs */}
      {/* <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'refunds'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          Refund Requests
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'credits'
              ? 'bg-orange-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          User Credits
        </button>
       
      </div> */}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by booking reference or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div> */}
        {activeTab === 'refunds' && (
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="REQUESTED">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Refund Requests Tab */}
      {activeTab === 'refunds' && (
        <Card>
          <CardHeader>
            <CardTitle>Refund Requests ({filteredRefunds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRefunds.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No refund requests found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRefunds.map((refund) => (
                  <div
                    key={refund.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {refund.Booking?.bookingRef || 'N/A'}
                        </span>
                        {getStatusBadge(refund.refundstatus)}
                      </div>
                      {refund.refundstatus === 'REQUESTED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedRefund(refund)}
                        >
                          Review
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">User:</span>
                          <span>{refund.User?.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Amount:</span>
                          <span>{formatCurrency(refund.refundamount)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Requested:</span>
                          <span>{formatDate(refund.requestedat)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {refund.Booking && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Location:</span>
                            <span>{refund.Booking.location}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Reason:</span>
                          <p className="text-gray-600 mt-1">{refund.refundreason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Credits Tab */}
      {activeTab === 'credits' && (
        <Card>
          <CardHeader>
            <CardTitle>User Credits ({filteredCredits.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredCredits.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No user credits found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCredits.map((credit) => (
                  <div
                    key={credit.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(credit.amount)}
                        </span>
                        {/* <Badge variant={credit.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {credit.status}
                        </Badge> */}
                        <Badge
  className={
    credit.status === "ACTIVE"
      ? "bg-orange-600 text-white hover:bg-orange-700"
      : "bg-gray-200 text-gray-800"
  }
>
  {credit.status}
</Badge>

                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">User ID:</span>
                          <span className="font-mono text-xs">{credit.userid}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Created:</span>
                          <span>{formatDate(credit.createdat)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">Expires:</span>
                          <span>{formatDate(credit.expiresat)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        {credit.Booking && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">From Booking:</span>
                            <span>{credit.Booking.bookingRef}</span>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Booking Location:</span>
                          <p className="text-gray-600 mt-1">{credit.Booking?.location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Refund Review Dialog */}
      <Dialog open={!!selectedRefund} onOpenChange={() => setSelectedRefund(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Refund Request</DialogTitle>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Booking Reference</Label>
                  <p className="font-medium">{selectedRefund.Booking?.bookingRef || 'N/A'}</p>
                </div>
                <div>
                  <Label>Amount</Label>
                  <p className="font-medium">{formatCurrency(selectedRefund.refundamount)}</p>
                </div>
                <div>
                  <Label>User Email</Label>
                  <p className="font-medium">{selectedRefund.User?.email || 'N/A'}</p>
                </div>
                <div>
                  <Label>Requested Date</Label>
                  <p className="font-medium">{formatDate(selectedRefund.requestedat)}</p>
                </div>
              </div>
              
              <div>
                <Label>Reason</Label>
                <p className="text-gray-600 mt-1">{selectedRefund.refundreason}</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  className="border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                  onClick={() => setSelectedRefund(null)}
                  disabled={isApproving || isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-500/90 text-white border-red-500 hover:border-red-500"
                  onClick={() => handleRejectRefund(selectedRefund.id)}
                  disabled={isApproving || isRejecting}
                >
                  {isRejecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-500/90 text-white border-orange-500 hover:border-orange-500"
                  onClick={() => handleApproveRefund(selectedRefund.id)}
                  disabled={isApproving || isRejecting}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    'Approve'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
