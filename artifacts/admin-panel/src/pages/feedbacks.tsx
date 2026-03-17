import React from "react";
import { useFeedbacksManager } from "@/hooks/use-feedbacks";
import { StatCard } from "@/components/ui/stat-card";
import { Layout } from "@/components/layout";
import { MessageSquare, AlertCircle, Phone, Smartphone, Search, Filter, Loader2, ChevronLeft, ChevronRight, FileX } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

const CATEGORIES = [
  "Без категории",
  "Техническая",
  "Доступность",
  "Мобильное приложение"
];

function getCategoryIcon(category: string) {
  switch (category) {
    case "Техническая": return <AlertCircle className="w-4 h-4 text-orange-500" />;
    case "Доступность": return <Phone className="w-4 h-4 text-blue-500" />;
    case "Мобильное приложение": return <Smartphone className="w-4 h-4 text-green-500" />;
    default: return <MessageSquare className="w-4 h-4 text-slate-500" />;
  }
}

export default function FeedbacksPage() {
  const {
    page, setPage,
    limit, setLimit,
    category, setCategory,
    searchInput, setSearchInput,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    query,
    statsQuery
  } = useFeedbacksManager();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Обращения</h2>
            <p className="text-muted-foreground mt-1">Управление сообщениями об ошибках от пользователей.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Всего обращений"
            value={statsQuery.isLoading ? "-" : statsQuery.data?.total || 0}
            icon={<MessageSquare className="w-5 h-5" />}
            delay={0.1}
          />
          <StatCard
            title="Новых за сегодня"
            value={statsQuery.isLoading ? "-" : statsQuery.data?.todayCount || 0}
            icon={<AlertCircle className="w-5 h-5" />}
            delay={0.2}
            className="border-primary/20 bg-primary/5"
          />
          <StatCard
            title="Частая категория"
            value={
              statsQuery.isLoading || !statsQuery.data?.byCategory.length
                ? "-" 
                : [...statsQuery.data.byCategory].sort((a, b) => b.count - a.count)[0].category
            }
            description="Основано на всех данных"
            icon={<Filter className="w-5 h-5" />}
            delay={0.3}
          />
        </div>

        {/* Filters & Actions */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по имени или тексту..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1em 1em`, paddingRight: `2.5rem` }}
            >
              <option value="">Все категории</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              placeholder="С"
              className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              placeholder="По"
              className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Пользователь</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Категория</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Сообщение</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Дата отправки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {query.isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                        <p>Загрузка данных...</p>
                      </div>
                    </td>
                  </tr>
                ) : query.data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileX className="w-12 h-12 mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-foreground">Обращения не найдены</p>
                        <p className="text-sm">Попробуйте изменить параметры фильтрации.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  query.data?.data.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">#{item.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                            {item.name ? item.name.charAt(0).toUpperCase() : "?"}
                          </div>
                          <span className="text-sm font-medium text-foreground">{item.name || "Аноним"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-background border border-border w-fit">
                          {getCategoryIcon(item.category)}
                          <span className="text-xs font-medium text-foreground">{item.category}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-muted-foreground max-w-md truncate" title={item.message}>
                          {item.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {query.data && query.data.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card">
              <div className="text-sm text-muted-foreground">
                Показано <span className="font-medium text-foreground">{(page - 1) * limit + 1}</span> - <span className="font-medium text-foreground">{Math.min(page * limit, query.data.total)}</span> из <span className="font-medium text-foreground">{query.data.total}</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="text-sm bg-background border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <div className="flex gap-1 ml-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(query.data.totalPages, p + 1))}
                    disabled={page === query.data.totalPages}
                    className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
