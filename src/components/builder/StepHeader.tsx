"use client";
import { ChevronDown, ChevronUp, Camera, Shield, Cpu, Lock } from "lucide-react";

const icons: Record<string, React.ElementType> = {
  cameras: Camera,
  plans: Shield,
  sensors: Cpu,
  accessories: Lock,
};

interface Props {
  stepNum: number;
  title: string;
  category: string;
  selectedCount: number;
  isOpen: boolean;
  onClick: () => void;
}

export default function StepHeader({ stepNum, title, category, selectedCount, isOpen, onClick }: Props) {
  const Icon = icons[category] ?? Shield;
  return (
    <button
      onClick={onClick}
      aria-expanded={isOpen}
      aria-controls={`step-panel-${stepNum}`}
      className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 hover:bg-gray-50 transition-colors text-left cursor-pointer"
    >
      <Icon className="w-5 h-5 text-gray-500 shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase leading-none mb-0.5">
          Step {stepNum} of 4
        </p>
        <p className="font-semibold text-gray-900 text-sm sm:text-[15px] leading-tight">{title}</p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {selectedCount > 0 && (
          <span className="text-[#4C51BF] text-sm font-medium whitespace-nowrap">
            {selectedCount} selected
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>
    </button>
  );
}
