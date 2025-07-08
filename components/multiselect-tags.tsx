"use client";

import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { useQuery } from "@tanstack/react-query";
import { MultiAsyncSelect } from "@/components/multi-async-select";

// Async fetcher for tags
async function fetchTags(query: string): Promise<string[]> {
  const res = await fetch(`/api/media/tags?query=${query}`);
  if (!res.ok) throw new Error("Network error");
  return res.json();
}

export interface MultiSelectTagsProps {
  value?: string[];
  onChange?: (tags: string[]) => void;
  className?: string;
  placeholder?: string;
}

export default function MultiSelectTags(props: MultiSelectTagsProps) {
  const { value = [], onChange, ...rest } = props;

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);

  const {
    data: tags = [],
    error,
    isLoading,
  } = useQuery<string[]>({
    queryKey: ["tags", debouncedQuery],
    queryFn: () => fetchTags(debouncedQuery),
  });

  const handleSearch = (val: string) => setQuery(val.trim());

  const options = [...new Set([...value, ...tags])].map((tag) => ({
    label: tag,
    value: tag,
  }));

  return (
    <MultiAsyncSelect
      loading={isLoading}
      error={error}
      options={options}
      value={value}
      onValueChange={(values) => onChange?.(values)}
      onSearch={handleSearch}
      searchPlaceholder="Buscar etiquetas..."
      async
      {...rest}
    />
  );
}
