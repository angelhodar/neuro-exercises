"use client";

import { Fragment, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { Exercise } from "@/lib/db/schema";
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
    if (!open) setSearchTerm("");
  };

  return (
    <Fragment>
      <Button
        type="button"
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir ejercicio
      </Button>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="lg:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Añadir ejercicio</DialogTitle>
            <DialogDescription>
              Elige un ejercicio para añadir a tu plantilla
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2 mt-4">
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar ejercicio..."
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 max-h-[600px]">
              {filteredExercises.map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise}>
                  <Button
                    type="button"
                    onClick={() => handleAddExercise(exercise)}
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir
                  </Button>
                </ExerciseCard>
              ))}
            </div>
            {filteredExercises.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>
                  No se han encontrado ejercicios que coincidan con "
                  {searchTerm}"
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Fragment>
  );
}
