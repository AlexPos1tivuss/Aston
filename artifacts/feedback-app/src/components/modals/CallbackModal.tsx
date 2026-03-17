import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Phone, Calendar, Clock, AlertCircle } from "lucide-react";
import { useCreateCallback } from "@workspace/api-client-react";
import { formatPhoneNumber, cn } from "@/lib/utils";

interface CallbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
  "17:00 - 18:00",
];

const CALLBACK_RATE_LIMIT_KEY = "callback_last_submit";
const CALLBACK_RATE_LIMIT_MS = 3 * 60 * 1000;

function getCallbackRateLimitRemaining(): number {
  const last = localStorage.getItem(CALLBACK_RATE_LIMIT_KEY);
  if (!last) return 0;
  const elapsed = Date.now() - parseInt(last, 10);
  return Math.max(0, CALLBACK_RATE_LIMIT_MS - elapsed);
}

export function CallbackModal({ isOpen, onClose }: CallbackModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");

  const createCallback = useCreateCallback();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setName("");
      setPhone("+7");
      setDate("");
      setTime("");
      createCallback.reset();
    }, 300);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  // Build valid dates
  const getValidDates = () => {
    const dates = [];
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Check up to 30 days ahead to find valid dates in current month
    for (let i = 1; i <= 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      
      // Stop if we enter next month
      if (d.getMonth() !== today.getMonth()) break;
      
      // Skip weekends
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates;
  };

  const validDates = getValidDates();
  
  const isFormValid = name.trim().length > 0 && phone.length === 18 && date && time;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    const remaining = getCallbackRateLimitRemaining();
    if (remaining > 0) {
      const mins = Math.ceil(remaining / 60000);
      setRateLimitError(`Повторная отправка возможна через ${mins} мин.`);
      return;
    }
    setRateLimitError("");

    createCallback.mutate(
      {
        data: {
          name,
          phoneNumber: "+7" + phone.replace(/\D/g, "").substring(1),
          callDate: date,
          callTime: time,
        },
      },
      {
        onSuccess: () => {
          localStorage.setItem(CALLBACK_RATE_LIMIT_KEY, Date.now().toString());
          setStep("success");
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between bg-slate-50 px-6 py-4 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 font-display flex items-center">
              <Phone className="w-5 h-5 mr-2 text-primary" />
              Заказать звонок
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Имя <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Как к вам обращаться?"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Телефон <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+7 (999) 000-00-00"
                    className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 font-medium transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Дата звонка <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                      >
                        <option value="" disabled>Выберите дату</option>
                        {validDates.map((d) => (
                          <option key={d} value={d}>
                            {new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
                          </option>
                        ))}
                      </select>
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Время <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full appearance-none rounded-xl border-2 border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 transition-colors focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                      >
                        <option value="" disabled>Выберите время</option>
                        {TIME_SLOTS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {(createCallback.isError || rateLimitError) && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-start mt-2">
                    <AlertCircle className="h-5 w-5 mr-2 shrink-0 text-red-500" />
                    <p>{rateLimitError || "Произошла ошибка при отправке заявки."}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || createCallback.isPending}
                    className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                  >
                    {createCallback.isPending ? "Отправка..." : "Перезвоните мне"}
                  </button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-800 font-display">Спасибо!</h3>
                <p className="mb-8 text-slate-500">Ваша заявка на обратный звонок принята. Сотрудник свяжется с вами в указанное время.</p>
                <button
                  onClick={handleClose}
                  className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
                >
                  Закрыть
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
