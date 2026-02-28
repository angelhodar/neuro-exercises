"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";

export default function MediaSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("q") || "";
  const [search, setSearch] = useState(currentSearch);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      router.push(`?q=${encodeURIComponent(debouncedSearch.trim())}`);
    } else {
      router.push("/dashboard/media");
    }
  }, [debouncedSearch, router]);

  return (
    <div className="relative w-64">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pr-10 pl-10"
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar por nombre..."
        value={search}
      />
      {search && (
        <Button
          className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
          onClick={() => setSearch("")}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
