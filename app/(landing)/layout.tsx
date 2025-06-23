import type { ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
