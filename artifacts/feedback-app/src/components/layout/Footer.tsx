import React, { useState } from "react";
import { MessageSquareWarning } from "lucide-react";
import { FeedbackModal } from "../modals/FeedbackModal";

export function Footer() {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer id="support" className="mt-auto border-t border-gray-200 bg-white pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                  <span className="text-lg font-bold text-white font-display">А</span>
                </div>
                <span className="text-xl font-black tracking-tight text-black font-display">
                  АСТОН Банк
                </span>
              </div>
              <p className="max-w-sm text-sm text-gray-400 leading-relaxed">
                Универсальный коммерческий банк с лицензией ЦБ РФ.
                Современные финансовые сервисы для частных и корпоративных клиентов.
                <br />© 1995—2026 АО «АСТОН Банк»
              </p>
              
              <div className="mt-8">
                <button
                  onClick={() => setIsFeedbackOpen(true)}
                  className="inline-flex items-center rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-primary hover:text-black hover:shadow-md active:scale-95"
                >
                  <MessageSquareWarning className="mr-2 h-4 w-4 text-gray-400" />
                  Сообщить о проблеме
                </button>
              </div>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold text-black font-display">Продукты</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>Дебетовые карты</li>
                <li>Кредиты и ипотека</li>
                <li>Вклады и накопления</li>
                <li>Инвестиции</li>
              </ul>
            </div>
            
            <div>
              <h4 className="mb-4 font-semibold text-black font-display">Банк</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li>О банке</li>
                <li>Отделения и банкоматы</li>
                <li>Тарифы</li>
                <li>Контакты</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
      
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}
