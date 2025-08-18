# Backend API Setup

## Environment Variables

Add this to your `.env.local` file:

```bash
# Backend Configuration
NEXT_PUBLIC_BACKEND_BASE_URL=http://localhost:8000
```

## API Endpoints

Your backend API endpoints are now configured:

- **Create Booking**: `POST /booking/create`
- **Get All Bookings**: `GET /api/bookings` (placeholder)
- **Get Booking by ID**: `GET /api/bookings/:id` (placeholder)
- **Update Booking**: `PUT /api/bookings/:id` (placeholder)
- **Delete Booking**: `DELETE /api/bookings/:id` (placeholder)

## What's Working Now

✅ **Real Booking Creation**: When you submit step 1, it creates a real booking in your database
✅ **Real Data**: All booking data is saved with your actual API structure
✅ **Step Progression**: Only moves to step 2 after successful booking creation
✅ **Error Handling**: Shows proper error messages if booking fails
✅ **Booking Display**: Shows created booking details in step 2

## Next Steps

1. **Add your backend URL** to `.env.local`
2. **Test the booking flow** - create a booking and check your database
3. **Integrate HitPay** for payment processing
4. **Add more endpoints** as needed (update, delete, etc.)

## Testing

1. Fill out the booking form
2. Submit step 1
3. Check your browser console for API calls
4. Verify the booking is created in your database
5. Check that step 2 shows the created booking details
