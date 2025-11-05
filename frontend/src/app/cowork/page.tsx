// app/cowork/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import { Tab } from '@headlessui/react'
import { Carousel } from '@/components/Carousel'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { usePackages } from '@/hooks/useNewPackages'
import { NewPackage } from '@/lib/services/packageService'
import { usePricing } from '@/hooks/usePricing'
import { Sparkles, ShoppingCart, Calendar, CheckCircle, Wifi, Monitor, Coffee, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const rateHeaders = ['1 hr']

const promos = [
  {
    title: 'Spring Special: 20% Off',
    img: '/pricing_img/promo-spring.png',
    desc: 'Use code SPRING20 at checkout. Valid till 30 Apr.',
  },
]

const TABS = ['Rates', 'Promos', 'Packages'] as const

const perks = [
  { src: '/mock_img/perk1.png', title: 'Best WiFi in Town', subtitle: '1 Gbps High-Speed Wi-Fi' },
  { src: '/mock_img/perk2.png', title: 'Tech Forward Space', subtitle: 'Charging Points & Monitors at Every Table' },
  { src: '/mock_img/perk3.png', title: 'Complimentary Snacks', subtitle: 'Best Facilities in the Region' },
  { src: '/mock_img/perk4.png', title: 'Clean Bathrooms', subtitle: 'Pods' },
  { src: '/mock_img/perk1.png', title: 'Business-Grade WiFi', subtitle: '1 Gbps fiber for seamless video calls' },
  { src: '/mock_img/perk2.png', title: 'Executive Workspace', subtitle: 'Ergonomic setups with dual monitors & USB-C docking' },
  { src: '/mock_img/perk3.png', title: 'Premium Coffee Bar', subtitle: 'Barista-quality espresso & healthy meal options' },
  { src: '/mock_img/perk4.png', title: 'Meeting Ready', subtitle: 'Soundproof phone booths & conference rooms' },
  { src: '/mock_img/perk1.png', title: 'Networking Hub', subtitle: 'Connect with entrepreneurs & industry professionals' },
  { src: '/mock_img/perk2.png', title: 'Flexible Membership', subtitle: 'Day packages to monthly plans - scale as you grow' },
  { src: '/mock_img/perk1.png', title: 'Peak Performance Setup', subtitle: 'High-speed internet & premium tech infrastructure' },
  { src: '/mock_img/perk2.png', title: 'Professional Atmosphere', subtitle: 'Quiet zones designed for deep work & focus' },
  { src: '/mock_img/perk3.png', title: 'Fuel Your Hustle', subtitle: 'Gourmet coffee, healthy snacks & energy drinks' },
  { src: '/mock_img/perk4.png', title: 'Client-Ready Spaces', subtitle: 'Impress clients with modern meeting rooms' },
  { src: '/mock_img/perk1.png', title: 'Work-Life Balance', subtitle: 'Wellness areas & break spaces to recharge' },
  { src: '/mock_img/perk2.png', title: 'No Commitment Stress', subtitle: 'Pay-per-use flexibility without long-term contracts' },
]

export default function CoworkPage() {
  const router = useRouter()
  const { packages, loading: packagesLoading, error: packagesError } = usePackages('MEMBER')
  const { memberPricing, loading: pricingLoading } = usePricing('ALL')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const packagesRef = useRef<HTMLDivElement | null>(null)

  // Filter cowork packages (member packages)
  const coworkPackages = packages

  // Generate rate rows based on backend pricing (1 hour only)
  const getRateRows = () => {
    if (!memberPricing) {
      return [
        { label: 'Member', values: ['$6/hr'] },
      ]
    }
    return [
      { label: 'Member', values: [`$${memberPricing.oneHourRate}/hr`] },
    ]
  }

  const rateRows = getRateRows()

  const handleBuyNow = (packageData: NewPackage) => {
    router.push(`/buy-pass?package=${encodeURIComponent(packageData.name)}&type=cowork&packageId=${packageData.id}`)
  }

  // If URL has #packages on first load, open that tab
  useEffect(() => {
    if (window.location.hash === '#packages') {
      const targetIdx = TABS.indexOf('Packages')
      if (targetIdx >= 0) {
        setSelectedIndex(targetIdx)
        // Let the tab render, then scroll
        setTimeout(() => {
          document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 0)
      }
    }
  }, [])

  // Handle hash changes while staying on the page (e.g., internal links)
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#packages') {
        const targetIdx = TABS.indexOf('Packages')
        setSelectedIndex(targetIdx)
        setTimeout(() => {
          document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 0)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <Image src="/mock_img/hero-bg.png" alt="Co-working Space" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">People. Space. Vibes.</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Co-Workspace <span className="text-orange-500">Solutions</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
              Elevate Your Work Experience. Find the perfect workspace solution tailored to your needs—whether you're a member, student, or tutor, we've got you covered.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => router.push('/book-now')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-2xl hover:scale-105 transition-all"
              >
                Book Now
              </Button>
              <Button 
                onClick={() => {
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })
                }}
                variant="outline"
                className="border-2 border-white text-orange-600 hover:bg-white hover:text-gray-900 font-bold px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all"
              >
                View Packages
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="bg-gray-50">
        {/* Reasons Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
                <Wifi className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">Why Choose Us</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Reasons to Co-Work at <span className="text-orange-600">My Productive Space</span>
              </h2>
            </div>

            <Carousel
              settings={{
                dots: true,
                arrows: true,
                infinite: true,
                speed: 500,
                slidesToShow: 3,
                slidesToScroll: 1,
                autoplay: true,
                autoplaySpeed: 3000,
                pauseOnHover: true,
                responsive: [
                  { breakpoint: 1024, settings: { slidesToShow: 2 } },
                  { breakpoint: 640, settings: { slidesToShow: 1 } },
                ],
              }}
            >
              {perks.map((item, i) => (
                <div key={i} className="px-4 py-4">
                  <div className="group relative rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-300 transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-80">
                      <Image 
                        src={item.src} 
                        alt={item.title} 
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent"></div>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h4 className="font-bold text-xl text-white mb-2">
                          {item.title}
                        </h4>
                        <p className="text-white/90 text-sm">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
        </section>

        {/* Tabs Section */}
        <div id="packages" ref={packagesRef} className="h-0 w-0 overflow-hidden scroll-mt-24" />
        
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
              <Tab.List className="flex flex-wrap justify-center gap-4 mb-12">
                {TABS.map((tab) => (
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

          <Tab.Panels className="mt-8" >
            {/* Rates Panel */}
            <Tab.Panel>
              <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-orange-50 to-pink-50 border-b-2 border-orange-200">
                        <th className="p-5 font-bold text-left text-gray-900 text-lg">Member Tier</th>
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
                          {values.map((v, i) => (
                            <td key={i} className="p-5 text-center font-semibold text-orange-600 text-lg">{v}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pricing Example */}
                {/* <div className="p-6 bg-gradient-to-r from-orange-50 to-pink-50 border-t border-gray-200">
                  <div className="max-w-2xl mx-auto">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-600" />
                      Pricing Example
                    </h3>
                    <p className="text-gray-700">
                      Member booking 3 hours = 3 × ${rateRows.find(r => r.label === 'Member')?.values[0] || '$6/hr'} = <strong className="text-orange-600 text-xl">$18</strong>
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
              {packagesLoading ? (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-orange-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading packages...</p>
                  </div>
                </div>
              ) : packagesError ? (
                <div className="col-span-full">
                  <div className="bg-white rounded-2xl border-2 border-red-200 p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-semibold mb-4">Error loading packages: {packagesError}</p>
                    <Button 
                      onClick={() => window.location.reload()} 
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : coworkPackages.length > 0 ? (
                coworkPackages.map((pkg) => (
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
                      
                      <Button
                        onClick={() => handleBuyNow(pkg)}
                        className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        Buy Package
                      </Button>
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
        </section>
      </main>

      <ContactSection />
      <FooterSection />
    </>
  )
}

