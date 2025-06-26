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
  startCountdown: () => void;
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

  const startCountdown = () => {
    setCountdown(3);

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) return prev - 1;
        if (intervalRef.current) clearInterval(intervalRef.current);
        return 0;
      });
    }, 1000);
  };

  useEffect(() => {
    if (countdown === 0 && intervalRef.current === null) return;

    if (countdown === 0) {
      startExercise();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [countdown, startExercise]);

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
