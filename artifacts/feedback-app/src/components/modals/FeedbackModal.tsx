import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { useCreateFeedback } from "@workspace/api-client-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { label: "Без категории", disabled: false },
  { label: "Отделение банка", disabled: false },
  { label: "Банкоматы", disabled: false },
  { label: "Сайт", disabled: false },
  { label: "Мобильное приложение", disabled: true, tooltip: "Приложение банка находится в разработке." },
];

const RATE_LIMIT_KEY = "feedback_last_submit";
const RATE_LIMIT_MS = 3 * 60 * 1000;

function getRateLimitRemaining(): number {
  const last = localStorage.getItem(RATE_LIMIT_KEY);
  if (!last) return 0;
  const elapsed = Date.now() - parseInt(last, 10);
  return Math.max(0, RATE_LIMIT_MS - elapsed);
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Без категории");
  const [message, setMessage] = useState("");
  const [rateLimitError, setRateLimitError] = useState("");
  
  const createFeedback = useCreateFeedback();

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("form");
      setName("");
      setCategory("Без категории");
      setMessage("");
      createFeedback.reset();
    }, 300);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^[А-Яа-яЁё\s\-]*$/.test(val)) {
      setName(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.length < 20 || message.length > 400) return;

    const remaining = getRateLimitRemaining();
    if (remaining > 0) {
      const mins = Math.ceil(remaining / 60000);
      setRateLimitError(`Повторная отправка возможна через ${mins} мин.`);
      return;
    }
    setRateLimitError("");

    createFeedback.mutate(
      {
        data: {
          name: name || undefined,
          category,
          message,
          timestamp: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
          setStep("success");
        },
      }
    );
  };

  const getErrorMessage = () => {
    if (!createFeedback.isError) return null;
    const err = createFeedback.error as { status?: number; data?: { message?: string } } | null;
    if (err?.status === 429) return "Превышена частота запросов. Повторите попытку позже.";
    if (err?.status && err.status >= 400 && err.status < 500 && err.data?.message) {
      return err.data.message;
    }
    return "Сервис временно недоступен. Повторите попытку позже";
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
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
            <h2 className="text-xl font-bold text-black font-display">Форма обратной связи</h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">ФИО</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={name}
                    onChange={handleNameChange}
                    placeholder="Иванов Иван Иванович"
                    className="w-full rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-black transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Категория</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <TooltipProvider key={cat.label}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              disabled={cat.disabled}
                              onClick={() => !cat.disabled && setCategory(cat.label)}
                              className={cn(
                                "flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                                cat.disabled
                                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : category === cat.label
                                    ? "border-primary bg-primary text-black shadow-md shadow-primary/25"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                              )}
                            >
                              {cat.label}
                              {cat.disabled && (
                                <Info className="ml-1.5 h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </TooltipTrigger>
                          {cat.tooltip && (
                            <TooltipContent>{cat.tooltip}</TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Сообщение о проблеме</label>
                    <span className={cn(
                      "text-xs",
                      message.length > 400 ? "text-red-500 font-medium" : "text-gray-400"
                    )}>
                      {message.length} / 400
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Введите текст"
                    className="w-full resize-none rounded-xl border-2 border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-black transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                  {message.length > 0 && message.length < 20 && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Слишком короткий текст (минимальная длина - 20 символов)
                    </p>
                  )}
                  {message.length > 400 && (
                    <p className="text-xs text-red-500 flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Слишком длинный текст (максимальное количество символов - 400)
                    </p>
                  )}
                </div>

                <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600 flex items-start">
                  <Info className="h-5 w-5 mr-2 shrink-0 text-gray-400" />
                  <p>Форма предназначена для информирования и не подразумевает ответа.</p>
                </div>

                {(createFeedback.isError || rateLimitError) && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 shrink-0 text-red-500" />
                    <p>{rateLimitError || getErrorMessage()}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={message.length < 20 || message.length > 400 || createFeedback.isPending}
                  className="w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-black shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
                >
                  {createFeedback.isPending ? "Отправка..." : "Отправить"}
                </button>
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
                <h3 className="mb-2 text-xl font-bold text-black font-display">Форма отправлена!</h3>
                <p className="mb-8 text-gray-500">
                  Спасибо за обратную связь! Ваше сообщение о проблеме будет проанализировано вместе с другими обращениями. Это поможет улучшить качество работы и устранить возможные недочеты.
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
