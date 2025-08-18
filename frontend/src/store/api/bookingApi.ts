import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types for booking operations
export interface CreateBookingRequest {
  userId: string; // This should be the user's email address
  location: string;
  startAt: string;
  endAt: string;
  specialRequests?: string;
  seatNumbers: string[];
  pax: number;
  students: number;
  members: number;
  tutors: number;
  totalCost: number;
  discountId?: string | null;
  totalAmount: number;
  memberType: string;
  bookedForEmails: string[];
  // Add bookingRef if your backend requires it
  bookingRef?: string;
  // Add bookedAt if your backend requires it
  bookedAt?: string;
  // Add confirmedPayment if your backend requires it
  confirmedPayment?: boolean;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  location: string;
  bookedAt: string;
  startAt: string;
  endAt: string;
  specialRequests?: string;
  seatNumbers: string[];
  pax: number;
  students: number;
  members: number;
  tutors: number;
  totalCost: number;
  discountId?: string | null;
  totalAmount: number;
  memberType: string;
  bookedForEmails: string[];
  confirmedPayment: boolean;
  paymentId?: string | null;
}

export interface BookingResponse {
  success: boolean;
  data?: Booking;
  message?: string;
}

export interface BookingsResponse {
  success: boolean;
  data?: Booking[];
  message?: string;
}

// Base API configuration for your backend
export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:8000',
    prepareHeaders: (headers, { getState }) => {
      // Add any authentication headers if needed
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // Create a new booking
    createBooking: builder.mutation<BookingResponse, CreateBookingRequest>({
      query: (bookingData) => ({
        url: '/booking/create', // Your actual endpoint
        method: 'POST',
        body: bookingData,
      }),
      invalidatesTags: ['Booking'],
    }),

    // Get all bookings
    getAllBookings: builder.query<BookingsResponse, void>({
      query: () => '/api/bookings', // Update this with your actual endpoint
      providesTags: ['Booking'],
    }),

    // Get booking by ID
    getBookingById: builder.query<BookingResponse, string>({
      query: (bookingId) => `/api/bookings/${bookingId}`, // Update this with your actual endpoint
      providesTags: (result, error, id) => [{ type: 'Booking', id }],
    }),

    // Update booking
    updateBooking: builder.mutation<BookingResponse, { id: string; data: Partial<CreateBookingRequest> }>({
      query: ({ id, data }) => ({
        url: `/api/bookings/${id}`, // Update this with your actual endpoint
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Booking', id }],
    }),

    // Delete booking
    deleteBooking: builder.mutation<{ success: boolean; message?: string }, string>({
      query: (bookingId) => ({
        url: `/api/bookings/${bookingId}`, // Update this with your actual endpoint
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useCreateBookingMutation,
  useGetAllBookingsQuery,
  useGetBookingByIdQuery,
  useUpdateBookingMutation,
  useDeleteBookingMutation,
} = bookingApi;
