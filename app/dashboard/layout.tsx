import type { PropsWithChildren } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import Providers from "./providers";

export default function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <Providers>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-screen">
          <div className="flex h-full flex-col">
            <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
            </header>
            <div className="flex min-h-0 w-full flex-1 flex-col gap-4 p-4">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Providers>
  );
}
