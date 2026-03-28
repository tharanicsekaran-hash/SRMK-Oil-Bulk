"use client";
import Link from "next/link";
import Image from "next/image";
import { useI18n } from "@/components/LanguageProvider";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 md:grid-cols-3 text-sm">
        <div>
          <div className="mb-3">
            <Image 
              src="/logo.png" 
              alt="SRMK Oil Mill" 
              width={130} 
              height={37} 
              className="h-7 md:h-8 w-auto"
            />
          </div>
          <p className="text-gray-600">{t.home.heroSubtitle}</p>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#d97706]">{t.footer.contact}</div>
          <p className="text-gray-600">Phone: +91 9994341826</p>
          <p className="text-gray-600">Email: selvaraj.whizzkid@gmail.com</p>
        </div>
        <div>
          <div className="font-semibold mb-2 text-[#d97706]">{t.footer.quickLinks}</div>
          <div className="flex flex-col gap-1">
            <Link href="/products" className="hover:text-[#d97706]">{t.nav.products}</Link>
            <Link href="/cart" className="hover:text-[#d97706]">{t.nav.cart}</Link>
            <Link href="/account" className="hover:text-[#d97706]">{t.nav.account}</Link>
            <Link href="/about" className="hover:text-[#d97706]">{t.nav.about}</Link>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-gray-500 pb-6">© {new Date().getFullYear()} SRMK Oil Mill</div>
    </footer>
  );
}
