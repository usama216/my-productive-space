// app/terms/page.tsx
'use client'

import Navbar from '@/components/Navbar'
import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import { FooterSection } from '@/components/landing-page-sections/FooterSection'
import { FileText, Calendar, AlertCircle, Users, CheckCircle } from 'lucide-react'

export default function LegalPage() {
  return (
    <>
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-semibold text-white">Legal Information</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Terms & <span className="text-orange-500">Conditions</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Please read these terms carefully before using our services.
          </p>
        </div>
      </div>

      <main className="bg-gray-50 py-16 md:py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Terms & Conditions */}
          <section className="mb-0">
            <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-50 to-pink-50 border-b-2 border-orange-200 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900">Terms & Conditions</h2>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to MyProductiveSpace. By accessing or using our service, you agree to the following terms:
                </p>
              </div>

              {/* Content */}
              <div className="p-8 space-y-8">
                {/* 1. Booking Policy */}
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">1. Booking Policy</h3>
                  </div>
                  <ul className="space-y-3 ml-11">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">All bookings must be made through our online portal.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Teaching activities must be booked under the "Tutor" tier; failure to do so will be deemed a policy violation.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">Only one tuition session per timeslot is allowed.</span>
                    </li>
                  </ul>
                </div>

                {/* 2. Cancellation & Refunds */}
                <div className="p-6 bg-gray-50 rounded-xl border-l-4 border-orange-600">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">2. Cancellation & Refunds</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Cancellations made more than 24 hours in advance receive a full refund. Within 24 hours, bookings
                    are non-refundable but may be rescheduled once, subject to availability.
                  </p>
                </div>

                {/* 3. Conduct */}
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">3. Conduct</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed ml-11">
                    You are responsible for the behaviour of yourself and your guests. Any damage to facilities will
                    incur repair or replacement charges.
                  </p>
                </div>

                {/* 4. Liability */}
                <div className="p-6 bg-orange-50 rounded-xl border-l-4 border-orange-600">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <h3 className="text-xl font-bold text-gray-900">4. Liability</h3>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    MyProductiveSpace is not liable for personal injury or loss of personal property. Use of our
                    premises is at your own risk.
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <ContactSection />
      <FooterSection />
    </>
  )
}
