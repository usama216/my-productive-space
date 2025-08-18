// app/pricing/page.tsx
'use client'

import Navbar from '@/components/Navbar'
import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import { Tab } from '@headlessui/react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const rateHeaders = ['30min(0.5hr)', '1 hr', '> 1 hr']
const rateRows = [
  { label: 'Guest', values: ['7', '6', '6'] },
  { label: 'Member', values: ['5', '4', '4'] },
  { label: 'Student', values: ['4', '3', '3'] },
  { label: 'Tutor', values: ['6', '5', '5'] },
]

const promos = [
  {
    title: 'Spring Special: 20% Off',
    img: '/pricing_img/promo-spring.png',
    desc: 'Use code SPRING20 at checkout. Valid till 30 Apr.',
  },
]

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

export default function PricingPage() {
  const router = useRouter()
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto py-20 px-4 space-y-12">
        {/* Header */}
        <div className="text-center">
          <p className="uppercase text-sm text-gray-500 tracking-wide">
            People. Space. Vibes.
          </p>
          <h1 className="mt-2 text-4xl font-bold">Workspace Solutions</h1>
          <p className="mt-2 text-gray-700 max-w-2xl mx-auto">
            Find the perfect workspace solution tailored to your needs—whether you are a guest, member,
            student, or tutor, we have got you covered.
          </p>
        </div>

        {/* Tabs */}
        <Tab.Group>
          <Tab.List className="flex justify-center space-x-4">
            {['Rates', 'Promos', 'Packages'].map((tab) => (
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

          <Tab.Panels className="mt-8">
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
                        {values.map((v,i) => (
                          <td key={i} className="p-3">{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Scenario Example */}
                <div className="mt-6 p-4 bg-gray-50 rounded">
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
                      onClick={() =>
                        router.push(`/buy-pass?package=${encodeURIComponent(pkg.title)}&type=cowork`)
                      } 
                      className="mt-4 px-4 py-2 bg-gray-800 text-white rounded transition-colors duration-200 hover:bg-orange-500"
                    >
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

