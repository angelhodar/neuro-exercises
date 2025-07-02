"use client"

import { PropsWithChildren } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { LazyMotion, domAnimation } from "motion/react"

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <Header />
      <main className="flex-1">
        <LazyMotion features={domAnimation}>
          {children}
        </LazyMotion>
      </main>
      <Footer />
    </div>
  );
}
