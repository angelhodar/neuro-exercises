"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormField } from "@/components/ui/form";
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireChoice,
  QuestionnaireChoiceDescription,
  QuestionnaireChoices,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire";
import type {
  AskUserQuestionInput,
  AskUserQuestionOutput,
} from "@/lib/schemas/exercise-refinement";

const questionAnswerSchema = z
  .object({
    freeText: z.string().trim().max(1000),
    selected: z.array(z.string()).max(4),
  })
  .refine(
    (answer) => answer.selected.length > 0 || answer.freeText.length > 0,
    {
      message: "Selecciona una opción o escribe una respuesta",
      path: ["selected"],
    }
  );
type QuestionAnswerForm = z.infer<typeof questionAnswerSchema>;

export function QuestionAnswer({ answer }: { answer: AskUserQuestionOutput }) {
  return (
    <div className="flex flex-wrap gap-2">
      {answer.selected.map((selection) => (
        <span
          className="rounded-full bg-blue-100 px-2.5 py-1 font-medium text-blue-800 text-xs"
          key={selection}
        >
          {selection}
        </span>
      ))}
      {answer.freeText ? (
        <p className="w-full whitespace-pre-wrap text-sm">{answer.freeText}</p>
      ) : null}
    </div>
  );
}

export function QuestionCard({
  disabled,
  input,
  onAnswer,
}: {
  disabled: boolean;
  input: AskUserQuestionInput;
  onAnswer: (answer: AskUserQuestionOutput) => void;
}) {
  const form = useForm<QuestionAnswerForm>({
    defaultValues: { freeText: "", selected: [] },
    resolver: zodResolver(questionAnswerSchema),
  });
  const selected = form.watch("selected");
  const freeText = form.watch("freeText");
  const error =
    form.formState.errors.selected?.message ??
    form.formState.errors.freeText?.message;

  function toggleSelection(label: string, checked: boolean) {
    let nextSelected: string[] = [];
    if (input.multiSelect) {
      nextSelected = checked
        ? [...selected, label]
        : selected.filter((selection) => selection !== label);
    } else if (checked) {
      nextSelected = [label];
    }
    form.setValue("selected", nextSelected, { shouldValidate: true });
  }

  function submitAnswer(answer: QuestionAnswerForm) {
    onAnswer({
      freeText: answer.freeText || undefined,
      selected: answer.selected,
    });
  }

  return (
    <Card className="border-blue-100 bg-white shadow-sm" size="sm">
      <CardContent>
        <Form {...form}>
          <Questionnaire
            items={[
              {
                choices: input.options?.map((option) => ({
                  disabled,
                  value: option.label,
                })),
                name: "answer",
              },
            ]}
            onSubmit={form.handleSubmit(submitAnswer)}
            shortcuts="letters"
          >
            <QuestionnaireItem
              invalid={Boolean(error)}
              multiple={input.multiSelect}
              name="answer"
            >
              <QuestionnaireTitle>{input.question}</QuestionnaireTitle>
              <QuestionnaireDescription>
                Puedes elegir una opción, escribir un matiz o combinar ambas.
              </QuestionnaireDescription>
              <QuestionnaireChoices>
                {input.options?.map((option) => (
                  <QuestionnaireChoice
                    checked={selected.includes(option.label)}
                    disabled={disabled}
                    key={option.label}
                    onChange={(event) =>
                      toggleSelection(option.label, event.currentTarget.checked)
                    }
                    value={option.label}
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description ? (
                      <QuestionnaireChoiceDescription>
                        {option.description}
                      </QuestionnaireChoiceDescription>
                    ) : null}
                  </QuestionnaireChoice>
                ))}
                <FormField
                  control={form.control}
                  name="freeText"
                  render={({ field }) => (
                    <QuestionnaireInput
                      {...field}
                      aria-label="Añadir una respuesta personalizada"
                      disabled={disabled}
                      placeholder={
                        input.options
                          ? "Añade un matiz o escribe otra respuesta..."
                          : "Escribe tu respuesta..."
                      }
                    />
                  )}
                />
              </QuestionnaireChoices>
              <QuestionnaireError>{error}</QuestionnaireError>
            </QuestionnaireItem>
            <QuestionnaireActions>
              <Button
                className="col-start-3 justify-self-end"
                disabled={
                  disabled || (selected.length === 0 && freeText.trim() === "")
                }
                onClick={form.handleSubmit(submitAnswer)}
                type="button"
              >
                Continuar
                <ArrowRight />
              </Button>
            </QuestionnaireActions>
          </Questionnaire>
        </Form>
      </CardContent>
    </Card>
  );
}
