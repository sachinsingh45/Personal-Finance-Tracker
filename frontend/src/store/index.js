import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import transactionsSlice from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    transactions: transactionsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});
