"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { categoryDisplayNames, categories } from "@/lib/medias/generate";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Props {
    selectedCategory: string;
}

export default function CategoryFilter({ selectedCategory }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();

    function handleChange(value: string) {
        const params = new URLSearchParams(searchParams.toString());
        if (value === "all") params.delete("category");
        else params.set("category", value);
        router.push(`?${params.toString()}`);
    }

    return (
        <Select value={selectedCategory || "all"} onValueChange={handleChange}>
            <SelectTrigger className="w-56">
                <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{categoryDisplayNames[cat]}</SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
} 