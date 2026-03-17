import { useState } from "react";
import { useDebounce } from "use-debounce";
import {
  useListFeedbacks,
  useGetFeedbackStats,
  type ListFeedbacksSortOrder,
} from "@workspace/api-client-react";

export function useFeedbacksManager() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [search] = useDebounce(searchInput, 500);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<ListFeedbacksSortOrder>("desc");

  const queryParams = {
    page,
    limit,
    category: category || undefined,
    search: search || undefined,
    sortBy,
    sortOrder,
  };

  const query = useListFeedbacks(queryParams, {
    query: { keepPreviousData: true },
  });

  const statsQuery = useGetFeedbackStats();

  return {
    page,
    setPage,
    limit,
    setLimit,
    category,
    setCategory,
    searchInput,
    setSearchInput,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    query,
    statsQuery,
  };
}
