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
  "Без категории",
  "Техническая",
  "Доступность",
  "Мобильное приложение",
];

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Без категории");
  const [message, setMessage] = useState("");
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.length < 20 || message.length > 400) return;

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
          setStep("success");
        },
      }
    );
  };

  const getErrorMessage = () => {
    if (!createFeedback.isError) return null;
    const err = createFeedback.error;
    if (err && "status" in err && err.status === 429) return "Превышена частота запросов. Повторите попытку позже.";
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
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-xl font-bold text-slate-800 font-display">Форма обратной связи</h2>
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            {step === "form" ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">ФИО (необязательно)</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Иванов Иван Иванович"
                    className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Категория</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <TooltipProvider key={cat}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setCategory(cat)}
                              className={cn(
                                "flex items-center rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-200",
                                category === cat
                                  ? "border-primary bg-primary text-white shadow-md shadow-primary/25"
                                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                              )}
                            >
                              {cat}
                              {cat === "Мобильное приложение" && (
                                <Info className={cn("ml-1.5 h-4 w-4", category === cat ? "text-white/80" : "text-slate-400")} />
                              )}
                            </button>
                          </TooltipTrigger>
                          {cat === "Мобильное приложение" && (
                            <TooltipContent>Приложение банка находится в разработке.</TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-slate-700">Описание проблемы</label>
                    <span className={cn(
                      "text-xs",
                      message.length > 400 ? "text-red-500 font-medium" : "text-slate-400"
                    )}>
                      {message.length} / 400
                    </span>
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Опишите вашу проблему подробно..."
                    className="w-full resize-none rounded-xl border-2 border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 transition-colors focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10"
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

                <div className="rounded-lg bg-blue-50/50 p-3 text-sm text-blue-800 flex items-start">
                  <Info className="h-5 w-5 mr-2 shrink-0 text-blue-500" />
                  <p>Форма предназначена для информирования и не подразумевает ответа.</p>
                </div>

                {createFeedback.isError && (
                  <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 shrink-0 text-red-500" />
                    <p>{getErrorMessage()}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={message.length < 20 || message.length > 400 || createFeedback.isPending}
                  className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:transform-none"
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
                <div className="mb-4 rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-800 font-display">Спасибо!</h3>
                <p className="mb-8 text-slate-500">Ваше сообщение успешно отправлено.</p>
                <button
                  onClick={handleClose}
                  className="w-full max-w-xs rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200"
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
