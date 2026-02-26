"use client";

import {
  type KeyboardEvent,
  type Ref,
  useCallback,
  useRef,
  useState,
} from "react";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/utils";

interface TagsInputProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

function TagsInput({
  value = [],
  onValueChange,
  placeholder = "Añadir etiqueta...",
  disabled = false,
  className,
  ref,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !value.includes(trimmed)) {
        onValueChange?.([...value, trimmed]);
      }
      setInputValue("");
    },
    [value, onValueChange]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onValueChange?.(value.filter((tag) => tag !== tagToRemove));
    },
    [value, onValueChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addTag(inputValue);
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        value.length > 0
      ) {
        removeTag(value[value.length - 1]);
      }
    },
    [inputValue, value, addTag, removeTag]
  );

  return (
    <div
      className={cn(
        "flex min-h-9 flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
      data-slot="tags-input"
      onClick={() => inputRef.current?.focus()}
      ref={ref}
    >
      {value.map((tag) => (
        <Tag disabled={disabled} key={tag} onRemove={() => removeTag(tag)}>
          {tag}
        </Tag>
      ))}
      <input
        className="min-w-16 flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
        data-slot="tags-input-field"
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        ref={inputRef}
        value={inputValue}
      />
    </div>
  );
}

export { TagsInput };
export type { TagsInputProps };
