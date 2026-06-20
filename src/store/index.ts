import { configureStore } from "@reduxjs/toolkit";
import bundleReducer from "./bundleSlice";
import { persistenceMiddleware } from "./persistenceMiddleware";

export const store = configureStore({
  reducer: {
    bundle: bundleReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
