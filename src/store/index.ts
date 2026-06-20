import { configureStore } from "@reduxjs/toolkit";
import bundleReducer from "./bundleSlice";

export const store = configureStore({
  reducer: {
    bundle: bundleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
