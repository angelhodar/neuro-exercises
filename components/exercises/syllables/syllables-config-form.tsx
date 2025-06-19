"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExerciseBaseFields } from "@/components/exercises/exercise-base-fields";
import { ExerciseConfigPresetSelector } from "@/components/exercises/exercise-config-preset-selector";
import {
  syllablesConfigSchema,
  defaultSyllablesConfig,
  syllablesPresets,
  type SyllablesConfig,
} from "./syllables-schema";

interface SyllablesConfigFormProps {
  defaultConfig?: Partial<SyllablesConfig>;
  onSubmit?: (config: SyllablesConfig) => void;
}

interface SyllablesConfigFieldsProps {
  basePath?: string;
}

export function SyllablesConfigFields(props: SyllablesConfigFieldsProps) {
  const { basePath = "" } = props;
  const { control } = useFormContext();

  const syllablesCountPath = `${basePath}syllablesCount`;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={syllablesCountPath}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Número de Sílabas</FormLabel>
            <Select
              onValueChange={(value) => field.onChange(Number.parseInt(value))}
              defaultValue={field.value?.toString()}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el número de sílabas" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="3">3 sílabas</SelectItem>
                <SelectItem value="4">4 sílabas</SelectItem>
                <SelectItem value="5">5 sílabas</SelectItem>
                <SelectItem value="6">6 sílabas</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Las palabras tendrán esta cantidad de sílabas
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

export function SyllablesConfigForm({
  defaultConfig,
  onSubmit,
}: SyllablesConfigFormProps) {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(syllablesConfigSchema),
    defaultValues: {
      ...defaultSyllablesConfig,
      ...defaultConfig,
    },
  });

  function handleSubmit(data: SyllablesConfig) {
    try {
      const validatedData = syllablesConfigSchema.parse(data);
      if (onSubmit) {
        onSubmit(validatedData);
        return;
      }
      const params = new URLSearchParams();
      params.set("config", JSON.stringify(validatedData));
      router.push(`?${params.toString()}`);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Sílabas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <ExerciseConfigPresetSelector presets={syllablesPresets} />
            <Separator />
            <ExerciseBaseFields />
            <Separator />
            <SyllablesConfigFields />
            <Separator />
            <div className="flex justify-end">
              <Button type="submit">Comenzar Ejercicio</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
