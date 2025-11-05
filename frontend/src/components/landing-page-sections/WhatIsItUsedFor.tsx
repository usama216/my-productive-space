'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Briefcase, GraduationCap, Users, ArrowRight, Sparkles, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const items = [
  {
    src: '/mock_img/member-premium.png',
    title: 'Co-working Space',
    desc: 'A noise-free, productive environment suited to your habits—love where you work!',
    icon: Briefcase,
    color: 'from-blue-500 to-cyan-500',
    borderColor: 'border-blue-200',
    hoverColor: 'hover:border-blue-400',
    links: [
      {
        text: 'Learn More',
        href: '/cowork',
        type: 'primary',
      },
      {
        text: 'View Pricing',
        href: '/pricing',
        type: 'secondary',
      },
      {
        text: 'Offer Packages',
        href: '/cowork#packages',
        type: 'link',
      },
    ],
  },
  {
    src: '/mock_img/Students.jpeg',
    title: 'Co-study',
    desc: 'A space with good vibes for effective studying. Be motivated with friends and push through the rigour.',
    icon: GraduationCap,
    color: 'from-purple-500 to-pink-500',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:border-purple-400',
    links: [
      {
        text: 'Learn More',
        href: '/costudy',
        type: 'primary',
      },
      {
        text: 'View Pricing',
        href: '/pricing',
        type: 'secondary',
      },
      {
        text: 'Offer Packages',
        href: '/costudy#packages',
        type: 'link',
      },
    ],
  },
  {
    src: '/mock_img/tutor.jpg',
    title: 'Co-learn',
    desc: 'A dedicated area for one-on-one tutoring. Commercial teaching must be booked under our Tutor tier.',
    icon: Users,
    color: 'from-orange-500 to-red-500',
    borderColor: 'border-orange-200',
    hoverColor: 'hover:border-orange-400',
    links: [
      {
        text: 'Learn More',
        href: '/colearn',
        type: 'primary',
      },
      {
        text: 'View Pricing',
        href: '/pricing',
        type: 'secondary',
      },
      {
        text: 'Offer Packages',
        href: '/colearn#packages',
        type: 'link',
      },
    ],
  },
]

export default function WhatIsItUsedForSection() {
  return (
    <section id="WhyUs" className="py-20 md:py-28 bg-gray-50 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20 -z-10"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">Perfect For Everyone</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            What Is It Used For
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            A tranquil, flexible and hassle-free workspace—tailored to your needs from morning to night.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {items.map((item, index) => {
            const IconComponent = item.icon
            return (
              <div key={index} className="group h-full">
                <div className={`h-full bg-white rounded-2xl border-2 ${item.borderColor} ${item.hoverColor} overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col`}>
                  {/* Image Section */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={item.src}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${item.color} opacity-20 group-hover:opacity-30 transition-opacity`}></div>
                    
                    {/* Icon Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                        <IconComponent className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6 flex-1">
                      {item.desc}
                    </p>

                    {/* Links Section */}
                    <div className="space-y-3">
                      {item.links.map((link, linkIndex) => {
                        if (link.type === 'primary') {
                          return (
                            <Link key={linkIndex} href={link.href} className="block">
                              <Button
                                className="
                                  w-full
                                  bg-orange-600 hover:bg-orange-700
                                  text-white font-semibold
                                  rounded-lg
                                  transition-colors
                                  flex items-center justify-center gap-2
                                "
                              >
                                {link.text}
                                <ArrowRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          )
                        } else if (link.type === 'secondary') {
                          return (
                            <Link key={linkIndex} href={link.href} className="block">
                              <Button
                                variant="outline"
                                className="
                                  w-full
                                  border-2 border-orange-600 text-orange-600
                                  hover:bg-orange-50
                                  font-semibold
                                  rounded-lg
                                  transition-colors
                                "
                              >
                                {link.text}
                              </Button>
                            </Link>
                          )
                        } else {
                          return (
                            <Link 
                              key={linkIndex} 
                              href={link.href}
                              className="
                                flex items-center justify-center gap-2
                                text-sm font-medium text-gray-600 hover:text-orange-600
                                transition-colors
                                group/link
                              "
                            >
                              <ExternalLink className="w-4 h-4" />
                              <span className="underline underline-offset-2">{link.text}</span>
                              <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                          )
                        }
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
