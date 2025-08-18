import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  HitPayPaymentRequest,
  HitPayPaymentResponse,
  HitPayTransaction,
  HitPayUserProfile,
  HitPayWebhookData,
  TransactionQueryParams,
} from '@/types/hitpay';

// Base API configuration for HitPay
export const hitpayApi = createApi({
  reducerPath: 'hitpayApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_HITPAY_API_URL || 'https://api.sandbox.hit-pay.com',
    prepareHeaders: (headers, { getState }) => {
      // Add HitPay API key for authentication
      const apiKey = process.env.NEXT_PUBLIC_HITPAY_API_KEY || 'test_d80e053f0caa5345edf1ad435962dc327666278eac65f63c9f9bc589f167115e';
      headers.set('X-Business-API-Key', apiKey);
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Payment', 'Transaction', 'User'],
  endpoints: (builder) => ({
    // Payment endpoints
    createPayment: builder.mutation<HitPayPaymentResponse, HitPayPaymentRequest>({
      query: (paymentData) => ({
        url: '/v1/payment-requests',
        method: 'POST',
        body: paymentData,
      }),
      invalidatesTags: ['Payment'],
    }),

    getPaymentStatus: builder.query<HitPayPaymentResponse, string>({
      query: (paymentId) => `/v1/payment-requests/${paymentId}`,
      providesTags: (result, error, id) => [{ type: 'Payment', id }],
    }),

    // Transaction endpoints
    getTransactions: builder.query<HitPayTransaction[], TransactionQueryParams>({
      query: (params) => ({
        url: '/v1/transactions',
        params,
      }),
      providesTags: ['Transaction'],
    }),

    getTransactionById: builder.query<HitPayTransaction, string>({
      query: (transactionId) => `/v1/transactions/${transactionId}`,
      providesTags: (result, error, id) => [{ type: 'Transaction', id }],
    }),

    // User/Account endpoints
    getUserProfile: builder.query<HitPayUserProfile, void>({
      query: () => '/v1/user/profile',
      providesTags: ['User'],
    }),

    updateUserProfile: builder.mutation<HitPayUserProfile, Partial<HitPayUserProfile>>({
      query: (profileData) => ({
        url: '/v1/user/profile',
        method: 'PUT',
        body: profileData,
      }),
      invalidatesTags: ['User'],
    }),

    // Webhook verification
    verifyWebhook: builder.mutation<any, HitPayWebhookData>({
      query: (webhookData) => ({
        url: '/v1/webhook/verify',
        method: 'POST',
        body: webhookData,
      }),
    }),
  }),
});

// Export hooks for use in components
export const {
  useCreatePaymentMutation,
  useGetPaymentStatusQuery,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useVerifyWebhookMutation,
} = hitpayApi;
