'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Package, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ShoppingBag,
  Gift,
  CreditCard,
  ExternalLink
} from 'lucide-react'
import { 
  getUserPackages, 
  UserPackage, 
  formatPackagePrice, 
  formatPackageDate, 
  formatPackageDateTime,
  getPackageStatusColor,
  getPackageStatusText,
  getPackageProgressPercentage
} from '@/lib/packageService'

interface UserPackagesProps {
  userId: string
}

export function UserPackages({ userId }: UserPackagesProps) {
  const [userPackages, setUserPackages] = useState<UserPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadUserPackages()
    }
  }, [userId])

  const loadUserPackages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await getUserPackages(userId)
      
      if (response.success && response.activePackages) {
        setUserPackages(response.activePackages)
      } else {
        setError(response.error || 'Failed to load packages')
      }
    } catch (error) {
      console.error('Error loading user packages:', error)
      setError('Failed to load packages')
    } finally {
      setLoading(false)
    }
  }

  const getPackageIcon = (packageType: string) => {
    switch (packageType.toLowerCase()) {
      case 'premium':
        return <Gift className="h-5 w-5 text-purple-600" />
      case 'basic':
        return <Package className="h-5 w-5 text-blue-600" />
      case 'student':
        return <Package className="h-5 w-5 text-green-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusIcon = (userPackage: UserPackage) => {
    if (userPackage.isExpired) {
      return <XCircle className="h-4 w-4 text-red-500" />
    }
    if (userPackage.remainingPasses === 0) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusBadgeVariant = (userPackage: UserPackage) => {
    if (userPackage.isExpired) return 'destructive'
    if (userPackage.remainingPasses === 0) return 'secondary'
    return 'default'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading packages...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (userPackages.length === 0) {
    return (
      <div className="text-center py-8">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Found</h3>
        <p className="text-muted-foreground mb-4">
          You haven't purchased any packages yet. Browse our available packages to get started.
        </p>
        <Button asChild>
          <a href="/buy-pass">
            Browse Packages
          </a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Packages</h2>
          <p className="text-muted-foreground">
            Manage your purchased packages and track usage
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/buy-pass" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Buy More Packages
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Package Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userPackages.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Packages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {userPackages.reduce((sum, pkg) => sum + pkg.remainingPasses, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Available Passes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userPackages.reduce((sum, pkg) => sum + pkg.usedPasses, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Used Passes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatPackagePrice(userPackages.reduce((sum, pkg) => sum + pkg.totalAmount, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {userPackages.map((userPackage) => (
          <Card key={userPackage.id} className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getPackageIcon(userPackage.packageType)}
                  <div>
                    <CardTitle className="text-lg">{userPackage.packageName}</CardTitle>
                    <p className="text-sm text-muted-foreground capitalize">
                      {userPackage.packageType} Package
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(userPackage)}
                  <Badge variant={getStatusBadgeVariant(userPackage)}>
                    {getPackageStatusText(userPackage)}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Package Description */}
              {userPackage.description && (
                <p className="text-sm text-muted-foreground">
                  {userPackage.description}
                </p>
              )}

              {/* Bonus Description */}
              {userPackage.bonusDescription && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Bonus</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    {userPackage.bonusDescription}
                  </p>
                </div>
              )}

              {/* Usage Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usage Progress</span>
                  <span className="font-medium">
                    {userPackage.usedPasses} / {userPackage.totalPasses} passes
                  </span>
                </div>
                <Progress 
                  value={getPackageProgressPercentage(userPackage)} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{userPackage.usedPasses} used</span>
                  <span>{userPackage.remainingPasses} remaining</span>
                  {userPackage.expiredPasses > 0 && (
                    <span className="text-red-500">{userPackage.expiredPasses} expired</span>
                  )}
                </div>
              </div>

              {/* Package Stats */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {userPackage.remainingPasses}
                  </div>
                  <div className="text-xs text-muted-foreground">Available</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatPackagePrice(userPackage.totalAmount)}
                  </div>
                  <div className="text-xs text-muted-foreground">Total Paid</div>
                </div>
              </div>

              {/* Package Dates */}
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Purchased:</span>
                  <span>{formatPackageDate(userPackage.purchasedAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Expires:</span>
                  <span className={userPackage.isExpired ? 'text-red-500' : ''}>
                    {formatPackageDate(userPackage.expiresAt)}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Payment:</span>
                  <Badge 
                    variant={userPackage.paymentStatus === 'completed' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {userPackage.paymentStatus}
                  </Badge>
                </div>
                {userPackage.remainingPasses > 0 && !userPackage.isExpired && (
                  <Button size="sm" variant="outline" asChild>
                    <a href="/book-now" className="flex items-center gap-1">
                      Use Package
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
   
    </div>
  )
}
