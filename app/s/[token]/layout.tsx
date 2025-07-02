import { PropsWithChildren } from "react";

export default function ExerciseSessionLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <main className="flex-1">{children}</main>
    </div>
  );
}
