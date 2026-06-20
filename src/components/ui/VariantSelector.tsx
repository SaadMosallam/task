"use client";
import { Variant } from "@/types";

interface Props {
  variants: Variant[];
  selected: string;
  onSelect: (id: string) => void;
}

export default function VariantSelector({ variants, selected, onSelect }: Props) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {variants.map((v) => {
        const isSelected = v.id === selected;
        const isDark = v.color === "#1F2937";
        return (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            title={v.label}
            aria-label={v.label}
            className={`flex items-center gap-1 px-2 py-1 rounded border text-xs font-medium transition-all cursor-pointer
              ${isSelected
                ? "border-[#4C51BF] bg-[#EEF2FF]"
                : "border-gray-300 bg-white hover:border-gray-400"
              }`}
          >
            <span
              className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block flex-shrink-0"
              style={{ backgroundColor: v.color }}
            />
            <span className="text-gray-700">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
