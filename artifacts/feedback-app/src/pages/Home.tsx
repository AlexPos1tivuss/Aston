import React, { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CallbackModal } from "@/components/modals/CallbackModal";
import { PhoneCall, CreditCard, Wallet, PiggyBank, ShieldCheck, Landmark, Smartphone, Building2, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

const FEATURES = [
  { icon: CreditCard, title: "Карты", desc: "Дебетовые и кредитные карты с кэшбэком до 10% и бесплатным обслуживанием." },
  { icon: PiggyBank, title: "Вклады", desc: "Накопительные счета и вклады со ставкой до 16% годовых и ежемесячной выплатой процентов." },
  { icon: Wallet, title: "Кредиты", desc: "Потребительские, ипотечные и автокредиты с одобрением онлайн за 5 минут." },
  { icon: ShieldCheck, title: "Страхование", desc: "Защита здоровья, имущества и путешествий с поддержкой 24/7." },
];

const SERVICES = [
  { icon: Landmark, title: "Для бизнеса", desc: "РКО, эквайринг, зарплатные проекты и кредитование для предпринимателей" },
  { icon: Smartphone, title: "Мобильный банк", desc: "Все операции в одном приложении: переводы, оплата, инвестиции" },
  { icon: Building2, title: "Ипотека", desc: "Семейная, льготная и стандартная ипотека от 5,9% годовых" },
];

const STATS = [
  { value: "30+", label: "Лет на рынке" },
  { value: "5 млн", label: "Активных клиентов" },
  { value: "1500+", label: "Отделений по стране" },
  { value: "24/7", label: "Поддержка клиентов" },
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
                  Банк нового поколения
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-black font-display sm:text-6xl lg:text-7xl mb-6 leading-[1.1]">
                  Ваш{" "}
                  <span className="text-gradient">надежный</span>{" "}
                  финансовый партнёр
                </h1>
                <p className="text-lg text-gray-500 sm:text-xl mb-10 max-w-2xl leading-relaxed">
                  АСТОН Банк — современные банковские услуги для частных лиц и бизнеса. 
                  Карты, вклады, кредиты и инвестиции в одном приложении.
                </p>
                
                <button
                  onClick={() => setIsCallbackOpen(true)}
                  className="rounded-xl bg-primary px-8 py-4 text-base font-bold text-black shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/30 flex items-center"
                >
                  <PhoneCall className="mr-2 h-5 w-5" />
                  Заказать обратный звонок
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
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Продукты</p>
                <h2 className="text-3xl font-bold tracking-tight text-black font-display sm:text-4xl">
                  Всё для вашей жизни
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

        <section id="business" className="relative py-24 bg-white">
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">Услуги</p>
                <h2 className="text-3xl font-bold tracking-tight text-black font-display sm:text-4xl">
                  Решения для каждого
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
                Нужна консультация?
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
                Наши специалисты подберут оптимальный банковский продукт под ваши цели. 
                Оставьте заявку — перезвоним в удобное время.
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
