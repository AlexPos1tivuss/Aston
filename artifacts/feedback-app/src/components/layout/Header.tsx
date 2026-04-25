import React, { useState } from "react";
import { Link } from "wouter";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "#services", label: "Продукты" },
  { href: "#business", label: "Услуги" },
  { href: "#support", label: "Контакты" },
];

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/90 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black transition-transform group-hover:scale-105">
            <span className="text-xl font-extrabold text-white font-display">А</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-black font-display">
            АСТОН Банк
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 -mr-2 text-gray-600 hover:text-black transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block text-sm font-medium text-gray-600 hover:text-black py-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
