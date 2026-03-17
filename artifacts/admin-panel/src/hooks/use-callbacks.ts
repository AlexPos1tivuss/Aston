import { useState } from "react";
import { useDebounce } from "use-debounce";
import { useQueryClient, keepPreviousData } from "@tanstack/react-query";
import {
  useListCallbacks,
  useGetCallbackStats,
  useUpdateCallbackStatus,
  getListCallbacksQueryKey,
  getGetCallbackStatsQueryKey,
  type ListCallbacksSortOrder,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function useCallbacksManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [search] = useDebounce(searchInput, 500);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<ListCallbacksSortOrder>("desc");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryParams = {
    page,
    limit,
    status: status || undefined,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy,
    sortOrder,
  };

  const query = useListCallbacks(queryParams, {
    query: { placeholderData: keepPreviousData },
  });

  const statsQuery = useGetCallbackStats();

  const updateStatusMutation = useUpdateCallbackStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCallbacksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetCallbackStatsQueryKey() });
        toast({
          title: "Статус обновлен",
          description: "Статус заявки успешно изменен.",
        });
      },
      onError: () => {
        toast({
          variant: "destructive",
          title: "Ошибка",
          description: "Не удалось обновить статус.",
        });
      }
    }
  });

  return {
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
    searchInput,
    setSearchInput,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    query,
    statsQuery,
    updateStatusMutation,
  };
}
