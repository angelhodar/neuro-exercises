"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
// biome-ignore lint/performance/noNamespaceImport: motion uses namespace proxy for motion.div, motion.span etc.
import * as motion from "motion/react-client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const waitlistSchema = z.object({
  email: z.email("Introduce un email válido"),
});

type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export default function CtaSection() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<WaitlistFormValues>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (_values: WaitlistFormValues) => {
    setSubmitted(true);
  };

  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-32 lg:px-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-blue-50 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 font-mono text-blue-500 text-xs uppercase tracking-widest shadow-sm">
            Empieza hoy
          </div>

          <h2 className="font-(family-name:--font-display) mb-6 font-bold text-3xl text-slate-900 leading-tight sm:text-4xl md:text-5xl lg:text-7xl">
            Transforma tu
            <br />
            <span className="bg-linear-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              práctica clínica
            </span>
          </h2>

          <p className="mx-auto mb-12 max-w-2xl text-lg text-slate-600 leading-relaxed sm:text-xl">
            Únete a los profesionales de neurología que ya usan NeuroGranada
            para crear rehabilitación cognitiva de vanguardia. Sin curva de
            aprendizaje, sin límites creativos.
          </p>

          {submitted ? (
            <div className="fade-in mx-auto flex max-w-md animate-in items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-6 py-5 duration-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                <ArrowRight className="h-4 w-4 text-white" />
              </div>
              <p className="text-blue-700 text-sm leading-snug">
                ¡Apuntado! Te avisaremos en cuanto tengas acceso.
              </p>
            </div>
          ) : (
            <Form {...form}>
              <form
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          className="h-auto rounded-xl border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100"
                          placeholder="tu@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="h-auto rounded-xl bg-blue-600 px-6 py-3.5 shadow-blue-200 shadow-lg hover:bg-blue-700 hover:shadow-blue-200 hover:shadow-xl"
                  type="submit"
                >
                  Unirse
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </Form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
