import type { PropsWithChildren } from "react";

export default function ExerciseSessionLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-blue-50">
      <main className="flex-1">{children}</main>
    </div>
  );
}
