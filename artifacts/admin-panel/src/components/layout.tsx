import React, { useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PhoneCall, MessageSquare, Menu, X, Bell, BellOff, Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, useNotificationsProvider, NotificationsContext } from "@/hooks/use-notifications";

const NAV_ITEMS = [
  { href: "/", label: "Обращения", icon: MessageSquare },
  { href: "/callbacks", label: "Заявки на звонок", icon: PhoneCall },
];

function NotificationPanel() {
  const { notifications, unreadCount, isOpen, toggle, close, markAllRead, markRead, clearAll } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, close]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={toggle}
        className="p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-bold rounded-full px-1 border-2 border-card"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-display font-bold text-foreground">Уведомления</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Отметить все прочитанными"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Очистить все"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BellOff className="w-8 h-8 mb-3 opacity-40" />
                  <p className="text-sm">Нет уведомлений</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => markRead(notif.id)}
                    className={cn(
                      "px-5 py-3.5 border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-muted/50",
                      !notif.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                        notif.type === "feedback" ? "bg-gray-100 text-gray-600" : "bg-primary/10 text-primary"
                      )}>
                        {notif.type === "feedback" ? (
                          <MessageSquare className="w-4 h-4" />
                        ) : (
                          <PhoneCall className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{notif.title}</p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{notif.description}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {notif.timestamp.toLocaleString("ru-RU", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const notificationsValue = useNotificationsProvider();

  return (
    <NotificationsContext.Provider value={notificationsValue}>
      <LayoutInner>{children}</LayoutInner>
    </NotificationsContext.Provider>
  );
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border z-20 relative">
        <div className="flex items-center gap-2 font-display font-bold text-xl tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center">
            <span className="text-sm font-bold text-white">А</span>
          </div>
          <span className="text-foreground">АСТОН</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationPanel />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 z-20 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-30 w-[280px] bg-card border-r border-border flex flex-col shadow-2xl md:hidden"
            >
              <div className="p-6 flex items-center gap-3 border-b border-border">
                <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold">А</span>
                </div>
                <span className="font-display font-bold text-xl tracking-tight text-foreground">АСТОН</span>
              </div>
              <div className="px-4 py-6 flex-1">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
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
                          "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "text-primary-foreground bg-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden md:flex w-64 bg-card border-r border-border flex-col h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shadow-lg">
            <span className="text-white font-bold font-display">А</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">АСТОН</span>
        </div>

        <div className="px-4 py-2 mt-2 flex-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Панель управления
          </p>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                    isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-desktop"
                      className="absolute inset-0 bg-primary rounded-xl"
                      transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    />
                  )}
                  <item.icon className={cn("w-5 h-5 z-10 transition-transform duration-200", isActive && "scale-110")} />
                  <span className="z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-dot"
                      className="ml-auto z-10 w-1.5 h-1.5 rounded-full bg-primary-foreground/60"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs">
              АД
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Администратор</p>
              <p className="text-xs text-muted-foreground truncate">admin@astondevs.ru</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-xl hidden md:flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="font-display font-semibold text-lg text-foreground">
            {NAV_ITEMS.find((item) => item.href === location)?.label || "Панель управления"}
          </h1>
          <div className="flex items-center gap-4">
            <NotificationPanel />
          </div>
        </header>
        
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
