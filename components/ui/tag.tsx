import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "flex h-[calc(var(--spacing)*5.5)] w-fit items-center justify-center gap-1 whitespace-nowrap rounded-sm px-1.5 font-medium text-sm",
  {
    variants: {
      variant: {
        default:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        secondary: "bg-muted text-foreground",
        destructive:
          "bg-destructive/10 text-destructive dark:bg-destructive/20",
        outline: "border border-input bg-transparent text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface TagProps extends VariantProps<typeof tagVariants> {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onRemove?: () => void;
}

function Tag({
  children,
  className,
  variant = "default",
  disabled,
  onRemove,
}: TagProps) {
  return (
    <span
      className={cn(
        tagVariants({ variant }),
        disabled && "pointer-events-none opacity-50",
        className
      )}
      data-slot="tag"
    >
      {children}
      {onRemove && !disabled && (
        <button
          aria-label="Remove"
          className="-ml-0.5 inline-flex cursor-pointer items-center justify-center rounded-sm opacity-50 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          type="button"
        >
          <X className="size-3" />
        </button>
      )}
    </span>
  );
}

export { Tag, tagVariants };
export type { TagProps };
