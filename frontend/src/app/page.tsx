'use client'

import BookingForm from '@/components/landing-page-sections/BookingForm'
import Navbar from '@/components/Navbar'
import AboutSection from '@/components/landing-page-sections/AboutSection'
import WhatIsItUsedForSection from '@/components/landing-page-sections/WhatIsItUsedFor'
import BookingGuideSection from '@/components/landing-page-sections/BookingGuideSection'
import LocationsSection from "@/components/landing-page-sections/LocationsSection";
import PricingSection from '@/components/landing-page-sections/PricingSection';
import FeedbackSection from '@/components/landing-page-sections/FeedbackSection';
import FAQSection from '@/components/landing-page-sections/FAQSection'


import { ContactSection } from '@/components/landing-page-sections/ContactSection'
import {FooterSection} from '@/components/landing-page-sections/FooterSection'
import OpenDoorExample from '@/components/OpenDoorExample'


export default function Home() {

  return (

    <main className="space-y-16 md:space-y-24">
      {/* NavBar */}
      <Navbar />

      {/* Section 1: Quick Booking */}
      <BookingForm />

      {/* Section 2: About Us Carousel */}
      <AboutSection />

      {/* Section 3: What Is It Used For */}
      <WhatIsItUsedForSection /> 

      {/* Section 4: How to Book */}
      <BookingGuideSection />

      {/* Section 5: Locations */}
      <LocationsSection />  
      
      {/* Section 5: Rates & Price */}
      <PricingSection />

      {/* Section 6: Feedback */}
      <FeedbackSection />
      

      {/* Section 7: FAQ */}
      <FAQSection />

      {/* Section 8: Contact & Footer */}
      <ContactSection />
      <FooterSection />
      <OpenDoorExample />

    </main>
  );
}
