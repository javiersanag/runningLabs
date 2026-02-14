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

import { getCurrentUser } from "@/lib/session";
import { Shell } from "@/components/layout/Shell";
import { Providers } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "Khronos",
  description: "Athletic Intelligence Platform",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const athleteData = await getCurrentUser();
  // Serialize for Client Components
  const athlete = athleteData ? JSON.parse(JSON.stringify(athleteData)) : null;

  if (!athlete) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <Shell athlete={athlete}>
            {children}
          </Shell>
        </Providers>
      </body>
    </html>
  );
}
