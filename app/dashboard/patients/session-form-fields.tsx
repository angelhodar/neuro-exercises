"use client";

import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  DISCIPLINE_LABELS,
  DISCIPLINES,
  SESSION_TYPE_LABELS,
  SESSION_TYPES,
} from "./constants";
import type { SessionFormValues } from "./session-form-schema";

const sessionTypes = SESSION_TYPES.map((type) => ({
  label: SESSION_TYPE_LABELS[type],
  value: type,
}));
const disciplines = DISCIPLINES.map((discipline) => ({
  label: DISCIPLINE_LABELS[discipline],
  value: discipline,
}));

export function SessionFormFields({ disabled }: { disabled: boolean }) {
  const { control } = useFormContext<SessionFormValues>();

  return (
    <div className="grid gap-4 py-4">
      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Fecha *</FormLabel>
            <FormControl>
              <Input disabled={disabled} type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de sesión *</FormLabel>
              <Select
                disabled={disabled}
                items={sessionTypes}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sessionTypes.map(({ label, value }) => (
                    <SelectItem key={value} label={label} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="discipline"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Disciplina *</FormLabel>
              <Select
                disabled={disabled}
                items={disciplines}
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccionar disciplina" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {disciplines.map(({ label, value }) => (
                    <SelectItem key={value} label={label} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={control}
        name="observations"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observaciones</FormLabel>
            <FormControl>
              <Textarea
                disabled={disabled}
                placeholder="Observaciones de la sesión..."
                rows={4}
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
