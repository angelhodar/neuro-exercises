"use client";

import { ArrowRight, Delete } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";

const NON_DIGIT_REGEX = /\D/;

interface NumericPadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function NumericPad({
  value,
  onChange,
  onSubmit,
  inputRef,
}: NumericPadProps) {
  function handleDigitClick(digit: string) {
    onChange(value + digit);
  }

  function handleClear() {
    onChange("");
  }

  return (
    <form
      className="flex w-full max-w-xs flex-col items-center gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <input
        className="w-full rounded-md border bg-background p-2 text-center text-xl"
        onChange={(e) => onChange(e.target.value.replace(NON_DIGIT_REGEX, ""))}
        ref={inputRef}
        type="text"
        value={value}
      />

      <div className="grid w-full grid-cols-3 gap-3">
        {[
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "Borrar",
          "0",
          "Enviar",
        ].map((key) => {
          if (key === "Borrar") {
            return (
              <Button
                className="h-16 text-lg"
                key="clear"
                onClick={handleClear}
                type="button"
                variant="secondary"
              >
                <Delete className="h-8 w-8" />
              </Button>
            );
          }
          if (key === "Enviar") {
            return (
              <Button className="h-16 text-lg" key="submit" type="submit">
                <ArrowRight className="h-8 w-8" />
              </Button>
            );
          }
          return (
            <Button
              className="h-16 text-xl"
              key={key}
              onClick={() => handleDigitClick(key)}
              type="button"
              variant="outline"
            >
              {key}
            </Button>
          );
        })}
      </div>
    </form>
  );
}
