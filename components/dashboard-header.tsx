import { PropsWithChildren } from "react";

export function DashboardHeader({ children }: PropsWithChildren) {
  return (
    <div className="flex items-center justify-between border-b pb-4">
      {children}
    </div>
  );
}

export function DashboardHeaderTitle({ children }: PropsWithChildren) {
  return (
    <h1 className="text-3xl font-bold tracking-tight">{children}</h1>
  );
}

export function DashboardHeaderDescription({ children }: PropsWithChildren) {
  return (
    <p className="text-muted-foreground">{children}</p>
  );
}

export function DashboardHeaderActions({ children }: PropsWithChildren) {
  return <div className="flex gap-2 items-end">{children}</div>;
} 