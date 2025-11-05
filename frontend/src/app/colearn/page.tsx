'use client'
// app/colearn/page.tsx
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import { Tab } from '@headlessui/react'
import { Carousel } from '@/components/Carousel'
import { useRouter } from 'next/navigation'
import { usePackages } from '@/hooks/useNewPackages'
import { NewPackage } from '@/lib/services/packageService'
import { usePricing } from '@/hooks/usePricing'
import { Sparkles, ShoppingCart, Calendar, CheckCircle, Users, Monitor, AlertCircle, Clock, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const rateHeaders = ['1 hr']

const promos = [
  {
    title: 'Spring Special: 20% Off',
    img: '/pricing_img/promo-spring.png',
    desc: 'Use code SPRING20 at checkout. Valid till 30 Apr.',
  },
]

const packages = [
  {
    title: 'Half-Day Productivity Boost',
    img: '/pricing_img/package-1.png',
    details: [
      '6 Half-Day Pass (6 hrs/pass)',
      '4 Complimentary Hours',
      'Valid 30 days from activation',
      'SGD 109 (UP 150) + SGD 5 for all outlets'
    ],
  },
  {
    title: 'Flexible Full-Day Focus',
    img: '/pricing_img/package-2.png',
    details: [
      '6 Full-Day Pass (12 hrs/pass)',
      '2 Half-Day Passes (6 hrs/pass)',
      'Valid 30 days from activation',
      'SGD 209 (UP 280) + SGD 5 for all outlets'
    ],
  },
]

const perks = [
  { src: '/mock_img/perk1.png', title: 'Teaching Command Center', subtitle: 'Smart boards, projectors & premium audio-visual setup' },
  { src: '/mock_img/perk2.png', title: 'Flexible Class Sizes', subtitle: 'Scale from 1-on-1 to group sessions effortlessly' },
  { src: '/mock_img/perk3.png', title: 'Professional Atmosphere', subtitle: 'Impress students & parents with premium facilities' },
  { src: '/mock_img/perk4.png', title: 'Zero Setup Hassle', subtitle: 'Walk in, teach, walk out - everything provided' },
  { src: '/mock_img/perk1.png', title: 'Prime Locations', subtitle: 'Convenient spots that save you & students travel time' },
  { src: '/mock_img/perk2.png', title: 'Pay-As-You-Go', subtitle: 'No long-term commitments or hidden fees' },
  { src: '/mock_img/perk1.png', title: 'Revenue Multiplier', subtitle: 'Teach more students simultaneously, earn more' },
  { src: '/mock_img/perk2.png', title: 'Educator Community', subtitle: 'Network with fellow tutors & share resources' },
  { src: '/mock_img/perk3.png', title: 'Brand Building Hub', subtitle: 'Professional space that elevates your reputation' },
  { src: '/mock_img/perk4.png', title: 'All-Inclusive Setup', subtitle: 'Furniture, tech & utilities - focus on teaching' },
  { src: '/mock_img/perk1.png', title: 'Booking Guarantee', subtitle: 'Reserved slots ensure your classes run smoothly' },
  { src: '/mock_img/perk2.png', title: 'Flexible Pricing', subtitle: 'Pay per session with no minimum commitments' },
]

export default function CoTutorPage() {
  const router = useRouter()
  const { packages, loading: packagesLoading, error: packagesError } = usePackages('TUTOR')
  const { tutorPricing, studentPricing, loading: pricingLoading } = usePricing('ALL')

  // Filter tutor packages
  const tutorPackages = packages

  // Generate rate rows based on backend pricing (1 hour only)
  const getRateRows = () => {
    const rows = []
    
    if (studentPricing) {
      rows.push({ label: 'Student', values: [`$${studentPricing.oneHourRate}/hr*`] })
    } else {
      rows.push({ label: 'Student', values: ['$4.50/hr*'] })
    }
    
    if (tutorPricing) {
      rows.push({ label: 'Tutor', values: [`$${tutorPricing.oneHourRate}/hr`] })
    } else {
      rows.push({ label: 'Tutor', values: ['$6/hr'] })
    }
    
    return rows
  }

  const rateRows = getRateRows()

  const handleBuyNow = (packageData: NewPackage) => {
    router.push(`/buy-pass?package=${encodeURIComponent(packageData.name)}&type=tutor&packageId=${packageData.id}`)
  }
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <Image src="/mock_img/hero-bg.png" alt="Co-Learning Space" fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold text-white">People. Space. Vibes.</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Co-Learning <span className="text-orange-500">Solutions</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed mb-8">
              Expand and scale your teaching capabilities in a modern, accessible environment.
              Classrooms come with spacious tables, a 55″ TV, and whiteboards. Printing services available.
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
                <Users className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-semibold text-orange-700">For Educators</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Reasons to Teach at <span className="text-orange-600">My Productive Space</span>
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
        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      *Student ID required for verification during payment
                    </p>
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
              <Tab.Panel id="packages" className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
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
                ) : tutorPackages.length > 0 ? (
                  tutorPackages.map((pkg) => (
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
