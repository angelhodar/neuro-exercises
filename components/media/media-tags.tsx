"use client";

import type { Ref } from "react";
import { TagsInput } from "@/components/ui/tags-input";

interface MediaTagsInputProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function MediaTagsInput({
  value = [],
  onChange,
  placeholder = "Escribe una etiqueta y presiona Enter",
  disabled = false,
  className,
  ref,
}: MediaTagsInputProps) {
  return (
    <TagsInput
      className={className}
      disabled={disabled}
      onValueChange={onChange}
      placeholder={placeholder}
      ref={ref}
      value={value}
    />
  );
}
