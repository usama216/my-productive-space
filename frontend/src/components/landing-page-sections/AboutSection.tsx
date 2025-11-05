// frontend/src/components/landing-page-sections/AboutSection.tsx
'use client'

import Image from 'next/image'
import { Carousel } from '@/components/Carousel'
import LogoCloud from '@/components/logo-cloud'
import { Wifi, Monitor, Coffee, Sparkles, Star, CheckCircle } from 'lucide-react'

const perks = [
    { 
        src: '/mock_img/perk1.png', 
        title: 'Best WiFi in Town', 
        subtitle: '1 Gbps High-Speed Wi-Fi',
        icon: Wifi,
        color: 'from-blue-500 to-cyan-500',
    },
    { 
        src: '/mock_img/perk2.png', 
        title: 'Tech Forward Space', 
        subtitle: 'Charging Points & Monitors at Every Table',
        icon: Monitor,
        color: 'from-purple-500 to-pink-500',
    },
    { 
        src: '/mock_img/perk3.png', 
        title: 'Complimentary Snacks', 
        subtitle: 'Best Facilities in the Region',
        icon: Coffee,
        color: 'from-orange-500 to-red-500',
    },
    { 
        src: '/mock_img/perk4.png', 
        title: 'Clean Bathrooms', 
        subtitle: 'Pods',
        icon: Sparkles,
        color: 'from-green-500 to-emerald-500',
    },
]

export default function AboutSection() {
    return (
        <section id="About" className="py-20 md:py-28 bg-white relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-20 -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -z-10"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
                        <Star className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-700">Why Choose Us</span>
                    </div>
                    
                    <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
                        About Us
                    </h2>
                </div>

                {/* Pain Points Slider */}
                <div className="">
                    <LogoCloud />
                </div>

                {/* What We Offer Section */}
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                        So What Do We <span className="text-orange-600">Offer?</span>
                    </h3>
                    
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8">
                        Step into our co-working sanctuary – where ambition ignites and creativity flourishes. 
                        With top-notch amenities and a vibrant community, fuel your drive and feed your imagination.
                    </p>

                    {/* Quick Benefits */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900">Premium Facilities</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900">Vibrant Community</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-semibold text-gray-900">Flexible Hours</span>
                        </div>
                    </div>
                </div>

                {/* Perks Carousel */}
                <div className="max-w-7xl mx-auto">
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
                                {
                                    breakpoint: 1024,
                                    settings: { 
                                        slidesToShow: 2, 
                                        slidesToScroll: 1,
                                    },
                                },
                                {
                                    breakpoint: 640,
                                    settings: { 
                                        slidesToShow: 1, 
                                        slidesToScroll: 1,
                                    },
                                },
                            ],
                        }}
                    >
                        {perks.map((item, i) => {
                            const IconComponent = item.icon
                            return (
                                <div key={i} className="px-4 py-4">
                                    <div className="group relative rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-orange-300 transition-all duration-500 hover:-translate-y-2">
                                        {/* Image */}
                                        <div className="relative h-96">
                                            <Image 
                                                src={item.src} 
                                                alt={item.title} 
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700" 
                                            />
                                            
                                            {/* Icon Badge */}
                                            <div className="absolute top-4 right-4">
                                                <div className="p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg">
                                                    <IconComponent className="w-6 h-6 text-orange-600" />
                                                </div>
                                            </div>

                                            {/* Content Overlay - Black gradient at bottom only */}
                                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
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
                            )
                        })}
                    </Carousel>
                </div>
            </div>
        </section>
    )
}
