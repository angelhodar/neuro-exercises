"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PropsWithChildren } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  type ClientAssets,
  useExerciseAssetsLoader,
} from "@/hooks/use-exercise-assets-loader";
import type { ExerciseConfigPreset } from "@/lib/db/schema";

interface ExerciseConfigFormProps extends PropsWithChildren {
  slug: string;
  title: string;
  exerciseId?: number;
  presets?: ExerciseConfigPreset[];
  onSubmit?: (config: Record<string, unknown>) => void;
}

interface ExerciseConfigFormContentProps extends ExerciseConfigFormProps {
  assets: ClientAssets;
}

// Content component that only renders when assets are loaded
function ExerciseConfigFormContent({
  slug,
  title,
  exerciseId,
  presets,
  assets,
  onSubmit,
  children,
}: ExerciseConfigFormContentProps) {
  const router = useRouter();
  const { configSchema, defaultConfig, ConfigFieldsComponent } = assets;

  const form = useForm<z.infer<typeof configSchema>>({
    resolver: zodResolver(configSchema),
    defaultValues: defaultConfig,
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
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(handleSubmit)}
          >
            {exerciseId && presets && (
              <>
                <ExerciseConfigPresetSelector
                  exerciseId={exerciseId}
                  initialPresets={presets}
                />
                <Separator />
              </>
            )}

            <ExerciseBaseFields
              hasIntrinsicGoal={!defaultConfig.endConditionType}
            />
            <Separator />

            {children || <ConfigFieldsComponent />}
            <Separator />

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
      <Card className="mx-auto w-full max-w-2xl">
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
      <Card className="mx-auto w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center">
            <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin" />
            <div className="text-gray-600">
              Loading exercise configuration...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!assets) {
    return null;
  }

  return (
    <ExerciseConfigFormContent {...rest} assets={assets} slug={slug}>
      {children}
    </ExerciseConfigFormContent>
  );
}
