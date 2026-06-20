"use client";

interface Props {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  size?: "sm" | "md";
  disabled?: boolean;
}

export default function QuantityStepper({ value, onChange, min = 0, size = "md", disabled = false }: Props) {
  const btnCls =
    size === "sm"
      ? "w-6 h-6 text-sm"
      : "w-7 h-7 text-base";

  const canDecrement = !disabled && value > min;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => canDecrement && onChange(value - 1)}
        disabled={!canDecrement}
        aria-label="Decrease quantity"
        className={`${btnCls} rounded flex items-center justify-center border border-gray-300 text-gray-600 font-semibold transition-colors
          ${canDecrement ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
      >
        −
      </button>
      <span className={`${size === "sm" ? "w-5 text-sm" : "w-6 text-sm"} text-center font-medium tabular-nums`}>
        {value}
      </span>
      <button
        onClick={() => !disabled && onChange(value + 1)}
        disabled={disabled}
        aria-label="Increase quantity"
        className={`${btnCls} rounded flex items-center justify-center border border-gray-300 text-gray-600 font-semibold transition-colors
          ${!disabled ? "hover:bg-gray-100 cursor-pointer" : "opacity-40 cursor-not-allowed"}`}
      >
        +
      </button>
    </div>
  );
}
