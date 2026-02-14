"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X, ArrowUp, Loader2 } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  createExerciseSchema,
  CreateExerciseSchema,
} from "@/lib/schemas/exercises";
import { createExercise } from "@/app/actions/exercises";

export default function CreateExercisePage() {
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
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
      if (!created) throw new Error("Failed to create exercise");
      router.push(`/dashboard/exercises/${created.slug}`);
    } catch (e) {
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
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-8 tracking-tight">
            ¿Qué ejercicio quieres crear?
          </h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Describe el ejercicio que quieres crear..."
                          className="w-full min-h-48 p-4 text-lg border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder:text-blue-400 resize-none leading-relaxed"
                          rows={8}
                          {...field}
                        />

                        {/* Action Buttons */}
                        <div className="absolute bottom-2 right-2 flex gap-2">
                          {/* Image Upload Button */}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="image-upload"
                          />
                          <label htmlFor="image-upload">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-10 w-10 p-0 border-blue-300 hover:bg-blue-50 hover:border-blue-400 transition-colors duration-200 bg-white shadow-sm rounded-full"
                              render={<div className="cursor-pointer" />}
                            >
                                <ImagePlus className="w-5 h-5 text-blue-600" />
                            </Button>
                          </label>

                          {/* Submit Button */}
                          <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="h-10 w-10 p-0 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-full shadow-sm"
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <ArrowUp className="w-5 h-5" />
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
                <div className="relative rounded-xl overflow-hidden border border-blue-200">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors duration-200 shadow-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-600 text-sm">{error}</div>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
