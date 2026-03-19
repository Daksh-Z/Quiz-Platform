import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar/Navbar";
import { MouseGlow } from "@/components/MouseGlow/MouseGlow";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BlitzQuiz Platform",
  description: "The ultimate aesthetic dynamic quiz experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body>
        <MouseGlow />
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
