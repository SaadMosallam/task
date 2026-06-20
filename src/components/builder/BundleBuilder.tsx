"use client";
import { useEffect } from "react";
import { Product } from "@/types";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { seedItems } from "@/store/bundleSlice";
import BuilderStep from "./BuilderStep";
import ReviewPanel from "@/components/review/ReviewPanel";

interface StepConfig {
  id: number;
  title: string;
  nextLabel?: string;
  category: "cameras" | "sensors" | "accessories" | "plans";
}

interface Props {
  products: Product[];
  steps: StepConfig[];
}

const STORAGE_KEY = "wyze_bundle_v3";

export default function BundleBuilder({ products, steps }: Props) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed) && parsed.length > 0) {
          dispatch(seedItems(parsed));
          return;
        }
      } catch {
        // fall through to seed defaults
      }
    }

    const seed = products
      .filter((p) => p.initialQty && p.initialQty > 0)
      .map((p) => ({
        productId: p.id,
        variantId: p.initialVariantId ?? p.variants?.[0]?.id,
        qty: p.initialQty!,
      }));
    dispatch(seedItems(seed));
  }, [dispatch, products]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center lg:text-left">
          Let&apos;s get started!
        </h1>

        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">
          {/* Builder accordion */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
              {steps.map((step, idx) => {
                const stepProducts = products.filter((p) => p.category === step.category);
                return (
                  <BuilderStep
                    key={step.id}
                    step={step}
                    products={stepProducts}
                    isLast={idx === steps.length - 1}
                  />
                );
              })}
            </div>
          </div>

          {/* Review panel — sticky on desktop, stacked on mobile */}
          <div className="w-full lg:w-[340px] xl:w-[360px] shrink-0 lg:sticky lg:top-6">
            <ReviewPanel products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
