// src/components/ContactSection.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Mail, User, MessageSquare, Send, Phone, MapPin } from 'lucide-react'


export function ContactSection() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const whatsappInfo = {
    number: "6589202462",
    baseUrl: "https://api.whatsapp.com/send/",
  };
  
  const handleWhatsApp = () => {
    const messageText = `Hello, I came over from https://www.myproductivespace.com and would like to know more about your services.
  Name: ${name}
  Email: ${email}
  Subject: ${subject}
  Inquiry: ${message}`;
    const fullUrl = `${whatsappInfo.baseUrl}?phone=${whatsappInfo.number}&text=${encodeURIComponent(messageText)}`;
    window.open(fullUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mailto = [
      `mailto:myproductivespacecontact@gmail.com`,
      `subject=${encodeURIComponent(subject)}`,
      `body=${encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      )}`,
    ].join('?')
    window.location.href = mailto
  }

  return (
    <section id="ContactUs" className="relative py-20 md:py-28 bg-gray-50 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 border border-orange-200 mb-6">
            <Mail className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">24/7 Support</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-gray-900">
            Get in <span className="text-orange-600">Touch</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Side by Side Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Side - Contact Info (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                  Contact Information
                </h3>
                
                <div className="space-y-6">
                  {/* Email */}
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-orange-50 transition-colors group">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                      <Mail className="w-6 h-6 text-orange-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                      <a 
                        href="mailto:myproductivespacecontact@gmail.com" 
                        className="text-gray-600 hover:text-orange-600 transition-colors text-sm"
                      >
                        myproductivespacecontact@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-orange-50 transition-colors group">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                      <Phone className="w-6 h-6 text-orange-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Phone</h4>
                      <a 
                        href="tel:+6589202462" 
                        className="text-gray-600 hover:text-orange-600 transition-colors text-sm"
                      >
                        +65 8920 2462
                      </a>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start gap-4 p-4 rounded-lg hover:bg-orange-50 transition-colors group">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-600 transition-colors">
                      <MapPin className="w-6 h-6 text-orange-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Location</h4>
                      <a 
                        href="https://maps.app.goo.gl/wAWnGw36L5Ls2kBf7" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-orange-600 transition-colors text-sm"
                      >
                        Blk 208 Hougang St 21 #01-201<br />Singapore 530208
                      </a>
                    </div>
                  </div>
                </div>

                {/* Response Time Badge */}
                <div className="mt-8 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-gray-700 text-center">
                    ⚡ We typically respond within <span className="font-bold text-orange-600">24 hours</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Contact Form (8 columns) */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Send Us a Message
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Subject Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subject
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MessageSquare className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="How can we help you?"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      placeholder="Tell us more about your inquiry..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button 
                      type="submit" 
                      className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send via Email
                    </Button>
                    
                    <Button 
                      type="button" 
                      onClick={handleWhatsApp}
                      className="flex-1 h-12 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Send via WhatsApp
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
{/* Optional: Contact Us Form */ }
{/* <section id="Contact Us">
        <div className="container mx-auto bg-gray-900 text-white rounded-xl p-12">
          <h2 className="text-4xl font-serif">Contact Us</h2>
          <form className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <input type="email" placeholder="Enter your email" className="col-span-1 p-4 rounded-lg text-gray-800" />
            <input type="text" placeholder="Enter your name" className="col-span-1 p-4 rounded-lg text-gray-800" />
            <textarea placeholder="Enter your message" className="col-span-1 p-4 rounded-lg text-white-800" rows={1} />
            <Button className="col-span-1 bg-orange-500">Send Now</Button>
          </form>
        </div>
        <footer className="container mx-auto mt-8 flex flex-col md:flex-row justify-between text-sm text-gray-500">
          <div>
            <div className="font-bold">MyProductiveSpace</div>
            <p>© MyProductiveSpace 2025 All rights reserved</p>
          </div>
          <div className="flex space-x-12">
            <div>
              <p className="font-semibold">Menu</p>
              <ul>
                {['Home','Explore','Travel','Blog','Pricing'].map((t) => (<li key={t}><a href="#">{t}</a></li>))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Information</p>
              <ul>
                {['Spaces','Booking Types','Terms & Conditions','Privacy'].map((t) => (<li key={t}><a href="#">{t}</a></li>))}
              </ul>
            </div>
            <div>
              <p className="font-semibold">Contact Info</p>
              <p>+65 9113 1752</p>
              <p>contact@myproductivespace.com</p>
              <p>#01-201, Singapore</p>
            </div>
            <div>
              <p className="font-semibold">Follow & Contact us on</p>
              <div className="flex space-x-4 mt-2">
                <a href="#">FB</a><a href="#">IG</a><a href="#">TW</a>
              </div>
            </div>
          </div>
        </footer>
      </section> */}