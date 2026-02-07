import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { db } from "@/lib/db";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: "RunningLabs",
  description: "Athletic Intelligence Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const athlete = await db.query.athletes.findFirst({
    where: (t, { eq }) => eq(t.id, "default_athlete")
  });

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Shell athlete={athlete}>
          {children}
        </Shell>
      </body>
    </html>
  );
}
