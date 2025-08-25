// src/components/buy-pass/PaymentStep.tsx
'use client'

import { useState } from 'react'
import { CreditCard, Shield, QrCode, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

type PaymentMethod = 'payNow' | 'creditCard'

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
  user?: any
  bookingId?: string // Add bookingId for package purchases
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
  user,
  bookingId
}: Props) {
  const [loading, setLoading] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('payNow')

  // Calculate totals based on payment method
  const creditCardFee = selectedPaymentMethod === 'creditCard' ? total * 0.05 : 0
  const finalTotal = total + creditCardFee

  // Map payment methods to API values
  const getPaymentMethodForAPI = (method: PaymentMethod): string => {
    return method === 'creditCard' ? 'card' : 'paynow_online'
  }

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method)
    const newTotal = method === 'creditCard' ? total + (total * 0.05) : total
    console.log(`Payment method changed to: ${method} (API value: ${getPaymentMethodForAPI(method)})`)
    // Update the parent component's payment method
    onPaymentMethodChange(method === 'creditCard' ? 'card' : 'paynow')
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      // Get current page full URL (with query params)
      const redirectUrl = `${window.location.origin}${window.location.pathname}${window.location.search}&step=3`

      const body = {
        amount: finalTotal.toFixed(2),
        currency: 'SGD',
        email: user?.email ?? 'guest@gmail.com',  // safe access
        name: user?.user_metadata?.firstName ?? 'Guest',
        purpose: 'Test Order Payment for My Productive Space',
        reference_number: `${bookingId || 'DEMO'}`,
        redirect_url: redirectUrl,
        webhook: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/hitpay/webhook`,
        payment_methods: [getPaymentMethodForAPI(selectedPaymentMethod)], // Array of strings
        bookingId: bookingId || null, // Add bookingId field
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

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Payment</h3>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Select Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedPaymentMethod}
            onValueChange={(value) => handlePaymentMethodChange(value as PaymentMethod)}
            className="space-y-4"
          >
            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="payNow" id="payNow" />
              <Label htmlFor="payNow" className="flex items-center space-x-3 cursor-pointer flex-1">
                <QrCode className="w-5 h-5 text-orange-500" />
                <div>
                  <div className="font-medium">Pay Now (Scan & Pay)</div>
                  <div className="text-sm text-gray-600">Pay using QR code or bank transfer</div>
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <RadioGroupItem value="creditCard" id="creditCard" />
              <Label htmlFor="creditCard" className="flex items-center space-x-3 cursor-pointer flex-1">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <div>
                  <div className="font-medium">Credit Card Payment</div>
                  <div className="text-sm text-gray-600">Pay using credit or debit card</div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Credit Card Fee Disclaimer */}
          {selectedPaymentMethod === 'creditCard' && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Credit Card Processing Fee</p>
                  <p>A 5% processing fee will be added to your total amount when paying with credit card.</p>
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

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
            {creditCardFee > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>Credit Card Fee (5%)</span>
                <span>${creditCardFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
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
          {loading ? 'Processing…' : `Pay $${finalTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
