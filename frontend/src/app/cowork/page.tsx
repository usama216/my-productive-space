// app/cowork/page.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import Navbar from '@/components/Navbar'
import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import { Tab } from '@headlessui/react'
import { Carousel } from '@/components/Carousel'
import Image from 'next/image'
import { useRouter } from 'next/navigation'


const rateHeaders = ['1 hr', '> 1 hr']
const rateRows = [
  { label: 'Guest', values: ['6', '6'] },
  { label: 'Member', values: ['4', '4'] },
]

const promos = [
  {
    title: 'Spring Special: 20% Off',
    img: '/pricing_img/promo-spring.png',
    desc: 'Use code SPRING20 at checkout. Valid till 30 Apr.',
  },
]

const TABS = ['Rates', 'Promos', 'Packages'] as const


const packages = [
  {
    title: 'Half-Day Productivity Boost',
    img: '/pricing_img/package-1.png',
    details: [
      '6 Half-Day Pass (6 hrs/pass)',
      '4 Complimentary Hours',
      'Valid 30 days from activation',
      'SGD 109 (UP 150) + SGD 5 for all outlets'
    ],
  },
  {
    title: 'Flexible Full-Day Focus',
    img: '/pricing_img/package-2.png',
    details: [
      '6 Full-Day Pass (12 hrs/pass)',
      '2 Half-Day Passes (6 hrs/pass)',
      'Valid 30 days from activation',
      'SGD 209 (UP 280) + SGD 5 for all outlets'
    ],
  },
]
const perks = [
  { src: '/mock_img/perk1.png', title: 'Best WiFi in Town', subtitle: '1 Gbps High-Speed Wi-Fi' },
  { src: '/mock_img/perk2.png', title: 'Tech Forward Space', subtitle: 'Charging Points & Monitors at Every Table' },
  { src: '/mock_img/perk3.png', title: 'Complimentary Snacks', subtitle: 'Best Facilities in the Region' },
  { src: '/mock_img/perk4.png', title: 'Clean Bathrooms', subtitle: 'Pods' },
  { src: '/mock_img/perk1.png', title: 'Business-Grade WiFi', subtitle: '1 Gbps fiber for seamless video calls' },
  { src: '/mock_img/perk2.png', title: 'Executive Workspace', subtitle: 'Ergonomic setups with dual monitors & USB-C docking' },
  { src: '/mock_img/perk3.png', title: 'Premium Coffee Bar', subtitle: 'Barista-quality espresso & healthy meal options' },
  { src: '/mock_img/perk4.png', title: 'Meeting Ready', subtitle: 'Soundproof phone booths & conference rooms' },
  { src: '/mock_img/perk1.png', title: 'Networking Hub', subtitle: 'Connect with entrepreneurs & industry professionals' },
  { src: '/mock_img/perk2.png', title: 'Flexible Membership', subtitle: 'Day passes to monthly plans - scale as you grow' },
  { src: '/mock_img/perk1.png', title: 'Peak Performance Setup', subtitle: 'High-speed internet & premium tech infrastructure' },
  { src: '/mock_img/perk2.png', title: 'Professional Atmosphere', subtitle: 'Quiet zones designed for deep work & focus' },
  { src: '/mock_img/perk3.png', title: 'Fuel Your Hustle', subtitle: 'Gourmet coffee, healthy snacks & energy drinks' },
  { src: '/mock_img/perk4.png', title: 'Client-Ready Spaces', subtitle: 'Impress clients with modern meeting rooms' },
  { src: '/mock_img/perk1.png', title: 'Work-Life Balance', subtitle: 'Wellness areas & break spaces to recharge' },
  { src: '/mock_img/perk2.png', title: 'No Commitment Stress', subtitle: 'Pay-per-use flexibility without long-term contracts' },
]
// const reasons = [
//   { num: '1', title: 'Scale Your Teaching', desc: 'More space lets you reach more students.' },
//   { num: '2', title: 'Peer Learning',      desc: 'Facilitate group learning experiences.' },
//   { num: '3', title: 'Multimedia Ready',    desc: '55″ TV & whiteboard for better demos.' },
//   { num: '4', title: 'Maximize Profits',    desc: 'Lower overhead, higher margins.' },
//   { num: '5', title: 'Save Travel Time',    desc: 'Central locations for you and your tutees.' },
//   { num: '6', title: 'No Startup Cost',     desc: 'Furnished classrooms—walk in and teach.' },
//   { num: '7', title: 'Build Your Brand',    desc: 'Join our community of educators.' },
//   { num: '8', title: 'Pay-per-Use',         desc: 'No minimums or hidden fees.' },
//   { num: '9', title: 'Guaranteed Space',    desc: 'Fixed bookings give you certainty.' },
// ]

export default function ColearnPage() {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const packagesRef = useRef<HTMLDivElement | null>(null)

  // If URL has #packages on first load, open that tab
  useEffect(() => {
    if (window.location.hash === '#packages') {
      const targetIdx = TABS.indexOf('Packages')
      if (targetIdx >= 0) {
        setSelectedIndex(targetIdx)
        // Let the tab render, then scroll
        setTimeout(() => {
          document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 0)
      }
    }
  }, [])

  // Handle hash changes while staying on the page (e.g., internal links)
  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === '#packages') {
        const targetIdx = TABS.indexOf('Packages')
        setSelectedIndex(targetIdx)
        setTimeout(() => {
          document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 0)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="relative h-125">
        <Image src="/mock_img/hero-bg.png" alt="" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg max-w-2xl text-center">
            <p className="uppercase text-sm text-gray-500">People. Space. Vibes.</p>
            <h1 className="mt-2 text-3xl font-bold">Co-Workspace Solutions</h1>
            <p className="mt-4 text-gray-700">
              Elevate Your Work Experience. Find the perfect workspace solution tailored to your needs—whether you’re a guest, member,
              student, or tutor, we’ve got you covered.
            </p>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-20 px-4 space-y-12">

        {/* Reasons Grid */}

        {/* <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Reasons to Teach at Spatial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((r) => (
              <div key={r.num} className="bg-gray-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-orange-600">{r.num}</div>
                <h4 className="mt-2 font-semibold">{r.title}</h4>
                <p className="mt-1 text-gray-700 text-sm">{r.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <button className="px-6 py-3 bg-orange-600 text-white rounded">
              Book Now
            </button>
          </div>
        </section> */}

        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-center">Reasons to Co-Work at My Prodcutive Space</h2>
          <div className="mt-4">
            <Carousel>
              {perks.map((item, i) => (
                <div key={i} className="relative">
                  <Image src={item.src} alt={item.title} width={400} height={300} className="rounded-lg" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h4 className="font-semibold text-lg">{item.title}</h4>
                    <p>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </Carousel>
          </div>
          <div className="text-center mt-10">
            {/* BOOK BUTTON */}
            <button className="px-6 py-3 bg-orange-500 text-white rounded ml-auto transition-colors duration-200 hover:bg-orange-800">
              Book Now →
            </button>
          </div>
        </section>
        {/* Tabs */}
        <div id="packages" ref={packagesRef} className="h-0 w-0 overflow-hidden scroll-mt-24" />

        <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab.List className="flex justify-center space-x-4">
            {TABS.map((tab) => (
              <Tab
                key={tab}
                className={({ selected }) =>
                  `px-4 py-2 rounded-md font-medium ${
                    selected ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'
                  }`
                }
              >
                {tab}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-8" >
            {/* Rates Panel */}
            <Tab.Panel>
              <div className="overflow-x-auto">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 font-semibold text-left">Tier</th>
                      {rateHeaders.map((h) => (
                        <th key={h} className="p-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rateRows.map(({ label, values }) => (
                      <tr key={label} className="border-t">
                        <td className="p-3 text-left font-medium">{label}</td>
                        {values.map((v, i) => (
                          <td key={i} className="p-3">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Scenario Example */}
                <div className="mt-6 p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-500">
                    *Disclaimer: We go by an hourly fee...Full terms & conditions apply. Maximum xx pax in meeting rooms and 5 pax in collaborative spaces.
                    All xxx activities deemed xxxx.
                  </p>
                  <h3 className="font-semibold">Example: Guest booking 1.5 hrs</h3>
                  <p>
                    1 hr @ 6 + 0.5 hr @ (6/2) = <strong>$9</strong>
                  </p>
                </div>
              </div>
            </Tab.Panel>

            {/* Promos Panel */}
            <Tab.Panel className="space-y-6">
              {promos.map((p) => (
                <div key={p.title} className="flex flex-col md:flex-row bg-orange-50 rounded-lg overflow-hidden shadow">
                  <div className="md:w-1/3 relative h-48 md:h-auto">
                    <Image src={p.img} alt={p.title} fill className="object-cover" />
                  </div>
                  <div className="p-6 flex-1">
                    <h4 className="text-2xl font-semibold">{p.title}</h4>
                    <p className="mt-2 text-gray-700">{p.desc}</p>
                    <button className="mt-4 px-4 py-2 bg-orange-600 text-white rounded">
                      Redeem Now
                    </button>
                  </div>
                </div>
              ))}
            </Tab.Panel>

            {/* Packages Panel */}
            <Tab.Panel className="grid gap-8 md:grid-cols-2">
              {packages.map((pkg) => (
                <div key={pkg.title} className="bg-gray-50 rounded-lg overflow-hidden shadow-lg">
                  <div className="relative h-48">
                    <Image src={pkg.img} alt={pkg.title} fill className="object-cover" />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-semibold">{pkg.title}</h4>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
                      {pkg.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                    <button
                      onClick={() => router.push(`/buy-pass?package=${encodeURIComponent(pkg.title)}&type=cowork`)}
                      className="mt-4 px-4 py-2 bg-gray-800 text-white rounded transition-colors duration-200 hover:bg-orange-500">
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </main>

      <ContactSection />
    </>
  )
}

