"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Search, X, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import MultiSelectTags from "@/components/ui/templates/multiselect-tags"
import { useRouter, useSearchParams } from "next/navigation"

const filterSchema = z.object({
  search: z.string(),
  tags: z.array(z.string()),
})

type FilterFormValues = z.infer<typeof filterSchema>

export default function MediaFilters() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSearch = searchParams.get("q") || ""
  const currentTags = searchParams.getAll("tags") || [] 

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      search: currentSearch,
      tags: currentTags,
    },
  })

  const onSubmit = (values: FilterFormValues) => {
    const params = new URLSearchParams()
    
    if (values.search.trim()) {
      params.set("q", values.search.trim())
    }
    
    if (values.tags.length > 0) {
      values.tags.forEach(tag => params.append("tags", tag))
    }
    
    router.push(`?${params.toString()}`)
    setIsPopoverOpen(false)
  }

  const clearAllFilters = () => {
    form.reset({
      search: "",
      tags: [],
    })
    router.push("/dashboard/media")
    setIsPopoverOpen(false)
  }

  const filterCount = (currentSearch ? 1 : 0) + currentTags.length

  return (
    <div className="flex gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
            {filterCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {filterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="max-w-xl p-4" align="end">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="search"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buscar</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Buscar por nombre..."
                          className="pl-10 pr-10"
                          {...field}
                        />
                        {field.value && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => field.onChange("")}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
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
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleccionar etiquetas..."
                        className="w-full"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="pt-2 border-t space-y-2">
                <Button type="submit" className="w-full">
                  Aplicar filtros
                </Button>

                {(form.watch("search") || form.watch("tags")?.length > 0) && (
                  <Button type="button" variant="ghost" size="sm" onClick={clearAllFilters} className="w-full">
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
    </div>
  )
}
