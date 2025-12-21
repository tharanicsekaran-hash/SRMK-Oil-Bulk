import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageProvider";
import SessionProvider from "@/components/SessionProvider";
import ConditionalLayout from "@/components/ConditionalLayout";
import Toast from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SRMK Oil Mill",
  description: "Traditional cold-pressed oils from SRMK Oil Mill",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ta">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <LanguageProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toast />
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
