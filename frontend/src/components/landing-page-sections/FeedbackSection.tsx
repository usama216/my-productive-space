// src/components/landing-page-sections/FeedbackSection.tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import FeedbackCTA from '@/components/landing-page-sections/FeedbackCTA'
import { Quote, Star, Users } from 'lucide-react'


const testimonials = [
  {
    avatar: '/mock_img/john.png',
    name: 'John Tan',
    role: 'Freelance UX Designer',
    feedback: 'Whether it’s investor calls or team sprints  this is the place...',
  },
  {
    avatar: '/mock_img/jake.png',
    name: 'Jake Lee',
    role: 'Remote Journalist',
    feedback: 'I’ve tried multiple co-working spaces and this one is the best...',
  },
  {
    avatar: '/mock_img/joanne.png',
    name: 'Joanne Lim',
    role: '90 RP JC Student',
    feedback: 'Studying here helps me stay in the zone and also helps me stay focused...',
  },
]

export default function FeedbackSection() {
  return (
    <section id="Feedback" className="relative py-20 bg-gradient-to-br from-orange-50 via-white to-blue-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-20 left-1/2 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mb-6 shadow-lg">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
            What <span className="text-orange-600">Community</span> Says
          </h2>
          <p className="text-lg text-gray-600">
            Don't just take our word for it - hear from our amazing community members
          </p>
          
          {/* Star Rating Display */}
          {/* <div className="flex items-center justify-center gap-4 mt-8 p-4 bg-white bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-lg inline-flex">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">4.9/5.0</p>
              <p className="text-sm text-gray-600">Based on 100+ reviews</p>
            </div>
          </div> */}
        </div>

        {/* Testimonials Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((u, i) => (
              <div 
                key={i} 
                className="group relative bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                {/* Quote Icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Quote className="w-16 h-16 text-orange-600" />
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, starIdx) => (
                    <Star key={starIdx} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Feedback Text */}
                <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                  "{u.feedback}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-md opacity-30"></div>
                    <Image 
                      src={u.avatar} 
                      alt={u.name} 
                      width={56} 
                      height={56} 
                      className="rounded-full relative z-10 border-2 border-white shadow-lg" 
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-lg">{u.name}</p>
                    <p className="text-sm text-orange-600 font-medium">{u.role}</p>
                  </div>
                </div>

                {/* Decorative gradient border on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Review CTA */}
        <div className="mt-16">
          <FeedbackCTA />
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
      `}</style>
    </section>
  )
}
