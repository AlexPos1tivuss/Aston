import React from "react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
            <span className="text-xl font-extrabold text-white font-display">А</span>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 font-display">
            АСТОН
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Частным лицам</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Бизнесу</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Инвестиции</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">О банке</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="#" className="hidden sm:block text-sm font-medium text-primary hover:text-blue-700">Войти</a>
          <button className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md">
            Стать клиентом
          </button>
        </div>
      </div>
    </header>
  );
}
