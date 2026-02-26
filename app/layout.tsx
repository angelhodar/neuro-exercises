import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { PropsWithChildren } from "react";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "NeuroGranada - Plataforma de Ejercicios Neurológicos",
  description:
    "Ejercicios interactivos para personas con problemas neurológicos",
};

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
