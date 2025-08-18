'use client';

import { useState } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CreateBookingRequest } from '@/store/api/bookingApi';

export function BookingExample() {
  const [formData, setFormData] = useState({
    // Add your form fields here based on your CreateBookingRequest interface
    // Example:
    // userId: '',
    // seatId: '',
    // startTime: '',
    // endTime: '',
    // date: '',
  });
  
  const {
    createBooking,
    getAllBookings,
    updateBooking,
    deleteBooking,
    isLoading,
    error,
  } = useBooking();

  // Example booking creation
  const handleCreateBooking = async () => {
    const bookingData: CreateBookingRequest = {
      // Map your form data here
      // Example:
      // userId: formData.userId,
      // seatId: formData.seatId,
      // startTime: formData.startTime,
      // endTime: formData.endTime,
      // date: formData.date,
    };

    const result = await createBooking(bookingData);
    
    if (result.success) {
      console.log('Booking created:', result.data);
      // Reset form or show success message
    } else {
      console.error('Booking failed:', result.error);
    }
  };

  // Example of using queries
  const { data: bookingsData, isLoading: bookingsLoading } = getAllBookings();

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Booking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add your form fields here based on your CreateBookingRequest interface */}
          {/* Example:
          <div>
            <label className="block text-sm font-medium mb-2">User ID</label>
            <Input
              value={formData.userId}
              onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              placeholder="Enter user ID"
            />
          </div>
          */}

          <Button 
            onClick={handleCreateBooking}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Creating Booking...' : 'Create Booking'}
          </Button>

          {error && (
            <div className="text-red-600 text-sm">
              Error: {error.toString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bookings Display */}
      <Card>
        <CardHeader>
          <CardTitle>All Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingsLoading ? (
            <div>Loading bookings...</div>
          ) : bookingsData?.data && bookingsData.data.length > 0 ? (
            <div className="space-y-3">
              {bookingsData.data.map((booking) => (
                <div key={booking.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Booking #{booking.id}</div>
                      {/* Add your booking display fields here */}
                      {/* Example:
                      <div className="text-sm text-gray-600">
                        User: {booking.userId} | Seat: {booking.seatId}
                      </div>
                      <div className="text-sm text-gray-600">
                        {booking.date} | {booking.startTime} - {booking.endTime}
                      </div>
                      */}
                    </div>
                    {/* Add status badge if you have one */}
                    {/* Example:
                    <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                      {booking.status}
                    </Badge>
                    */}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div>No bookings found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
