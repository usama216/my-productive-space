// src/components/book-now-sections/EntitlementTabs.tsx
'use client'

import { useState } from 'react'
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
import { Package, Ticket, Clock, AlertCircle, ExternalLink } from 'lucide-react'

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

export type TestVoucher = {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  expires_at: string
  max_uses_per_user: number
  max_uses_total: number
  description: string
  is_active: boolean
}

// Mock user packages data
// //- set to empty to demonstrate the empty state
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
  },
  {
    id: 'pkg3',
    name: 'Student Semester Bundle',
    total_passes: 20,
    passes_used: 8,
    purchased_at: '2025-01-10T00:00:00Z',
    expires_at: '2025-03-10T23:59:59Z',
    package_type: 'study-hour',
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

type Props = {
  onChange: (mode: 'package' | 'promo', value: string) => void
  mode: 'package' | 'promo'
  selectedPackage?: string
  promoCode?: string
  promoValid?: boolean
  testVouchers: Record<string, TestVoucher>
}

export function EntitlementTabs({
  mode,
  onChange,
  selectedPackage,
  promoCode,
  promoValid,
  testVouchers,
}: Props) {
  const [localPromo, setLocalPromo] = useState(promoCode || '')
  const [promoFeedback, setPromoFeedback] = useState<string | null>(
    promoValid === undefined ? null : (promoValid ? 'Valid code!' : 'Invalid code')
  )
  const [showExpiredPackages, setShowExpiredPackages] = useState(false)

  const handleValidatePromo = () => {
    const upperCode = localPromo.toUpperCase()
    const found = Object.values(testVouchers).find(v => v.code === upperCode && v.is_active)

    if (found) {
      setPromoFeedback(`${found.description} - Expires ${new Date(found.expires_at).toLocaleDateString()}`)
      onChange('promo', found.code)
    } else {
      setPromoFeedback('Invalid or expired code')
      onChange('promo', '')
    }
  }

  const formatExpiryDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

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
      <Tabs value={mode} onValueChange={(v) => onChange(v as any, '')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="package" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Use Package
          </TabsTrigger>
          <TabsTrigger value="promo" className="flex items-center gap-2">
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
                      onValueChange={(val) => onChange('package', val)}
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
                                  <span>Expires: {formatExpiryDate(pkg.expires_at)}</span>
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
                                  Expired {formatExpiryDate(pkg.expires_at)}
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
                <Card className="bg-orange-50 border-orange-200">
                  <CardContent className="p-4 text-center">
                    <AlertCircle className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-orange-800 font-medium">No Active Packages</p>
                    <p className="text-sm text-orange-700 mt-1">
                      Purchase a package to unlock member discounts
                    </p>
                    <Button
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
                        href="http://localhost:3000/pricing#packages"
                        className="inline-flex items-center justify-center w-full px-3 py-1.5 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 transition-colors font-medium"
                      >
                        View Packages
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                      <Link
                        href="http://localhost:3000/buy-pass"
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
            <Label className="text-sm font-medium mb-2 block">Discount Code</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter promo code"
                value={localPromo}
                onChange={(e) => setLocalPromo(e.target.value.toUpperCase())}
                className="flex-1"
              />
              <Button
                onClick={handleValidatePromo}
                variant="outline"
                disabled={!localPromo.trim()}
              >
                Validate
              </Button>
            </div>

            {promoFeedback && (
              <div className={`mt-3 p-3 rounded-md ${promoFeedback.includes('Invalid')
                ? 'bg-red-50 border border-red-200'
                : 'bg-green-50 border border-green-200'
                }`}>
                <p className={`text-sm font-medium ${promoFeedback.includes('Invalid')
                  ? 'text-red-800'
                  : 'text-green-800'
                  }`}>
                  {promoFeedback.includes('Invalid') ? '❌' : '✅'} {promoFeedback}
                </p>
              </div>
            )}
          </div>

          {/* Test Vouchers Hint */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-800 mb-2">Test Vouchers Available:</h4>
              <div className="space-y-1 text-sm text-blue-700">
                {Object.values(testVouchers).map((voucher) => (
                  <div key={voucher.code} className="flex justify-between">
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                      {voucher.code}
                    </span>
                    <span>{voucher.description}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}