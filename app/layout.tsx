import type { Metadata } from "next";
import { Fraunces, Karla } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
});

export const metadata: Metadata = {
  title: "Rytm",
  description: "Logga enkelt. Bygg historik. Se din utveckling.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sv" className={`${fraunces.variable} ${karla.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
