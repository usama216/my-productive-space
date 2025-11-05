// src/components/landing-page-sections/FeedbackCTA.tsx
'use client'

import { Star, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function FeedbackCTA() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 rounded-2xl p-6 md:p-8 shadow-xl overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          {/* Star Icon Badge */}
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl mb-4">
            <Sparkles className="w-6 h-6 text-orange-600" />
          </div>

          {/* Main Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              Loved Your Time Here?
            </h3>
            <p className="text-orange-50 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Your feedback helps us grow and serve our community better!
            </p>
          </div>

          {/* Star Rating Display */}
          <div className="flex justify-center gap-1.5 mb-6">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="transform hover:scale-110 transition-transform duration-200"
              >
                <Star className="w-7 h-7 fill-yellow-300 text-yellow-300 drop-shadow-lg" />
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center">
            <Link href="https://www.google.com/search?sca_esv=6e430c099377becc&sxsrf=AE3TifMArXba-2tTAqzgepKVCWKO0nxlKQ:1751697082160&kgmid=/g/11xkz9g25_&q=My+Productive+Space&shndl=30&shem=fdl1p,lcuae,lspt19,uaasie&source=sh/x/loc/uni/m1/1&kgs=dff62f9f4f2aac23&sei=8MZoaM3dE_yX4-EPx7-T2QM#lrd=0x31da17e60c43cc53:0x5edc6bc187ef02f0,3,,,,">
              <Button 
                className="h-12 px-6 bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group rounded-lg"
              >
                Leave a 5-Star Review
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </div>

         
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-3 left-3 w-12 h-12 border-l-2 border-t-2 border-white border-opacity-20 rounded-tl-2xl"></div>
        <div className="absolute bottom-3 right-3 w-12 h-12 border-r-2 border-b-2 border-white border-opacity-20 rounded-br-2xl"></div>
      </div>
    </div>
  )
}
