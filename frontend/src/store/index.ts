/**
 * Redux Store Configuration
 * 
 * Configures the Redux store with:
 * - All slices (exposures, etc.)
 * - Redux Persist for state persistence
 * - Redux DevTools
 * - Type safety for dispatch and state
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import exposureReducer from './slices/exposureSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['exposure'], // Only persist exposure data for now
};

// Root reducer
const rootReducer = combineReducers({
  exposure: exposureReducer,
  // Add other reducers here as they are created
  // account: accountReducer,
  // policy: policyReducer,
  // location: locationReducer,
  // hazard: hazardReducer,
  // vulnerability: vulnerabilityReducer,
});

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }) as any,
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
