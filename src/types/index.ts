export interface Variant {
  id: string;
  label: string;
  color?: string; // CSS color or hex
}

export interface Product {
  id: string;
  category: "cameras" | "sensors" | "accessories" | "plans";
  name: string;
  description: string;
  learnMoreUrl?: string;
  image: string;
  badge?: string; // e.g. "Save 22%"
  variants?: Variant[];
  compareAtPrice?: number;
  price: number;
  priceUnit?: "mo"; // for plans
  required?: boolean;
  initialQty?: number; // pre-seeded quantity
  initialVariantId?: string;
}

export interface LineItem {
  productId: string;
  variantId?: string;
  qty: number;
}

export interface StepConfig {
  id: number;
  title: string;
  nextLabel?: string;
  category: "cameras" | "sensors" | "accessories" | "plans";
}
