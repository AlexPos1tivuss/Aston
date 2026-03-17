import React, { useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { FeedbackModal } from "../modals/FeedbackModal";

export function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="mt-auto border-t border-slate-200 bg-slate-50 pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                  <span className="text-lg font-bold text-white font-display">А</span>
                </div>
                <span className="text-xl font-black tracking-tight text-slate-900 font-display">
                  АСТОН
                </span>
              </div>
              <p className="max-w-sm text-sm text-slate-500 leading-relaxed">
                Генеральная лицензия Банка России № 1326 от 16 января 2015 г.
                <br />© 2001—2025 АСТОН Банк.
              </p>
              
              <div className="mt-8">
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="inline-flex items-center rounded-xl border-2 border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-95"
                >
                  <MessageSquareWarning className="mr-2 h-4 w-4 text-slate-400" />
                  Сообщить о проблеме
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold text-slate-900 font-display">Продукты</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-primary">Кредитные карты</a></li>
                <li><a href="#" className="hover:text-primary">Вклады</a></li>
                <li><a href="#" className="hover:text-primary">Ипотека</a></li>
                <li><a href="#" className="hover:text-primary">Автокредиты</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold text-slate-900 font-display">Поддержка</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-primary">Контакты</a></li>
                <li><a href="#" className="hover:text-primary">Офисы и банкоматы</a></li>
                <li><a href="#" className="hover:text-primary">Тарифы и документы</a></li>
                <li><a href="#" className="hover:text-primary">Безопасность</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
