import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guía Restaurante Rentable — Content OS",
  description: "Centro interno para planificar, publicar y medir contenido."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
