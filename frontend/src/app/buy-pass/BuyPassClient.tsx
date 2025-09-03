// src/app/buy-pass/BuyPassClient.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ChevronDown, CreditCard, Shield, Package, User, Mail, Phone, MapPin, AlertCircle, AlertTriangle, Loader2 } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { usePackages } from '@/hooks/usePackages'
import { Package as PackageType, packagesApi } from '@/lib/api/packages'

import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import Navbar from '@/components/Navbar'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import PaymentStep from '@/components/buy-pass/PaymentStep'

export default function BuyNowPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ALL HOOKS MUST BE CALLED FIRST - NO EARLY RETURNS
  const { user, loading: isLoadingAuth } = useAuth()
  const { packages, loading: packagesLoading, error: packagesError, retryFetch } = usePackages()


  // State variables
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)
  const [packageType, setPackageType] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paynow'>('card')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState(1)
  const [confirmationStatus, setConfirmationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [confirmationError, setConfirmationError] = useState<string | null>(null)
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [orderId, setOrderId] = useState<string>('')
  const [userPackageId, setUserPackageId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // ALL useEffect calls
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push(`/login?next=/buy-pass${window.location.search}`)
    }
  }, [user, isLoadingAuth, router])

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

  useEffect(() => {
    const packageParam = searchParams.get('package')
    const typeParam = searchParams.get('type')
    const stepParam = searchParams.get('step')
    const orderIdParam = searchParams.get('orderId')
    const userPackageIdParam = searchParams.get('userPackageId')
    const referenceParam = searchParams.get('reference')
    const statusParam = searchParams.get('status')

    if (packageParam && packages.length > 0) {
      const decodedPackageName = decodeURIComponent(packageParam)
      const foundPackage = packages.find(pkg => pkg.name === decodedPackageName)
      if (foundPackage) {
        setSelectedPackage(foundPackage)
      } else {
        setError(`Package "${decodedPackageName}" not found`)
      }
    }
    
    if (typeParam) {
      setPackageType(typeParam)
    }
  }, [searchParams, packages])

  // Separate useEffect for step 3 handling to avoid dependency issues
  useEffect(() => {
    const stepParam = searchParams.get('step')
    const orderIdParam = searchParams.get('orderId')
    const userPackageIdParam = searchParams.get('userPackageId')
    const referenceParam = searchParams.get('reference')
    const statusParam = searchParams.get('status')

    // Handle step 3 - payment confirmation
    if (stepParam === '3' && orderIdParam && userPackageIdParam && referenceParam && statusParam === 'completed') {
      console.log('Step 3 detected, setting up confirmation:', {
        stepParam,
        orderIdParam,
        userPackageIdParam,
        referenceParam,
        statusParam
      })
      
      setPurchaseStep(3)
      setOrderId(orderIdParam)
      setUserPackageId(userPackageIdParam)
      
      // Trigger confirmation immediately after state is set
      const triggerConfirmation = () => {
        console.log('Triggering confirmation with current state:', {
          userPackageId: userPackageIdParam,
          orderId: orderIdParam,
          reference: referenceParam
        })
        
        // Use the URL params directly instead of state
        const confirmData = {
          userPackageId: userPackageIdParam,
          orderId: orderIdParam,
          hitpayReference: referenceParam,
          paymentStatus: 'completed'
        }
        
        console.log('Calling confirm API with data:', confirmData)
        
        // Call the API directly
        packagesApi.confirmPackagePurchase(confirmData)
          .then(result => {
            if (result.success) {
              setConfirmationStatus('success')
              setConfirmationData(result.data)
              console.log('Package purchase confirmed successfully:', result.data)
            } else {
              throw new Error(result.message || 'Failed to confirm purchase')
            }
          })
          .catch(error => {
            console.error('Package confirmation error:', error)
            setConfirmationStatus('error')
            setConfirmationError(error instanceof Error ? error.message : 'Failed to confirm purchase')
            setConfirmationStatus('idle')
          })
      }
      
      // Trigger immediately
      triggerConfirmation()
    }
  }, [searchParams])

  // Helper functions
  const isFormValid = customerName && customerEmail && customerPhone && agreedToTerms && user
  const subtotal = selectedPackage ? (selectedPackage.price + selectedPackage.outletFee) * quantity : 0
  const total = subtotal

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPackage) return

    setIsLoading(true)
    try {
      // Step 1: Create package purchase record (data only, no payment yet)
      const purchaseData = {
        userId: user.id,
        packageId: selectedPackage.id, // UUID from API response
        quantity,
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          company: companyName,
          billingAddress,
          postalCode
        }
      }

      // Call the new package purchase endpoint
      const result = await packagesApi.createPackagePurchase(purchaseData)
      
      if (result.success) {
        // Store purchase data for payment step
        setOrderId(result.data.orderId)
        setUserPackageId(result.data.userPackageId)
        
        // Step 2: Navigate to payment page (same as booking flow)
        setPurchaseStep(2)
      } else {
        throw new Error(result.message || 'Failed to create package purchase')
      }
    } catch (error) {
      console.error('Package purchase error:', error)
      alert('Failed to create package purchase. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const confirmPurchaseHandler = async () => {
    try {
      console.log('confirmPurchaseHandler called with state:', {
        userPackageId,
        orderId,
        searchParams: Object.fromEntries(searchParams.entries())
      })
      
      setConfirmationStatus('loading')
      
      // Get reference from URL params (HitPay webhook response)
      const hitpayReference = searchParams.get('reference') || searchParams.get('reference_number') || orderId
      
      console.log('Extracted hitpayReference:', hitpayReference)
      
      if (!userPackageId || !hitpayReference) {
        console.error('Missing required data:', { userPackageId, hitpayReference })
        throw new Error('Missing purchase information')
      }

      console.log('Confirming package purchase:', {
        userPackageId,
        orderId,
        hitpayReference,
        paymentStatus: 'completed'
      })

      // Confirm the package purchase with the backend
      const confirmData = {
        userPackageId,
        orderId,
        hitpayReference,
        paymentStatus: 'completed'
      }

      const result = await packagesApi.confirmPackagePurchase(confirmData)
      
      if (result.success) {
        setConfirmationStatus('success')
        setConfirmationData(result.data)
        console.log('Package purchase confirmed successfully:', result.data)
      } else {
        throw new Error(result.message || 'Failed to confirm purchase')
      }
    } catch (error) {
      console.error('Package confirmation error:', error)
      setConfirmationStatus('error')
      setConfirmationError(error instanceof Error ? error.message : 'Failed to confirm purchase')
      setConfirmationStatus('idle') // Reset to idle so user can try again
    }
  }

  // NOW ALL HOOKS ARE CALLED - WE CAN DO CONDITIONAL RENDERING
  if (isLoadingAuth || packagesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center">
          <Loader2 className="w-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading packages...</p>
        </div>
      </div>
    )
  }

  if (packagesError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center">
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Packages</AlertTitle>
            <AlertDescription>{packagesError}</AlertDescription>
          </Alert>
          <Button onClick={retryFetch} className="mt-4">Try Again</Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center">
          <Alert className="max-w-md mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Package Not Found</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/pricing')} className="mt-4">View All Packages</Button>
        </div>
      </div>
    )
  }

  if (packages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-32 text-center">
          <Alert className="max-w-md mx-auto">
            <Package className="h-4 w-4" />
            <AlertTitle>No Packages Available</AlertTitle>
            <AlertDescription>Please check back later or contact support</AlertDescription>
          </Alert>
          <Button onClick={() => router.push('/pricing')} className="mt-4">View All Packages</Button>
        </div>
      </div>
    )
  }

  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Guest Warning */}
          {!user && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertTitle className="text-orange-800">Sign In Required</AlertTitle>
              <AlertDescription className="text-orange-700">
                You must be signed in to purchase packages.
                <Button variant="link" className="px-2 text-orange-600 hover:text-orange-800" onClick={() => router.push('/login')}>
                  Sign in now
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-gray-900 mb-4">Purchase Your Pass</h1>
            <p className="text-lg text-gray-600">Unlock unlimited productivity with our flexible packages</p>
            {selectedPackage && (
              <div className="mt-4 inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm">
                <Package className="w-4 h-4 mr-2" />
                Purchasing: {selectedPackage.name}
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${purchaseStep >= step ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {purchaseStep > step ? '✓' : step}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${purchaseStep >= step ? 'text-orange-500' : 'text-gray-500'}`}>
                    {step === 1 ? 'Details' : step === 2 ? 'Payment' : 'Confirmation'}
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
                  <CardTitle>Purchase Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {purchaseStep === 1 && (
                    <form onSubmit={handlePurchaseSubmit} className="space-y-6">
                      {/* Package Selection */}
                      <div>
                        <Label>Select Package</Label>
                        <Select 
                          value={selectedPackage?.id || ''} 
                          onValueChange={(value) => {
                            const packageData = packages.find(pkg => pkg.id === value)
                            setSelectedPackage(packageData || null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your package" />
                          </SelectTrigger>
                          <SelectContent>
                            {packages
                              .filter((pkg) => !packageType || pkg.type === packageType)
                              .map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  <div className="flex flex-col">
                                    <span>{pkg.name} - ${pkg.price}</span>
                                    <span className="text-xs text-gray-500">{pkg.type}</span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <Label>Quantity</Label>
                        <Select value={quantity.toString()} onValueChange={(val) => setQuantity(parseInt(val))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map(num => (
                              <SelectItem key={num} value={num.toString()}>
                                {num} {num === 1 ? 'Package' : 'Packages'}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Customer Info */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Full Name *</Label>
                            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                          </div>
                          <div>
                            <Label>Email *</Label>
                            <Input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
                          </div>
                          <div>
                            <Label>Phone *</Label>
                            <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
                          </div>
                          <div>
                            <Label>Company</Label>
                            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                          </div>
                        </div>
                        <div>
                          <Label>Billing Address</Label>
                          <Input value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
                        </div>
                        <div>
                          <Label>Postal Code</Label>
                          <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 h-4 w-4 text-orange-600"
                          required
                        />
                        <Label className="text-sm">I agree to the terms and conditions</Label>
                      </div>

                      <Button type="submit" disabled={!isFormValid || isLoading} className="w-full">
                        {isLoading ? 'Processing...' : 'Continue to Payment'}
                      </Button>
                    </form>
                  )}

                  {purchaseStep === 2 && (
                    <PaymentStep
                      subtotal={subtotal}
                      total={total}
                      paymentMethod={paymentMethod}
                      onPaymentMethodChange={setPaymentMethod}
                      customer={{
                        name: customerName,
                        email: customerEmail,
                        phone: customerPhone
                      }}
                      order={{
                        packageName: selectedPackage?.name || '',
                        quantity,
                        notes: `Package: ${selectedPackage?.name}, Total: $${total.toFixed(2)}`
                      }}
                      onBack={() => setPurchaseStep(1)}
                      user={user}
                      userPackageId={userPackageId}
                      orderId={orderId}
                    />
                  )}

                  {purchaseStep === 3 && (
                    <div className="text-center py-8">
                      {confirmationStatus === 'idle' && (
                        <div>
                          <h3 className="text-2xl font-bold mb-4">Payment Successful!</h3>
                          <p className="text-gray-600 mb-6">Your payment has been processed. Now confirming your package purchase...</p>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                            <h4 className="font-medium text-blue-800 mb-2">Purchase Details:</h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p><strong>Order ID:</strong> {orderId}</p>
                              <p><strong>Package ID:</strong> {userPackageId}</p>
                              <p><strong>Status:</strong> Payment Completed</p>
                              <p><strong>Reference:</strong> {searchParams.get('reference') || 'Not found'}</p>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <Button onClick={confirmPurchaseHandler} className="bg-green-600 hover:bg-green-700 w-full">
                              Confirm Package Activation
                            </Button>
                            <Button 
                              onClick={() => {
                                console.log('Manual trigger clicked. Current state:', {
                                  userPackageId,
                                  orderId,
                                  searchParams: Object.fromEntries(searchParams.entries())
                                })
                                confirmPurchaseHandler()
                              }} 
                              variant="outline" 
                              className="w-full"
                            >
                              Debug: Check State & Retry
                            </Button>
                          </div>
                        </div>
                      )}
                      {confirmationStatus === 'loading' && (
                        <div>
                          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                          <h3 className="text-xl font-medium mb-2">Confirming Purchase</h3>
                          <p className="text-gray-600">Please wait while we activate your package...</p>
                        </div>
                      )}
                      {confirmationStatus === 'success' && (
                        <div>
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-green-600 mb-4">Package Activated Successfully!</h3>
                          <p className="text-gray-600 mb-4">Your package has been confirmed and activated.</p>
                          
                          {/* Package Details */}
                          {confirmationData?.package && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
                              <h4 className="font-bold text-blue-800 text-lg mb-4">Package Details</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="font-semibold text-blue-700 mb-2">{confirmationData.package.name}</h5>
                                  <p className="text-blue-600 text-sm mb-2">{confirmationData.package.description}</p>
                                  <p className="text-blue-600 text-sm mb-2">Bonus: {confirmationData.package.bonus}</p>
                                  <p className="text-blue-600 text-sm">Validity: {confirmationData.package.validity} days</p>
                                </div>
                                <div>
                                  <div className="space-y-2">
                                    {confirmationData.package.passes.map((pass: any, index: number) => (
                                      <div key={index} className="flex justify-between items-center bg-white rounded-lg px-3 py-2">
                                        <span className="text-blue-700 text-sm font-medium">
                                          {pass.count}x {pass.type} Pass
                                        </span>
                                        <span className="text-blue-600 text-sm">
                                          {pass.hours} hrs each
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="mt-3 pt-3 border-t border-blue-200">
                                    <div className="flex justify-between items-center">
                                      <span className="text-blue-700 font-medium">Total Passes:</span>
                                      <span className="text-blue-600 font-bold">
                                        {confirmationData.package.passes.reduce((total: number, pass: any) => total + pass.count, 0)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Activation Details */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-green-800 mb-2">Activation Details</h4>
                            <div className="text-sm text-green-700 space-y-1">
                              {confirmationData?.activatedAt && (
                                <p><strong>Activated:</strong> {new Date(confirmationData.activatedAt).toLocaleDateString()}</p>
                              )}
                              {confirmationData?.expiresAt && (
                                <p><strong>Expires:</strong> {new Date(confirmationData.expiresAt).toLocaleDateString()}</p>
                              )}
                              <p><strong>Status:</strong> Active</p>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-green-800 text-sm">
                              <strong>What's next?</strong> You can now use your passes to book coworking spaces.
                            </p>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Button onClick={() => router.push('/dashboard')} className="bg-blue-600 hover:bg-blue-700">
                              Go to Dashboard
                            </Button>
                            <Button onClick={() => router.push('/book-now')} variant="outline">
                              Book Now
                            </Button>
                          </div>
                        </div>
                      )}
                      {confirmationStatus === 'error' && (
                        <div>
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-red-600 mb-4">Confirmation Failed</h3>
                          <p className="text-gray-600 mb-4">{confirmationError}</p>
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-red-800 text-sm">
                              <strong>Don't worry!</strong> Your payment was successful. Please contact support if this issue persists.
                            </p>
                          </div>
                          <Button onClick={confirmPurchaseHandler} className="bg-orange-600 hover:bg-orange-700 mr-2">
                            Try Again
                          </Button>
                          <Button onClick={() => router.push('/dashboard')} variant="outline">
                            Go to Dashboard
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Order Summary - Only show on steps 1 and 2 */}
            {purchaseStep !== 3 && (
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPackage && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium">{selectedPackage.name}</h4>
                          <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Package Price</span>
                            <span>${selectedPackage.price}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Outlet Fee</span>
                            <span>${selectedPackage.outletFee}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Quantity</span>
                            <span>× {quantity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>${subtotal}</span>
                          </div>

                          <div className="flex justify-between font-bold border-t pt-2">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <FooterSection />
    </div>
  )
}