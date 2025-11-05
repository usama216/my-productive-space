// src/components/Footer.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa'
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react'

const menuLinks = [
  { label: 'Home', href: '/' },
  { label: 'Book Now', href: '/book-now' },
  { label: 'Buy Pass', href: '/buy-pass' },
  { label: 'Pricing', href: '/pricing' },
]

const infoLinks = [
  { label: 'Co-working', href: '/cowork' },
  { label: 'Co-study', href: '/costudy' },
  { label: 'Co-learn', href: '/colearn' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
]

const whatsappInfo = {
  number: "+65 8920 2462",
  baseUrl: "https://api.whatsapp.com/send/",
  siteLink: "https://www.myproductivespace.com",
  get encodedMessage() {
    return `Hello, I came over from ${this.siteLink} and I would like to know more about your services.`;
  },
  get fullUrl() {
    return `${this.baseUrl}?phone=${this.number}&text=${encodeURIComponent(this.encodedMessage)}`;
  }
};

export function FooterSection() {
  return (
    <footer className="relative bg-white overflow-hidden">
      {/* Main Footer */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Gradient Overlays */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="mb-6 bg-white p-4 rounded-xl inline-block">
                <Image
                  src="/mock_img/logo1.png"
                  alt="MyProductiveSpace Logo"
                  width={240}
                  height={64}
                  className="object-contain"
                />
              </div>
              <p className="text-gray-300 leading-relaxed mb-8 text-lg">
                Your premier co-working space for productivity and collaboration. Work smarter, not harder.
              </p>
              
              {/* Social Links */}
              <div>
                <h4 className="font-bold text-white mb-5 text-lg flex items-center gap-2">
                  <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                  Connect With Us
                </h4>
                <div className="flex gap-4">
                  <a
                    href="https://www.facebook.com/people/My-Productive-Space/61575790394823/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="group relative w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  >
                    <FaFacebookF size={20} className="text-white" />
                  </a>
                  <a
                    href="https://instagram.com/temp"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="group relative w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  >
                    <FaInstagram size={20} className="text-white" />
                  </a>
                  <a
                    href={whatsappInfo.fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="group relative w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  >
                    <FaWhatsapp size={20} className="text-white" />
                  </a>
                  <a
                    href="https://maps.app.goo.gl/5Vjx5BBzuFLpWbCG8"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View on Maps"
                    className="group relative w-12 h-12 bg-white/10 backdrop-blur-sm hover:bg-orange-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                  >
                    <FaMapMarkerAlt size={20} className="text-white" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                Quick Links
              </h4>
              <ul className="space-y-3">
                {menuLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-gray-300 hover:text-orange-600 transition-all duration-300 inline-flex items-center gap-2 group hover:translate-x-1"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Information */}
            <div className="lg:col-span-2">
              <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                Information
              </h4>
              <ul className="space-y-3">
                {infoLinks.map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="text-gray-300 hover:text-orange-600 transition-all duration-300 inline-flex items-center gap-2 group hover:translate-x-1"
                    >
                      <span className="w-1.5 h-1.5 bg-orange-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-4">
              <h4 className="font-bold text-white mb-6 text-lg flex items-center gap-2">
                <span className="w-1 h-6 bg-orange-600 rounded-full"></span>
                Get In Touch
              </h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="tel:+6589202462"
                    className="text-gray-300 hover:text-orange-600 transition-colors flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Call Us</p>
                      <span className="text-sm">+65 8920 2462</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:myproductivespacecontact@gmail.com"
                    className="text-gray-300 hover:text-orange-600 transition-colors flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Email Us</p>
                      <span className="text-sm break-all">myproductivespacecontact@gmail.com</span>
                    </div>
                  </a>
                </li>
                <li>
                  <a
                    href="https://maps.app.goo.gl/wAWnGw36L5Ls2kBf7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-300 hover:text-orange-600 transition-colors flex items-start gap-3 group"
                  >
                    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-orange-600 transition-colors">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">Visit Us</p>
                      <span className="text-sm">Blk 208 Hougang St 21 #01-201 S 530208</span>
                    </div>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} MyProductiveSpace. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/terms" className="text-gray-400 hover:text-orange-600 transition-colors">
                Terms of Service
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/privacy-policy" className="text-gray-400 hover:text-orange-600 transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
