"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface ConfirmOptions {
  title: string;
  description: string;
}

interface ConfirmContextProps {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

interface PendingPromise {
  resolve: (value: boolean) => void;
  reject: (reason?: any) => void;
}

const ConfirmContext = createContext<ConfirmContextProps | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions>({ title: "", description: "" });
  const [pendingPromise, setPendingPromise] = useState<PendingPromise | null>(null);

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      setOptions(options);
      setPendingPromise({ resolve, reject });
    });
  };

  const handleConfirm = () => {
    if (pendingPromise) {
      pendingPromise.resolve(true);
      setPendingPromise(null);
    }
  };

  const handleCancel = () => {
    if (pendingPromise) {
      pendingPromise.resolve(false);
      setPendingPromise(null);
    }
  };

  const isOpen = !!pendingPromise;

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options.title}</AlertDialogTitle>
            <AlertDialogDescription>{options.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }

  return context;
} 