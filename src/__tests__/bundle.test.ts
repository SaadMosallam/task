/**
 * Tests for the core bundle logic:
 *  - Reducer: variant quantity tracking, add/update/remove
 *  - Required products: minimum quantity enforcement
 *  - Total calculation: subtotal, savings, shipping threshold
 *  - Persistence middleware: localStorage sync on mutations
 */
import { configureStore } from "@reduxjs/toolkit";
import bundleReducer, {
  setQty,
  seedItems,
  saveSystem,
  STORAGE_KEY,
} from "@/store/bundleSlice";
import { persistenceMiddleware } from "@/store/persistenceMiddleware";
import type { LineItem } from "@/types";

// ─── helpers ────────────────────────────────────────────────────────────────

function makeStore(preloadedItems: LineItem[] = []) {
  const store = configureStore({
    reducer: { bundle: bundleReducer },
    middleware: (getDefault) =>
      getDefault().prepend(persistenceMiddleware.middleware),
    preloadedState: { bundle: { items: preloadedItems, activeStep: 1 } },
  });
  return store;
}

function items(store: ReturnType<typeof makeStore>) {
  return store.getState().bundle.items;
}

// ─── Variant quantity tracking ────────────────────────────────────────────────

describe("setQty — variant quantity tracking", () => {
  it("tracks each (productId, variantId) pair independently", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 1 }));
    store.dispatch(setQty({ productId: "cam", variantId: "black", qty: 2 }));

    expect(items(store)).toHaveLength(2);
    expect(items(store).find((i) => i.variantId === "white")?.qty).toBe(1);
    expect(items(store).find((i) => i.variantId === "black")?.qty).toBe(2);
  });

  it("updates qty when the same (productId, variantId) is dispatched again", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 1 }));
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 3 }));

    expect(items(store)).toHaveLength(1);
    expect(items(store)[0].qty).toBe(3);
  });

  it("treats the same productId with different variantIds as distinct line items", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 1 }));
    store.dispatch(setQty({ productId: "cam", variantId: "grey", qty: 1 }));
    store.dispatch(setQty({ productId: "cam", variantId: "black", qty: 1 }));

    expect(items(store)).toHaveLength(3);
  });

  it("treats productId without variantId separately from one with variantId", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "hub", qty: 1 }));
    store.dispatch(setQty({ productId: "hub", variantId: "white", qty: 1 }));

    expect(items(store)).toHaveLength(2);
  });
});

// ─── Add / update / remove ───────────────────────────────────────────────────

describe("setQty — add / update / remove", () => {
  it("adds a new line item when the product is not in the cart", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "sensor", qty: 2 }));

    expect(items(store)).toEqual([{ productId: "sensor", variantId: undefined, qty: 2 }]);
  });

  it("removes a line item when qty is set to 0", () => {
    const store = makeStore([{ productId: "cam", variantId: "white", qty: 1 }]);
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 0 }));

    expect(items(store)).toHaveLength(0);
  });

  it("removes a line item when qty is negative", () => {
    const store = makeStore([{ productId: "cam", variantId: "white", qty: 1 }]);
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: -1 }));

    expect(items(store)).toHaveLength(0);
  });

  it("does nothing when removing a product not in the cart", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 0 }));

    expect(items(store)).toHaveLength(0);
  });
});

// ─── Required-product behavior ───────────────────────────────────────────────

describe("required products", () => {
  it("allows a required product to be present at qty 1", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "wyze-sense-hub", qty: 1 }));

    expect(items(store)).toHaveLength(1);
    expect(items(store)[0].qty).toBe(1);
  });

  it("still removes a required product when the reducer receives qty 0 — enforcement is in the UI", () => {
    // The reducer itself is not responsible for enforcing the minimum.
    // ProductCard/QuantityStepper enforce min=1 at the UI layer.
    // This test documents that the reducer stays pure (no minimum clamping).
    const store = makeStore([{ productId: "wyze-sense-hub", qty: 1 }]);
    store.dispatch(setQty({ productId: "wyze-sense-hub", qty: 0 }));

    expect(items(store)).toHaveLength(0);
  });
});

// ─── seedItems ───────────────────────────────────────────────────────────────

describe("seedItems", () => {
  it("replaces all items with the provided payload", () => {
    const store = makeStore([{ productId: "old", qty: 5 }]);
    const seed: LineItem[] = [
      { productId: "cam", variantId: "white", qty: 1 },
      { productId: "sensor", qty: 2 },
    ];
    store.dispatch(seedItems(seed));

    expect(items(store)).toEqual(seed);
  });

  it("accepts an empty array and clears the cart", () => {
    const store = makeStore([{ productId: "cam", qty: 1 }]);
    store.dispatch(seedItems([]));

    expect(items(store)).toHaveLength(0);
  });
});

// ─── Total calculation (pure logic, mirrors ReviewPanel) ─────────────────────

describe("total calculation", () => {
  const PRODUCTS = [
    { id: "cam-v4", price: 27.98, compareAtPrice: 35.98 },
    { id: "hub", price: 0, compareAtPrice: 29.92 },
    { id: "plan", price: 9.99, compareAtPrice: 12.99, priceUnit: "mo" as const },
  ];

  function calcTotals(lineItems: LineItem[]) {
    const productMap = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
    let subtotal = 0;
    let compareTotal = 0;

    for (const item of lineItems) {
      if (item.qty <= 0) continue;
      const p = productMap[item.productId];
      if (!p) continue;
      const isPlan = "priceUnit" in p && p.priceUnit === "mo";
      const qty = isPlan ? 1 : item.qty;
      subtotal += p.price * qty;
      compareTotal += (p.compareAtPrice ?? p.price) * qty;
    }

    const shipping = subtotal >= 100 ? 0 : 5.99;
    const total = subtotal + shipping;
    const savings = compareTotal - subtotal;
    return { subtotal, compareTotal, shipping, total, savings };
  }

  it("computes subtotal and savings correctly for multi-qty items", () => {
    const { subtotal, savings } = calcTotals([
      { productId: "cam-v4", variantId: "white", qty: 2 },
    ]);
    expect(subtotal).toBeCloseTo(55.96, 2);
    expect(savings).toBeCloseTo(16.0, 2);
  });

  it("applies free shipping above the $100 threshold", () => {
    const { shipping } = calcTotals([
      { productId: "cam-v4", variantId: "white", qty: 4 },
    ]);
    expect(shipping).toBe(0);
  });

  it("charges shipping when subtotal is below $100", () => {
    const { shipping } = calcTotals([
      { productId: "cam-v4", variantId: "white", qty: 1 },
    ]);
    expect(shipping).toBe(5.99);
  });

  it("counts plan as qty 1 regardless of line item qty", () => {
    const { subtotal } = calcTotals([{ productId: "plan", qty: 3 }]);
    expect(subtotal).toBeCloseTo(9.99, 2);
  });

  it("treats FREE products (price 0) correctly — they don't contribute to subtotal", () => {
    const { subtotal, savings } = calcTotals([{ productId: "hub", qty: 1 }]);
    expect(subtotal).toBe(0);
    expect(savings).toBeCloseTo(29.92, 2);
  });
});

// ─── Persistence middleware ───────────────────────────────────────────────────

describe("persistence middleware", () => {
  const mockStorage: Record<string, string> = {};

  beforeEach(() => {
    Object.defineProperty(global, "localStorage", {
      value: {
        getItem: (k: string) => mockStorage[k] ?? null,
        setItem: (k: string, v: string) => { mockStorage[k] = v; },
        removeItem: (k: string) => { delete mockStorage[k]; },
        clear: () => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); },
      },
      writable: true,
      configurable: true,
    });
    mockStorage[STORAGE_KEY] && delete mockStorage[STORAGE_KEY];
  });

  it("writes to localStorage after setQty", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 2 }));

    const stored = JSON.parse(mockStorage[STORAGE_KEY] ?? "null");
    expect(stored).toEqual([{ productId: "cam", variantId: "white", qty: 2 }]);
  });

  it("writes to localStorage after seedItems", () => {
    const store = makeStore();
    const seed: LineItem[] = [{ productId: "hub", qty: 1 }];
    store.dispatch(seedItems(seed));

    const stored = JSON.parse(mockStorage[STORAGE_KEY] ?? "null");
    expect(stored).toEqual(seed);
  });

  it("writes to localStorage after saveSystem", () => {
    const store = makeStore([{ productId: "sensor", qty: 3 }]);
    store.dispatch(saveSystem());

    const stored = JSON.parse(mockStorage[STORAGE_KEY] ?? "null");
    expect(stored).toEqual([{ productId: "sensor", qty: 3 }]);
  });

  it("updates localStorage when qty changes", () => {
    const store = makeStore();
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 1 }));
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 4 }));

    const stored = JSON.parse(mockStorage[STORAGE_KEY] ?? "null");
    expect(stored[0].qty).toBe(4);
  });

  it("reflects removals in localStorage", () => {
    const store = makeStore([{ productId: "cam", variantId: "white", qty: 1 }]);
    store.dispatch(setQty({ productId: "cam", variantId: "white", qty: 0 }));

    const stored = JSON.parse(mockStorage[STORAGE_KEY] ?? "null");
    expect(stored).toEqual([]);
  });
});
