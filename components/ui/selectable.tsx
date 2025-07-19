import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface SelectableProps extends React.HTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  onClick: () => void;
}

export function Selectable({ selected, className, children, onClick, ...props }: SelectableProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative cursor-pointer rounded-lg border-2 transition-all duration-200 bg-white text-left",
        selected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg"
          : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 hover:shadow-md",
        className
      )}
      onClick={onClick}
      aria-pressed={selected}
      {...props}
    >
      {children}
      {selected && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold shadow-lg">
          <Check className="w-4 h-4" />
        </div>
      )}
    </button>
  );
} 