"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we're on an admin or auth page
  const isAdminPage = pathname.startsWith("/admin");
  const isAuthPage = pathname.startsWith("/auth");
  
  // Don't show header/footer on admin or auth pages
  if (isAdminPage || isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }
  
  // Show header/footer on all other pages
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}

