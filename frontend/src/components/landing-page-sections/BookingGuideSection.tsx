// src/components/landing-page-sections/BookingGuideSection.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, CreditCard, Clock, ArrowRight, CheckCircle } from 'lucide-react'

const steps = [
  {
    src: '/mock_img/step1.jpg',
    number: '01',
    title: 'Choose Your Zone',
    desc: 'Select the location or seating zone that fits your needs. Browse available spaces and find your perfect spot.',
    est: '2 min',
    icon: MapPin,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50',
  },
  {
    src: '/mock_img/step2.png',
    number: '02',
    title: 'Select Time Slot',
    desc: 'Pick your preferred date and time. Choose duration that works best for your schedule.',
    est: '1 min',
    icon: Calendar,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
  },
  {
    src: '/mock_img/step3.png',
    number: '03',
    title: 'Confirm & Pay',
    desc: 'Click Book Now, confirm your slot and complete the secure payment. Get instant confirmation!',
    est: '2 min',
    icon: CreditCard,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50',
  },
]

export default function BookingGuideSection() {
  return (
    <section id="BookingGuide" className="py-10 md:py-14 bg-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">Quick & Easy Process</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Book in Under <span className="text-orange-600">5 Minutes!</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Our environment is distraction-free, safe, and community-driven. Work solo or together — it's your space, your pace.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-7xl mx-auto mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden md:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 -z-10"></div>

            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div
                  key={index}
                  className="group relative h-full"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Step Card */}
                  <div className="h-full bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-orange-300 transition-all duration-500 hover:scale-105 hover:shadow-2xl flex flex-col">
                    {/* Number Badge */}
                    <div className="absolute -top-4 -left-4 z-20">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl font-bold text-white">{step.number}</span>
                      </div>
                    </div>

                    {/* Image Section */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={step.src}
                        alt={step.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${step.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                      
                      {/* Icon Badge */}
                      <div className="absolute top-4 right-4">
                        <div className="p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                          <IconComponent className={`w-6 h-6 bg-gradient-to-r ${step.color} bg-clip-text text-transparent`} />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed mb-4 flex-1">
                        {step.desc}
                      </p>
                      
                      {/* Time Badge */}
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-600">
                          Est. {step.est}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow (Desktop) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-8 h-8 text-orange-400" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Benefits Bar */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-2xl p-6 md:p-8 border-2 border-orange-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <p className="font-semibold text-gray-900">Instant Confirmation</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <p className="font-semibold text-gray-900">Secure Payment</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <p className="font-semibold text-gray-900">24/7 Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        {/* <div className="text-center">
          <Link href="/pricing" scroll={false}>
            <Button
              className="
                px-10 py-6
                text-xl font-bold
                bg-gradient-to-r from-orange-600 to-red-600
                text-white
                rounded-xl
                hover:shadow-2xl
                transition-all duration-300
                hover:scale-105
                inline-flex items-center gap-3
                group
              "
            >
              Get Pricing & Book Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            No hidden fees • Cancel anytime • Flexible hours
          </p>
        </div> */}
      </div>
    </section>
  )
}
