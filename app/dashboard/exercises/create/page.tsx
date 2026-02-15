"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowUp, ImagePlus, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createExercise } from "@/app/actions/exercises";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  type CreateExerciseSchema,
  createExerciseSchema,
} from "@/lib/schemas/exercises";

export default function CreateExercisePage() {
  const [error, setError] = useState<string | null>(null);
  const [_selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<CreateExerciseSchema>({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: CreateExerciseSchema) => {
    setError(null);
    try {
      const created = await createExercise(values);
      if (!created) {
        throw new Error("Failed to create exercise");
      }
      router.push(`/dashboard/exercises/${created.slug}`);
    } catch (_e) {
      setError("Error creando el ejercicio. Por favor intenta nuevamente.");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-12 text-center">
          <h1 className="mb-8 font-bold text-4xl text-blue-900 tracking-tight md:text-5xl">
            ¿Qué ejercicio quieres crear?
          </h1>
        </div>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          className="min-h-48 w-full resize-none rounded-xl border-blue-200 p-4 text-lg leading-relaxed transition-all duration-200 placeholder:text-blue-400 focus:border-transparent focus:ring-2 focus:ring-blue-400"
                          placeholder="Describe el ejercicio que quieres crear..."
                          rows={8}
                          {...field}
                        />

                        {/* Action Buttons */}
                        <div className="absolute right-2 bottom-2 flex gap-2">
                          {/* Image Upload Button */}
                          <input
                            accept="image/*"
                            className="hidden"
                            id="image-upload"
                            onChange={handleImageUpload}
                            type="file"
                          />
                          <label htmlFor="image-upload">
                            <Button
                              className="h-10 w-10 rounded-full border-blue-300 bg-white p-0 shadow-sm transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50"
                              render={<div className="cursor-pointer" />}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <ImagePlus className="h-5 w-5 text-blue-600" />
                            </Button>
                          </label>

                          {/* Submit Button */}
                          <Button
                            className="h-10 w-10 rounded-full bg-blue-600 p-0 text-white shadow-sm transition-all duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={isSubmitting}
                            type="submit"
                          >
                            {isSubmitting ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <ArrowUp className="h-5 w-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative overflow-hidden rounded-xl border border-blue-200">
                  {/* biome-ignore lint/performance/noImgElement: data URL from FileReader cannot use next/image */}
                  <img
                    alt="Preview"
                    className="h-64 w-full object-cover"
                    height={256}
                    src={imagePreview || "/placeholder.svg"}
                    width={512}
                  />
                  <button
                    className="absolute top-3 right-3 rounded-full bg-red-500 p-2 text-white shadow-lg transition-colors duration-200 hover:bg-red-600"
                    onClick={removeImage}
                    type="button"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
