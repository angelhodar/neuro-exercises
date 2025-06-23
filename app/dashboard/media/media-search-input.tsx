"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";

export default function MediaSearchInput() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 200);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearchTerm.trim()) {
      params.set("q", debouncedSearchTerm.trim());
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }, [debouncedSearchTerm, router, searchParams]);

  return (
    <Input
      placeholder="Buscar por nombre..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="max-w-2xl"
    />
  );
}
