// src/components/landing-page-sections/LocationsSection.tsx
'use client'

import Image from 'next/image'
import { Carousel } from '@/components/Carousel'
import { Button } from '@/components/ui/button'
import { MapPin, Users, Maximize2, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react'
import Link from 'next/link'

const locations = [
  {
    src: '/mock_img/zoneA.png',
    title: 'Kovan Zone A',
    location: 'Kovan, Singapore',
    desc: 'Spacious and modern co-working space designed for productivity and comfort.',
    capacity: '15 seats',
    spacing: '~2m apart',
    features: [
      'Window-side solo seats (T1–T2)',
      'Collaborative group tables (T4, T5)',
      'Double-seat workstation near pillar (T7)',
      'High-speed WiFi throughout',
      'Air-conditioned environment',
      'Power outlets at every seat',
    ],
    highlights: [
      'Natural lighting',
      'Quiet zone available',
      'Printer access',
    ]
  }
]

export default function LocationsSection() {
  return (
    <section id="Locations" className="pt-15 md:pt-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-4">
            <MapPin className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">Our Locations</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 text-gray-900">
        Location
          </h2>
          <p className="text-lg text-gray-600">
            A visual guide to our premium co-working seating layouts
          </p>
        </div>

        {/* Location Cards Carousel */}
        <div className="max-w-7xl mx-auto">
          <Carousel
            settings={{
              slidesToShow: 1,
              slidesToScroll: 1,
              arrows: true,
              dots: true,
              infinite: false,
              autoplay: false,
              speed: 500,
            }}
          >
            {locations.map((loc, i) => {
              const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.title)}`
              
              return (
                <div key={i} className="px-4 py-8">
                  <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
                    <div className="grid lg:grid-cols-2 gap-0">
                      {/* Image Section */}
                      <div className="relative bg-white p-6 md:p-8">
                        <div className="mb-6">
                          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                            {loc.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm font-medium">{loc.location}</span>
                          </div>
                          <div className="flex flex-wrap gap-3 mb-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                              <Users className="w-4 h-4 text-gray-700" />
                              <span className="text-sm font-medium text-gray-900">{loc.capacity}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200">
                              <Maximize2 className="w-4 h-4 text-gray-700" />
                              <span className="text-sm font-medium text-gray-900">{loc.spacing}</span>
                            </div>
                          </div>
                        </div>

                        {/* Floor Plan Image */}
                        <div className="relative w-full">
                          <Image
                            src={loc.src}
                            alt={loc.title}
                            width={500}
                            height={600}
                            className="w-full h-auto rounded-lg border border-gray-200"
                          />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-between bg-gradient-to-br from-white to-orange-50/30">
                        <div>
                          {/* Description */}
                          <div className="mb-8">
                            <p className="text-lg text-gray-800 leading-relaxed font-medium">
                              {loc.desc}
                            </p>
                          </div>

                          {/* Features List */}
                          <div className="mb-8">
                            <h4 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                              <div className="w-1.5 h-8 bg-orange-600 rounded-full"></div>
                              Seating Features
                            </h4>
                            <div className="space-y-3">
                              {loc.features.map((feature, idx) => (
                                <div 
                                  key={idx} 
                                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/80 transition-colors group"
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-5 h-5 text-orange-600 group-hover:scale-110 transition-transform" />
                                  </div>
                                  <span className="text-gray-700 group-hover:text-gray-900">
                                    {feature}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Highlights */}
                          <div className="mb-8">
                            <div className="flex flex-wrap gap-2">
                              {loc.highlights.map((highlight, idx) => (
                                <span
                                  key={idx}
                                  className="px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-full hover:bg-orange-600 hover:text-white transition-all cursor-default"
                                >
                                  {highlight}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6">
                          <Link href={mapLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                            <Button
                              className="
                                w-full
                                inline-flex items-center justify-center gap-2
                                px-6 py-3.5
                                bg-orange-600 hover:bg-orange-700
                                text-white font-bold
                                rounded-xl
                                transition-all duration-300
                                hover:shadow-lg
                              "
                            >
                              <MapPin className="w-5 h-5" />
                              Find us on Maps
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Link href="/book-now" className="flex-1">
                            <Button
                              className="
                                w-full
                                px-6 py-3.5
                                font-bold
                                rounded-xl
                                border-2 border-orange-600 text-orange-600 bg-white
                                hover:bg-orange-600 hover:text-white
                                transition-all duration-300
                                hover:shadow-lg
                              "
                            >
                              Book a Seat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Carousel>
        </div>

        {/* Additional Info */}
        <div className="mt-0 text-center">
          <p className="text-gray-600 text-lg">
            More locations coming soon!{' '}
            <Link href="#ContactUs" className="text-[#A52A2A] font-semibold hover:text-orange-600 underline transition-colors">
              Contact us
            </Link>
            {' '}for updates.
          </p>
        </div>
      </div>
    </section>
  )
}
