import type React from "react";
import type { Metadata } from "next";
// import { GeistSans } from "geist/font/sans"
// import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "CustomTee - Design Your Perfect T-Shirt",
  description:
    "Create custom T-shirts with AI generation, text customization, and image uploads. Design your unique style today!",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>
          <Navbar />
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
