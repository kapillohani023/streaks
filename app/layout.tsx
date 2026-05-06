import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/shared/Navbar";
import { ServiceWorkerRegister } from "./sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Streaks",
  description: "Build habits better with streaks",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
};

import { auth } from "@/app/auth";
import { SessionProvider } from "next-auth/react";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <div className="flex h-[100dvh] flex-col pt-[env(safe-area-inset-top)]">
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            <Navbar />
          </div>
        </SessionProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
