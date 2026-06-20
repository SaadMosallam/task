"use client";
import Image from "next/image";
import { Variant } from "@/types";

interface Props {
  variants: Variant[];
  selected: string;
  onSelect: (id: string) => void;
  /** When provided, chips show a cropped product thumbnail tinted by variant color */
  showThumbnail?: string;
}

export default function VariantSelector({ variants, selected, onSelect, showThumbnail }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {variants.map((v) => {
        const isSelected = v.id === selected;
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            title={v.label}
            aria-label={v.label}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border-2 text-xs font-medium transition-all cursor-pointer
              ${isSelected
                ? "border-[#4C51BF] bg-[#EEF2FF]"
                : "border-gray-200 bg-white hover:border-gray-300"
              }`}
          >
            {showThumbnail ? (
              <span className="relative w-5 h-5 rounded overflow-hidden shrink-0 border border-gray-200 bg-gray-50">
                <Image src={showThumbnail} alt={v.label} fill className="object-contain" />
              </span>
            ) : (
              <span
                className="w-3.5 h-3.5 rounded-full border border-gray-200 inline-block shrink-0"
                style={{ backgroundColor: v.color }}
              />
            )}
            <span className="text-gray-700">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
