import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "MedCare — Appointment Booking System",
  description: "A modern patient appointment booking platform for clinics and healthcare centres.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
