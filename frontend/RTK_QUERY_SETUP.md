# RTK Query Integration with HitPay APIs

This project now includes RTK Query for managing external API calls to HitPay payment services. The integration is completely separate from your existing Next.js API routes and won't affect them.

## What's Been Added

### 1. Dependencies
- `@reduxjs/toolkit` - Redux Toolkit with RTK Query
- `react-redux` - React bindings for Redux

### 2. File Structure
```
src/
├── store/
│   ├── store.ts              # Redux store configuration
│   └── api/
│       ├── hitpayApi.ts      # HitPay API endpoints
│       └── bookingApi.ts     # Backend booking API endpoints
├── providers/
│   └── ReduxProvider.tsx     # Redux provider wrapper
├── hooks/
│   ├── useHitPay.ts          # Custom hook for HitPay API
│   └── useBooking.ts         # Custom hook for booking API
├── types/
│   └── hitpay.ts             # TypeScript interfaces
└── components/examples/
    ├── HitPayExample.tsx     # Example usage component
    └── BookingExample.tsx    # Example usage component
```

## Configuration

### Environment Variables
Add this to your `.env.local`:
```bash
# HitPay Configuration
NEXT_PUBLIC_HITPAY_API_URL=https://api.sandbox.hit-pay.com
NEXT_PUBLIC_HITPAY_API_KEY=test_d80e053f0caa5345edf1ad435962dc327666278eac65f63c9f9bc589f167115e

# Backend Configuration
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Base URL
The default base URL is set to `https://api.hitpay.com`. You can change this by:
1. Setting the environment variable
2. Modifying the `baseUrl` in `src/store/api/hitpayApi.ts`

## Available API Endpoints

### HitPay API
- `createPayment` - Create a new payment request
- `getPaymentStatus` - Get payment status by ID
- `getTransactions` - Get list of transactions
- `getTransactionById` - Get specific transaction
- `getUserProfile` - Get user profile information
- `updateUserProfile` - Update user profile
- `verifyWebhook` - Verify webhook signatures

### Backend Booking API
- `createBooking` - Create a new booking
- `getAllBookings` - Get all bookings
- `getBookingById` - Get specific booking
- `updateBooking` - Update existing booking
- `deleteBooking` - Delete a booking

## Usage Examples

### Basic Usage with Custom Hooks

#### HitPay API
```tsx
import { useHitPay } from '@/hooks/useHitPay';

function PaymentComponent() {
  const { createPayment, isLoading, error } = useHitPay();

  const handlePayment = async () => {
    const result = await createPayment({
      amount: 100,
      currency: 'SGD',
      reference_number: 'REF123',
      redirect_url: 'https://yoursite.com/success',
      webhook: 'https://yoursite.com/api/webhook',
      email: 'customer@example.com'
    });

    if (result.success) {
      console.log('Payment created:', result.data);
    } else {
      console.error('Payment failed:', result.error);
    }
  };

  return (
    <button onClick={handlePayment} disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

#### Booking API
```tsx
import { useBooking } from '@/hooks/useBooking';

function BookingComponent() {
  const { createBooking, getAllBookings, isLoading, error } = useBooking();

  const handleCreateBooking = async () => {
    const result = await createBooking({
      // Add your booking data here
      // userId: 'user123',
      // seatId: 'seat456',
      // startTime: '09:00',
      // endTime: '17:00',
      // date: '2024-01-15'
    });

    if (result.success) {
      console.log('Booking created:', result.data);
    } else {
      console.error('Booking failed:', result.error);
    }
  };

  return (
    <button onClick={handleCreateBooking} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Booking'}
    </button>
  );
}
```

### Direct RTK Query Hooks
```tsx
import { useCreatePaymentMutation, useGetTransactionsQuery } from '@/store/api/hitpayApi';

function DirectUsage() {
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const { data: transactions, isLoading: loadingTransactions } = useGetTransactionsQuery();

  // Use the hooks directly
}
```

## Features

### Automatic Caching
- RTK Query automatically caches API responses
- Queries are deduplicated and shared across components
- Automatic background refetching when data becomes stale

### Error Handling
- Built-in error states for all API calls
- Automatic retry logic for failed requests
- Consistent error format across all endpoints

### Loading States
- Automatic loading states for all operations
- Optimistic updates for mutations
- Background refetching without blocking UI

### TypeScript Support
- Full type safety for all API calls
- Auto-generated types from API responses
- IntelliSense support in your IDE

## Adding New Endpoints

To add new HitPay API endpoints:

1. **Add to the API slice** in `src/store/api/hitpayApi.ts`:
```tsx
newEndpoint: builder.query<ResponseType, RequestType>({
  query: (params) => ({
    url: '/v1/endpoint',
    method: 'GET',
    params,
  }),
  providesTags: ['TagName'],
}),
```

2. **Export the hook**:
```tsx
export const { useNewEndpointQuery } = hitpayApi;
```

3. **Add to the custom hook** in `src/hooks/useHitPay.ts`

4. **Add types** in `src/types/hitpay.ts`

## Integration with Existing Code

The RTK Query integration:
- ✅ **Does NOT affect** your existing Next.js API routes
- ✅ **Does NOT interfere** with your current authentication system
- ✅ **Can coexist** with your existing API calls
- ✅ **Provides** a clean separation of concerns

## Testing

You can test the integration by:
1. Adding the `HitPayExample` component to any page
2. Checking the browser console for API calls
3. Verifying that Redux DevTools show the API state

## Next Steps

1. **Replace the example URLs** with your actual HitPay API endpoints
2. **Add authentication headers** if required by your HitPay setup
3. **Customize the error handling** to match your app's needs
4. **Add more endpoints** as needed for your specific use case

## Troubleshooting

### Common Issues

1. **API calls not working**: Check the base URL and environment variables
2. **Type errors**: Ensure all types are properly imported
3. **Caching issues**: Check the `providesTags` and `invalidatesTags` configuration
4. **Authentication errors**: Verify the token handling in `prepareHeaders`

### Debug Mode
Enable Redux DevTools in your browser to see:
- API call states
- Cached data
- Error messages
- Request/response details
