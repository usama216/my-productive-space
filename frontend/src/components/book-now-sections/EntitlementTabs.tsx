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
import { Package, Ticket, Clock, AlertCircle, ExternalLink, Loader2, CheckCircle, XCircle, Wallet } from 'lucide-react'
import { PromoCode, validatePromoCodeLocally, calculateDiscountLocally, formatDiscountDisplay, getPromoCodeStatusColor, getUserAvailablePromoCodes, applyPromoCode, calculateBookingDuration, validateMinimumHours, formatDurationDisplay, BookingDuration } from '@/lib/promoCodeService';
import { getUserPackages, UserPackage as ApiUserPackage } from '@/lib/services/packageService';
import { getUserCredits, UserCredit } from '@/lib/refundService';
import { useToast } from '@/hooks/use-toast';

// Package hour limits per day based on requirements - DEPRECATED
// Now using dynamic hoursAllowed from package configuration
const PACKAGE_HOUR_LIMITS = {
  'HALF_DAY': 4,
  'FULL_DAY': 8,
  'SEMESTER_BUNDLE': 4
} as const;

// Hourly rates by role
const HOURLY_RATES = {
  'STUDENT': 5.00,
  'MEMBER': 6.00,
  'TUTOR': 4.00
} as const;

// Package validation logic - packages are always valid regardless of booking hours
const validatePackageForBooking = (packageType: string, bookingHours: number) => {
  // All packages are valid for any booking duration
  // No hour-based restrictions - users can use packages for any duration
  return { valid: true };
};

// Get applicable packages for booking
const getApplicablePackages = (bookingHours: number, userPackages: ApiUserPackage[]) => {
  // All packages are applicable regardless of booking hours
  // No hour-based restrictions - users can use packages for any duration
  return userPackages.filter(pkg => {
    const remainingPasses = pkg.remainingPasses || pkg.packageContents?.passCount || 0;
    return remainingPasses > 0 && !pkg.isExpired;
  });
};

// Calculate package discount based on dynamic hoursAllowed from package configuration
const calculatePackageDiscount = (pkg: ApiUserPackage, bookingHours: number, userRole: string = 'MEMBER', locationPrice: number = 0) => {
  // Use dynamic hoursAllowed from package configuration instead of hardcoded values
  const discountHours = pkg.hoursAllowed || 4; // Default to 4 hours if not set
  const appliedHours = Math.min(bookingHours, discountHours);
  const remainingHours = Math.max(0, bookingHours - appliedHours);
  
  // Use the actual location price instead of hardcoded rates
  const hourlyRate = locationPrice || HOURLY_RATES[userRole as keyof typeof HOURLY_RATES] || 6.00;
  const discountAmount = appliedHours * hourlyRate;
  const remainingAmount = remainingHours * hourlyRate;
  
  const canUse = (pkg.remainingPasses || pkg.packageContents?.passCount || 0) > 0 && !pkg.isExpired;
  
  console.log('Package discount calculation:', {
    packageName: pkg.packageName,
    packageType: pkg.packageType,
    hoursAllowed: pkg.hoursAllowed,
    discountHours,
    bookingHours,
    appliedHours,
    remainingHours,
    userRole,
    hourlyRate,
    locationPrice,
    discountAmount,
    remainingAmount,
    canUse,
    remainingPasses: pkg.remainingPasses,
    passCount: pkg.packageContents?.passCount,
    isExpired: pkg.isExpired
  });
  
  return {
    hoursToUse: appliedHours,
    discountAmount,
    remainingAmount,
    canUse,
    appliedHours,
    remainingHours,
    packageHours: discountHours
  };
};

type DiscountInfo =
  | { type: 'package'; id: string; discountAmount?: number; finalAmount?: number }
  | { type: 'promo'; id: string; discountAmount: number; finalAmount: number; promoCode: PromoCode }
  | { type: 'credit'; id: string; discountAmount: number; finalAmount: number; creditAmount: number }
  | null;

type Props = {
  onChange: (discountInfo: DiscountInfo) => void
  onModeChange?: (mode: 'package' | 'promo' | 'credit') => void
  mode: 'package' | 'promo' | 'credit'
  selectedPackage?: string
  promoCode?: string
  promoValid?: boolean
  userId?: string
  bookingAmount?: number
  bookingDuration?: BookingDuration
  userRole?: 'STUDENT' | 'MEMBER' | 'TUTOR'
  locationPrice?: number
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
  bookingDuration,
  userRole = 'MEMBER',
  locationPrice = 0
}: Props) {
  const [localPromo, setLocalPromo] = useState(promoCode || '')
  const [promoFeedback, setPromoFeedback] = useState<{ isValid: boolean; message: string } | null>(null)
  const [availablePromos, setAvailablePromos] = useState<PromoCode[]>([])
  const [isLoadingPromos, setIsLoadingPromos] = useState(false)
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null)
  const [discountCalculation, setDiscountCalculation] = useState<{
    discountAmount: number
    finalAmount: number
    isValid: boolean
    message: string
  } | null>(null)
  const [userPackages, setUserPackages] = useState<ApiUserPackage[]>([])
  const [isLoadingPackages, setIsLoadingPackages] = useState(false)
  const [userCredits, setUserCredits] = useState<UserCredit[]>([])
  const [totalCredit, setTotalCredit] = useState(0)
  const [isLoadingCredits, setIsLoadingCredits] = useState(false)
  const [useCredit, setUseCredit] = useState(false)
  const [creditAmount, setCreditAmount] = useState(0)
  const { toast } = useToast()

  // Load user packages from API
  const loadUserPackages = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided, skipping package load');
      return;
    }

    setIsLoadingPackages(true);
    try {
      const packages = await getUserPackages(userId);
      // Filter only packages with COMPLETED payment status
      const completedPackages = packages.filter(pkg => pkg.paymentStatus === 'COMPLETED');

      // All completed packages are applicable regardless of booking hours
      const applicablePackages = completedPackages;
      

      setUserPackages(applicablePackages);
      console.log('User packages loaded:', applicablePackages);
    } catch (error) {
      console.error('Error loading user packages:', error);
      setUserPackages([]);
    } finally {
      setIsLoadingPackages(false);
    }
  }, [userId, bookingDuration]);

  // Load user credits from API
  const loadUserCredits = useCallback(async () => {
    if (!userId) {
      console.log('No userId provided, skipping credit load');
      return;
    }

    setIsLoadingCredits(true);
    try {
      const data = await getUserCredits(userId);
      setUserCredits(data.credits);
      setTotalCredit(data.totalCredit);
      console.log('User credits loaded:', data);
    } catch (error) {
      console.error('Error loading user credits:', error);
      setUserCredits([]);
      setTotalCredit(0);
    } finally {
      setIsLoadingCredits(false);
    }
  }, [userId]);

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

  // Load packages, promo codes, and credits when component mounts
  useEffect(() => {
    if (userId) {
      loadUserPackages();
      if (mode === 'promo') {
        loadAvailablePromoCodes();
      } else if (mode === 'credit') {
        loadUserCredits();
      }
    }
  }, [mode, userId, loadUserPackages, loadAvailablePromoCodes, loadUserCredits]);

  // Recalculate promo code discount when bookingAmount changes
  useEffect(() => {
    if (selectedPromoCode && bookingAmount > 0) {
      const localValidation = validatePromoCodeLocally(selectedPromoCode, bookingAmount);
      if (localValidation.isValid) {
        const newCalculation = calculateDiscountLocally(selectedPromoCode, bookingAmount);

        setDiscountCalculation(prev => {
          if (prev &&
            prev.discountAmount === newCalculation.discountAmount &&
            prev.finalAmount === newCalculation.finalAmount) {
            return prev;
          }

          return {
            discountAmount: newCalculation.discountAmount,
            finalAmount: newCalculation.finalAmount,
            isValid: true,
            message: 'Promo code recalculated for new amount'
          };
        });

        onChange({
          type: 'promo',
          id: selectedPromoCode.id,
          discountAmount: newCalculation.discountAmount,
          finalAmount: newCalculation.finalAmount,
          promoCode: selectedPromoCode
        });
      } else {
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
      const foundPromo = availablePromos.find(promo =>
        promo.code.toLowerCase() === localPromo.toLowerCase()
      );

      if (!foundPromo) {
        setPromoFeedback({ isValid: false, message: 'Invalid promo code' });
        return;
      }

      const localValidation = validatePromoCodeLocally(foundPromo, bookingAmount);
      if (!localValidation.isValid) {
        setPromoFeedback({ isValid: false, message: localValidation.message });
        return;
      }

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
      case 'FULL_DAY': return '🌅'
      case 'HALF_DAY': return '🌤️'
      case 'SEMESTER_BUNDLE': return '📚'
      default: return '📦'
    }
  }

  // // Check if package is valid for current booking
  // const isPackageValidForBooking = (pkg: ApiUserPackage, bookingHours: number) => {
  //   // Use remainingPasses from the API response, fallback to passCount if not available
  //   const remainingPasses = pkg.remainingPasses || pkg.packageContents?.passCount || 0;
  //   return !pkg.isExpired && remainingPasses > 0
  // }

  // // Check if user has any valid packages
  // const hasValidPackages = userPackages.some(pkg => {
  //   const remainingPasses = pkg.remainingPasses || pkg.packageContents?.passCount || 0;
  //   return !pkg.isExpired && remainingPasses > 0
  // })

  // Check if package is valid for current booking
// Check if package is valid for current booking
const isPackageValidForBooking = (pkg: ApiUserPackage, bookingHours: number) => {
  const remainingPasses = pkg.remainingPasses || pkg.packageContents?.passCount || 0;

  // Invalid agar expired hai OR passes khatam ho gaye OR usedPasses === totalPasses
  return !pkg.isExpired && remainingPasses > 0 && pkg.usedPasses < (pkg.totalPasses || 0);
};

// Check if user has any valid packages
const hasValidPackages = userPackages.some(pkg => {
  const remainingPasses = pkg.remainingPasses || pkg.packageContents?.passCount || 0;

  return !pkg.isExpired && remainingPasses > 0 && pkg.usedPasses < (pkg.totalPasses || 0);
});


const getRemainingPasses = (pkg: ApiUserPackage) => {
  const baseRemaining = pkg.remainingPasses || pkg.packageContents?.passCount || 0;

  // Agar sab passes use ho gaye -> no passes left
  if (pkg.usedPasses >= (pkg.totalPasses || 0)) {
    return 0;
  }

  return baseRemaining;
};



  return (
    <div className="border-t pt-6">
      <Label className="text-base font-medium mb-4 block">Apply Discount</Label>
      <Tabs
        value={mode}
        onValueChange={(newMode) => {
          onChange(null);
          if (onModeChange && newMode !== mode) {
            onModeChange(newMode as 'package' | 'promo' | 'credit');
          }
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="package" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Use Package
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2">
            <Ticket className="w-4 h-4" />
            Apply Promo
          </TabsTrigger>
          <TabsTrigger value="credit" className="flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Use Credit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="package" className="mt-4 space-y-4">
          <div className="">
            {isLoadingPackages ? (
              // 1. Loading state
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Loading your packages...</span>
              </div>
            ) : userPackages.length === 0 ? (
              // 2. No packages at all
              <Card className="bg-white border-black">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-orange-800 font-medium">
                    No Active Packages
                  </p>
                  <p className="text-sm text-orange-700 mt-1">
                    Purchase a package to unlock member discounts
                  </p>

                </CardContent>
              </Card>
            ) : !hasValidPackages ? (
              // 3. Packages exist but none valid
              <div className="inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                      <Ticket className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      No passes available
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      You don't have any valid passes for this booking. Purchase passes to
                      save money!
                    </p>
                    <div className="flex space-x-2">
                      <Link
                        href="/buy-pass"
                        className="inline-flex items-center px-2.5 py-1.5 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 transition-colors font-medium"
                      >
                        Buy Passes
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                      <Link
                        href="/pricing#packages"
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors font-medium"
                      >
                        View Packages
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // ✅ 4. Packages exist + at least one valid → Show main package selection UI
              <div className={hasValidPackages ? "" : "blur-sm pointer-events-none"}>
                {userPackages.length > 0 && (
                  <>
                    <div>
                      <Label className="text-sm font-medium mb-2 block">Active Packages</Label>
                      <Select
                        value={selectedPackage || ""}
                        onValueChange={(val) => {
                          const pkg = userPackages.find((p) => p.id === val);
                          const bookingHours = bookingDuration?.durationHours || 0;
                          const discount =
                            pkg && bookingHours > 0
                              ? calculatePackageDiscount(pkg, bookingHours, userRole, locationPrice)
                              : null;

                          console.log('Package selected:', {
                            packageId: val,
                            packageName: pkg?.packageName,
                            packageType: pkg?.packageType,
                            bookingHours,
                            userRole,
                            discount,
                            remainingPasses: pkg?.remainingPasses,
                            passCount: pkg?.packageContents?.passCount
                          });

                          onChange({
                            type: "package",
                            id: val,
                            discountAmount: discount?.discountAmount || 0,
                            finalAmount: discount?.remainingAmount || bookingAmount,
                          });
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a package to use..." />
                        </SelectTrigger>
                      <SelectContent>
  {userPackages.map((pkg) => {
    const remaining = getRemainingPasses(pkg);
    const bookingHours = bookingDuration?.durationHours || 0;
    const isValid = isPackageValidForBooking(pkg, bookingHours);
    const discount =
      bookingHours > 0
        ? calculatePackageDiscount(pkg, bookingHours, userRole, locationPrice)
        : null;
    const packageHours = PACKAGE_HOUR_LIMITS[pkg.packageType as keyof typeof PACKAGE_HOUR_LIMITS] || 0;

    return (
      <SelectItem
        key={pkg.id}
        value={pkg.id}
        disabled={!isValid || remaining === 0}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span>{getPackageTypeIcon(pkg.packageType)}</span>
            <div>
              <span className="font-medium">{pkg.packageName}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({remaining} of {pkg.totalPasses || pkg.packageContents?.passCount || 0} left)
              </span>
            </div>
          </div>
        </div>
      </SelectItem>
    );
  })}
</SelectContent>

                      </Select>
                    </div>

                    {/* Selected Package Details */}
                    {selectedPackage && (
                      <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4">
                          {(() => {
                            const pkg = userPackages.find((p) => p.id === selectedPackage);
                            if (!pkg) return null;
                            const remaining = pkg.remainingPasses || pkg.packageContents?.passCount || 0;

                            return (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span>{getPackageTypeIcon(pkg.packageType)}</span>
                                    <span className="font-medium text-green-800">
                                      {pkg.packageName}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800"
                                  >
                                    {remaining} passes left
                                  </Badge>
                                </div>

                                {/* <div className="flex items-center gap-4 text-sm text-green-700">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      Expires:{" "}
                                      {pkg.expiresAt
                                        ? new Date(pkg.expiresAt).toLocaleDateString()
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <span>Type: {pkg.packageType}</span>
                                </div> */}

                                {(() => {
                                  const bookingHours = bookingDuration?.durationHours || 0;
                                  const packageHours = PACKAGE_HOUR_LIMITS[pkg.packageType as keyof typeof PACKAGE_HOUR_LIMITS] || 0;
                                  const discount = calculatePackageDiscount(pkg, bookingHours, userRole, locationPrice);

                                  return (
                                <div className="space-y-2">
                                  <div className="text-sm text-green-700">
                                    <span className="font-medium">Package Type:</span>{" "}
                                    {pkg.packageName}
                                    {bookingHours > 0 && (
                                      <span className="ml-2">
                                        <span className="font-medium">
                                          Booking Hours:
                                        </span>{" "}
                                        {bookingHours}h
                                      </span>
                                    )}
                                  </div>

                                      {discount && (
                                        <div className="space-y-2">
                                          <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                                            <span className="font-medium">Discount Applied:</span>{" "}
                                            ${discount.discountAmount.toFixed(2)} saved
                                            {discount.remainingAmount > 0 && (
                                              <span className="ml-2">
                                                <span className="font-medium">Final Amount:</span>{" "}
                                                ${discount.remainingAmount.toFixed(2)}
                                              </span>
                                            )}
                                          </div>

                                          {discount.remainingAmount === 0 && (
                                            <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                                              <span className="font-medium">✅ Fully Covered</span>{" "}
                                              - No additional charges
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                                <div className="flex justify-end pt-2 border-t border-green-200">
                                  <Button
                                    type="button"
                                    onClick={() => onChange(null)}
                                    variant="outline"
                                    size="sm"
                                    className="border-green-300 text-green-700 hover:bg-green-100"
                                  >
                                    Remove Package
                                  </Button>
                                </div>
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
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

            {selectedPromoCode && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <p className="flex items-center gap-1">
                  <span>ℹ️</span>
                  <span>Remove the current promo code to apply a different one</span>
                </p>
              </div>
            )}

            {promoFeedback && (
              <div className={`mt-3 p-3 rounded-md ${!promoFeedback.isValid
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-green-50 border border-green-200'
                }`}>
                <div className="flex items-center gap-2">
                  {!promoFeedback.isValid ? (
                    <XCircle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <p className={`text-sm font-medium ${!promoFeedback.isValid
                      ? 'text-red-800'
                      : 'text-green-800'
                    }`}>
                    {promoFeedback.message}
                  </p>
                </div>
              </div>
            )}

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
                  const meetsMinimumHours = !bookingDuration || bookingDuration.durationHours >= 3;
                  const meetsPromoMinimumHours = !promo.minimumHours || !bookingDuration ||
                    validateMinimumHours(promo, bookingDuration).isValid;

                  const isEligible = meetsMinimumHours && meetsPromoMinimumHours;

                  return (
                    <Card
                      key={promo.id}
                      className={`border-gray-200 transition-colors ${isEligible
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
                                {bookingDuration && (
                                  <div className="mt-1">
                                    <p className={`text-xs font-medium ${meetsMinimumHours ? 'text-green-600' : 'text-red-600'
                                      }`}>
                                      {meetsMinimumHours
                                        ? '✅ Meets 3+ hours requirement'
                                        : '❌ Requires minimum 3 hours. Your booking is ' + bookingDuration.durationHours.toFixed(1) + ' hours.'
                                      }
                                    </p>
                                  </div>
                                )}
                                {bookingDuration && promo.minimumHours && (
                                  <div className="mt-1">
                                    {(() => {
                                      const validation = validateMinimumHours(promo, bookingDuration);
                                      return (
                                        <p className={`text-xs font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'
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

        <TabsContent value="credit" className="mt-4 space-y-4">
          <div>
            {/* Credit Disclaimer */}
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Important Notice</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Credits are only available for 30 days from the date they are issued.
                  </p>
                </div>
              </div>
            </div>

            {isLoadingCredits ? (
              // Loading state
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading credits...</span>
              </div>
            ) : totalCredit <= 0 ? (
              // No credits available
              <div className="text-center py-8">
                <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Credits Available</h3>
                <p className="text-gray-600 mb-4">
                  You don't have any store credits available at the moment.
                </p>
                <p className="text-sm text-gray-500">
                  Credits are added to your account when refunds are approved.
                </p>
              </div>
            ) : (
              // Credits available
              <div className="space-y-4">
                {/* Credit Summary */}
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-orange-900">Available Credits</h3>
                        <p className="text-2xl font-bold text-orange-600">
                          ${totalCredit.toFixed(2)}
                        </p>
                        <p className="text-sm text-orange-700">
                          {userCredits.length} credit{userCredits.length !== 1 ? 's' : ''} available
                        </p>
                      </div>
                      <Wallet className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                {/* Credit Usage Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="useCredit"
                      checked={useCredit}
                      onChange={(e) => {
                        setUseCredit(e.target.checked);
                        if (!e.target.checked) {
                          setCreditAmount(0);
                          onChange(null);
                        } else {
                          // Auto-apply maximum available credit when checkbox is checked
                          const maxAmount = Math.min(totalCredit, bookingAmount);
                          setCreditAmount(maxAmount);
                          
                          // Immediately apply the credit and update total amount
                          const finalAmount = Math.max(0, bookingAmount - maxAmount);
                          onChange({
                            type: 'credit',
                            id: 'credit',
                            discountAmount: maxAmount,
                            finalAmount: finalAmount,
                            creditAmount: maxAmount
                          });
                        }
                      }}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <Label htmlFor="useCredit" className="text-sm font-medium">
                      Use store credits for this booking
                    </Label>
                  </div>

                  {useCredit && (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="creditAmount" className="text-sm font-medium">
                          Credit Amount to Use
                        </Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">$</span>
                          <Input
                            id="creditAmount"
                            type="number"
                            min="0"
                            max={Math.min(totalCredit, bookingAmount)}
                            step="0.01"
                            value={creditAmount}
                            onChange={(e) => {
                              const inputAmount = parseFloat(e.target.value) || 0;
                              const maxAmount = Math.min(totalCredit, bookingAmount);
                              const amount = Math.min(inputAmount, maxAmount);
                              
                              // Validate that amount doesn't exceed available credit
                              if (inputAmount > totalCredit) {
                                toast({
                                  title: "Invalid Credit Amount",
                                  description: `You can only use up to $${totalCredit.toFixed(2)} in credits.`,
                                  variant: "destructive"
                                });
                                return;
                              }
                              
                              setCreditAmount(amount);
                              
                              // Immediately apply credit changes and update total amount
                              if (useCredit) {
                                const finalAmount = Math.max(0, bookingAmount - amount);
                                onChange({
                                  type: 'credit',
                                  id: 'credit',
                                  discountAmount: amount,
                                  finalAmount: finalAmount,
                                  creditAmount: amount
                                });
                              }
                            }}
                            className="flex-1"
                            placeholder="0.00"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const maxAmount = Math.min(totalCredit, bookingAmount);
                              setCreditAmount(maxAmount);
                              
                              // Immediately apply maximum credit and update total amount
                              if (useCredit) {
                                const finalAmount = Math.max(0, bookingAmount - maxAmount);
                                onChange({
                                  type: 'credit',
                                  id: 'credit',
                                  discountAmount: maxAmount,
                                  finalAmount: finalAmount,
                                  creditAmount: maxAmount
                                });
                              }
                            }}
                          >
                            Use Max
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum: ${Math.min(totalCredit, bookingAmount).toFixed(2)}
                        </p>
                      </div>

                      {/* Credit Usage Summary */}
                      {creditAmount > 0 && (
                        <Card className="bg-orange-50 border-orange-200">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Booking Amount:</span>
                                <span>${bookingAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-sm text-orange-600">
                                <span>Credit Applied:</span>
                                <span>-${creditAmount.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium border-t border-orange-200 pt-2">
                                <span>Amount to Pay:</span>
                                <span>${Math.max(0, bookingAmount - creditAmount).toFixed(2)}</span>
                              </div>
                              {bookingAmount - creditAmount === 0 && (
                                <div className="text-sm text-orange-700 bg-orange-100 p-2 rounded text-center">
                                  <span className="font-medium">✅ Fully Covered</span> - No payment required
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Credit Details */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Credit Details</Label>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {userCredits.map((credit) => (
                            <div key={credit.id} className="flex items-center justify-between p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                              <div>
                                <span className="font-medium text-orange-900">${credit.amount.toFixed(2)}</span>
                                <span className="text-orange-600 ml-2">
                                  from {credit.Booking?.bookingRef || 'Refund'}
                                </span>
                              </div>
                              <div className="text-xs text-orange-500">
                                Expires: {new Date(credit.expiresat).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}