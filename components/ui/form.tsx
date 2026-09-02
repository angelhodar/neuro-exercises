"use client";

import {
  type ComponentPropsWithoutRef,
  cloneElement,
  createContext,
  type HTMLAttributes,
  type ReactElement,
  type RefObject,
  useContext,
  useId,
} from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName;
}

const FormFieldContext = createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
);

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext);
  const itemContext = useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    formDescriptionId: `${id}-form-item-description`,
    formItemId: `${id}-form-item`,
    formMessageId: `${id}-form-item-message`,
    id,
    name: fieldContext.name,
    ...fieldState,
  };
};

interface FormItemContextValue {
  id: string;
}

const FormItemContext = createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  ref?: RefObject<HTMLDivElement | null>;
}) => {
  const id = useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} ref={ref} {...props} />
    </FormItemContext.Provider>
  );
};
FormItem.displayName = "FormItem";

const FormLabel = ({
  className,
  ref,
  ...props
}: ComponentPropsWithoutRef<"label"> & {
  ref?: RefObject<HTMLLabelElement | null>;
}) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      ref={ref}
      {...props}
    />
  );
};
FormLabel.displayName = "FormLabel";

function FormControl({
  children,
}: {
  children: ReactElement<Record<string, unknown>>;
}) {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return cloneElement(children, {
    "aria-describedby": error
      ? `${formDescriptionId} ${formMessageId}`
      : formDescriptionId,
    "aria-invalid": !!error,
    id: formItemId,
  } as Record<string, unknown>);
}
FormControl.displayName = "FormControl";

const FormDescription = ({
  className,
  ref,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  ref?: RefObject<HTMLParagraphElement | null>;
}) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      className={cn("text-muted-foreground text-sm", className)}
      id={formDescriptionId}
      ref={ref}
      {...props}
    />
  );
};
FormDescription.displayName = "FormDescription";

const FormMessage = ({
  className,
  children,
  ref,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  ref?: RefObject<HTMLParagraphElement | null>;
}) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      className={cn("font-medium text-destructive text-sm", className)}
      id={formMessageId}
      ref={ref}
      {...props}
    >
      {body}
    </p>
  );
};
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
};
