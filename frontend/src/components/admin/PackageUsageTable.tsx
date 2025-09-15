'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Package, Users, Calendar, TrendingUp, Search, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PackageUsage {
  id: string
  packageName: string
  packageType: string
  targetRole: string
  userName: string
  userEmail: string
  userMemberType: string
  totalPasses: number
  usedPasses: number
  remainingPasses: number
  usagePercentage: number
  revenue: number
  lastUsed: string
  purchasedAt: string
  activatedAt: string
  expiresAt: string
  quantity: number
  paymentMethod: string
}

interface PackageUsageStats {
  totalPackages: number
  totalPurchases: number
  totalPasses: number
  totalUsed: number
  totalRevenue: number
  averageUsage: number
}

export default function PackageUsageTable() {
  const { toast } = useToast()
  const [packageUsages, setPackageUsages] = useState<PackageUsage[]>([])
  const [stats, setStats] = useState<PackageUsageStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('usagePercentage')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Fetch package usage data
  const fetchPackageUsage = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/admin/packages/usage`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch package usage data')
      }
      
      const data = await response.json()
      setPackageUsages(data.packages || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching package usage:', error)
      toast({
        title: "Error",
        description: "Failed to fetch package usage data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPackageUsage()
  }, [])

  // Filter and sort packages
  const filteredPackages = packageUsages
    .filter(pkg => {
      const matchesSearch = pkg.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pkg.targetRole.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterType === 'all' || pkg.packageType === filterType
      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      let aValue = a[sortBy as keyof PackageUsage]
      let bValue = b[sortBy as keyof PackageUsage]
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

  const getPackageTypeIcon = (type: string) => {
    switch (type) {
      case 'HALF_DAY': return '🕐'
      case 'FULL_DAY': return '🕘'
      case 'SEMESTER_BUNDLE': return '🎓'
      default: return '📦'
    }
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Usage Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading package usage data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Packages</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalPackages}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPurchases}</p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Passes</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalPasses}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usage Rate</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.averageUsage.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Package Usage Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Package Usage Details
          </CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search packages, users, emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="HALF_DAY">Half Day</SelectItem>
                <SelectItem value="FULL_DAY">Full Day</SelectItem>
                <SelectItem value="SEMESTER_BUNDLE">Semester Bundle</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usagePercentage">Usage %</SelectItem>
                <SelectItem value="usedPasses">Used Passes</SelectItem>
                <SelectItem value="remainingPasses">Remaining Passes</SelectItem>
                <SelectItem value="revenue">Revenue</SelectItem>
                <SelectItem value="packageName">Package Name</SelectItem>
                <SelectItem value="userName">User Name</SelectItem>
                <SelectItem value="purchasedAt">Purchase Date</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No package usage data found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Total Passes</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Usage %</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Purchased</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getPackageTypeIcon(pkg.packageType)}</span>
                          <div>
                            <p className="font-medium">{pkg.packageName}</p>
                            <p className="text-sm text-gray-500">Purchase ID: {pkg.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">{pkg.userName}</p>
                          <p className="text-sm text-gray-500">{pkg.userEmail}</p>
                          <Badge variant="outline" className="text-xs">
                            {pkg.userMemberType}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {pkg.packageType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-center font-medium">
                        {pkg.totalPasses}
                      </TableCell>
                      
                      <TableCell className="text-center text-green-600 font-medium">
                        {pkg.usedPasses}
                      </TableCell>
                      
                      <TableCell className="text-center text-blue-600 font-medium">
                        {pkg.remainingPasses}
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(pkg.usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium ${getUsageColor(pkg.usagePercentage)}`}>
                            {pkg.usagePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      
                      <TableCell className="text-right font-medium">
                        ${pkg.revenue.toFixed(2)}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-500">
                        {pkg.purchasedAt ? new Date(pkg.purchasedAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-500">
                        {pkg.expiresAt ? new Date(pkg.expiresAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      
                      <TableCell className="text-sm text-gray-500">
                        {pkg.lastUsed ? new Date(pkg.lastUsed).toLocaleDateString() : 'Never'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
