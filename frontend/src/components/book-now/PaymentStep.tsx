// src/components/book-now/PaymentStep.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { CreditCard, QrCode, AlertTriangle } from 'lucide-react'

type PaymentMethod = 'payNow' | 'creditCard'

type Props = {
  subtotal: number
  total: number
  discountAmount: number
  appliedVoucher?: { code: string } | null
  selectedPackage?: string
  customer: { name: string; email: string; phone: string }
  bookingId?: string // Add booking ID for confirmation
  onBack: () => void
  onComplete: () => void
  onPaymentMethodChange: (method: PaymentMethod, newTotal: number) => void
}

export default function PaymentStep({
  subtotal,
  total,
  discountAmount,
  appliedVoucher,
  selectedPackage,
  customer,
  bookingId,
  onBack,
  onComplete,
  onPaymentMethodChange,
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
    onPaymentMethodChange(method, newTotal)
  }

  const handlePay = async () => {
    setLoading(true)
    try {
      // Include booking ID in the redirect URL for confirmation
      const redirectUrl = `${window.location.origin}${window.location.pathname}?step=3&bookingId=${bookingId}`

      const body = {
        amount: finalTotal.toFixed(2),
        currency: 'SGD',
        email: customer.email,
        name: customer.name,
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
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardContent className="pt-6">
          <h4 className="font-medium mb-4">Select Payment Method</h4>
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

      {/* Price Breakdown */}
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
          {loading ? 'Processing…' : `Pay $${finalTotal.toFixed(2)}`}
        </Button>
      </div>
    </div>
  )
}
