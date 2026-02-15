"use client";

import { Check, ChevronRight } from "lucide-react";
import { type FC, Fragment } from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  title: string;
  description?: string;
  isCompleted?: boolean;
  isActive?: boolean;
}

const Step: FC<StepProps> = ({ title, description, isCompleted, isActive }) => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2",
            isCompleted && "border-primary bg-primary text-primary-foreground",
            !isCompleted && isActive && "border-primary",
            !(isCompleted || isActive) && "border-muted"
          )}
        >
          {isCompleted ? (
            <Check className="h-4 w-4" />
          ) : (
            <span className="font-medium text-sm">{title[0]}</span>
          )}
        </div>
      </div>
      <div className="ml-4">
        <p
          className={cn(
            "font-medium text-sm",
            isActive || isCompleted
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {title}
        </p>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
    </div>
  );
};

interface StepperProps {
  steps: Array<{ title: string; description?: string }>;
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        {steps.map((step, index) => (
          <Fragment key={step.title}>
            <Step
              description={step.description}
              isActive={index === currentStep}
              isCompleted={index < currentStep}
              title={step.title}
            />
            {index < steps.length - 1 && (
              <ChevronRight className="hidden text-muted-foreground md:block" />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
