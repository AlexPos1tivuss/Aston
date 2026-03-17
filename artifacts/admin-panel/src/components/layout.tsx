import React from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PhoneCall, MessageSquare, Menu, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { href: "/", label: "Обращения", icon: MessageSquare },
  { href: "/callbacks", label: "Заявки на звонок", icon: PhoneCall },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-20 relative">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-xl tracking-tight">
          <LayoutDashboard className="w-6 h-6" />
          <span>АСТОН</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <AnimatePresence>
        {(isMobileMenuOpen || typeof window !== 'undefined' && window.innerWidth >= 768) && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className={cn(
              "fixed md:static inset-y-0 left-0 z-10 w-64 bg-card border-r border-border flex flex-col h-[calc(100vh-65px)] md:h-screen shadow-2xl md:shadow-none",
              !isMobileMenuOpen && "hidden md:flex"
            )}
          >
            <div className="p-6 hidden md:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">АСТОН</span>
            </div>

            <div className="px-4 py-2 mt-2">
              <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Панель управления
              </p>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="active-nav"
                          className="absolute inset-0 bg-primary/10 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className={cn("w-5 h-5 z-10", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                      <span className="z-10">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl hidden md:flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-display font-semibold text-lg text-foreground">
            {NAV_ITEMS.find((item) => item.href === location)?.label || "Панель управления"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full border-2 border-card"></span>
            </button>
            <div className="w-px h-6 bg-border mx-2"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-foreground">Администратор</p>
                <p className="text-xs text-muted-foreground">admin@astondevs.ru</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm border-2 border-card">
                АД
              </div>
            </div>
          </div>
        </header>
        
        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 md:p-8 bg-background relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
