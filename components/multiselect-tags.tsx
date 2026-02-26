"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

async function fetchTags(query: string): Promise<string[]> {
  const res = await fetch(`/api/media/tags?query=${query}`);
  if (!res.ok) {
    throw new Error("Network error");
  }
  return res.json();
}

export interface MultiSelectTagsProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  className?: string;
  placeholder?: string;
}

export default function MultiSelectTags({
  value = [],
  onChange,
  className,
  placeholder = "Buscar etiquetas...",
}: MultiSelectTagsProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedQuery = useDebounce(inputValue, 400);
  const anchor = useComboboxAnchor();

  const {
    data: tags = [],
    error,
    isLoading,
  } = useQuery<string[]>({
    queryKey: ["tags", debouncedQuery],
    queryFn: () => fetchTags(debouncedQuery),
  });

  // Merge selected values with search results so selected items are always available
  const items = useMemo(() => {
    const merged = [...tags];
    for (const tag of value) {
      if (!tags.includes(tag)) {
        merged.push(tag);
      }
    }
    return merged;
  }, [tags, value]);

  return (
    <Combobox
      filter={null}
      items={items}
      multiple
      onInputValueChange={(nextInputValue) => {
        setInputValue(nextInputValue);
      }}
      onValueChange={(nextValues: string[]) => {
        onChange?.(nextValues);
      }}
      value={value}
    >
      <ComboboxChips className={cn(className)} ref={anchor}>
        <ComboboxValue>
          {(selectedValues: string[]) => (
            <>
              {selectedValues.map((tag) => (
                <ComboboxChip key={tag}>{tag}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={selectedValues.length > 0 ? "" : placeholder}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        {isLoading && items.length === 0 && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && (
          <div className="py-2 text-center text-destructive text-sm">
            Error al buscar etiquetas
          </div>
        )}
        <ComboboxEmpty>
          {isLoading || error ? null : "Sin resultados"}
        </ComboboxEmpty>
        <ComboboxList>
          {(tag: string) => (
            <ComboboxItem key={tag} value={tag}>
              {tag}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
