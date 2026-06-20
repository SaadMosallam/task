import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { seedItems, setQty, saveSystem, STORAGE_KEY } from "./bundleSlice";

export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: isAnyOf(seedItems, setQty, saveSystem),
  effect: (_action, api) => {
    const state = api.getState() as RootState;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bundle.items));
    } catch {
      // ignore storage errors (private browsing, quota exceeded, etc.)
    }
  },
});
