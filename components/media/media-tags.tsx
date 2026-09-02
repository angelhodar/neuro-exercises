"use client";

import type { Ref } from "react";
import { TagsInput } from "@/components/ui/tags-input";

interface MediaTagsInputProps {
  className?: string;
  disabled?: boolean;
  onChange?: (value: string[]) => void;
  placeholder?: string;
  ref?: Ref<HTMLDivElement>;
  value?: string[];
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
