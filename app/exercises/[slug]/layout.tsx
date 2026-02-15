import type { PropsWithChildren } from "react";
import Providers from "@/app/dashboard/providers";

export default function ExerciseLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <div className="flex min-h-screen w-screen flex-col overflow-y-auto bg-blue-50 p-2">
        {children}
      </div>
    </Providers>
  );
}
