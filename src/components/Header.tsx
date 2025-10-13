"use client";
import Link from "next/link";
import { useI18n } from "@/components/LanguageProvider";
import { useCart } from "@/store/cart";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import ToggleSwitch from "@/components/ToggleSwitch";
import { useState } from "react";

export default function Header() {
  const { locale, setLocale, t } = useI18n();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-[#f0e6d8] bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          {t.brand.name}
        </Link>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-[#d97706]">{t.nav.home}</Link>
          <Link href="/products" className="hover:text-[#d97706]">{t.nav.products}</Link>
          <Link href="/about" className="hover:text-[#d97706]">About</Link>
          <div className="h-5 w-px bg-gray-300" />
          <Link href="/account" className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100" aria-label="Profile">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative inline-flex items-center justify-center p-2 rounded hover:bg-gray-100" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-orange-600 text-white rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </Link>
          <ToggleSwitch
            leftLabel="தமிழ்"
            rightLabel="EN"
            checked={locale === "en"}
            onChange={(checked: boolean) => setLocale(checked ? "en" : "ta")}
          />
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Link href="/account" className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100" aria-label="Profile">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/cart" className="relative inline-flex items-center justify-center p-2 rounded hover:bg-gray-100" aria-label="Cart">
            <ShoppingCart className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] leading-none bg-orange-600 text-white rounded-full px-1.5 py-0.5">
                {count}
              </span>
            )}
          </Link>
          <ToggleSwitch
            leftLabel="தமிழ்"
            rightLabel="EN"
            checked={locale === "en"}
            onChange={(checked: boolean) => setLocale(checked ? "en" : "ta")}
          />
          <button aria-label="Menu" onClick={() => setOpen((o) => !o)} className="inline-flex items-center justify-center p-2 rounded hover:bg-gray-100">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-3">
            <Link href="/" className="py-1 hover:text-[#d97706]" onClick={() => setOpen(false)}>{t.nav.home}</Link>
            <Link href="/products" className="py-1 hover:text-[#d97706]" onClick={() => setOpen(false)}>{t.nav.products}</Link>
            <Link href="/about" className="py-1 hover:text-[#d97706]" onClick={() => setOpen(false)}>About</Link>
          </div>
        </div>
      )}
    </header>
  );
}
