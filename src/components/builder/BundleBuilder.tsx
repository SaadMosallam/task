"use client";
import { useEffect, useRef } from "react";
import { Product } from "@/types";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { seedItems } from "@/store/bundleSlice";
import { STORAGE_KEY } from "@/lib/bundlePersistence";
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

export default function BundleBuilder({ products, steps }: Props) {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let restored = false;

    try {
      const persisted = localStorage.getItem(STORAGE_KEY);
      if (persisted) {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed)) {
          dispatch(seedItems(parsed));
          restored = true;
        }
      }
    } catch {
      // Fall through to the design defaults when storage is unavailable or invalid.
    }

    if (!restored) {
      const seed = products
        .filter((p) => p.initialQty && p.initialQty > 0)
        .map((p) => ({
          productId: p.id,
          variantId: p.initialVariantId ?? p.variants?.[0]?.id,
          qty: p.initialQty!,
        }));
      dispatch(seedItems(seed));
    }

    containerRef.current?.classList.remove("invisible");
    containerRef.current?.removeAttribute("aria-busy");
  }, [dispatch, products]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gray-50 invisible"
      aria-busy="true"
    >
      {/* Page header — full bleed, no side padding on mobile */}
      <div className="px-4 sm:px-6 pt-6 pb-4 lg:pt-10 max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center lg:text-left">
          Let&apos;s get started!
        </h1>
      </div>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-6">
        <div className="flex flex-col lg:flex-row gap-0 sm:gap-6 xl:gap-8 items-start">
          {/* Builder accordion — edge-to-edge on mobile, rounded on sm+ */}
          <div className="flex-1 min-w-0 w-full">
            <div className="bg-white sm:rounded-2xl border-y sm:border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
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

          {/* Review panel — stacked on mobile/tablet, sticky sidebar on desktop */}
          <div className="w-full sm:rounded-2xl lg:w-[340px] xl:w-[380px] shrink-0 lg:sticky lg:top-6 mt-4 sm:mt-0">
            <ReviewPanel products={products} />
          </div>
        </div>
      </div>
    </div>
  );
}
