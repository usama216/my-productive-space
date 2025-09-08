// src/app/test-packages/page.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePackages } from '@/hooks/useNewPackages';
import { PackageCard } from '@/components/packages/PackageCard';
import { PackagePurchase } from '@/components/packages/PackagePurchase';
import { PackageGridSkeleton } from '@/components/packages/PackageLoadingSkeleton';
import { PackageComparison } from '@/components/packages/PackageComparison';
import { PackageStats } from '@/components/packages/PackageStats';
import { PackageSearchFilter } from '@/components/packages/PackageSearchFilter';
import { PackageRecommendations } from '@/components/packages/PackageRecommendations';
import { ApiResponseDebugger } from '@/components/packages/ApiResponseDebugger';
import { NewPackage } from '@/lib/services/packageService';
import { PACKAGE_TYPES, TARGET_ROLES } from '@/lib/constants/packageConstants';

export default function TestPackagesPage() {
  const [selectedRole, setSelectedRole] = useState<string>('MEMBER');
  const [selectedPackage, setSelectedPackage] = useState<NewPackage | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'packages' | 'comparison' | 'stats' | 'recommendations' | 'debug'>('packages');
  const [filteredPackages, setFilteredPackages] = useState<NewPackage[]>([]);
  const [testUserId] = useState('test-user-123');

  const { packages, loading, error, retryCount, retry } = usePackages(selectedRole);

  const handlePurchase = (pkg: NewPackage) => {
    setSelectedPackage(pkg);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = (result: any) => {
    console.log('Test purchase successful:', result);
    setShowPurchaseModal(false);
  };

  // Update filtered packages when packages change
  React.useEffect(() => {
    setFilteredPackages(packages);
  }, [packages]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Package System Test Page</h1>
          <p className="text-xl text-muted-foreground">
            Test the new package system integration
          </p>
        </div>

        {/* Role Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Role to Test</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              {Object.entries(TARGET_ROLES).map(([key, value]) => (
                <Button
                  key={key}
                  variant={selectedRole === value ? 'default' : 'outline'}
                  onClick={() => setSelectedRole(value)}
                >
                  {value}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading && <Badge variant="secondary">Loading...</Badge>}
              {error && <Badge variant="destructive">Error</Badge>}
              {!loading && !error && <Badge variant="default">Connected</Badge>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selected Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{selectedRole}</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Packages Found</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{packages.length} packages</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription>
              <div className="flex items-center justify-between">
                <div>
                  <strong>API Error:</strong> {error}
                  {retryCount > 0 && (
                    <span className="block text-sm mt-1">
                      Retry attempts: {retryCount}
                    </span>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retry}
                  className="ml-4"
                >
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              {selectedRole} Packages (Loading...)
            </h2>
            <PackageGridSkeleton count={6} />
          </div>
        )}

        {/* Tab Navigation */}
        {!loading && !error && packages.length > 0 && (
          <div className="flex justify-center mb-8">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={activeTab === 'packages' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('packages')}
                className="px-6"
              >
                Packages
              </Button>
              <Button
                variant={activeTab === 'recommendations' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('recommendations')}
                className="px-6"
              >
                Recommendations
              </Button>
              <Button
                variant={activeTab === 'comparison' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('comparison')}
                className="px-6"
              >
                Compare
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('stats')}
                className="px-6"
              >
                Statistics
              </Button>
              <Button
                variant={activeTab === 'debug' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('debug')}
                className="px-6"
              >
                API Debug
              </Button>
            </div>
          </div>
        )}

        {/* Packages Display */}
        {!loading && !error && (
          <div>
            {packages.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No packages found for {selectedRole} role. This might be expected if the backend API is not running or no packages are configured.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {activeTab === 'packages' && (
                  <>
                    <h2 className="text-2xl font-bold mb-6">
                      {selectedRole} Packages ({packages.length})
                    </h2>
                    
                    {/* Search and Filter */}
                    <PackageSearchFilter
                      packages={packages}
                      onFilteredPackages={setFilteredPackages}
                      userRole={selectedRole}
                    />
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
                      {filteredPackages.map((pkg) => (
                        <PackageCard
                          key={pkg.id}
                          package={pkg}
                          onPurchase={handlePurchase}
                          userRole={selectedRole}
                        />
                      ))}
                    </div>
                  </>
                )}

                {activeTab === 'recommendations' && (
                  <PackageRecommendations
                    packages={packages}
                    onPurchase={handlePurchase}
                    userRole={selectedRole}
                  />
                )}

                {activeTab === 'comparison' && (
                  <PackageComparison
                    packages={packages}
                    onPurchase={handlePurchase}
                    userRole={selectedRole}
                  />
                )}

                {activeTab === 'stats' && (
                  <PackageStats
                    packages={packages}
                    userRole={selectedRole}
                  />
                )}

                {activeTab === 'debug' && (
                  <ApiResponseDebugger />
                )}
              </>
            )}
          </div>
        )}

        {/* Package Purchase Modal */}
        <PackagePurchase
          show={showPurchaseModal}
          onHide={() => setShowPurchaseModal(false)}
          package={selectedPackage}
          userId={testUserId}
          onSuccess={handlePurchaseSuccess}
        />

        {/* Test Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">What this page tests:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>New package service integration</li>
                <li>Role-based package filtering</li>
                <li>Package card component rendering</li>
                <li>Package purchase modal functionality</li>
                <li>Error handling and loading states</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold">Expected behavior:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Packages should load based on selected role</li>
                <li>Package cards should display correctly</li>
                <li>Purchase modal should open when clicking "Buy Now"</li>
                <li>Error states should be handled gracefully</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold">Backend API endpoints:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>GET /api/new-packages/role/{role}</li>
                <li>POST /api/new-packages/purchase</li>
                <li>GET /api/new-packages/user/{userId}</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


