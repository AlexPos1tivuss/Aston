import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallbackModal } from "@/components/modals/CallbackModal";
import { PhoneCall, Code2, Database, Cloud, Shield, Layers, Cpu, Braces, ArrowUpRight, Users, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: Code2, title: "Разработка ПО", desc: "Полный цикл создания программных продуктов — от проектирования архитектуры до поддержки в продакшене." },
  { icon: Database, title: "Работа с данными", desc: "Проектирование баз данных, ETL-процессы, аналитические платформы и хранилища данных." },
  { icon: Cloud, title: "Облачные решения", desc: "Миграция в облако, DevOps-практики, CI/CD пайплайны и инфраструктура как код." },
  { icon: Shield, title: "Безопасность", desc: "Аудит безопасности, защита приложений, соответствие стандартам и регуляторным требованиям." },
];

const SERVICES = [
  { icon: Layers, title: "Веб-разработка", desc: "Высоконагруженные веб-приложения, SPA/SSR, микросервисная архитектура" },
  { icon: Cpu, title: "Мобильная разработка", desc: "Нативные и кроссплатформенные приложения для iOS и Android" },
  { icon: Braces, title: "Интеграция систем", desc: "API-разработка, интеграция с внешними сервисами и legacy-системами" },
];

const STATS = [
  { value: "200+", label: "Реализованных проектов" },
  { value: "50+", label: "Специалистов в команде" },
  { value: "10+", label: "Лет на рынке" },
  { value: "99.9%", label: "Uptime наших решений" },
];

export function Home() {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col relative overflow-x-hidden bg-white">
      <Header />

      <main className="flex-1">
        <section className="relative pt-24 pb-32 lg:pt-36 lg:pb-48 overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-100 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
          
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-sm font-medium text-gray-600 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  IT-аутсорсинг и разработка
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-black font-display sm:text-6xl lg:text-7xl mb-6 leading-[1.1]">
                  Разрабатываем{" "}
                  <span className="text-gradient">цифровые</span>{" "}
                  продукты для бизнеса
                </h1>
                <p className="text-lg text-gray-500 sm:text-xl mb-10 max-w-2xl leading-relaxed">
                  АСТОН — IT-компания полного цикла. Создаем надежное программное обеспечение, 
                  выстраиваем инфраструктуру и помогаем бизнесу расти с помощью технологий.
                </p>
                
                <button
                  onClick={() => setIsCallbackOpen(true)}
                  className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 flex items-center"
                >
                  <PhoneCall className="mr-2 h-5 w-5" />
                  Обсудить проект
                </button>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl sm:text-4xl font-extrabold text-primary font-display mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="relative py-24 bg-gray-50">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Компетенции</p>
                <h2 className="text-3xl font-bold tracking-tight text-black font-display sm:text-4xl">
                  Наши направления
                </h2>
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-gray-100 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-colors duration-300">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-black font-display mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="technologies" className="relative py-24 bg-white">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Услуги</p>
                <h2 className="text-3xl font-bold tracking-tight text-black font-display sm:text-4xl">
                  Что мы делаем
                </h2>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SERVICES.map((service, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:bg-black hover:border-black transition-all duration-300 cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-xl bg-white text-black flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                    <service.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-black font-display mb-3 group-hover:text-white transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors duration-300">
                    {service.desc}
                  </p>
                  <ArrowUpRight className="absolute top-8 right-8 w-5 h-5 text-gray-300 group-hover:text-primary transition-colors duration-300" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-white font-display sm:text-4xl mb-4">
                Готовы обсудить проект?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                Наша команда разработчиков поможет воплотить вашу идею в работающий продукт. 
                Свяжитесь с нами для бесплатной консультации.
              </p>
              <button
                onClick={() => setIsCallbackOpen(true)}
                className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 inline-flex items-center"
              >
                <PhoneCall className="mr-2 h-5 w-5" />
                Заказать обратный звонок
              </button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCallbackOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-black shadow-2xl shadow-primary/30 transition-shadow hover:shadow-primary/40"
      >
        <PhoneCall className="h-7 w-7" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black/30 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-black border-2 border-primary"></span>
        </span>
      </motion.button>

      <CallbackModal isOpen={isCallbackOpen} onClose={() => setIsCallbackOpen(false)} />
    </div>
  );
}
