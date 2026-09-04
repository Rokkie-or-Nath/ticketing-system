import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PageTransition from "@/components/PageTransition";
import Spotlight from "@/components/Spotlight";
import { Toaster } from "@/components/ui/sonner";
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
  title: "TICKETNET — Support Dashboard",
  description: "Enterprise IT support ticketing platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-background text-foreground min-h-full">
        <div className="aurora-bg" aria-hidden="true">
          <span className="aurora-blob a" />
          <span className="aurora-blob b" />
          <span className="aurora-blob c" />
        </div>
        <Spotlight />
        <Toaster position="top-center" richColors />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}