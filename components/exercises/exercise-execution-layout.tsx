"use client";

import { PropsWithChildren } from "react";
import { ExerciseProgress } from "./exercise-progress-bar";
import { ExerciseContainer } from "./exercise-container";
import { ExerciseControls } from "./exercise-controls";
import { ExerciseAudioButton } from "./exercise-audio-button";
import { ExerciseFullscreenButton } from "./exercise-fullscreen-button";
import { ExerciseFlowButton } from "./exercise-flow-button";
import { CountdownProvider } from "./exercise-countdown";

export default function ExerciseExecutionLayout({
  children,
}: PropsWithChildren) {
  return (
    <div className="flex flex-col overflow-hidden w-full h-full container mx-auto max-w-7xl">
      <CountdownProvider>
        <ExerciseProgress />
        <ExerciseContainer>{children}</ExerciseContainer>
        <ExerciseControls>
          <ExerciseAudioButton />
          <ExerciseFullscreenButton />
          <ExerciseFlowButton />
        </ExerciseControls>
      </CountdownProvider>
    </div>
  );
}
