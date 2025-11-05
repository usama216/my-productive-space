// app/pricing/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import { Tab } from '@headlessui/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePackages } from '@/hooks/useNewPackages'
import { NewPackage } from '@/lib/services/packageService'
import { Loader2, AlertCircle, Sparkles, ShoppingCart, Calendar, Clock, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getAllPricingForLocation } from '@/lib/pricingService'

const rateHeaders = ['1 hour']
// Dynamic pricing will be loaded from database
const fallbackRateRows = [
  { label: 'Students', values: ['$4.50/hr*'] },
  { label: 'Members', values: ['$6/hr'] },
  { label: 'Tutor', values: ['$6/hr'] },
]

const studentNote = "*Student ID would be required as proof of verification during payment"

const promos = [
  {
    title: 'Spring Special: 20% Off',
    img: '/pricing_img/promo-spring.png',
    desc: 'Use code SPRING20 at checkout. Valid till 30 Apr.',
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { packages, loading: packagesLoading, error: packagesError } = usePackages('MEMBER')
  const [rateRows, setRateRows] = useState(fallbackRateRows)
  const [pricingLoading, setPricingLoading] = useState(true)

  // Load dynamic pricing from admin panel
  useEffect(() => {
    const loadPricing = async () => {
      try {
        const pricing = await getAllPricingForLocation('Kovan')
        setRateRows([
          { label: 'Students', values: [`$${pricing.student.oneHourRate}/hr*`] },
          { label: 'Members', values: [`$${pricing.member.oneHourRate}/hr`] },
          { label: 'Tutor', values: [`$${pricing.tutor.oneHourRate}/hr`] },
        ])
      } catch (error) {
        console.error('Error loading pricing:', error)
        // Keep fallback pricing
      } finally {
        setPricingLoading(false)
      }
    }
    loadPricing()
  }, [])

  const handleBuyNow = (packageData: NewPackage) => {
    // Map targetRole to type parameter
    const typeMap: { [key: string]: string } = {
      'MEMBER': 'member',
      'STUDENT': 'student', 
      'TUTOR': 'tutor'
    }
    const typeParam = typeMap[packageData.targetRole] || 'member'
    router.push(`/buy-pass?package=${encodeURIComponent(packageData.name)}&type=${typeParam}&packageId=${packageData.id}`)
  }

  const handleBookWithPackage = (packageData: NewPackage) => {
    // Navigate to booking page with package parameter for auto-selection
    router.push(`/book-now?package=${encodeURIComponent(packageData.name)}`)
  }

  if (packagesLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading packages...</p>
          </div>
        </div>
      </>
    )
  }

  if (packagesError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Packages</AlertTitle>
              <AlertDescription>{packagesError}</AlertDescription>
            </Alert>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4 w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </>
    )
  }


  return (
    <>
      <Navbar />

      <main className="pt-24 pb-0 bg-gray-50">
        {/* Header Section */}
        <div className="bg-white py-16 md:py-20 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-700">Flexible Pricing Options</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
              Workspace <span className="text-orange-600">Solutions</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Find the perfect workspace solution tailored to your needs—whether you are a member,
              student, or tutor, we have got you covered.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mt-12">
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">Flexible Plans</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">No Hidden Fees</span>
              </div>
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">24/7 Access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Tab.Group>
            <Tab.List className="flex flex-wrap justify-center gap-4 mb-12">
              {['Rates', 'Promos', 'Packages'].map((tab) => (
                <Tab
                  key={tab}
                  className={({ selected }) =>
                    `px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                      selected 
                        ? 'bg-orange-600 text-white shadow-lg scale-105' 
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </Tab.List>

          <Tab.Panels className="mt-8">
            {/* Rates Panel */}
            <Tab.Panel>
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-50 to-pink-50 border-b-2 border-orange-200">
                        <th className="p-5 font-bold text-left text-gray-900 text-lg">Tier</th>
                        {rateHeaders.map((h) => (
                          <th key={h} className="p-5 font-bold text-center text-gray-900 text-lg">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rateRows.map(({ label, values }, idx) => (
                        <tr 
                          key={label} 
                          className={`border-b border-gray-200 hover:bg-orange-50 transition-colors ${
                            idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <td className="p-5 text-left font-bold text-gray-900">{label}</td>
                          {values.map((v,i) => (
                            <td key={i} className="p-5 text-center font-semibold text-orange-600 text-lg">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* <div className="p-6 bg-blue-50 border-t-2 border-blue-200">
                  <p className="text-sm text-gray-700 text-center flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    {studentNote}
                  </p>
                </div> */}

                {/* Scenario Example */}
                {/* <div className="p-6 bg-gradient-to-r from-orange-50 to-pink-50 border-t border-gray-200">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Pricing Example
                    </h3>
                    <p className="text-gray-700">
                      Student booking 3 hours = 3 × ${rateRows.find(r => r.label === 'Students')?.values[0].replace('$', '').replace('/hr*', '') || '4.50'}/hr = <strong className="text-orange-600 text-xl">$13.50</strong>
                    </p>
                  </div>
                </div> */}
              </div>
            </Tab.Panel>

            {/* Promos Panel */}
            <Tab.Panel className="space-y-6">
              {promos.map((p) => (
                <div key={p.title} className="bg-white rounded-2xl border-2 border-orange-200 overflow-hidden hover:shadow-xl transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                    <div className="relative h-64 md:h-auto min-h-[300px]">
                      <Image src={p.img} alt={p.title} fill className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-orange-600/50 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-4 py-2 bg-orange-600 text-white font-bold rounded-full text-sm">
                          Limited Time Offer
                        </span>
                      </div>
                    </div>
                    <div className="p-8 md:p-10 flex flex-col justify-center">
                      <h4 className="text-3xl font-bold text-gray-900 mb-4">{p.title}</h4>
                      <p className="text-lg text-gray-600 mb-6">{p.desc}</p>
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg h-12 w-full sm:w-auto">
                        Redeem Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Tab.Panel>

            {/* Packages Panel */}
            <Tab.Panel className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <div key={pkg.id} className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col">
                    <div className="relative h-52">
                      <Image 
                        src={`/pricing_img/package-${pkg.packageType === 'HALF_DAY' ? '1' : '2'}.png`} 
                        alt={pkg.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      
                      {/* Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1.5 bg-orange-600 text-white font-bold rounded-full text-xs">
                          {pkg.packageType.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Price Tag */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg p-3">
                          <p className="text-2xl font-bold text-orange-600">
                            SGD {pkg.price}
                            {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                SGD {pkg.originalPrice}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">+ SGD {pkg.outletFee} outlet fee</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h4 className="text-xl font-bold text-gray-900 mb-3">{pkg.name}</h4>
                      <ul className="space-y-2 text-sm text-gray-600 mb-6 flex-1">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{pkg.description}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{pkg.passCount} Packages Included</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Valid {pkg.validityDays} days from activation</span>
                        </li>
                      </ul>
                      
                      <div className="space-y-3">
                        <Button
                          onClick={() => handleBuyNow(pkg)}
                          className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-5 h-5" />
                          Buy Package
                        </Button>
                        <Button
                          onClick={() => handleBookWithPackage(pkg)}
                          variant="outline"
                          className="w-full h-12 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                          title="Book now with this package (you must own it first)"
                        >
                          <Calendar className="w-5 h-5" />
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                    <div className="max-w-md mx-auto">
                      <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-900 text-xl font-semibold mb-2">No packages available</p>
                      <p className="text-gray-500">Please check back later for exciting offers.</p>
                    </div>
                  </div>
                </div>
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
        </div>
      </main>

      <ContactSection />
      <FooterSection />
    </>
  )
}

