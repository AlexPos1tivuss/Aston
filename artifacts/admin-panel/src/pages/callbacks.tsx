import React, { useState } from "react";
import { useCallbacksManager } from "@/hooks/use-callbacks";
import { StatCard } from "@/components/ui/stat-card";
import { Layout } from "@/components/layout";
import { PhoneCall, Search, Calendar, Clock, Loader2, ChevronLeft, ChevronRight, FileX, CheckCircle2, Clock3, XCircle, MoreVertical } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { UpdateCallbackStatusRequestStatus } from "@workspace/api-client-react";

const STATUSES = [
  { value: "new", label: "Новая", icon: PhoneCall, color: "bg-blue-100 text-blue-700 border-blue-200" },
  { value: "in_progress", label: "В обработке", icon: Clock3, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { value: "completed", label: "Завершена", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "rejected", label: "Отклонена", icon: XCircle, color: "bg-rose-100 text-rose-700 border-rose-200" },
];

function getStatusInfo(status: string) {
  return STATUSES.find(s => s.value === status) || STATUSES[0];
}

export default function CallbacksPage() {
  const {
    page, setPage,
    limit, setLimit,
    status, setStatus,
    searchInput, setSearchInput,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    query,
    statsQuery,
    updateStatusMutation
  } = useCallbacksManager();

  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleStatusChange = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateStatusMutation.mutateAsync({
        id,
        data: { status: newStatus as UpdateCallbackStatusRequestStatus }
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Заявки на звонок</h2>
            <p className="text-muted-foreground mt-1">Очередь запросов на обратный звонок клиентам.</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Всего заявок"
            value={statsQuery.isLoading ? "-" : statsQuery.data?.total || 0}
            icon={<PhoneCall className="w-5 h-5" />}
            delay={0.1}
          />
          <StatCard
            title="Новых заявок"
            value={
              statsQuery.isLoading || !statsQuery.data?.byStatus 
                ? "-" 
                : statsQuery.data.byStatus.find(s => s.status === 'new')?.count || 0
            }
            icon={<PhoneCall className="w-5 h-5" />}
            className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/50"
            delay={0.2}
          />
           <StatCard
            title="В ожидании"
            value={
              statsQuery.isLoading || !statsQuery.data?.byStatus 
                ? "-" 
                : statsQuery.data.byStatus.find(s => s.status === 'in_progress')?.count || 0
            }
            icon={<Clock3 className="w-5 h-5" />}
            className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-900/50"
            delay={0.3}
          />
          <StatCard
            title="Успешно завершены"
            value={
              statsQuery.isLoading || !statsQuery.data?.byStatus 
                ? "-" 
                : statsQuery.data.byStatus.find(s => s.status === 'completed')?.count || 0
            }
            icon={<CheckCircle2 className="w-5 h-5" />}
            className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/10 dark:border-emerald-900/50"
            delay={0.4}
          />
        </div>

        {/* Filters & Actions */}
        <div className="bg-card rounded-2xl p-4 sm:p-5 shadow-sm border border-border flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Поиск по имени или телефону..."
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
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.75rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1em 1em`, paddingRight: `2.5rem` }}
            >
              <option value="">Все статусы</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden flex flex-col">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Клиент</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Телефон</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Желаемое время</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Создано</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Статус</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {query.isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                        <p>Загрузка заявок...</p>
                      </div>
                    </td>
                  </tr>
                ) : query.data?.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <FileX className="w-12 h-12 mb-4 text-muted-foreground/50" />
                        <p className="text-lg font-medium text-foreground">Заявки не найдены</p>
                        <p className="text-sm">Очередь пуста или фильтры слишком строгие.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  query.data?.data.map((item) => {
                    const statusInfo = getStatusInfo(item.status);
                    const isUpdating = updatingId === item.id;
                    
                    return (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">#{item.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {item.phoneNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {item.callDate}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {item.callTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative inline-block">
                            <select
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                              disabled={isUpdating}
                              className={cn(
                                "appearance-none cursor-pointer border py-1.5 pl-3 pr-8 rounded-full text-xs font-semibold outline-none transition-all w-36",
                                statusInfo.color,
                                isUpdating && "opacity-50 cursor-wait"
                              )}
                              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23374151'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1em 1em` }}
                            >
                              {STATUSES.map(s => (
                                <option key={s.value} value={s.value} className="bg-background text-foreground">{s.label}</option>
                              ))}
                            </select>
                            {isUpdating && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-inherit">
                                <Loader2 className="w-3 h-3 animate-spin text-current" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {query.data && query.data.totalPages > 0 && (
            <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-card mt-auto">
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
