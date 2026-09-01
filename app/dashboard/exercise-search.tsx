"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ExerciseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("q") || "";
  const [value, setValue] = useState(currentSearch);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const timeout = debounceRef.current;
    if (timeout !== null) {
      clearTimeout(timeout);
    }

    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim();
      if (trimmed) {
        router.push(`?q=${encodeURIComponent(trimmed)}`);
      } else if (currentSearch) {
        router.push("/dashboard");
      }
    }, 400);

    return () => {
      const cleanupTimeout = debounceRef.current;
      if (cleanupTimeout !== null) {
        clearTimeout(cleanupTimeout);
      }
    };
  }, [value, router, currentSearch]);

  const clear = useCallback(() => {
    setValue("");
    router.push("/dashboard");
  }, [router]);

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  }, []);

  return (
    <div className="relative w-64">
      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pr-10 pl-10"
        onChange={handleChange}
        placeholder="Buscar ejercicios..."
        value={value}
      />
      {value ? (
        <Button
          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
          onClick={clear}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
