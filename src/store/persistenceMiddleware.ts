import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "./index";
import { seedItems, setQty } from "./bundleSlice";
import { persistBundleItems } from "@/lib/bundlePersistence";

export const persistenceMiddleware = createListenerMiddleware();

persistenceMiddleware.startListening({
  matcher: isAnyOf(seedItems, setQty),
  effect: (_action, api) => {
    const state = api.getState() as RootState;
    persistBundleItems(state.bundle.items);
  },
});
