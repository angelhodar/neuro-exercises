import type { PropsWithChildren } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen flex-col bg-blue-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
