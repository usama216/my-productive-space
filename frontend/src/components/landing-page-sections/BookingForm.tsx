// src/components/BookingForm.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import Image from 'next/image'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// date‐fns helpers to compare dates & get end of day
import { isSameDay, endOfDay, addMonths, addDays, setHours, setMinutes } from 'date-fns'

import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

import { PeopleSelector } from '@/components/PeopleSelector'
import { useAuth } from '@/hooks/useAuth'

export default function BookingForm() {
  const router = useRouter()
  const { user, loading } = useAuth()

  const [location, setLocation] = useState<string>('kovan')
  const [people, setPeople] = useState<number>(1)
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  // Add state for people breakdown
  const [peopleBreakdown, setPeopleBreakdown] = useState<{
    coWorkers: number
    coTutors: number
    coStudents: number
    total: number
  }>({
    coWorkers: 1,
    coTutors: 0,
    coStudents: 0,
    total: 1
  })

  // Calculate max date (2 months from today)
  const maxBookingDate = addMonths(new Date(), 2)

  // Helper function to STRICTLY enforce 15-minute intervals
  const enforceStrict15Minutes = (date: Date | null): Date | null => {
    if (!date) return null;
    
    const strictDate = new Date(date);
    const minutes = strictDate.getMinutes();
    const remainder = minutes % 15;
    
    // Reject any time that's not on a 15-minute boundary
    if (remainder !== 0) {
      // Always round DOWN to the previous 15-minute mark for strict enforcement
      const validMinutes = minutes - remainder;
      strictDate.setMinutes(validMinutes);
      strictDate.setSeconds(0);
      strictDate.setMilliseconds(0);
    } else {
      // Time is already on 15-minute boundary, just clear seconds/milliseconds
      strictDate.setSeconds(0);
      strictDate.setMilliseconds(0);
    }
    
    return strictDate;
  };

  // Filter function to only allow 15-minute intervals in time picker
  const filterTime = (time: Date): boolean => {
    const minutes = time.getMinutes();
    return minutes % 15 === 0; // Only allow :00, :15, :30, :45
  };

  const handleStartChange = (date: Date | null) => {
    const validDate = enforceStrict15Minutes(date);
    setStartDate(validDate)
    setEndDate(null) // Clear end date to force user to select
  }

  const handleEndChange = (date: Date | null) => {
    const validDate = enforceStrict15Minutes(date);
    
    // Prevent selecting past end times
    if (validDate && startDate) {
      const now = new Date();
      const minEndTime = new Date(startDate.getTime() + 60 * 60 * 1000); // Start + 1 hour
      
      // If selecting today and end time is before current time + 1 hour from start
      if (isSameDay(validDate, now) && validDate < minEndTime && minEndTime > now) {
        // Don't allow past times
        alert('End time cannot be in the past. Please select a future time.');
        return;
      }
      
      // Ensure end time is at least 1 hour after start time
      if (validDate <= startDate) {
        alert('End time must be after start time');
        return;
      }
      
      if (validDate < minEndTime) {
        alert('End time must be at least 1 hour after start time');
        return;
      }
    }
    
    setEndDate(validDate)
  }

  const getEndDateConstraints = () => {
    if (!startDate) return { minDate: new Date(), maxDate: maxBookingDate }

    // End date can be same day or next day
    const minEndDate = startDate
    const maxEndDate = addDays(startDate, 1) // Allow booking until next day

    return {
      minDate: minEndDate,
      maxDate: maxEndDate > maxBookingDate ? maxBookingDate : maxEndDate
    }
  }

  const getEndTimeConstraints = () => {
    if (!startDate || !endDate) {
      return {
        minTime: setHours(setMinutes(new Date(), 0), 0),
        maxTime: setHours(setMinutes(new Date(), 59), 23)
      }
    }

    // Minimum end time is start time + 1 hour (60 minutes)
    const minEndTime = new Date(startDate.getTime() + 60 * 60 * 1000)

    // If end date is same day as start date
    if (isSameDay(startDate, endDate)) {
      return {
        minTime: minEndTime, // Must be at least 1 hour after start time
        maxTime: setHours(setMinutes(endDate, 59), 23) // Until 11:59 PM same day
      }
    }

    // If end date is next day
    const nextDay = addDays(startDate, 1)
    if (isSameDay(endDate, nextDay)) {
      return {
        minTime: setHours(setMinutes(endDate, 0), 0), // From 12:00 AM next day
        maxTime: setHours(setMinutes(endDate, 0), 12) // Until 12:00 PM next day
      }
    }

    // Default fallback
    return {
      minTime: setHours(setMinutes(new Date(), 0), 0),
      maxTime: setHours(setMinutes(new Date(), 59), 23)
    }
  }

  const getStartTimeConstraints = () => {
    const selectedDate = startDate || new Date()
    const today = new Date()

    // If booking for today, minimum time is current time
    if (isSameDay(selectedDate, today)) {
      return {
        minTime: new Date(),
        maxTime: setHours(setMinutes(new Date(), 59), 23) // Until 11:59 PM
      }
    }

    // For future dates, allow full day
    return {
      minTime: setHours(setMinutes(new Date(), 0), 0), // From 12:00 AM
      maxTime: setHours(setMinutes(new Date(), 59), 23) // Until 11:59 PM
    }
  }


  const getInitialEndTimeConstraints = () => {
    if (!startDate) {
      return {
        minTime: setHours(setMinutes(new Date(), 0), 0),
        maxTime: setHours(setMinutes(new Date(), 59), 23)
      }
    }

    // Minimum end time is start time + 1 hour (60 minutes)
    const minEndTime = new Date(startDate.getTime() + 60 * 60 * 1000)

    // For today's date, start from the start time + 1 hour
    const today = new Date()
    if (isSameDay(startDate, today)) {
      return {
        minTime: minEndTime,
        maxTime: setHours(setMinutes(today, 59), 23)
      }
    }

    // For future dates, still need 1 hour minimum
    return {
      minTime: minEndTime,
      maxTime: setHours(setMinutes(new Date(), 59), 23)
    }
  }

  const handleBookNow = () => {
    // Validate required fields
    if (!location || !startDate || !endDate) {
      alert('Please fill in all required fields')
      return
    }
    // Validate booking time constraints
    if (endDate <= startDate) {
      alert('End time must be after start time')
      return
    }
    
    // Validate minimum booking duration of 1 hour
    const timeDifferenceMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    if (timeDifferenceMinutes < 60) {
      alert('Minimum booking duration is 1 hour')
      return
    }
    
    // Check if it is a valid cross-day booking
    const timeDifferenceHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    const daysDifference = Math.floor(timeDifferenceHours / 24)

    if (daysDifference > 1) {
      alert('Bookings can only span maximum 2 days from start date to end date (e.g., 11 PM today to 12 PM tomorrow)')
      return
    }

    // If it's a next-day booking, validate time constraints
    if (daysDifference === 1) {
      const startHour = startDate.getHours()
      const endHour = endDate.getHours()

      // Business rule: Cross-day bookings only allowed from 5 PM to 12 PM next day
      if (startHour < 17 || endHour > 12) {
        alert('Cross-day bookings are only allowed from 5 PM to 12 PM next day')
        return
      }
    }

    // Check if user is logged in, redirect to login if not logged in
    if (!user) {
      // Redirect to login page instead of showing modal
      router.push('/login')
      return
    }

    // If user is logged in, continue to booking
    handleContinueToBooking()
  }

  const handleContinueToBooking = () => {
    // Clear home page localStorage before navigating
    clearHomePageStorage()
    
    // Create URL with prefilled data
    const params = new URLSearchParams({
      location: location.toString(),
      people: people.toString(),
      start: startDate!.toISOString(),
      end: endDate!.toISOString(),
      coWorkers: peopleBreakdown.coWorkers.toString(),
      coTutors: peopleBreakdown.coTutors.toString(),
      coStudents: peopleBreakdown.coStudents.toString()
    })

    router.push(`/book-now?${params.toString()}`)
  }

  // Handle people count changes - this prevents circular updates
  const handlePeopleChange = (newPeople: number) => {
    if (people !== newPeople) {
      setPeople(newPeople)
      // Only update breakdown if it's different to prevent loops
      if (peopleBreakdown.total !== newPeople) {
        setPeopleBreakdown(prev => ({
          ...prev,
          total: newPeople,
          // Adjust coWorkers to match the new total if needed
          coWorkers: Math.max(1, newPeople - prev.coTutors - prev.coStudents)
        }))
      }
    }
  }

  // Handle breakdown changes - this prevents circular updates
  const handleBreakdownChange = (newBreakdown: typeof peopleBreakdown) => {
    // Only update if there's an actual change
    if (JSON.stringify(peopleBreakdown) !== JSON.stringify(newBreakdown)) {
      setPeopleBreakdown(newBreakdown)
      // Only update people count if it's different to prevent loops
      if (people !== newBreakdown.total) {
        setPeople(newBreakdown.total)
      }
    }
  }

  // Function to clear home page localStorage
  const clearHomePageStorage = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('home-page-people-selector')
    }
  }
  const { minDate: endMinDate, maxDate: endMaxDate } = getEndDateConstraints()
  const endTimeConstraints = endDate ? getEndTimeConstraints() : getInitialEndTimeConstraints()

  return (
    <section id="BookNow" className="pt-24">
      <div className="relative h-[600px]">
        <Image src="/mock_img/hero-bg.png" alt="Hero" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white">
          <h1 className="text-5xl font-serif">
            Start your unforgettable co-working journey with us.
          </h1>
          <p className="mt-4">Where Community meets Productivity</p>

          {/*  THE WHITE BAR  */}
          <div className="mt-8 bg-white p-6 rounded-lg flex space-x-8 items-end">

            {/* LOCATION */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase mb-1">Location</label>
              <Select
                value={location}
                onValueChange={setLocation}
              >
                <SelectTrigger className="flex h-10 w-40 items-center justify-between rounded-none border-b border-gray-300 bg-transparent px-3 py-2 text-left text-sm focus:ring-0 text-black">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kovan">Kovan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* PEOPLE */}
            <div className="flex flex-col">
              <label className="text-xs text-gray-500 uppercase">People</label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="w-32 text-black border-b border-gray-300 pb-1 text-left focus:outline-none"
                  >
                    {people} {people === 1 ? 'Person' : 'People'}
                    {peopleBreakdown.coTutors > 0 || peopleBreakdown.coStudents > 0 ? (
                      <div className="text-xs text-gray-500 mt-1">
                        {peopleBreakdown.coWorkers}💼 {peopleBreakdown.coTutors}👩‍🏫 {peopleBreakdown.coStudents}🎓
                      </div>
                    ) : null}
                  </button>
                </PopoverTrigger>
                <PopoverContent side="bottom" className="w-auto">
                  <PeopleSelector
                    value={people}
                    min={1}
                    max={15}
                    onChange={handlePeopleChange}
                    showBreakdown={true}
                    onBreakdownChange={handleBreakdownChange}
                    storageKey="home-page-people-selector"
                    enablePersistence={false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* DATE & TIME RANGE */}
            <div className="flex space-x-6">
              {/* From */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1">From</label>
                {/* For START date picker: */}
                <DatePicker
                  selected={startDate}
                  onChange={handleStartChange}
                  onChangeRaw={(e) => e?.preventDefault()}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  showTimeSelect
                  timeIntervals={15}
                  filterTime={filterTime}
                  dateFormat="MMM d, yyyy h:mm aa"
                  placeholderText="Start"
                  className="w-48 pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                  minDate={new Date()}
                  maxDate={maxBookingDate}
                  {...getStartTimeConstraints()}
                />
              </div>

              {/* To */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1">To</label>
                {/* For END date picker */}
                <DatePicker
                  selected={endDate}
                  onChange={handleEndChange}
                  onChangeRaw={(e) => e?.preventDefault()}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={endMinDate}
                  maxDate={endMaxDate}
                  showTimeSelect
                  timeIntervals={15}
                  filterTime={filterTime}
                  dateFormat="MMM d, yyyy h:mm aa"
                  placeholderText="End"
                  className="w-48 pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                  disabled={!startDate}
                  {...endTimeConstraints}
                />
              </div>
            </div>

            {/* BOOK BUTTON */}
            <Button
              onClick={handleBookNow}
              className="bg-orange-500 text-white ml-auto transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Book Now →'}
            </Button>
          </div>

          {/* Helper text for cross-day bookings */}
          {startDate && (
            <div className="mt-4 text-sm text-white/80 max-w-md text-center">
              <p>💡 You can book across days (e.g., 11 PM today to 1 AM tomorrow)</p>
              <p>Bookings are limited to 2 months in advance</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}