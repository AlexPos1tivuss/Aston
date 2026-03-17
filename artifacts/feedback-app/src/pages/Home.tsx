import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallbackModal } from "@/components/modals/CallbackModal";
import { PhoneCall, ArrowRight, ShieldCheck, Wallet, LineChart, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function Home() {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col relative overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
          <div className="absolute inset-0 z-0">
            <img 
              src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
              alt="Background" 
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-background" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  Надежный финансовый партнер
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 font-display sm:text-6xl lg:text-7xl mb-6 leading-[1.1]">
                  Откройте новые возможности с <span className="text-gradient">АСТОН</span> Банком
                </h1>
                <p className="text-lg text-slate-600 sm:text-xl mb-10 max-w-2xl leading-relaxed">
                  Инновационные финансовые решения для ваших целей. 
                  Удобное мобильное приложение, премиальное обслуживание и выгодные условия.
                </p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <button className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/40 flex items-center">
                    Оформить карту
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <button className="rounded-xl bg-white border border-slate-200 px-8 py-4 text-base font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md">
                    Все продукты
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 bg-white">
          <div className="absolute inset-0 z-0">
             <img 
              src={`${import.meta.env.BASE_URL}images/card-pattern.png`}
              alt="Pattern" 
              className="w-full h-full object-cover opacity-[0.03]"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 font-display sm:text-4xl">
                Почему выбирают нас
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: ShieldCheck, title: "Надежность", desc: "Гарантия сохранности ваших средств и защита данных." },
                { icon: Wallet, title: "Выгода", desc: "Кешбэк до 30% у партнеров и процент на остаток." },
                { icon: LineChart, title: "Инвестиции", desc: "Простой доступ к бирже и готовым портфелям." },
                { icon: Globe, title: "Доступность", desc: "Переводы без комиссии по всему миру 24/7." },
              ].map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="glass-panel p-8 rounded-3xl relative group"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-display mb-3">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Floating Callback Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCallbackOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl shadow-primary/40 transition-shadow hover:shadow-primary/50"
      >
        <PhoneCall className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
        </span>
      </motion.button>

      <CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
    </div>
  );
}
