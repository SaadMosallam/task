import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LineItem } from "@/types";

interface BundleState {
  items: LineItem[];
  activeStep: number;
}

const STORAGE_KEY = "wyze_bundle_v3";

function loadFromStorage(): LineItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LineItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: LineItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

const initialState: BundleState = {
  items: [],
  activeStep: 1,
};

const bundleSlice = createSlice({
  name: "bundle",
  initialState,
  reducers: {
    seedItems(state, action: PayloadAction<LineItem[]>) {
      state.items = action.payload;
      saveToStorage(state.items);
    },
    setQty(
      state,
      action: PayloadAction<{
        productId: string;
        variantId?: string;
        qty: number;
      }>,
    ) {
      const { productId, variantId, qty } = action.payload;
      const idx = state.items.findIndex(
        (i) => i.productId === productId && i.variantId === variantId,
      );
      if (qty <= 0) {
        if (idx !== -1) state.items.splice(idx, 1);
      } else {
        if (idx !== -1) {
          state.items[idx].qty = qty;
        } else {
          state.items.push({ productId, variantId, qty });
        }
      }
      saveToStorage(state.items);
    },
    setActiveStep(state, action: PayloadAction<number>) {
      state.activeStep = action.payload;
    },
    saveSystem(state) {
      saveToStorage(state.items);
    },
  },
});

export const { seedItems, setQty, setActiveStep, saveSystem } =
  bundleSlice.actions;
export default bundleSlice.reducer;
