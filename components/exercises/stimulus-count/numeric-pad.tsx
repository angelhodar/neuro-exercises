"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Delete } from "lucide-react"

interface NumericPadProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  inputRef: React.RefObject<HTMLInputElement | null>
}

export function NumericPad({ value, onChange, onSubmit, inputRef }: NumericPadProps) {
  function handleDigitClick(digit: string) {
    onChange(value + digit)
  }

  function handleClear() {
    onChange("")
  }

  return (
    <form
      className="flex flex-col items-center gap-4 w-full max-w-xs"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/, ""))}
        className="w-full border rounded-md p-2 text-center text-xl bg-background"
      />

      <div className="grid grid-cols-3 gap-3 w-full">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "Borrar", "0", "Enviar"].map((key) => {
          if (key === "Borrar") {
            return (
              <Button
                key="clear"
                variant="secondary"
                onClick={handleClear}
                className="h-16 text-lg"
                type="button"
              >
                <Delete className="w-8 h-8" />
              </Button>
            )
          }
          if (key === "Enviar") {
            return (
              <Button key="submit" type="submit" className="h-16 text-lg">
                <ArrowRight className="w-8 h-8" />
              </Button>
            )
          }
          return (
            <Button
              key={key}
              variant="outline"
              onClick={() => handleDigitClick(key)}
              className="h-16 text-xl"
              type="button"
            >
              {key}
            </Button>
          )
        })}
      </div>
    </form>
  )
} 