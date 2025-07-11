"use client";

import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import {
  useExerciseAssetsLoader,
  type ClientAssets,
} from "@/hooks/use-exercise-assets-loader";
import { Loader2 } from "lucide-react";

interface ExerciseConfigFormProps extends PropsWithChildren {
  slug: string;
  title: string;
  onSubmit?: (config: any) => void;
}

interface ExerciseConfigFormContentProps extends ExerciseConfigFormProps {
  assets: ClientAssets;
}

// Content component that only renders when assets are loaded
function ExerciseConfigFormContent({
  slug,
  title,
  assets,
  onSubmit,
  children,
}: ExerciseConfigFormContentProps) {
  const router = useRouter();
  const { configSchema, presets, ConfigFieldsComponent } = assets;

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: { automaticNextQuestion: true, ...presets?.easy },
  });

  function handleSubmit(data: z.infer<typeof configSchema>) {
    try {
      const validatedData = configSchema.parse(data);
      if (onSubmit) {
        onSubmit(validatedData);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validatedData));
      router.push(`/exercises/${slug}?${params.toString()}`);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {presets && (
              <>
                {/* Selector de presets */}
                <ExerciseConfigPresetSelector presets={presets} />
                <Separator />
              </>
            )}

            {/* Campos base comunes (totalQuestions, etc.) */}
            <ExerciseBaseFields />
            <Separator />

            {/* Campos específicos del ejercicio */}
            {children || <ConfigFieldsComponent />}
            <Separator />

            {/* Acciones */}
            <div className="flex justify-end">
              <Button type="submit">Comenzar</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Main wrapper component that handles loading states
export function ExerciseConfigForm({
  slug,
  children,
  ...rest
}: ExerciseConfigFormProps) {
  const { assets, isLoading, error } = useExerciseAssetsLoader(slug);

  if (error) {
    console.error(`Error loading assets for ${slug}:`, error);
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading exercise configuration
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            <div className="text-gray-600">
              Loading exercise configuration...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assets) return null;

  return (
    <ExerciseConfigFormContent {...rest} slug={slug} assets={assets}>
      {children}
    </ExerciseConfigFormContent>
  );
}
