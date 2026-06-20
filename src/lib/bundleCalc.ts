import type { LineItem, Product } from "@/types";

export const SHIPPING_THRESHOLD = 100;
export const SHIPPING_COST = 5.99;
// Scale the financing quote with the configured total while preserving the
// Figma baseline: $187.89 total -> $19.19/mo.
export const FINANCING_MONTHLY_FACTOR = 19.19 / 187.89;

export interface BundleTotals {
  subtotal: number;
  compareTotal: number;
  savings: number;
  shipping: number;
  total: number;
  /** Formatted monthly payment string, or null when cart is empty. */
  monthlyPayment: string | null;
}

/**
 * Pure function: derives totals from Redux line items + product catalog.
 * Used by ReviewPanel and the test suite — change one, change both.
 */
export function calcBundleTotals(
  items: LineItem[],
  productMap: Record<string, Product>,
): BundleTotals {
  let subtotal = 0;
  let compareTotal = 0;
  let hasItems = false;

  for (const item of items) {
    if (item.qty <= 0) continue;
    const product = productMap[item.productId];
    if (!product) continue;
    hasItems = true;
    const qty = product.priceUnit === "mo" ? 1 : item.qty;
    subtotal += product.price * qty;
    compareTotal += (product.compareAtPrice ?? product.price) * qty;
  }

  const shipping = !hasItems
    ? 0
    : subtotal >= SHIPPING_THRESHOLD
      ? 0
      : SHIPPING_COST;
  const total = subtotal + shipping;
  return {
    subtotal,
    compareTotal,
    savings: compareTotal - subtotal,
    shipping,
    total,
    monthlyPayment: hasItems
      ? (total * FINANCING_MONTHLY_FACTOR).toFixed(2)
      : null,
  };
}
