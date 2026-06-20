"use client";
import Image from "next/image";
import { Product } from "@/types";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setQty, saveSystem } from "@/store/bundleSlice";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { Truck } from "lucide-react";

interface Props {
  products: Product[];
}

interface ReviewLine {
  product: Product;
  variantId?: string;
  variantLabel?: string;
  qty: number;
  linePrice: number;
  compareLinePrice?: number;
}

const SHIPPING_THRESHOLD = 100;

const catLabels: Record<string, string> = {
  cameras: "CAMERAS",
  sensors: "SENSORS",
  accessories: "ACCESSORIES",
  plans: "HOME MONITORING PLAN",
};

export default function ReviewPanel({ products: allProducts }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.bundle.items);

  const productMap = Object.fromEntries(allProducts.map((p) => [p.id, p]));

  const lines: ReviewLine[] = [];
  for (const item of items) {
    if (item.qty <= 0) continue;
    const product = productMap[item.productId];
    if (!product) continue;
    const variant = product.variants?.find((v) => v.id === item.variantId);
    const isPlan = product.priceUnit === "mo";
    const effectiveQty = isPlan ? 1 : item.qty;
    lines.push({
      product,
      variantId: item.variantId,
      variantLabel: variant?.label,
      qty: item.qty,
      linePrice: product.price * effectiveQty,
      compareLinePrice: product.compareAtPrice != null ? product.compareAtPrice * effectiveQty : undefined,
    });
  }

  const grouped: Record<string, ReviewLine[]> = { cameras: [], sensors: [], accessories: [], plans: [] };
  for (const line of lines) {
    grouped[line.product.category]?.push(line);
  }

  const subtotal = lines.reduce((s, l) => s + l.linePrice, 0);
  const compareTotal = lines.reduce((s, l) => s + (l.compareLinePrice ?? l.linePrice), 0);
  const savings = compareTotal - subtotal;

  const shipping = subtotal >= SHIPPING_THRESHOLD ? 0 : 5.99;
  const total = subtotal + shipping;

  const handleSave = () => {
    dispatch(saveSystem());
    alert("System saved! It will be restored on your next visit.");
  };

  const handleCheckout = () => {
    alert("Checkout complete! (This is a prototype — no real order was placed.)");
  };

  const hasItems = lines.length > 0;

  return (
    <div className="bg-[#EEF2FF] rounded-2xl p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Your security system</h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Review your personalized protection system designed to keep what matters most safe.
        </p>
      </div>

      {/* Line items by category */}
      {(["cameras", "sensors", "accessories", "plans"] as const).map((cat) => {
        const catLines = grouped[cat];
        if (!catLines?.length) return null;
        return (
          <div key={cat}>
            <p className="text-[9px] font-bold text-gray-400 tracking-[0.12em] uppercase mb-2">
              {catLabels[cat]}
            </p>
            <div className="flex flex-col gap-3">
              {catLines.map((line) => (
                <ReviewLineRow
                  key={`${line.product.id}-${line.variantId ?? "base"}`}
                  line={line}
                  onQtyChange={(val) =>
                    dispatch(setQty({ productId: line.product.id, variantId: line.variantId, qty: val }))
                  }
                />
              ))}
            </div>
          </div>
        );
      })}

      {!hasItems && (
        <p className="text-sm text-gray-400 text-center py-6">
          No items selected yet. Start building your system above.
        </p>
      )}

      {/* Shipping */}
      <div className="flex items-center justify-between py-2 border-t border-indigo-200 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Truck className="w-4 h-4 shrink-0" />
          <span>Fast Shipping</span>
        </div>
        <div className="flex items-center gap-2">
          {shipping === 0 && <span className="text-xs text-gray-400 line-through">$5.99</span>}
          <span className={`font-semibold ${shipping === 0 ? "text-green-600" : "text-gray-800"}`}>
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
      </div>

      {/* Total section */}
      <div className="flex items-center gap-3 pt-1">
        <GuaranteeBadge />
        <div className="flex-1 min-w-0">
          {/* "as low as" pill */}
          <div className="flex justify-end mb-1">
            <span className="bg-[#4C51BF] text-white text-[10px] font-semibold px-3 py-1 rounded-full">
              as low as $19.19/mo
            </span>
          </div>
          {/* Prices */}
          <div className="flex items-baseline justify-end gap-2">
            {savings > 0.005 && (
              <span className="text-sm text-gray-400 line-through">${compareTotal.toFixed(2)}</span>
            )}
            <span className="text-[28px] font-extrabold text-gray-900 leading-none">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Savings callout */}
      {savings > 0.005 && (
        <p className="text-[12px] text-[#2D6A4F] font-semibold text-center -mt-1">
          Congrats! You&apos;re saving ${savings.toFixed(2)} on your security bundle!
        </p>
      )}

      {/* CTA */}
      <button
        onClick={handleCheckout}
        className="w-full bg-[#4C51BF] hover:bg-[#434190] active:bg-[#3730A3] text-white font-bold py-3.5 rounded-xl transition-colors text-[15px] tracking-wide shadow-md cursor-pointer"
      >
        Checkout
      </button>

      <button
        onClick={handleSave}
        className="text-center text-[13px] text-gray-500 hover:text-gray-700 italic underline underline-offset-2 transition-colors cursor-pointer"
      >
        Save my system for later
      </button>
    </div>
  );
}

function ReviewLineRow({ line, onQtyChange }: { line: ReviewLine; onQtyChange: (v: number) => void }) {
  const isPlan = line.product.priceUnit === "mo";
  const isFree = line.product.price === 0;

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-14 h-14 shrink-0 rounded-lg bg-white border border-gray-200 overflow-hidden shadow-sm">
        <Image
          src={line.product.image}
          alt={line.product.name}
          fill
          className="object-contain p-1"
        />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {line.product.name}
        </p>
        {line.variantLabel && (
          <p className="text-xs text-gray-400">{line.variantLabel}</p>
        )}
      </div>

      {!isPlan && (
        <QuantityStepper
          value={line.qty}
          onChange={onQtyChange}
          size="md"
          min={line.product.required ? 1 : 0}
        />
      )}

      <div className="text-right shrink-0 min-w-[60px]">
        {isPlan
          ? line.product.compareAtPrice != null && (
            <p className="text-xs text-gray-400 line-through leading-none">
              ${line.product.compareAtPrice.toFixed(2)}/mo
            </p>
          )
          : line.compareLinePrice != null && line.compareLinePrice !== line.linePrice && (
            <p className="text-xs text-gray-400 line-through leading-none">
              ${line.compareLinePrice.toFixed(2)}
            </p>
          )}
        <p className={`text-sm font-bold leading-tight ${isFree ? "text-green-600" : "text-[#4C51BF]"}`}>
          {isFree
            ? "FREE"
            : isPlan
              ? `$${line.product.price.toFixed(2)}/mo`
              : `$${line.linePrice.toFixed(2)}`}
        </p>
      </div>
    </div>
  );
}

function GuaranteeBadge() {
  return (
    <div className="relative w-20 h-20 shrink-0">
      <Image
        src="/images/satisfaction-badge.png"
        alt="100% Wyze satisfaction guarantee"
        fill
        className="object-contain"
      />
    </div>
  );
}
