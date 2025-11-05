// src/components/landing-page-sections/FAQSection.tsx
'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

import { MapPin, HelpCircle, MessageCircle, ChevronDown } from 'lucide-react'

const faqs: { question: string, answer: React.ReactNode }[] = [
  {
    question: 'What amenities are included?',
    answer: `Every desk comes with ultra-fast 1 Gbps Wi-Fi, unlimited premium coffee & tea, access to our phone booths,
             standing desks, ergonomic chairs, and printing/scanning services.  Need a whiteboard?  We’ve got you covered!`,
  },
  {
    question: 'Can I use the space on weekends?',
    answer: `Absolutely!  Our doors are open 7 days a week from 7 am to 10 pm.  Weekend slots tend to fill up fast,
             so we recommend booking in advance—just like any weekday booking.`,
  },
  {
    question: 'How do I book meeting rooms?',
    answer: `Head over to the “Book Now” tab, choose the “Meeting Room” option and select your preferred time slot.
             You can reserve rooms for as little as 30 minutes, up to 4 hours at a time.  Need catering?  Let us know in advance!`,
  },
  {
    question: 'Are there any events?',
    answer: `Yes!  We host weekly “Coffee & Code” hack nights, monthly guest-speaker talks, and quarterly networking mixers.
             Check our Events calendar or subscribe to our newsletter so you never miss out.`,
  },
  {
    question: 'Can I bring guests?',
    answer: `Of course—every member tier comes with two complimentary guest packages per month.  Guests get full
             access to all amenities but must be accompanied by a member at all times.`,
  },
  {
    question: 'Is parking available?',
    answer: `We offer secure, reserved parking for $5 per visit in the building’s basement garage.  Street parking
             is free on weekends, and there’s also a bike rack out front if you prefer two wheels!`,
  },
  {
        question: 'Where can I find your shop physically?',
        answer: (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-red-500 mt-1" />
            <div>
              We’re located at 123 Productivity Lane, Singapore 567890. View us on <Link
                href="https://g.co/kgs/oZ7c1hJ"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Maps
              </Link> or visit our <Link
              
                href="https://www.google.com/maps/place/My+Productive+Space/data=!4m2!3m1!1s0x0:0x5edc6bc187ef02f0?sa=X&ved=1t:2428&ictx=111"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Listing
              </Link>
            </div>
          </div>
        ),
      },
]

export default function FAQSection() {
  return (
    <section id="FAQ" className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 mb-4">
             <span className="text-orange-600">FAQs</span>
          </h2>
          <p className="text-lg text-gray-600">
            Everything you need to know about My Productive Space
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left Sidebar - CTA Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Still have questions card */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-xl">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Still have questions?</h3>
                  <p className="text-orange-50 mb-6 text-sm">
                    Can't find the answer you're looking for? Our team is here to help!
                  </p>
                  <Link href="#ContactUs">
                    <Button 
                      className="w-full bg-white text-orange-600 hover:bg-orange-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      Contact Us
                    </Button>
                  </Link>
                </div>

            
              </div>
            </div>

            {/* Right Content - FAQ Accordion */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <Accordion type="single" collapsible className="space-y-4">
                  {faqs.map((item, i) => (
                    <AccordionItem 
                      key={i} 
                      value={`faq-${i}`}
                      className="border-none bg-gray-50 rounded-xl overflow-hidden hover:bg-gray-100 transition-colors duration-200"
                    >
                      <AccordionTrigger className="px-6 py-5 hover:no-underline text-left group">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mt-0.5 group-hover:bg-orange-200 transition-colors duration-200">
                            <span className="text-orange-600 font-bold text-sm">{i + 1}</span>
                          </div>
                          <span className="font-semibold text-gray-900 text-base flex-1 pr-4">
                            {item.question}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-2">
                        <div className="pl-12 text-gray-600 leading-relaxed">
                          {item.answer}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>

              {/* Bottom CTA */}
           
            </div>
          </div>
        </div>
      </div>
      {/* <div className="mt-8 bg-gradient-to-r from-blue-50 to-orange-50 rounded-2xl p-6 md:p-8 text-center border border-orange-100">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Need More Information?
                </h3>
                <p className="text-gray-600 mb-6">
                  Check out our detailed guides or get in touch with our support team
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="#ContactUs">
                    <Button className="bg-orange-600 hover:bg-orange-700 text-white px-6">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/pricing">
                    <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 px-6">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div> */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  )
}
