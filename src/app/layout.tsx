import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COCO — Studia con le orecchie",
  description:
    "Trasforma appunti e sbobine in spiegazioni semplici da ascoltare. Ideale per studenti con DSA.",
  keywords: ["studio", "DSA", "dislessia", "appunti", "audio", "semplificazione"],
  openGraph: {
    title: "COCO",
    description: "I tuoi appunti, semplici da ascoltare",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="antialiased">{children}</body>
    </html>
  );
}