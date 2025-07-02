import type { PropsWithChildren } from "react";
import Providers from "@/app/dashboard/providers";

export default function ExerciseLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen w-screen bg-blue-50 p-2 overflow-y-auto">
        {children}
      </div>
    </Providers>
  );
}
