import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Navbar } from "@/components/shared/Navbar";
import { Header } from "@/components/shared/Header";
import { ServiceWorkerRegister } from "./sw-register";
import { TimezoneSync } from "./timezone-sync";
import "./globals.css";

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('streaks-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.add(t);}catch(e){}})();`;

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider session={session}>
          <div className="bg-background fixed inset-0 flex flex-col pt-[env(safe-area-inset-top)]">
            <Header />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {children}
            </div>
            <Navbar />
          </div>
          <TimezoneSync />
        </SessionProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
