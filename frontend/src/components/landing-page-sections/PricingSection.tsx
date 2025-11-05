// src/components/landing-page-sections/PricingSection.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Carousel } from '@/components/Carousel'
import { ArrowRight, Users, GraduationCap, Crown, Sparkles, Loader2 } from 'lucide-react'
import PricingService from '@/lib/services/pricingService'

// Static plan data (everything except pricing)
const plansTemplate = [
  { 
    src: '/mock_img/Students.jpeg', 
    title: 'Student',
    memberType: 'STUDENT',
    period: '/hr',
    desc: 'Perfect for focused study sessions in a peaceful, quiet environment designed for academic success.',
    icon: GraduationCap,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  { 
    src: '/mock_img/member-premium.png', 
    title: 'Member',
    memberType: 'MEMBER',
    period: '/hr',
    desc: 'Premium membership with comfortable workspaces and exclusive benefits for regular co-workers.',
    icon: Crown,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  { 
    src: '/mock_img/tutor.jpg', 
    title: 'Tutor',
    memberType: 'TUTOR',
    period: '/hr',
    desc: 'Private space ideal for teaching sessions with dedicated tables and quiet environment.',
    icon: Users,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
]

export default function PricingSection() {
  const [plans, setPlans] = useState(plansTemplate.map(plan => ({ ...plan, rate: 'Loading...' })))
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPricing = async () => {
      try {
        setIsLoading(true)
        const result = await PricingService.getAllPricingConfigurations()
        
        if (result.success && result.data) {
          // Map pricing data to plans
          const updatedPlans = plansTemplate.map(plan => {
            const pricing = result.data?.find(p => p.memberType === plan.memberType && p.isActive)
            return {
              ...plan,
              rate: pricing ? `$${pricing.overOneHourRate.toFixed(2)}` : '$0.00'
            }
          })
          setPlans(updatedPlans)
        } else {
          // Fallback to default rates if API fails
          const fallbackPlans = plansTemplate.map(plan => ({
            ...plan,
            rate: plan.memberType === 'STUDENT' ? '$4.50' : '$6.00'
          }))
          setPlans(fallbackPlans)
        }
      } catch (error) {
        console.error('Error fetching pricing:', error)
        // Fallback to default rates
        const fallbackPlans = plansTemplate.map(plan => ({
          ...plan,
          rate: plan.memberType === 'STUDENT' ? '$4.50' : '$6.00'
        }))
        setPlans(fallbackPlans)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPricing()
  }, [])

  return (
    <section id="Pricing" className="relative py-20 md:py-28 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 border border-orange-200 mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">Flexible Pricing Plans</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
            Rates & Pricing
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 mb-4 leading-relaxed">
            Most popular spaces for our co-workers & students.
          </p>
          
          <p className="text-base md:text-lg text-gray-500">
            For bulk bookings, corporate enquiries, or collaborations,{' '}
            <a 
              href="#ContactUs" 
              className="text-orange-600 font-semibold hover:text-orange-700 underline decoration-2 underline-offset-4 decoration-orange-300 hover:decoration-orange-500 transition-all duration-300"
            >
              contact us now
            </a>
            {' '}via our 24/7 Contact Form.
          </p>
        </div>

        {/* Pricing Cards Carousel */}
        <div className="max-w-7xl mx-auto px-4 sm:px-0">
          <Carousel
            settings={{
              dots: true,
              arrows: true,
              infinite: true,
              speed: 500,
              slidesToShow: 3,
              slidesToScroll: 1,
              autoplay: true,
              autoplaySpeed: 4000,
              pauseOnHover: true,
              responsive: [
                {
                  breakpoint: 1024,
                  settings: { 
                    slidesToShow: 2, 
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true 
                  },
                },
                {
                  breakpoint: 640,
                  settings: { 
                    slidesToShow: 1, 
                    slidesToScroll: 1,
                    infinite: true,
                    dots: true 
                  },
                },
              ],
            }}
          >
            {plans.map((plan, index) => {
              const IconComponent = plan.icon
              return (
                <div key={index} className="px-3 py-4">
                  <div className="group relative">
                    {/* Card */}
                    <div className={`
                      relative h-full bg-white rounded-2xl border-2 ${plan.borderColor}
                      transform transition-all duration-500 ease-out
                      hover:scale-105 hover:-translate-y-2
                    `}>
                      {/* Image Container with Gradient Overlay */}
                      <div className="relative h-48 sm:h-52 overflow-hidden rounded-t-xl">
                        <Image
                          src={plan.src}
                          alt={plan.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${plan.color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                        
                      
                      </div>

                      {/* Card Content */}
                      <div className="p-6">
                        {/* Title */}
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">
                          {plan.title}
                        </h3>

                    {/* Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            <span className="text-xl text-gray-400">Loading...</span>
                          </div>
                        ) : (
                          <>
                            <span className={`text-4xl font-extrabold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent`}>
                              {plan.rate}
                            </span>
                            <span className="text-gray-500 font-medium">
                              {plan.period}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                        {/* Description */}
                        <p className="text-gray-600 text-sm leading-relaxed mb-6 min-h-[4rem]">
                          {plan.desc}
                        </p>

                        {/* CTA Button */}
                        <Link href="/pricing" className="block">
                          <Button 
                            className={`
                              w-full py-6 text-base font-semibold rounded-xl
                              bg-gradient-to-r ${plan.color}
                              text-white
                              transform transition-all duration-300
                              hover:scale-105
                              group/btn
                            `}
                          >
                            <span>View Pricing</span>
                            <ArrowRight className="ml-2 w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300" />
                          </Button>
                        </Link>
                      </div>

                      {/* Decorative Corner */}
                      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${plan.color} opacity-5 rounded-bl-full`}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 text-center">
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 md:p-8 rounded-2xl bg-gradient-to-r from-orange-50 via-pink-50 to-purple-50 border-2 border-orange-200">
            <div className="text-left">
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Not sure which plan is right for you?
              </h3>
              <p className="text-gray-600">
                Compare all features and find the perfect workspace solution.
              </p>
            </div>
            <Link href="/pricing">
              <Button 
                size="lg"
                className="
                  px-8 py-6 text-base font-semibold rounded-xl
                  bg-gradient-to-r from-orange-600 to-red-600
                  text-white
                  hover:scale-105
                  transition-all duration-300
                  whitespace-nowrap
                "
              >
                Compare All Plans
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </section>
  )
}