// src/app/buy-pass/BuyPassClient.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Package, AlertCircle, AlertTriangle, Loader2, Clock, CheckCircle } from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'
import { usePackages } from '@/hooks/useNewPackages'
import { NewPackage } from '@/lib/services/packageService'
import { getUserProfile, UserProfile } from '@/lib/userProfileService'

import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import Navbar from '@/components/Navbar'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import PaymentStep from '@/components/buy-pass/PaymentStep'
import ConfirmationStep from '@/components/buy-pass/ConfirmationStep'
import { formatSingaporeDateOnly, getCurrentSingaporeTime } from '@/lib/timezoneUtils'

export default function BuyNowPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // ALL HOOKS MUST BE CALLED FIRST - NO EARLY RETURNS
  const { user, userId, loading: isLoadingAuth } = useAuth()

  // Get the target role from URL params first
  const typeParam = searchParams.get('type')
  const stepParam = searchParams.get('step')
  const typeMapping: { [key: string]: string } = {
    'cowork': 'MEMBER',
    'costudy': 'STUDENT',
    'colearn': 'TUTOR',
    'student': 'STUDENT',
    'tutor': 'TUTOR',
    'member': 'MEMBER'
  }
  
  // For step 3 (confirmation), don't fetch packages by role since we already have the package
  // For other steps, use the role from URL params or default to MEMBER
  const targetRole = stepParam === '3' ? null : (typeMapping[typeParam || ''] || 'MEMBER')

  const { packages, loading: packagesLoading, error: packagesError, refetch } = usePackages(targetRole)

  const [selectedPackage, setSelectedPackage] = useState<NewPackage | null>(null)
  const [packageType, setPackageType] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  
  // Track if we've already restored from localStorage (to prevent re-triggering)
  const hasRestoredFromStorage = useRef(false)
  
  // Save selected package to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && selectedPackage) {
      localStorage.setItem('lastSelectedPackage', JSON.stringify({
        id: selectedPackage.id,
        name: selectedPackage.name,
        targetRole: selectedPackage.targetRole
      }))
    }
  }, [selectedPackage])
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paynow'>('paynow')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState(1)
  const [confirmationData, setConfirmationData] = useState<any>(null)
  const [orderId, setOrderId] = useState<string>('')
  const [userPackageId, setUserPackageId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  
  // Fresh user profile state
  const [freshUserProfile, setFreshUserProfile] = useState<UserProfile | null>(null)
  const [isLoadingUserProfile, setIsLoadingUserProfile] = useState(false)

  // Fetch fresh user profile data
  const loadFreshUserProfile = async () => {
    if (!userId) return
    
    setIsLoadingUserProfile(true)
    try {
      console.log('🔄 Fetching fresh user profile for userId:', userId)
      const profile = await getUserProfile(userId)
      if (profile) {
        console.log('✅ Fresh user profile loaded:', profile)
        setFreshUserProfile(profile)
      } else {
        console.log('❌ Failed to load fresh user profile')
      }
    } catch (error) {
      console.error('❌ Error loading fresh user profile:', error)
    } finally {
      setIsLoadingUserProfile(false)
    }
  }

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push(`/login?next=/buy-pass${window.location.search}`)
    }
  }, [user, isLoadingAuth, router])

  // Load fresh user profile when userId is available
  useEffect(() => {
    if (userId) {
      loadFreshUserProfile()
    }
  }, [userId])

  // Fallback: Try to load from localStorage if available
  useEffect(() => {
    try {
      const userString = localStorage.getItem("database_user")
      if (userString) {
        const userData = JSON.parse(userString)
        const fullName = `${userData?.firstName ?? ""} ${userData?.lastName ?? ""}`.trim()
        if (fullName && !customerName) setCustomerName(fullName)
        if (userData.email && !customerEmail) setCustomerEmail(userData.email)
        if (userData.phone && !customerPhone) setCustomerPhone(userData.phone)
        console.log('📦 Loaded user data from localStorage as fallback')
      }
    } catch (error) {
      console.error("Error parsing database_user from localStorage:", error)
    }
  }, [])

  // Auto-fill customer information when fresh user profile is loaded
  useEffect(() => {
    if (freshUserProfile && !isLoadingUserProfile) {
      console.log('🔄 Auto-filling customer information with fresh user profile:', freshUserProfile)
      
      // Auto-fill customer name
      if (freshUserProfile.firstName && freshUserProfile.lastName) {
        const fullName = `${freshUserProfile.firstName} ${freshUserProfile.lastName}`
        setCustomerName(fullName)
        console.log('✅ Auto-filled customer name:', fullName)
      }
      
      // Auto-fill customer email
      if (freshUserProfile.email) {
        setCustomerEmail(freshUserProfile.email)
        console.log('✅ Auto-filled customer email:', freshUserProfile.email)
      }
      
      // Auto-fill customer phone
      if (freshUserProfile.contactNumber) {
        setCustomerPhone(freshUserProfile.contactNumber)
        console.log('✅ Auto-filled customer phone:', freshUserProfile.contactNumber)
      }
    }
  }, [freshUserProfile, isLoadingUserProfile])

  useEffect(() => {
    const packageParam = searchParams.get('package')
    const typeParam = searchParams.get('type')
    const stepParam = searchParams.get('step')
    const orderIdParam = searchParams.get('orderId')
    const userPackageIdParam = searchParams.get('userPackageId')
    const referenceParam = searchParams.get('reference')
    const statusParam = searchParams.get('status')

    console.log('🔍 Auto-selection effect running:', {
      packageParam,
      typeParam,
      packagesCount: packages.length,
      targetRole,
      packageType,
      currentSelectedPackage: selectedPackage?.name
    })

    // Set packageType first if available
    if (typeParam && targetRole) {
      console.log('🔍 Setting packageType to:', targetRole)
      setPackageType(targetRole)
    }

    if (packageParam && packages.length > 0) {
      const decodedPackageName = decodeURIComponent(packageParam)
      console.log('🔍 Searching for package:', decodedPackageName)
      console.log('🔍 Available packages:', packages.map(p => ({ name: p.name, role: p.targetRole })))

      // Try exact match first
      let foundPackage = packages.find(pkg => pkg.name === decodedPackageName)

      // If no exact match, try case-insensitive match
      if (!foundPackage) {
        foundPackage = packages.find(pkg =>
          pkg.name.toLowerCase() === decodedPackageName.toLowerCase()
        )
      }

      // If still no match, try partial match
      if (!foundPackage) {
        foundPackage = packages.find(pkg =>
          pkg.name.toLowerCase().includes(decodedPackageName.toLowerCase()) ||
          decodedPackageName.toLowerCase().includes(pkg.name.toLowerCase())
        )
      }

      if (foundPackage) {
        console.log('🎯 Auto-selecting package from URL:', foundPackage.name, 'ID:', foundPackage.id)
        // Only update if different to avoid unnecessary re-renders
        if (!selectedPackage || selectedPackage.id !== foundPackage.id) {
          setSelectedPackage(foundPackage)
          setError(null) // Clear any previous errors
        }
      } else {
        console.error('❌ Package not found:', decodedPackageName)
        console.error('❌ Available package names:', packages.map(p => p.name))
        setError(`Package "${decodedPackageName}" not found`)
      }
    } else if (packageParam && packages.length === 0) {
      console.log('⏳ Waiting for packages to load...')
    } else if (!packageParam && packages.length > 0 && !selectedPackage && !hasRestoredFromStorage.current) {
      // No URL param, try to restore from localStorage (only once)
      if (typeof window !== 'undefined') {
        try {
          const lastSelected = localStorage.getItem('lastSelectedPackage')
          if (lastSelected) {
            const { id, targetRole: savedRole } = JSON.parse(lastSelected)
            // Only restore if it matches current target role
            if (savedRole === targetRole) {
              const foundPackage = packages.find(pkg => pkg.id === id)
              if (foundPackage) {
                console.log('🔄 Restoring last selected package:', foundPackage.name)
                setSelectedPackage(foundPackage)
                hasRestoredFromStorage.current = true  // Mark as restored
              }
            }
          }
        } catch (e) {
          console.error('Error restoring package from localStorage:', e)
        }
      }
    }
  }, [searchParams, packages, targetRole])  // ✅ Removed selectedPackage from dependencies

  // Handle step 3 - payment confirmation
  useEffect(() => {
    const stepParam = searchParams.get('step')
    const orderIdParam = searchParams.get('orderId')
    const userPackageIdParam = searchParams.get('userPackageId')

    if (stepParam === '3' && orderIdParam && userPackageIdParam) {
      console.log('Step 3 detected, setting up confirmation:', {
        stepParam,
        orderIdParam,
        userPackageIdParam
      })

      setPurchaseStep(3)
      setOrderId(orderIdParam)
      setUserPackageId(userPackageIdParam)
    }
  }, [searchParams])

  // Auto-select package when selectedPackage changes from URL parameter
  useEffect(() => {
    if (selectedPackage && packages.length > 0) {
      console.log('🎯 Package auto-selected, triggering selection logic for:', selectedPackage.name)
      // The package selection dropdown should now show the selected package
    }
  }, [selectedPackage, packages])

  // Helper functions
  const isFormValid = customerName && customerEmail && customerPhone && agreedToTerms && user
  const subtotal = selectedPackage ? (selectedPackage.price + selectedPackage.outletFee) * quantity : 0
  const cardFee = paymentMethod === 'card' ? subtotal * 0.05 : 0
  const total = subtotal + cardFee
  
  console.log('Payment calculation:', {
    paymentMethod,
    subtotal,
    cardFee,
    total
  })

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedPackage) return

    setIsLoading(true)
    try {
      const purchaseData = {
        userId: user.id,
        packageId: selectedPackage.id, // UUID from API response
        quantity,
        totalAmount: subtotal, // Send base amount (without card fee)
        paymentMethod: paymentMethod, // Include payment method
        customerInfo: {
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          company: companyName,
          billingAddress,
          postalCode
        }
      }

      const { default: packageService } = await import('@/lib/services/packageService')
      const result = await packageService.purchasePackage(purchaseData)

  
      if (result.success) {
        
        const userPackageId = result.data.userPackageId ||
          (result.data as any).purchaseId ||
          (result.data as any).id
   
        if (!result.data.orderId) {
          throw new Error('Order ID not returned from purchase API')
        }

        if (!userPackageId) {
          
          throw new Error('User Package ID not returned from purchase API')
        }

        setOrderId(result.data.orderId)
        setUserPackageId(userPackageId)

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
          <Button onClick={() => refetch(true)} className="mt-4">Try Again</Button>
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

  

  // Main component render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-28 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                            console.log('🎯 Select onValueChange:', value)
                            const packageData = packages.find(pkg => pkg.id === value)
                            console.log('🎯 Found package data:', packageData)
                            setSelectedPackage(packageData || null)
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose your package" />
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              const filteredPackages = packages.filter((pkg) => !packageType || pkg.targetRole === packageType)
                            
                              console.log('🔍 Filtered packages for dropdown:', filteredPackages.map(p => p.name), 'packageType:', packageType)

                              if (filteredPackages.length === 0) {
                                return <div className="p-2 text-sm text-gray-500">No packages available</div>
                              }

                              return filteredPackages.map((pkg) => (
                                <SelectItem key={pkg.id} value={pkg.id}>
                                  {pkg.name}
                                </SelectItem>
                              ))
                            })()}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Quantity - Fixed at 1 (hidden from UI) */}

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
                      <p className='text-sm'>
                        <span className='text-orange-400'> Disclaimer:</span> please check the order summary before proceeding with payment

                      </p>
                      {/* Terms */}
                      <div className="flex items-start space-x-1">
                        <input
                          type="checkbox"
                          checked={agreedToTerms}
                          onChange={(e) => setAgreedToTerms(e.target.checked)}
                          className="mt-1 h-4 w-4 text-orange-600"
                          required
                        />
                        <Label className="text-sm">I agree to the terms and conditions</Label>
                      </div>

                      <Button
                        type="submit"
                        disabled={!isFormValid || isLoading}
                        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        {isLoading ? 'Processing...' : 'Continue to Payment'}
                      </Button>
                    </form>
                  )}

                  {purchaseStep === 2 && (
                    <>
                      {console.log('🎯 Rendering PaymentStep with:', {
                        userPackageId,
                        orderId,
                        userPackageIdType: typeof userPackageId,
                        orderIdType: typeof orderId
                      })}
                      <PaymentStep
                        subtotal={subtotal}
                        total={subtotal}
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
                    </>
                  )}

                  {purchaseStep === 3 && (
                    <ConfirmationStep
                      userPackageId={userPackageId}
                      orderId={orderId}
                      onBack={() => setPurchaseStep(2)}
                      onSuccess={(data) => {
                        setConfirmationData(data)
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            </div>


            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {confirmationData ? (
                    <div className="space-y-4">
                      {/* Confirmation Success Header */}
                      <div className="text-center py-2">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-green-600 text-sm">Package Activated!</h4>
                      </div>

                      {/* Confirmed Package Info */}
                      <div>
                        <h4 className="font-medium">{confirmationData.packageName}</h4>
                        <div className="mt-2 flex items-center space-x-2">
                          <Package className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{confirmationData.packageType}</span>
                        </div>
                        <div className="mt-1 flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{confirmationData.targetRole}</span>
                        </div>
                      </div>

              

                      {/* Activation Details */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Activated</span>
                          <span className="font-medium">{new Date(confirmationData.activatedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Expires</span>
                          <span className="font-medium">{new Date(confirmationData.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Status</span>
                          <span className="font-medium text-green-600">{confirmationData.paymentStatus}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Payment Reference</span>
                          <span className="text-xs text-gray-500">{confirmationData.hitpayReference}</span>
                        </div>
                      </div>

                      {/* Cost Summary */}
                      <div className="space-y-2 border-t pt-3">
                        {(() => {
                          const isCardPayment = confirmationData.paymentMethod === 'card'
                          const baseAmount = confirmationData.totalAmount
                          const cardFee = isCardPayment ? baseAmount * 0.05 : 0
                          const finalTotal = baseAmount + cardFee
                          
                          return (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Package Amount</span>
                                <span>SGD ${baseAmount.toFixed(2)}</span>
                              </div>
                              {isCardPayment && (
                                <div className="flex justify-between text-sm text-orange-600">
                                  <span>Credit Card Fee (5%)</span>
                                  <span>SGD ${cardFee.toFixed(2)}</span>
                                </div>
                              )}
                              <div className="flex justify-between font-bold text-lg">
                                <span>Total Paid</span>
                                <span>SGD ${finalTotal.toFixed(2)}</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>

                      {/* Customer Info */}
                      <div className="bg-blue-50 rounded-lg p-3">
                        <h5 className="text-sm font-medium text-blue-900 mb-2">Customer</h5>
                        <div className="text-xs text-blue-800 space-y-1">
                          <div>{confirmationData.userInfo.name}</div>
                          <div>{confirmationData.userInfo.email}</div>
                          <div>{confirmationData.userInfo.memberType}</div>
                        </div>
                      </div>

                      {/* Next Steps */}
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Ready to Use</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Your package is now active and ready for booking.
                        </p>
                      </div>
                    </div>
                  ) : selectedPackage ? (
                    <div className="space-y-4">
                      {/* Package Selection Info */}
                      <div>
                        <h4 className="font-medium">{selectedPackage.name}</h4>
                        <p className="text-sm text-gray-600">{selectedPackage.description}</p>
                        
                        {/* Package Details Box */}
                        <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <h5 className="text-sm font-semibold text-orange-900 mb-2">Package Includes:</h5>
                          
                          {/* Passes Count - Most Important */}
                          <div className="flex items-center space-x-2 mb-2">
                            <CheckCircle className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-orange-900">
                              {selectedPackage.passCount} {selectedPackage.passCount === 1 ? 'Pass' : 'Passes'}
                            </span>
                            <span className="text-xs text-orange-700">(1 pass per booking)</span>
                          </div>
                          
                          {/* Package Type */}
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-900">{selectedPackage.packageType.replace('_', ' ')}</span>
                          </div>
                          
                          {/* Validity Days */}
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-orange-900">{selectedPackage.validityDays} days validity</span>
                          </div>
                        </div>

                        {/* Activation & Expiry Info */}
                        <div className="mt-3 text-xs text-gray-500 space-y-1">
                          <span className="block">
                            Package activated on:{" "}
                            <span className="font-medium">
                              {new Date().toLocaleDateString()}
                            </span>
                          </span>
                          <span className="block">
                            Package expires on:{" "}
                            <span className="font-medium text-red-500">
                              {new Date(new Date().getTime() + selectedPackage.validityDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                            </span>
                          </span>
                        </div>
                        
                        <div className="mt-2 text-xs text-amber-600 italic">
                          ⚠️ Please note that pass will be activated upon payment
                        </div>
                      </div>
                      
                      {/* Divider */}
                      <div className="border-t border-gray-200"></div>

                      {/* Pricing Breakdown */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Package Price</h5>
                        <div className="flex justify-between">
                          <span>Package Price</span>
                          <span>${selectedPackage.price}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Outlet Fee</span>
                          <span>${selectedPackage.outletFee}</span>
                        </div>
                        {selectedPackage.originalPrice && selectedPackage.originalPrice > selectedPackage.price && (
                          <div className="flex justify-between text-green-600">
                            <span>Discount</span>
                            <span>-${(selectedPackage.originalPrice - selectedPackage.price) * quantity}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${subtotal.toFixed(2)}</span>
                        </div>

                        {cardFee > 0 && (
                          <div className="flex justify-between text-orange-600">
                            <span>Credit Card Fee (5%)</span>
                            <span>${cardFee.toFixed(2)}</span>
                          </div>
                        )}

                        <div className="flex justify-between font-bold border-t pt-2">
                          <span>Total</span>
                          <span>${total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500">Select a package to see details</p>
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