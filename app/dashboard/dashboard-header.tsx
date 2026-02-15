import type { PropsWithChildren } from "react";

export function DashboardHeader({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      {children}
    </div>
  );
}

export function DashboardHeaderTitle({ children }: PropsWithChildren) {
  return <h1 className="font-bold text-3xl tracking-tight">{children}</h1>;
}

export function DashboardHeaderDescription({ children }: PropsWithChildren) {
  return <p className="text-muted-foreground">{children}</p>;
}

export function DashboardHeaderActions({ children }: PropsWithChildren) {
  return <div className="flex items-end gap-2">{children}</div>;
}
