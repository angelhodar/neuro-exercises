import { Check } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";

interface SelectableProps extends React.HTMLAttributes<HTMLButtonElement> {
  selected: boolean;
  onClick: () => void;
}

export function Selectable({
  selected,
  className,
  children,
  onClick,
  ...props
}: SelectableProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "relative cursor-pointer rounded-lg border-2 bg-white text-left transition-all duration-200",
        selected
          ? "border-blue-500 bg-blue-50 shadow-lg dark:bg-blue-900/20"
          : "border-gray-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600",
        className
      )}
      onClick={onClick}
      type="button"
      {...props}
    >
      {children}
      {selected && (
        <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-lg text-white shadow-lg">
          <Check className="h-4 w-4" />
        </div>
      )}
    </button>
  );
}
