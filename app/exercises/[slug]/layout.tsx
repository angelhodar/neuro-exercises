import type { PropsWithChildren } from "react";
import Providers from "@/app/dashboard/providers";

export default function ExerciseLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <div className="flex h-dvh w-full flex-col bg-blue-50 p-2">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {children}
        </div>
      </div>
    </Providers>
  );
}
