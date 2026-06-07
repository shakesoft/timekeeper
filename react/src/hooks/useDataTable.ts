import { useState, useCallback, useEffect, useRef } from "react";
import type {
  SorterResult,
  TablePaginationConfig,
} from "antd/es/table/interface";

interface UseDataTableOutput<T> {
  loading: boolean;
  records: T[];
  pagination: TablePaginationConfig;
  handleTableChange: (
    pagination: TablePaginationConfig,
    sorter: SorterResult<T> | SorterResult<T>[],
  ) => void;
  fetchData: () => void;
  setRecords: React.Dispatch<React.SetStateAction<T[]>>;
}

export function useDataTable<T extends object>(
  fetchFn: (
    skipCount: number,
    maxResultCount: number,
    sorting: string,
  ) => Promise<{ totalCount: number; items?: T[] | null }>,
): UseDataTableOutput<T> {
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
  });
  const [sorter, setSorter] = useState<SorterResult<T>>({});
  const abortControllerRef = useRef<AbortController | null>(null);

  const getSorting = useCallback(
    (sorter: SorterResult<T>): string | undefined => {
      if (sorter.field && sorter.order) {
        return `${sorter.field} ${sorter.order === "ascend" ? "ASC" : "DESC"}`;
      }
      return undefined;
    },
    [],
  );

  const fetchData = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentController = abortControllerRef.current;

    setLoading(true);
    const skipCount =
      ((pagination.current || 1) - 1) * (pagination.pageSize || 10);
    const sorting = getSorting(sorter as SorterResult<T>) || "";

    fetchFn(skipCount, pagination.pageSize || 10, sorting)
      .then((result) => {
        if (!currentController.signal.aborted) {
          setRecords(result.items ?? []);
          setPagination((prev) => ({ ...prev, total: result.totalCount }));
        }
      })
      .catch((err) => {
        if (err.name === "AbortError" || currentController.signal.aborted) {
          return;
        }
        console.error("Data fetch error:", err);
        setRecords([]);
        setPagination((prev) => ({ ...prev, total: 0 }));
      })
      .finally(() => {
        if (!currentController.signal.aborted) {
          setLoading(false);
        }
      });
  }, [fetchFn, getSorting, pagination, sorter]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleTableChange = (
    newPagination: TablePaginationConfig,
    newSorter: SorterResult<T> | SorterResult<T>[],
  ) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
    setSorter(Array.isArray(newSorter) ? newSorter[0] : newSorter);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, sorter]);

  return {
    records,
    loading,
    pagination,
    handleTableChange,
    fetchData,
    setRecords,
  };
}
