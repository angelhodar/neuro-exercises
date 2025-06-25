"use client";

import {
  createContext,
  useContext,
  useRef,
  useEffect,
  useState,
  PropsWithChildren
} from "react";
import { useExerciseExecution } from "@/hooks/use-exercise-execution";

interface CountdownContextType {
  countdown: number;
  startCountdown: (initial: number) => void;
}

const CountdownContext = createContext<CountdownContextType | undefined>(
  undefined
);

export function useCountdown() {
  const context = useContext(CountdownContext);

  if (!context) {
    throw new Error("useCountdown debe usarse dentro de un CountdownProvider");
  }

  return context;
}

export function CountdownProvider({ children }: PropsWithChildren) {
  const { startExercise } = useExerciseExecution();
  const [countdown, setCountdown] = useState<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startCountdown = (initial: number) => {
    setCountdown(initial);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          startExercise();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <CountdownContext.Provider value={{ countdown, startCountdown }}>
      {children}
    </CountdownContext.Provider>
  );
}

export function CountdownDisplay({ children }: PropsWithChildren) {
  const { countdown } = useCountdown();

  if (countdown > 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
        <div className="text-8xl font-bold text-blue-600 animate-pulse">
          {countdown}
        </div>
      </div>
    );
  }

  return children;
}
