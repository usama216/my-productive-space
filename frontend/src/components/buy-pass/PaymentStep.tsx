// src/components/buy-pass/PaymentStep.tsx
'use client'

import { useState } from 'react'
import { CreditCard, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type Props = {
  subtotal: number
  tax: number
  total: number
  paymentMethod: 'card' | 'paynow'
  onPaymentMethodChange: (v: 'card' | 'paynow') => void
  customer: { name: string; email: string; phone: string }
  order: {
    packageName: string
    quantity: number
    notes?: string
  }
  onBack: () => void
  onComplete: () => void
user?:any
}

export default function PaymentStep({
  subtotal,
  tax,
  total,
  paymentMethod,
  onPaymentMethodChange,
  customer,
  order,
  onBack,
  onComplete,
  user
}: Props) {
  const [loading, setLoading] = useState(false)

    const handlePay = async () => {
    setLoading(true)
    try {
      // Get current page full URL (with query params)
      const redirectUrl = `${window.location.origin}${window.location.pathname}${window.location.search}&step=3`


      const body = {
        amount: total.toFixed(2),
        currency: 'SGD',
        email: user?.email ?? 'guest@gmail.com',  // safe access
        name: user?.user_metadata?.firstName ?? 'Guest',
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
      console.error('Payment error:', err)
      setLoading(false)
    }
  }

  // TODO: integrate HitPay here
  // Example:
  // const handlePay = async () => {
  //   setLoading(true)
  //   try {
  //     const res = await createHitPayCharge({
  //       amount: total,
  //       currency: 'SGD',
  //       customer,
  //       metadata: { packageName: order.packageName, quantity: order.quantity }
  //     })
  //     window.location.href = res.payment_url
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment</h3>

      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v: 'card' | 'paynow') => onPaymentMethodChange(v)}
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <RadioGroupItem value="card" id="card" />
              <label htmlFor="card" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  <span>Credit/Debit Card</span>
                </div>
              </label>
            </div>
            <div className="flex items-center space-x-2 p-4 border rounded-lg mt-3">
              <RadioGroupItem value="paynow" id="paynow" />
              <label htmlFor="paynow" className="flex-1 cursor-pointer">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  <span>PayNow</span>
                </div>
              </label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card> */}

      <Card>
        <CardHeader>
          <CardTitle>Order & Billing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-gray-700">
            <div><b>Package:</b> {order.packageName}</div>
            <div><b>Quantity:</b> {order.quantity}</div>
          </div>
          <div className="text-sm text-gray-700">
            <div><b>Payer:</b> {customer.name}</div>
            <div><b>Email:</b> {customer.email}</div>
            <div><b>Phone:</b> {customer.phone}</div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST (9%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

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
