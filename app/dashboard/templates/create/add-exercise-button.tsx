"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Exercise } from "@/lib/db/schema";
import { ExerciseCard } from "./exercise-card";

interface AddExerciseButtonProps {
  exercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
}

export function AddExerciseButton(props: AddExerciseButtonProps) {
  const { exercises, onAddExercise } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredExercises = exercises.filter((exercise) =>
    exercise.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddExercise = (exercise: Exercise) => {
    onAddExercise(exercise);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchTerm("");
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        type="button"
        variant="outline"
      >
        <Plus className="mr-2 h-4 w-4" />
        Añadir ejercicio
      </Button>

      <Dialog onOpenChange={handleOpenChange} open={isOpen}>
        <DialogContent className="lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Añadir ejercicio</DialogTitle>
            <DialogDescription>
              Elige un ejercicio para añadir a tu plantilla
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="mt-4 space-y-2">
              <Input
                className="w-full"
                id="search"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ejercicio..."
                value={searchTerm}
              />
            </div>
            <div className="grid max-h-[600px] grid-cols-1 gap-4 overflow-y-auto pr-2 md:grid-cols-2 lg:grid-cols-3">
              {filteredExercises.map((exercise) => (
                <ExerciseCard exercise={exercise} key={exercise.id}>
                  <Button
                    className="w-full"
                    onClick={() => handleAddExercise(exercise)}
                    size="sm"
                    type="button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Añadir
                  </Button>
                </ExerciseCard>
              ))}
            </div>
            {filteredExercises.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">
                <p>
                  No se han encontrado ejercicios que coincidan con "
                  {searchTerm}"
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
