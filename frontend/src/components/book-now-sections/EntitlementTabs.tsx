// src/components/book-now-sections/EntitlementTabs.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Ticket, Clock, AlertCircle, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react'
import { PromoCode, validatePromoCodeLocally, calculateDiscountLocally, formatDiscountDisplay, getPromoCodeStatusColor, getUserAvailablePromoCodes, applyPromoCode, calculateBookingDuration, validateMinimumHours, formatDurationDisplay, BookingDuration } from '@/lib/promoCodeService';

export type UserPackage = {
  id: string
  name: string
  total_passes: number
  passes_used: number
  purchased_at: string
  expires_at: string
  package_type: 'full-day' | 'half-day' | 'study-hour'
  is_expired: boolean
}



// Mock user packages data
const mockActivePackages: UserPackage[] = [
  {
    id: 'pkg1',
    name: '20-Day Pass',
    total_passes: 20,
    passes_used: 4,
    purchased_at: '2025-01-15T00:00:00Z',
    expires_at: '2025-03-15T23:59:59Z',
    package_type: 'full-day',
    is_expired: false
  },
  {
    id: 'pkg2',
    name: '15-Half-Day Pass',
    total_passes: 15,
    passes_used: 3,
    purchased_at: '2025-01-20T00:00:00Z',
    expires_at: '2025-02-20T23:59:59Z',
    package_type: 'half-day',
    is_expired: false
  }
]

const mockExpiredPackages: UserPackage[] = [
  {
    id: 'pkg_exp1',
    name: '10-Day Pass',
    total_passes: 10,
    passes_used: 10,
    purchased_at: '2024-11-15T00:00:00Z',
    expires_at: '2024-12-15T23:59:59Z',
    package_type: 'full-day',
    is_expired: true
  },
  {
    id: 'pkg_exp2',
    name: '8-Half-Day Pass',
    total_passes: 8,
    passes_used: 5,
    purchased_at: '2024-12-01T00:00:00Z',
    expires_at: '2024-12-31T23:59:59Z',
    package_type: 'half-day',
    is_expired: true
  }
]

type DiscountInfo = 
  | { type: 'package'; id: string }
  | { type: 'promo'; id: string; discountAmount: number; finalAmount: number; promoCode: PromoCode }
  | null;

type Props = {
  onChange: (discountInfo: DiscountInfo) => void
  onModeChange?: (mode: 'package' | 'promo') => void
  mode: 'package' | 'promo'
  selectedPackage?: string
  promoCode?: string
  promoValid?: boolean
  userId?: string
  bookingAmount?: number
  bookingDuration?: BookingDuration // NEW: Booking duration for minimum hours validation
}

export function EntitlementTabs({
  mode,
  onChange,
  onModeChange,
  selectedPackage,
  promoCode,
  promoValid,
  userId,
  bookingAmount = 0,
  bookingDuration
}: Props) {
  console.log('EntitlementTabs rendered with mode:', mode);
  console.log('All props:', { mode, onChange, onModeChange, selectedPackage, promoCode, promoValid, userId, bookingAmount });
  const [localPromo, setLocalPromo] = useState(promoCode || '')
  const [promoFeedback, setPromoFeedback] = useState<{ isValid: boolean; message: string } | null>(null)
  const [showExpiredPackages, setShowExpiredPackages] = useState(false)
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([])
  const [isLoadingPromos, setIsLoadingPromos] = useState(false)
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null)
  const [discountCalculation, setDiscountCalculation] = useState<{
    discountAmount: number
    finalAmount: number
    isValid: boolean
    message: string
  } | null>(null)



    // Load available promo codes from API
  const loadAvailablePromoCodes = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided, skipping promo code load');
      return;
    }
    
    setIsLoadingPromos(true);
    try {
      const response = await getUserAvailablePromoCodes(userId);
      if (response.availablePromos) {
        setAvailablePromos(response.availablePromos);
        console.log('Available promo codes loaded:', response.availablePromos);
        console.log('User info:', response.userInfo);
      } else {
        setAvailablePromos([]);
      }
    } catch (error) {
      console.error('Error loading promo codes:', error);
      setAvailablePromos([]);
    } finally {
      setIsLoadingPromos(false);
    }
  }, [userId]);

  // Load available promo codes when component mounts
  useEffect(() => {
    if (mode === 'promo' && userId) {
      loadAvailablePromoCodes()
    }
  }, [mode, userId, loadAvailablePromoCodes]);

  // Recalculate promo code discount when bookingAmount changes
  useEffect(() => {
    if (selectedPromoCode && bookingAmount > 0) {
      // Recalculate discount with new booking amount
      const localValidation = validatePromoCodeLocally(selectedPromoCode, bookingAmount);
      if (localValidation.isValid) {
        const newCalculation = calculateDiscountLocally(selectedPromoCode, bookingAmount);
        
        // Only update if the calculation has actually changed to prevent infinite loops
        setDiscountCalculation(prev => {
          if (prev && 
              prev.discountAmount === newCalculation.discountAmount && 
              prev.finalAmount === newCalculation.finalAmount) {
            return prev; // No change, return same object to prevent re-render
          }
          
          return {
            discountAmount: newCalculation.discountAmount,
            finalAmount: newCalculation.finalAmount,
            isValid: true,
            message: 'Promo code recalculated for new amount'
          };
        });
        
        // Notify parent component with updated discount info
        onChange({
          type: 'promo',
          id: selectedPromoCode.id,
          discountAmount: newCalculation.discountAmount,
          finalAmount: newCalculation.finalAmount,
          promoCode: selectedPromoCode
        });
      } else {
        // If promo code is no longer valid with new amount, remove it
        handleRemovePromo();
      }
    }
  }, [bookingAmount, selectedPromoCode]);

    // Validate and apply promo code
  const handleValidatePromo = useCallback(async () => {
    if (!localPromo.trim()) {
      setPromoFeedback({ isValid: false, message: 'Please enter a promo code' });
      return;
    }

    if (!userId || !bookingAmount) {
      setPromoFeedback({ isValid: false, message: 'User ID or booking amount not available' });
      return;
    }

    try {
      // First, find the promo code in available promos
      const foundPromo = availablePromos.find(promo => 
        promo.code.toLowerCase() === localPromo.toLowerCase()
      );

      if (!foundPromo) {
        setPromoFeedback({ isValid: false, message: 'Invalid promo code' });
        return;
      }

      // Validate locally first for immediate feedback
      const localValidation = validatePromoCodeLocally(foundPromo, bookingAmount);
      if (!localValidation.isValid) {
        setPromoFeedback({ isValid: false, message: localValidation.message });
        return;
      }

      // Apply promo code through API
      const apiResponse = await applyPromoCode({
        promoCode: foundPromo.code,
        userId,
        bookingAmount,
        startAt: bookingDuration?.startAt,
        endAt: bookingDuration?.endAt
      });

      if (apiResponse.eligibility.isEligible) {
        setSelectedPromoCode(apiResponse.promoCode);
        setDiscountCalculation({
          discountAmount: apiResponse.calculation.discountAmount,
          finalAmount: apiResponse.calculation.finalAmount,
          isValid: true,
          message: 'Promo code applied successfully!'
        });
        setPromoFeedback({ isValid: true, message: 'Promo code applied successfully!' });
        
        onChange({
          type: 'promo',
          id: apiResponse.promoCode.id,
          discountAmount: apiResponse.calculation.discountAmount,
          finalAmount: apiResponse.calculation.finalAmount,
          promoCode: apiResponse.promoCode
        });
      } else {
        setPromoFeedback({ 
          isValid: false, 
          message: apiResponse.eligibility.reason || 'Failed to apply promo code' 
        });
      }
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoFeedback({ isValid: false, message: 'Error applying promo code' });
    }
  }, [localPromo, userId, bookingAmount, availablePromos, onChange]);

  const handleRemovePromo = useCallback(() => {
    setLocalPromo('');
    setPromoFeedback(null);
    setSelectedPromoCode(null);
    setDiscountCalculation(null);
    onChange(null);
  }, [onChange]);



  const getPackageTypeIcon = (type: string) => {
    switch (type) {
      case 'full-day': return '🌅'
      case 'half-day': return '🌤️'
      case 'study-hour': return '📚'
      default: return '📦'
    }
  }

  // Check if user has any valid (non-expired, non-fully-used) packages
  const hasValidPackages = mockActivePackages.some(pkg =>
    !pkg.is_expired && (pkg.total_passes - pkg.passes_used) > 0
  )

  return (
    <div className="border-t pt-6">
      <Label className="text-base font-medium mb-4 block">Apply Discount</Label>
      <Tabs 
        value={mode} 
        onValueChange={(newMode) => {
          console.log('Tab changed from', mode, 'to', newMode);
          console.log('Current mode state:', mode);
          console.log('New mode requested:', newMode);
          // Clear any existing discount when switching tabs
          onChange(null);
          // Notify parent component about mode change
          if (onModeChange && newMode !== mode) {
            console.log('Calling onModeChange with:', newMode);
            onModeChange(newMode as 'package' | 'promo');
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="package" 
            className="flex items-center gap-2"
            onClick={() => console.log('Package tab clicked!')}
          >
            <Package className="w-4 h-4" />
            Use Package
          </TabsTrigger>
          <TabsTrigger 
            value="promo" 
            className="flex items-center gap-2"
            onClick={() => console.log('Promo tab clicked!')}
          >
            <Ticket className="w-4 h-4" />
            Apply Promo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="package" className="mt-4 space-y-4">
          <div className="relative">
            {/* Blurred content when no valid packages */}
            <div className={hasValidPackages ? '' : 'blur-sm pointer-events-none'}>
              {mockActivePackages.length > 0 ? (
                <>
                  <div>
                    <Label className="text-sm font-medium mb-2 block">Active Passes</Label>
                    <Select
                      value={selectedPackage || ''}
                      onValueChange={(val) => onChange({ type: 'package', id: val })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a pass to use..." />
                      </SelectTrigger>
                      <SelectContent>
                        {mockActivePackages.map((pkg) => {
                          const remaining = pkg.total_passes - pkg.passes_used
                          return (
                            <SelectItem key={pkg.id} value={pkg.id} disabled={remaining === 0}>
                              <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                  <span>{getPackageTypeIcon(pkg.package_type)}</span>
                                  <div>
                                    <span className="font-medium">{pkg.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({remaining} of {pkg.total_passes} left)
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selected Package Details */}
                  {selectedPackage && (
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="p-4">
                        {(() => {
                          const pkg = mockActivePackages.find(p => p.id === selectedPackage)
                          if (!pkg) return null
                          const remaining = pkg.total_passes - pkg.passes_used
                          return (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span>{getPackageTypeIcon(pkg.package_type)}</span>
                                  <span className="font-medium text-green-800">{pkg.name}</span>
                                </div>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  {remaining} passes left
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-green-700">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>Expires: {new Date(pkg.expires_at).toLocaleDateString()}</span>
                                </div>
                                <span>Code: {pkg.package_type}_user123</span>
                              </div>
                            </div>
                          )
                        })()}
                      </CardContent>
                    </Card>
                  )}

                  {/* Expired Packages Section */}
                  <div className="border-t pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowExpiredPackages(!showExpiredPackages)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      {showExpiredPackages ? 'Hide' : 'Show'} Expired Packages ({mockExpiredPackages.length})
                    </Button>

                    {showExpiredPackages && (
                      <div className="mt-3 space-y-2">
                        {mockExpiredPackages.map((pkg) => (
                          <Card key={pkg.id} className="bg-gray-50 border-gray-200">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="opacity-50">{getPackageTypeIcon(pkg.package_type)}</span>
                                  <div>
                                    <span className="font-medium text-gray-600">{pkg.name}</span>
                                    <span className="text-sm text-gray-500 ml-2">
                                      ({pkg.passes_used}/{pkg.total_passes} used)
                                    </span>
                                  </div>
                                </div>
                                <Badge variant="secondary" className="bg-red-100 text-red-800">
                                  Expired {new Date(pkg.expires_at).toLocaleDateString()}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Card className="bg-white border-black">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-orange-800 font-medium">No Active Packages</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Purchase a package to unlock member discounts
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-3 border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      Buy Passes →
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Overlay message when no valid packages */}
            {!hasValidPackages && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg border-2 border-dashed border-orange-300">
                <Card className="bg-white shadow-lg border-orange-200 max-w-xs">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      No Valid Passes Found
                    </h3>
                    <p className="text-gray-600 mb-3 text-sm leading-relaxed">
                      Save money by purchasing pass packages or individual passes.
                    </p>
                    <div className="space-y-2">
                      <Link
                        href="/pricing#packages"
                        className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors font-medium"
                      >
                        View Packages
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                      <Link
                        href="/buy-pass"
                        className="inline-flex items-center justify-center w-full px-3 py-1.5 border border-orange-300 text-orange-700 rounded text-sm hover:bg-orange-50 transition-colors font-medium"
                      >
                        Buy Passes
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Need more passes?{' '}
              <a 
                href="/buy-pass#packages" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Buy passes here
              </a>
              {' '}or explore our{' '}
              <a 
                href="/pricing" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                membership plans
              </a>
            </p>
          </div>
        </TabsContent>

        <TabsContent value="promo" className="mt-4 space-y-4">
          <div>
            <Label className={`text-sm font-medium mb-2 block ${selectedPromoCode ? 'text-gray-500' : ''}`}>
              Discount Code {selectedPromoCode && '(Already Applied)'}
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder={selectedPromoCode ? "Promo code already applied" : "Enter promo code"}
                value={localPromo}
                onChange={(e) => setLocalPromo(e.target.value.toUpperCase())}
                className={`flex-1 ${selectedPromoCode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
                disabled={!!selectedPromoCode}
              />
              <Button
                type="button"
                onClick={handleValidatePromo}
                variant="outline"
                disabled={!localPromo.trim() || isLoadingPromos || !!selectedPromoCode}
              >
                {isLoadingPromos ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : selectedPromoCode ? (
                  'Promo Applied'
                ) : (
                  'APPLY PROMO'
                )}
              </Button>
            </div>

            {/* Info message when promo code is already applied */}
            {selectedPromoCode && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <p className="flex items-center gap-1">
                  <span>ℹ️</span>
                  <span>Remove the current promo code to apply a different one</span>
                </p>
              </div>
            )}

            {/* Promo Code Feedback */}
            {promoFeedback && (
              <div className={`mt-3 p-3 rounded-md ${
                !promoFeedback.isValid
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
              }`}>
                <div className="flex items-center gap-2">
                  {!promoFeedback.isValid ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <p className={`text-sm font-medium ${
                    !promoFeedback.isValid
                      ? 'text-red-800'
                      : 'text-green-800'
                  }`}>
                    {promoFeedback.message}
                  </p>
                </div>
                
                {/* Show additional help for API errors */}
                {!promoFeedback.isValid && promoFeedback.message.includes('Failed to check promo code usage') && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <p className="font-medium">💡 Troubleshooting Tips:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Check if your backend server is running</li>
                      <li>• Verify database connection is working</li>
                      <li>• Check backend logs for detailed error</li>
                      <li>• Try refreshing the page and try again</li>
                    </ul>
                  </div>
                )}
              </div>
            )}

                        {/* Selected Promo Code Details */}
            {selectedPromoCode && discountCalculation && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">{selectedPromoCode.code}</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        {formatDiscountDisplay(selectedPromoCode)}
                      </Badge>
                    </div>
                    
                                                              <div className="text-sm text-green-700">
                       <p>{selectedPromoCode.description}</p>
                       {selectedPromoCode.remainingUses !== undefined && selectedPromoCode.remainingUses > 0 && (
                         <p className="text-xs mt-1">Uses remaining: {selectedPromoCode.remainingUses}</p>
                       )}
                     </div>

                    {/* Discount Calculation */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Original Amount:</span>
                        <span>${bookingAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-${discountCalculation.discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-green-800">
                        <span>Final Amount:</span>
                        <span>${discountCalculation.finalAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={handleRemovePromo}
                      variant="outline"
                      size="sm"
                      className="w-full border-green-300 text-green-700 hover:bg-green-100"
                    >
                      Remove Promo Code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Available Promo Codes */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Available Promo Codes</Label>
            {isLoadingPromos ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Loading promo codes...</span>
              </div>
            ) : availablePromos.length > 0 ? (
              <div className="space-y-2">
                {availablePromos.map((promo) => {
                  // Check if promo meets minimum hours requirement
                  const meetsMinimumHours = !promo.minimumHours || !bookingDuration || 
                    validateMinimumHours(promo, bookingDuration).isValid;
                  
                  return (
                    <Card 
                      key={promo.id} 
                      className={`border-gray-200 transition-colors ${
                        meetsMinimumHours 
                          ? 'hover:border-gray-300' 
                          : 'opacity-60 bg-gray-50 border-gray-300'
                      }`}
                    >
                      <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Ticket className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-medium bg-blue-50 px-2 py-1 rounded text-sm">
                                {promo.code}
                              </span>
                              <Badge className={getPromoCodeStatusColor(promo)}>
                                {formatDiscountDisplay(promo)}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{promo.description}</p>
                            <div className="flex flex-col gap-1 mt-1">
                              {promo.minimumAmount && (
                                <p className="text-xs text-gray-500">
                                  Min. order: ${promo.minimumAmount}
                                </p>
                              )}
                              {promo.minimumHours && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-blue-500" />
                                  <p className="text-xs text-blue-600 font-medium">
                                    Min. {promo.minimumHours} hours required
                                  </p>
                                </div>
                              )}
                              {bookingDuration && promo.minimumHours && (
                                <div className="mt-1">
                                  {(() => {
                                    const validation = validateMinimumHours(promo, bookingDuration);
                                    return (
                                      <p className={`text-xs font-medium ${
                                        validation.isValid ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                        {validation.message}
                                      </p>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                                                                          <div className="text-right text-xs text-gray-500">
                           <p>Uses: {promo.userUsageCount || 0}/{promo.maxUsagePerUser || 1}</p>
                           <p className="text-green-600 font-medium">
                             {promo.remainingUses || 0} uses left
                           </p>
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 text-center">
                  <Ticket className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No promo codes available at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>


        </TabsContent>
      </Tabs>
    </div>
  )
}