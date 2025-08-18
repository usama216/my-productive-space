// src/components/book-now/PaymentStep.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type Props = {
  subtotal: number
  tax: number
  total: number
  discountAmount: number
  appliedVoucher?: { code: string } | null
  selectedPackage?: string
  customer: { name: string; email: string; phone: string }
  onBack: () => void
  onComplete: () => void
}

export default function PaymentStep({
  subtotal,
  tax,
  total,
  discountAmount,
  appliedVoucher,
  selectedPackage,
  customer,
  onBack,
  onComplete,
}: Props) {
  const [loading, setLoading] = useState(false)


  const handlePay = async () => {
    setLoading(true)
    try {
      const redirectUrl = `${window.location.origin}${window.location.pathname}${window.location.search}&step=3`


      const body = {
        amount: total.toFixed(2),
        currency: 'SGD',
        email: customer.email,
        name: customer.name,
        purpose: 'Test Order Payment for My Productive Space',
        reference_number: 'ORDER123',
        redirect_url: redirectUrl,
        webhook: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/hitpay/webhook`,

      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/hitpay/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch (err) {
      setLoading(false)
    }
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment</h3>

      <Card>
        <CardContent className="space-y-2 pt-4">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {appliedVoucher ? `(${appliedVoucher.code})` : ''}</span>
              <span>- ${discountAmount.toFixed(2)}</span>
            </div>
          )}
          {selectedPackage && (
            <div className="flex justify-between text-blue-600">
              <span>Package</span>
              <span>Applied</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>GST</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-gray-600">
        <div><b>Payer:</b> {customer.name}</div>
        <div><b>Email:</b> {customer.email}</div>
        <div><b>Phone:</b> {customer.phone}</div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          Back
        </Button>
        <Button
          onClick={handlePay}
          disabled={loading}
          className="flex-1 bg-orange-500 hover:bg-orange-600"
        >
          {loading ? 'Processing…' : 'Pay Now'}
        </Button>
      </div>
    </div>
  )
}
