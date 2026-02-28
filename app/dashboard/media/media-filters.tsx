"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MediaSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("q") || "";
  const [value, setValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        router.push(`?q=${encodeURIComponent(trimmed)}`);
      } else if (currentSearch) {
        router.push("/dashboard/media");
      }
    }, 400);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value, router, currentSearch]);

  const clear = () => {
    setValue("");
    router.push("/dashboard/media");
  };

  return (
    <div className="relative w-64">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pr-10 pl-10"
        onChange={(e) => setValue(e.target.value)}
        placeholder="Buscar contenido..."
        value={value}
      />
      {value && (
        <Button
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          onClick={clear}
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
