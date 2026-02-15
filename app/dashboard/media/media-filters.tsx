"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Filter, Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MultiSelectTags from "@/components//multiselect-tags";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const filterSchema = z.object({
  search: z.string(),
  tags: z.array(z.string()),
});

type FilterFormValues = z.infer<typeof filterSchema>;

export default function MediaFilters() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("q") || "";
  const currentTags = searchParams.getAll("tags") || [];

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: currentSearch,
      tags: currentTags,
    },
  });

  const onSubmit = (values: FilterFormValues) => {
    const params = new URLSearchParams();

    if (values.search.trim()) {
      params.set("q", values.search.trim());
    }

    if (values.tags.length > 0) {
      for (const tag of values.tags) {
        params.append("tags", tag);
      }
    }

    router.push(`?${params.toString()}`);
    setIsPopoverOpen(false);
  };

  const clearAllFilters = () => {
    form.reset({
      search: "",
      tags: [],
    });
    router.push("/dashboard/media");
    setIsPopoverOpen(false);
  };

  const filterCount = (currentSearch ? 1 : 0) + currentTags.length;

  return (
    <div className="flex gap-2">
      <Popover onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
        <PopoverTrigger render={<Button className="gap-2" variant="outline" />}>
          <Filter className="h-4 w-4" />
          Filtros
          {filterCount > 0 && (
            <Badge className="ml-1 px-1.5 py-0.5 text-xs" variant="secondary">
              {filterCount}
            </Badge>
          )}
        </PopoverTrigger>
        <PopoverContent align="end" className="max-w-xl p-4">
          <Form {...form}>
            {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: form elements legitimately handle onSubmit and onKeyDown */}
            <form
              className="space-y-4"
              onKeyDown={(e) =>
                e.key === "Enter" && form.handleSubmit(onSubmit)()
              }
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buscar</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                        <Input
                          className="pr-10 pl-10"
                          placeholder="Buscar por nombre..."
                          {...field}
                        />
                        {field.value && (
                          <Button
                            className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 transform p-0"
                            onClick={() => field.onChange("")}
                            size="sm"
                            type="button"
                            variant="ghost"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Etiquetas</FormLabel>
                    <FormControl>
                      <MultiSelectTags
                        className="w-full"
                        onChange={field.onChange}
                        placeholder="Seleccionar etiquetas..."
                        value={field.value}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2 border-t pt-2">
                <Button className="w-full" type="submit">
                  Aplicar filtros
                </Button>

                {(form.watch("search") || form.watch("tags")?.length > 0) && (
                  <Button
                    className="w-full"
                    onClick={clearAllFilters}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  );
}
