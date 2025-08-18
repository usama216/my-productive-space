import { configureStore } from '@reduxjs/toolkit';
import { hitpayApi } from './api/hitpayApi';
import { bookingApi } from './api/bookingApi';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    [hitpayApi.reducerPath]: hitpayApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(hitpayApi.middleware, bookingApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
