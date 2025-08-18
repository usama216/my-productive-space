// src/app/buy-pass/BuyPassClient.tsx  (Client Component)
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronDown, CreditCard, Shield, Package, User, Mail, Phone, MapPin, AlertCircle } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'


import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import Navbar from '@/components/Navbar'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'

import PaymentStep from '@/components/buy-pass/PaymentStep'


// Package data - you might want to move this to a shared location
const packageDetails = {
  // Cowork packages
  'Half-Day Productivity Boost': {
    price: 109,
    originalPrice: 150,
    description: '6 Half-Day Pass (6 hrs/pass)',
    bonus: '4 Complimentary Hours',
    validity: '30 days from activation',
    addon: 5,
    type: 'cowork',
    highlights: ['Perfect for part-time workers', 'Flexible scheduling', 'Access to all amenities']
  },
  'Flexible Full-Day Focus': {
    price: 209,
    originalPrice: 280,
    description: '6 Full-Day Pass (12 hrs/pass)',
    bonus: '2 Half-Day Passes (6 hrs/pass)',
    validity: '30 days from activation',
    addon: 5,
    type: 'cowork',
    highlights: ['Best value for full-time workers', 'Extended hours access', 'Priority booking']
  },
  // Costudy package
  'Student Semester Bundle': {
    price: 129,
    originalPrice: 180,
    description: '20 Study-Hour Pass',
    bonus: 'Includes 5 Project-Room Credits',
    validity: '60 days from activation',
    addon: 0,
    type: 'costudy',
    highlights: ['Student-exclusive pricing', 'Group study room access', 'Extended validity']
  },
  // Colearn packages (same as cowork in the original files)
  'Half-Day Productivity Boost (Colearn)': {
    price: 109,
    originalPrice: 150,
    description: '6 Half-Day Pass (6 hrs/pass)',
    bonus: '4 Complimentary Hours',
    validity: '30 days from activation',
    addon: 5,
    type: 'colearn',
    highlights: ['Perfect for tutors', 'Flexible scheduling', 'Access to teaching facilities']
  },
  'Flexible Full-Day Focus (Colearn)': {
    price: 209,
    originalPrice: 280,
    description: '6 Full-Day Pass (12 hrs/pass)',
    bonus: '2 Half-Day Passes (6 hrs/pass)',
    validity: '30 days from activation',
    addon: 5,
    type: 'colearn',
    highlights: ['Best for full-time educators', 'Extended hours access', 'Priority room booking']
  }
}

export default function BuyNowPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Auth state
  const { user, loading: isLoadingAuth } = useAuth()
  // Package selection state
  const [selectedPackage, setSelectedPackage] = useState<string>('')
  const [packageType, setPackageType] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  // Customer information state
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paynow'>('card')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState(1) // 1: Details, 2: Payment, 3: Confirmation


  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push(`/login?next=/buy-pass${window.location.search}`)
    }
  }, [user, isLoadingAuth, router])

  // Pre-fill user information when user changes
  // Check authentication status
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata as any
      if (metadata) {
        setCustomerName(`${metadata.firstName || ''} ${metadata.lastName || ''}`.trim())
        setCustomerEmail(user.email || '')
        setCustomerPhone(metadata.contactNumber || '')
      }
    }
  }, [user])

  // Prefill form with data from URL
  useEffect(() => {
    const packageParam = searchParams.get('package')
    const typeParam = searchParams.get('type')

    console.log('URL Params:', { packageParam, typeParam }) // Debug log

    if (packageParam) {
      // todo:check this hitpay
      const decodedPackage = decodeURIComponent(packageParam)
      // const decodedPackage = packageParam
      console.log('Decoded package:', decodedPackage) // Debug log

      // Check if the package exists in our packageDetails
      if (packageDetails[decodedPackage as keyof typeof packageDetails]) {
        setSelectedPackage(decodedPackage)
        console.log('Package set:', decodedPackage) // Debug log
      } else {
        console.log('Package not found in packageDetails') // Debug log
      }
    }
    if (typeParam) {
      setPackageType(typeParam)
    }
  }, [searchParams])

  const currentPackage = selectedPackage ? packageDetails[selectedPackage as keyof typeof packageDetails] : null
  const subtotal = currentPackage ? (currentPackage.price + currentPackage.addon) * quantity : 0
  const tax = subtotal * 0.09 // 9% GST rn
  const total = subtotal + tax

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Double-check user is logged in
    // Redirect to login if not authenticated
    if (!user) {
      router.push(`/login?next=/buy-pass${window.location.search}`) 
      // new route to return back after login
      return
    }

    setIsLoading(true)

    // Simulate API call for payments HITPAY
    setTimeout(() => {
      setIsLoading(false)
      setPurchaseStep(2)
    }, 2000)
  }

  useEffect(() => {
  if (searchParams.get('step') === '3') {
    setPurchaseStep(3)
  }
}, [searchParams])

  const isFormValid =
    selectedPackage &&
    customerName &&
    customerEmail &&
    customerPhone &&
    agreedToTerms &&
    user;

  // Show loading state while checking auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Guest Warning Alert */}
          {!user && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Sign In Required</AlertTitle>
              <AlertDescription className="text-orange-700">
                You must be signed in as a member to purchase passes.
                <Button
                  variant="link"
                  className="px-2 text-orange-600 hover:text-orange-800"
                  onClick={() => router.push('/login')}
                >
                  Sign in now
                </Button>
                to continue with your purchase.
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Purchase Your Pass</h1>
            <p className="text-lg text-gray-600">
              {user ? 'Unlock unlimited productivity with our flexible packages' : 'Sign in to purchase member-exclusive packages'}
            </p>
            {selectedPackage && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm">
                <Package className="w-4 h-4 mr-2" />
                Purchasing: {selectedPackage}
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              {[
                { step: 1, title: 'Details', icon: Package },
                { step: 2, title: 'Payment', icon: CreditCard },
                { step: 3, title: 'Confirmation', icon: Shield }
              ].map(({ step, title, icon: Icon }) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${purchaseStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                    {purchaseStep > step ? '✓' : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${purchaseStep >= step ? 'text-orange-500' : 'text-gray-500'
                    }`}>
                    {title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Purchase Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {purchaseStep === 1 && (
                    <form onSubmit={handlePurchaseSubmit} className="space-y-6">
                      {/* Package Selection */}
                      <div>
                        <Label htmlFor="package">Select Package {selectedPackage && <span className="text-green-600 text-sm ml-2">(Pre-selected)</span>}</Label>
                        <Select value={selectedPackage || ''} onValueChange={setSelectedPackage}>
                          <SelectTrigger className={selectedPackage ? "border-green-500" : ""}>
                            <SelectValue placeholder="Choose your package">
                              {selectedPackage || "Choose your package"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(packageDetails)
                              .filter(([name, details]) => {
                                // If packageType is set from URL, only show packages of that type
                                return !packageType || details.type === packageType
                              })
                              .map(([name, details]) => (
                                <SelectItem key={name} value={name}>
                                  <div className="flex flex-col">
                                    <span>{name} - ${details.price}</span>
                                    <span className="text-xs text-gray-500">{details.type}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {selectedPackage && currentPackage && (
                          <div className="mt-2 p-3 bg-green-50 rounded-md text-sm">
                            <p className="font-medium text-green-800">Selected: {selectedPackage}</p>
                            <p className="text-green-700">{currentPackage.description}</p>
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Select value={quantity.toString()} onValueChange={(val) => setQuantity(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Package' : 'Packages'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Personal Information */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="Enter your full name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={customerEmail}
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              placeholder="Enter your email"
                              required
                              disabled={!!user} // Disable if user is logged in
                              className={user ? "bg-gray-50" : ""}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={customerPhone}
                              onChange={(e) => setCustomerPhone(e.target.value)}
                              placeholder="Enter your phone number"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="company">Company Name (Optional)</Label>
                            <Input
                              id="company"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="Enter company name"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Billing Information */}
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium mb-4">Billing Information</h3>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="address">Billing Address</Label>
                            <Input
                              id="address"
                              value={billingAddress}
                              onChange={(e) => setBillingAddress(e.target.value)}
                              placeholder="Enter your billing address"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <Label htmlFor="postal">Postal Code</Label>
                              <Input
                                id="postal"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="Enter postal code"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="border-t pt-6">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="terms"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="mt-1"
                          />
                          <label htmlFor="terms" className="text-sm text-gray-600">
                            I agree to the terms and conditions, including the package validity period and usage policies.
                          </label>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        disabled={!isFormValid || isLoading || !user}
                      >
                        {!user ? 'Sign In Required' : (isLoading ? 'Processing...' : 'Continue to Payment')}
                      </Button>

                      {!user && (
                        <p className="text-center text-sm text-gray-600 mt-2">
                          <Button
                            type="button"
                            variant="link"
                            className="text-orange-600 hover:text-orange-800 p-0"
                            onClick={() => router.push('/login')}
                          >
                            Sign in
                          </Button>
                          {' '}to purchase member passes
                        </p>
                      )}
                    </form>
                  )}

                  {purchaseStep === 2 && (
                    <div className="space-y-6">
                      <PaymentStep
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                        paymentMethod={paymentMethod}
                        onPaymentMethodChange={(v) => setPaymentMethod(v)}
                        customer={{ name: customerName, email: customerEmail, phone: customerPhone }}
                        order={{ packageName: selectedPackage, quantity }}
                        onBack={() => setPurchaseStep(1)}
                        onComplete={() => setPurchaseStep(3)}
                        user={user}
                      />

                      {/* <h3 className="text-lg font-medium">Payment Method</h3>

                      <RadioGroup value={paymentMethod} onValueChange={(value: 'card' | 'paynow') => setPaymentMethod(value)}>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="card" id="card" />
                          <label htmlFor="card" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <CreditCard className="w-5 h-5 mr-2" />
                              <span>Credit/Debit Card</span>
                            </div>
                          </label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                          <RadioGroupItem value="paynow" id="paynow" />
                          <label htmlFor="paynow" className="flex-1 cursor-pointer">
                            <div className="flex items-center">
                              <Shield className="w-5 h-5 mr-2" />
                              <span>PayNow</span>
                            </div>
                          </label>
                        </div>
                      </RadioGroup> */}

                      {/* <div className="p-4 bg-gray-50 rounded-lg">
                      
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setPurchaseStep(1)}
                            className="flex-1"
                          >
                            Back to Details
                          </Button>
                          <Button
                            onClick={() => setPurchaseStep(3)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                          >
                            Complete Purchase (Demo)
                          </Button>
                        </div>
                      </div> */}
                    </div>
                  )}

                  {purchaseStep === 3 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">Purchase Confirmed!</h3>
                      <p className="text-gray-600 mb-6">
                        Your package has been activated. Check your email for activation details.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
                        <p className="text-sm text-gray-600">Order Reference: #PKG{Date.now().toString().slice(-6)}</p>
                        <p className="text-sm text-gray-600">Package: {selectedPackage}</p>
                        <p className="text-sm text-gray-600">Valid for: {currentPackage?.validity}</p>
                      </div>
                      <Button
                        onClick={() => router.push('/book-now')}
                        className="mt-6 bg-orange-500 hover:bg-orange-600"
                      >
                        Book Your First Session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user && (
                    <div className="bg-orange-50 border border-orange-200 rounded-md p-4 text-center">
                      <p className="text-sm text-orange-800 font-medium">Member Pricing</p>
                      <p className="text-xs text-orange-700 mt-1">Sign in to purchase packages</p>
                    </div>
                  )}


                  {currentPackage && (
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium">{selectedPackage}</h4>
                        <p className="text-sm text-gray-600 mt-1">{currentPackage.description}</p>
                        {currentPackage.bonus && (
                          <p className="text-sm text-green-600 mt-1">+ {currentPackage.bonus}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-2">Valid: {currentPackage.validity}</p>

                        {/* Add highlights if available */}
                        {currentPackage.highlights && (
                          <div className="mt-3 space-y-1">
                            {currentPackage.highlights.map((highlight, idx) => (
                              <p key={idx} className="text-xs text-gray-600 flex items-center">
                                <span className="text-green-500 mr-1">✓</span>
                                {highlight}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Package Price</span>
                          <span>${currentPackage.price}</span>
                        </div>
                        {currentPackage.addon > 0 && (
                          <div className="flex justify-between">
                            <span>All Outlets Access</span>
                            <span>${currentPackage.addon}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Quantity</span>
                          <span>× {quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>GST (9%)</span>
                          <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                        {currentPackage.originalPrice && (
                          <div className="text-center mt-4">
                            <span className="text-sm text-gray-500 line-through">
                              Original: ${currentPackage.originalPrice * quantity}
                            </span>
                            <span className="text-sm text-green-600 ml-2">
                              You save: ${(currentPackage.originalPrice - currentPackage.price) * quantity}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />

    </div>
  )
}