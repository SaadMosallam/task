"use client";
import { Product } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setActiveStep } from "@/store/bundleSlice";
import StepHeader from "./StepHeader";
import ProductCard from "./ProductCard";

interface StepConfig {
  id: number;
  title: string;
  nextLabel?: string;
  category: "cameras" | "sensors" | "accessories" | "plans";
}

interface Props {
  step: StepConfig;
  products: Product[];
  isLast: boolean;
}

// cameras: 1-col mobile → auto-fill ≥200px (wraps at 2, 3, 4, 5 cols as space allows)
// others: 1-col mobile → 2-col at sm
const GRID: Record<string, string> = {
  cameras: "grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]",
  plans: "grid-cols-1 sm:grid-cols-2",
  sensors: "grid-cols-1 sm:grid-cols-2",
  accessories: "grid-cols-1 sm:grid-cols-2",
};

export default function BuilderStep({ step, products, isLast }: Props) {
  const dispatch = useAppDispatch();
  const activeStep = useAppSelector((s) => s.bundle.activeStep);
  const items = useAppSelector((s) => s.bundle.items);
  const isOpen = activeStep === step.id;
  const isCamera = step.category === "cameras";

  const selectedCount = products.filter((p) => {
    if (p.variants) {
      return p.variants.some((v) => items.find((i) => i.productId === p.id && i.variantId === v.id && i.qty > 0));
    }
    return items.find((i) => i.productId === p.id && (i.qty ?? 0) > 0);
  }).length;

  return (
    <div>
      <StepHeader
        stepNum={step.id}
        title={step.title}
        category={step.category}
        selectedCount={selectedCount}
        isOpen={isOpen}
        onClick={() => dispatch(setActiveStep(isOpen ? 0 : step.id))}
      />

      {isOpen && (
        <div id={`step-panel-${step.id}`} className="bg-[#EEF2FF] px-3 sm:px-5 pb-5 pt-3">
          <div className={`grid ${GRID[step.category] ?? "grid-cols-1 sm:grid-cols-2"} gap-3`}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} isCamera={isCamera} />
            ))}
          </div>

          {!isLast && step.nextLabel && (
            <div className="mt-5 flex justify-center">
              <button
                onClick={() => dispatch(setActiveStep(step.id + 1))}
                className="border-2 border-[#4C51BF] text-[#4C51BF] font-semibold text-sm px-10 py-2.5 rounded-xl hover:bg-white active:bg-[#E0E7FF] transition-colors cursor-pointer bg-[#EEF2FF]"
              >
                Next: {step.nextLabel}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
