"use client";
import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import Badge from "@/components/ui/Badge";
import VariantSelector from "@/components/ui/VariantSelector";
import QuantityStepper from "@/components/ui/QuantityStepper";
import { useAppDispatch, useAppSelector } from "@/hooks/useAppDispatch";
import { setQty } from "@/store/bundleSlice";

interface Props {
  product: Product;
  /** Camera cards flip to horizontal (image-left) layout at lg+ */
  isCamera?: boolean;
}

export default function ProductCard({ product, isCamera }: Props) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.bundle.items);

  const [selectedVariant, setSelectedVariant] = useState<string>(
    product.variants?.[0]?.id ?? ""
  );

  const getQty = (variantId?: string) => {
    const item = items.find(
      (i) => i.productId === product.id && i.variantId === variantId
    );
    return item?.qty ?? 0;
  };

  const currentQty = product.variants ? getQty(selectedVariant) : getQty(undefined);
  const totalQty = product.variants
    ? product.variants.reduce((sum, v) => sum + getQty(v.id), 0)
    : getQty(undefined);

  const isSelected = totalQty > 0;

  const handleQtyChange = (val: number) => {
    dispatch(setQty({
      productId: product.id,
      variantId: product.variants ? selectedVariant : undefined,
      qty: val,
    }));
  };

  return (
    <div
      className={`relative flex rounded-xl border-2 p-3.5 transition-all bg-white h-full
        ${isCamera ? "flex-col lg:flex-row lg:items-start" : "flex-col"}
        ${isSelected ? "border-[#4C51BF] shadow-md" : "border-gray-200 hover:border-gray-300"}`}
    >
      {product.badge && <Badge label={product.badge} />}

      {/* Image */}
      <div
        className={`relative shrink-0 rounded-lg overflow-hidden bg-gray-50
          ${isCamera
            ? "w-full aspect-[4/3] mb-3 mt-1 lg:w-28 lg:h-28 lg:aspect-auto lg:mb-0 lg:mr-3 lg:mt-0"
            : "w-full aspect-[4/3] mb-3 mt-1"
          }`}
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-2"
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug">{product.name}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">
          {product.description}
        </p>

        {product.learnMoreUrl && (
          <a href={product.learnMoreUrl} className="text-xs text-[#4C51BF] hover:underline font-medium w-fit">
            Learn More
          </a>
        )}

        {product.variants && (
          <VariantSelector
            variants={product.variants}
            selected={selectedVariant}
            onSelect={setSelectedVariant}
          />
        )}

        <div className="flex items-center justify-between mt-auto pt-1">
          {!product.priceUnit && (
            <QuantityStepper value={currentQty} onChange={handleQtyChange} min={product.required ? 1 : 0} />
          )}
          {product.priceUnit && (
            <button
              onClick={() => handleQtyChange(currentQty > 0 ? 0 : 1)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-lg border-2 transition-colors cursor-pointer
                ${currentQty > 0
                  ? "border-[#4C51BF] bg-[#EEF2FF] text-[#4C51BF]"
                  : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"}`}
            >
              {currentQty > 0 ? "Selected" : "Select"}
            </button>
          )}
          <div className="flex flex-col items-end">
            {product.compareAtPrice != null && (
              <span className="text-xs text-[#E53E3E] line-through leading-none">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
            <span className="text-sm font-bold leading-tight text-gray-900">
              {product.price === 0 ? "FREE" : `$${product.price.toFixed(2)}`}
              {product.priceUnit && <span className="text-xs font-medium">/{product.priceUnit}</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
