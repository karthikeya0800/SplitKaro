import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authReducer from "./slices/authSlice";
import participantReducer from "./slices/participantSlice";
import expenseReducer from "./slices/expenseSlice";

export type CurrencyType = "USD" | "EUR" | "GBP" | "JPY" | "INR";

const persistedReducer = persistReducer(
  {
    key: "root",
    storage,
  },
  combineReducers({
    auth: authReducer,
    participants: participantReducer,
    expenses: expenseReducer,
  })
);

export const store = configureStore({
  reducer: persistedReducer,
});

export const persistor = persistStore(store);

// Infer the `RootState` and `AppDispatch` types from the store
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
