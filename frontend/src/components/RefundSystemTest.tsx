'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { requestRefund, getUserRefundRequests } from '@/lib/refundService'

export function RefundSystemTest() {
  const [bookingId, setBookingId] = useState('')
  const [reason, setReason] = useState('')
  const [userId, setUserId] = useState('b90c181e-874d-46c2-b1c8-3a510bbdef48')
  const [isLoading, setIsLoading] = useState(false)
  const [refunds, setRefunds] = useState([])
  const { toast } = useToast()

  const handleRequestRefund = async () => {
    if (!bookingId || !reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    try {
      setIsLoading(true)
      const result = await requestRefund(bookingId, reason, userId)
      toast({
        title: "Success",
        description: "Refund request submitted successfully"
      })
      setBookingId('')
      setReason('')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit refund request",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGetRefunds = async () => {
    try {
      setIsLoading(true)
      const result = await getUserRefundRequests(userId)
      setRefunds(result)
      toast({
        title: "Success",
        description: `Found ${result.length} refund requests`
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch refund requests",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Refund System Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
          
          <div>
            <Label htmlFor="bookingId">Booking ID</Label>
            <Input
              id="bookingId"
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Enter booking ID"
            />
          </div>
          
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter refund reason"
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRequestRefund}
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Request Refund'}
            </Button>
            
            <Button 
              onClick={handleGetRefunds}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? 'Loading...' : 'Get Refund Requests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {refunds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refund Requests ({refunds.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {refunds.map((refund: any) => (
                <div key={refund.id} className="p-3 border rounded">
                  <div><strong>ID:</strong> {refund.id}</div>
                  <div><strong>Status:</strong> {refund.refundstatus}</div>
                  <div><strong>Amount:</strong> ${refund.refundamount}</div>
                  <div><strong>Reason:</strong> {refund.refundreason}</div>
                  <div><strong>Requested:</strong> {new Date(refund.requestedat).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}