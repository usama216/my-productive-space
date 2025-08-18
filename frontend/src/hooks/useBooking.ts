import {
  useCreateBookingMutation,
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} from '@/store/api/bookingApi';
import type {
  CreateBookingRequest,
  BookingResponse,
  BookingsResponse,
} from '@/store/api/bookingApi';

export const useBooking = () => {
  // Booking hooks
  const [createBooking, createBookingResult] = useCreateBookingMutation();
  const getAllBookings = useGetAllBookingsQuery;
  const getBookingById = useGetBookingByIdQuery;
  const [updateBooking, updateBookingResult] = useUpdateBookingMutation();
  const [deleteBooking, deleteBookingResult] = useDeleteBookingMutation();

  return {
    // Create booking
    createBooking: async (bookingData: CreateBookingRequest) => {
      try {
        const result = await createBooking(bookingData).unwrap();
        return { success: true, data: result };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.data?.message || error.message || 'Booking creation failed' 
        };
      }
    },

    // Get all bookings
    getAllBookings: () => {
      return getAllBookings();
    },

    // Get booking by ID
    getBookingById: (bookingId: string) => {
      return getBookingById(bookingId);
    },

    // Update booking
    updateBooking: async (id: string, data: Partial<CreateBookingRequest>) => {
      try {
        const result = await updateBooking({ id, data }).unwrap();
        return { success: true, data: result };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.data?.message || error.message || 'Booking update failed' 
        };
      }
    },

    // Delete booking
    deleteBooking: async (bookingId: string) => {
      try {
        const result = await deleteBooking(bookingId).unwrap();
        return { success: true, data: result };
      } catch (error: any) {
        return { 
          success: false, 
          error: error.data?.message || error.message || 'Booking deletion failed' 
        };
      }
    },

    // Loading states
    isLoading: createBookingResult.isLoading || updateBookingResult.isLoading || deleteBookingResult.isLoading,
    
    // Error states
    error: createBookingResult.error || updateBookingResult.error || deleteBookingResult.error,
  };
};
