// src/components/BookingForm.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import Image from 'next/image'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// date‐fns helpers to compare dates & get end of day
import { isSameDay, endOfDay, addMonths, addDays, setHours, setMinutes } from 'date-fns'

import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'

import { PeopleSelector } from '@/components/PeopleSelector'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { getOperatingHours, getClosureDates, OperatingHours, ClosureDate } from '@/lib/shopHoursService'
import { Loader2 } from 'lucide-react'

export default function BookingForm() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const { toast } = useToast()

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

  // Shop hours state
  const [operatingHours, setOperatingHours] = useState<OperatingHours[]>([])
  const [closureDates, setClosureDates] = useState<ClosureDate[]>([])
  const [isLoadingShopHours, setIsLoadingShopHours] = useState(false)

  // Load shop hours on mount
  useEffect(() => {
    const loadShopHours = async () => {
      setIsLoadingShopHours(true)
      try {
        // Hardcoded to Kovan as per UI
        const [hours, closures] = await Promise.all([
          getOperatingHours('Kovan'),
          getClosureDates('Kovan')
        ])
        setOperatingHours(hours)
        setClosureDates(closures)
        console.log('✅ Shop hours loaded:', hours)
      } catch (error) {
        console.error('Error loading shop hours:', error)
      } finally {
        setIsLoadingShopHours(false)
      }
    }

    loadShopHours()
  }, [])

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

  // Helper to generate available times for a given date based on operating hours
  const getAvailableTimes = (date: Date | null): Date[] => {
    if (!date) return [];

    const dayOfWeek = date.getDay();

    // Log for debugging
    console.log(' Getting available times for:', {
      date: date.toDateString(),
      dayOfWeek,
      operatingHoursLoaded: operatingHours.length,
      isLoadingShopHours
    });

    const dayHours = operatingHours.find(h => h.dayOfWeek === dayOfWeek && h.isActive);

    // CRITICAL: Always show times even if hours aren't loaded yet (fallback)
    if (operatingHours.length === 0 || !dayHours) {
      console.log(' Using fallback times - shop hours not loaded or day closed');
      const times: Date[] = [];
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      for (let i = 0; i < 24 * 4; i++) {
        times.push(new Date(start.getTime() + i * 15 * 60 * 1000));
      }
      return times;
    }

    console.log(' Using shop hours:', dayHours);
    const times: Date[] = [];
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    // Generate 15-min intervals within shop hours
    for (let i = 0; i < 24 * 4; i++) {
      const time = new Date(start.getTime() + i * 15 * 60 * 1000);
      const timeString = time.toTimeString().split(' ')[0].substring(0, 5);

      const openTime = dayHours.openTime.substring(0, 5);
      const closeTime = dayHours.closeTime.substring(0, 5);

      if (timeString >= openTime && timeString <= closeTime) {
        times.push(time);
      }
    }

    console.log(` Generated ${times.length} available times for ${date.toDateString()}`);
    return times;
  };

  const getAvailableEndTimes = (date: Date | null): Date[] => {
    const times = getAvailableTimes(date);
    if (!startDate || !times.length) return times;

    // Filter based on start time (must be >= start time + 1 hour)
    const minEndTime = new Date(startDate.getTime() + 60 * 60 * 1000);

    return times.filter(time => {
      // If same day, check time
      if (date && startDate && date.toDateString() === startDate.toDateString()) {
        return time >= minEndTime;
      }
      return true;
    });
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
    if (!startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }
    // Validate booking time constraints
    if (endDate <= startDate) {
      toast({
        title: "Invalid Time Range",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    // Validate minimum booking duration of 1 hour
    const timeDifferenceMinutes = (endDate.getTime() - startDate.getTime()) / (1000 * 60)
    if (timeDifferenceMinutes < 60) {
      toast({
        title: "Duration Too Short",
        description: "Minimum booking duration is 1 hour",
        variant: "destructive",
      })
      return
    }

    // Check if booking is over 24 hours
    const timeDifferenceHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
    if (timeDifferenceHours > 24) {
      toast({
        title: "Booking Duration Exceeded",
        description: "Booking of more than 24 hours should not be allowed. If required, please contact admin via whatsapp.",
        variant: "destructive",
      })
      return
    }

    // Check if it is a valid cross-day booking
    const daysDifference = Math.floor(timeDifferenceHours / 24)

    if (daysDifference > 1) {
      toast({
        title: "Invalid Booking Period",
        description: "Bookings can only span maximum 2 days from start date to end date (e.g., 11 PM today to 12 PM tomorrow)",
        variant: "destructive",
      })
      return
    }

    // If it's a next-day booking, validate time constraints
    if (daysDifference === 1) {
      const startHour = startDate.getHours()
      const endHour = endDate.getHours()

      // Business rule: Cross-day bookings only allowed from 5 PM to 12 PM next day
      if (startHour < 17 || endHour > 12) {
        toast({
          title: "Invalid Cross-Day Booking",
          description: "Cross-day bookings are only allowed from 5 PM to 12 PM next day",
          variant: "destructive",
        })
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
      location: 'kovan',
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
      <div className="relative h-[600px] md:h-[700px]">
        <Image src="/mock_img/hero-image.jpg" alt="Hero" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif leading-tight">
            Start your unforgettable co-working journey with us.
          </h1>
          <p className="mt-4 text-sm sm:text-base md:text-lg">Where Community meets Productivity</p>

          {/*  THE WHITE BAR - RESPONSIVE  */}
          <div className="mt-6 md:mt-8 bg-white p-4 md:p-6 rounded-lg w-full max-w-4xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden lg:flex space-x-6 items-end">

              {/* LOCATION */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1 text-left">Location</label>
                <div className="flex w-36 items-center border-b border-gray-300 pb-2 text-sm text-black">
                  Kovan
                </div>
              </div>

              {/* PEOPLE */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1 text-left">People</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-28 text-black border-b border-gray-300 pb-1 text-left focus:outline-none"
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
              <div className="flex space-x-4">
                {/* From */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left flex items-center gap-2">
                    From
                    {isLoadingShopHours && <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    onChangeRaw={(e) => e?.preventDefault()}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    showTimeSelect
                    timeIntervals={15}
                    includeTimes={getAvailableTimes(startDate)}
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="Start"
                    className="w-44 pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    minDate={new Date()}
                    maxDate={maxBookingDate}
                    {...getStartTimeConstraints()}
                  />
                </div>

                {/* To */}
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left">To</label>
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
                    includeTimes={getAvailableEndTimes(endDate)}
                    dateFormat="MMM d, yyyy h:mm aa"
                    placeholderText="End"
                    className="w-44 pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    disabled={!startDate}
                    {...endTimeConstraints}
                  />
                </div>
              </div>

              {/* BOOK BUTTON */}
              <Button
                onClick={handleBookNow}
                className="bg-orange-500 text-white ml-auto px-6 py-2 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Book Now →'}
              </Button>
            </div>

            {/* Tablet Layout */}
            <div className="hidden md:flex lg:hidden flex-col space-y-4">
              {/* Row 1: Location and People */}
              <div className="flex space-x-6">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase text-left">Location</label>
                  <div className="flex w-32 items-center border-b border-gray-300 text-sm text-black">
                    Kovan
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left">People</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-28 text-black border-b border-gray-300 pb-1 text-left focus:outline-none"
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
              </div>

              {/* Row 2: Date Range */}
              <div className="flex space-x-4">
                <div className="flex flex-col flex-1">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left">From</label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    onChangeRaw={(e) => e?.preventDefault()}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    showTimeSelect
                    includeTimes={getAvailableTimes(startDate)}
                    dateFormat="MMM d, h:mm aa"
                    placeholderText="Start"
                    className="w-full pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    minDate={new Date()}
                    maxDate={maxBookingDate}
                    {...getStartTimeConstraints()}
                  />
                </div>

                <div className="flex flex-col flex-1">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left">To</label>
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
                    includeTimes={getAvailableEndTimes(endDate)}
                    dateFormat="MMM d, h:mm aa"
                    placeholderText="End"
                    className="w-full pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    disabled={!startDate}
                    {...endTimeConstraints}
                  />
                </div>
              </div>

              {/* Row 3: Book Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleBookNow}
                  className="bg-orange-500 text-white px-6 py-2 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Book Now →'}
                </Button>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="flex md:hidden flex-col space-y-4">
              {/* Location */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1 text-left">Location</label>
                <div className="flex h-10 w-full items-center border-b border-gray-300 px-3 py-2 text-sm text-black">
                  Kovan
                </div>
              </div>

              {/* People */}
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 uppercase mb-1 text-left">People</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      className="w-full text-black border-b border-gray-300 pb-1 text-left focus:outline-none"
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

              {/* Date Range */}
              <div className="flex flex-col space-y-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left">From</label>
                  <DatePicker
                    selected={startDate}
                    onChange={handleStartChange}
                    onChangeRaw={(e) => e?.preventDefault()}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    showTimeSelect
                    includeTimes={getAvailableTimes(startDate)}
                    dateFormat="MMM d, h:mm aa"
                    placeholderText="Start"
                    className="w-full pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    minDate={new Date()}
                    maxDate={maxBookingDate}
                    {...getStartTimeConstraints()}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 uppercase mb-1 text-left">To</label>
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
                    includeTimes={getAvailableEndTimes(endDate)}
                    dateFormat="MMM d, h:mm aa"
                    placeholderText="End"
                    className="w-full pl-0 border-b border-gray-300 pb-1 focus:outline-none text-black"
                    disabled={!startDate}
                    {...endTimeConstraints}
                  />
                </div>
              </div>

              {/* Book Button */}
              <div className="flex justify-center pt-2">
                <Button
                  onClick={handleBookNow}
                  className="bg-orange-500 text-white w-full py-3 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Book Now →'}
                </Button>
              </div>
            </div>
          </div>

          {/* Helper text for cross-day bookings */}
          {startDate && (
            <div className="mt-4 text-xs sm:text-sm text-white/80 max-w-md text-center px-4">
              <p>💡 You can book across days (e.g., 11 PM today to 1 AM tomorrow)</p>
              <p>Bookings are limited to 2 months in advance</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}