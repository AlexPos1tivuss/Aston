import React, { useState, useMemo } from "react";
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

function getValidDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  for (let day = today.getDate() + 1; day <= lastDayOfMonth; day++) {
    const d = new Date(currentYear, currentMonth, day);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

export function CallbackModal({ isOpen, onClose }: CallbackModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const createCallback = useCreateCallback();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setName("");
      setPhone("+7");
      setDate("");
      setTime("");
      setTouched({});
      createCallback.reset();
    }, 300);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^[А-Яа-яЁё\s.\-]*$/.test(val)) {
      setName(val);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneNumber(e.target.value));
  };

  const validDates = useMemo(() => getValidDates(), []);

  const nameError = touched.name && name.trim().length < 2 ? "Имя должно состоять минимум из 2 букв" : "";
  const phoneError = touched.phone && phone.length < 18 ? "Заполните это поле" : "";
  const dateError = touched.date && !date ? "Выберите корректную дату" : "";
  const timeError = touched.time && !time ? "Заполните это поле" : "";

  const isFormValid = name.trim().length >= 2 && phone.length === 18 && date && time;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({ name: true, phone: true, date: true, time: true });

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

  const getErrorMessage = () => {
    if (!createCallback.isError) return null;
    const err = createCallback.error as { status?: number; data?: { message?: string } } | null;
    if (err?.status === 429) return "Превышена частота запросов. Повторите попытку позже.";
    if (err?.status && err.status >= 400 && err.status < 500 && err.data?.message) {
      return err.data.message;
    }
    return "Ошибка 500: Сервис временно недоступен";
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
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-black font-display flex items-center">
              <Phone className="w-5 h-5 mr-2 text-primary" />
              Заказать звонок
            </h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Ваше имя <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    maxLength={25}
                    value={name}
                    onChange={handleNameChange}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="Имя"
                    className={cn(
                      "w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-black transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10",
                      nameError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-primary"
                    )}
                  />
                  {nameError && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {nameError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Ваш телефон <span className="text-red-500">*</span></label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                    placeholder="+7 xxx xxx xxxx"
                    className={cn(
                      "w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-black font-medium transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10",
                      phoneError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-primary"
                    )}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {phoneError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Укажите удобную дату звонка <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, date: true }))}
                      className={cn(
                        "w-full appearance-none rounded-xl border-2 bg-white pl-10 pr-4 py-3 text-sm text-black transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10",
                        dateError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-primary"
                      )}
                    >
                      <option value="" disabled>ДД.ММ.ГГГГ</option>
                      {validDates.map((d) => (
                        <option key={d} value={d}>
                          {new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })}
                          {" "}
                          {new Date(d + "T00:00:00").toLocaleDateString("ru-RU", { weekday: "short" })}
                        </option>
                      ))}
                    </select>
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {dateError && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {dateError}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Укажите удобное время звонка (МСК) <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, time: true }))}
                      className={cn(
                        "w-full appearance-none rounded-xl border-2 bg-white pl-10 pr-4 py-3 text-sm text-black transition-colors focus:outline-none focus:ring-4 focus:ring-primary/10",
                        timeError ? "border-red-400 focus:border-red-400" : "border-gray-200 focus:border-primary"
                      )}
                    >
                      <option value="" disabled>Выберите время</option>
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                  {timeError && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {timeError}
                    </p>
                  )}
                </div>

                {(createCallback.isError || rateLimitError) && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-start mt-2">
                    <AlertCircle className="h-5 w-5 mr-2 shrink-0 text-red-500" />
                    <p>{rateLimitError || getErrorMessage()}</p>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!isFormValid || createCallback.isPending}
                    className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
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
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <CheckCircle2 className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-black font-display">Спасибо!</h3>
                <p className="mb-8 text-gray-500">
                  Ваша заявка на обратный звонок принята. Наш специалист свяжется с Вами в указанное время.
                </p>
                <button
                  onClick={handleClose}
                  className="w-full max-w-xs rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
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
