"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createPatientTest } from "@/app/actions/patients";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
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
import { EVALUATED_PROCESS_LABELS, EVALUATED_PROCESSES } from "../constants";

const createTestSchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  evaluatedProcess: z.string().min(1, "El proceso evaluado es obligatorio"),
  testName: z.string().optional(),
  score: z.string().optional(),
  observations: z.string().optional(),
});

type CreateTestFormValues = z.infer<typeof createTestSchema>;

interface CreateTestButtonProps {
  patientId: number;
}

export default function CreateTestButton({ patientId }: CreateTestButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateTestFormValues>({
    resolver: zodResolver(createTestSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      evaluatedProcess: "",
      testName: "",
      score: "",
      observations: "",
    },
  });

  const onSubmit = async (data: CreateTestFormValues) => {
    setIsLoading(true);
    try {
      await createPatientTest({
        patientId,
        date: new Date(data.date),
        evaluatedProcess: data.evaluatedProcess,
        testName: data.testName || null,
        score: data.score || null,
        observations: data.observations || null,
        sessionId: null,
      });
      toast.success("Test creado exitosamente");
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error("Error creating test:", error);
      toast.error("Error al crear el test");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger render={<Button size="sm" />}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo test
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuevo test</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha *</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="evaluatedProcess"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proceso evaluado *</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar proceso" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EVALUATED_PROCESSES.map((process) => (
                          <SelectItem
                            key={process}
                            label={EVALUATED_PROCESS_LABELS[process]}
                            value={process}
                          >
                            {EVALUATED_PROCESS_LABELS[process]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="testName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del test</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Ej: Trail Making Test A"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="score"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Puntuación</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Ej: 85"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Observaciones del test..."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                disabled={isLoading}
                onClick={() => setOpen(false)}
                type="button"
                variant="outline"
              >
                Cancelar
              </Button>
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear test"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
