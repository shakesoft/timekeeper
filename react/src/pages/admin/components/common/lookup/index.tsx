import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Modal } from "antd";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";
import L from "@/lib/L";

export interface PagedResultDto<TItem> {
  totalCount: number;
  items: TItem[];
}

export type CommonLookupColumn<TItem> = {
  key?: string;
  title: React.ReactNode;
  className?: string;
  width?: number | string;
  dataIndex?: keyof TItem;
  render?: (item: TItem, index: number) => React.ReactNode;
};

export interface CommonLookupModalOptions<TItem> {
  title?: string;
  isFilterEnabled?: boolean;
  dataSource: (
    skipCount: number,
    maxResultCount: number,
    filter: string,
    tenantId?: number,
    excludeCurrentUser?: boolean,
  ) => Promise<PagedResultDto<TItem>> | PagedResultDto<TItem>;
  canSelect?: (item: TItem) => boolean | Promise<boolean>;
  loadOnStartup?: boolean;
  pageSize?: number;
  columns?: CommonLookupColumn<TItem>[];
}

export interface CommonLookupModalProps<TItem> {
  isOpen: boolean;
  onClose: () => void;
  options: CommonLookupModalOptions<TItem>;
  onItemSelected?: (item: TItem) => void;
  tenantId?: number;
  excludeCurrentUser?: boolean;
  columns?: CommonLookupColumn<TItem>[];
}

const DEFAULT_PAGE_SIZE = 10;

const CommonLookupModal = <
  TItem extends {
    name?: string;
    surname?: string;
    emailAddress?: string;
  } = Record<string, unknown> & {
    name?: string;
    surname?: string;
    emailAddress?: string;
  },
>({
  isOpen,
  onClose,
  options,
  onItemSelected,
  tenantId,
  excludeCurrentUser = true,
  columns,
}: CommonLookupModalProps<TItem>) => {
  const mergedOptions = useMemo<Required<CommonLookupModalOptions<TItem>>>(
    () => ({
      title: options.title ?? L("SelectAnItem"),
      isFilterEnabled: options.isFilterEnabled ?? true,
      dataSource: options.dataSource,
      canSelect: options.canSelect ?? (() => true),
      loadOnStartup: options.loadOnStartup ?? true,
      pageSize: options.pageSize ?? DEFAULT_PAGE_SIZE,
      columns: options.columns ?? [],
    }),
    [options],
  );

  const [filterText, setFilterText] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(mergedOptions.pageSize);
  const [total, setTotal] = useState<number>(0);
  const [records, setRecords] = useState<TItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isShownRef = useRef<boolean>(false);
  const isInitializedRef = useRef<boolean>(false);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const resolvedColumns = useMemo<CommonLookupColumn<TItem>[]>(() => {
    if (columns && columns.length > 0) return columns;
    if (mergedOptions.columns && mergedOptions.columns.length > 0) {
      return mergedOptions.columns;
    }
    return [];
  }, [columns, mergedOptions.columns]);

  const fetchRecords = useCallback(
    async (nextPage: number, nextPageSize: number, filter: string) => {
      if (!isShownRef.current) return;
      if (!mergedOptions.loadOnStartup && !isInitializedRef.current) return;

      const skipCount = (nextPage - 1) * nextPageSize;
      const maxResultCount = nextPageSize;
      setLoading(true);
      try {
        const result = await Promise.resolve(
          mergedOptions.dataSource(
            skipCount,
            maxResultCount,
            filter,
            tenantId,
            excludeCurrentUser,
          ),
        );
        setTotal(result.totalCount);
        setRecords(result.items);
      } finally {
        setLoading(false);
      }
    },
    [mergedOptions, tenantId, excludeCurrentUser, isShownRef, isInitializedRef],
  );

  useEffect(() => {
    if (isOpen) {
      isShownRef.current = true;
      if (mergedOptions.loadOnStartup) {
        void fetchRecords(1, pageSize, filterText);
        isInitializedRef.current = true;
      }
    } else {
      isShownRef.current = false;
    }
  }, [
    isOpen,
    mergedOptions.loadOnStartup,
    pageSize,
    filterText,
    fetchRecords,
    tenantId,
    excludeCurrentUser,
    isShownRef,
    isInitializedRef,
  ]);

  useEffect(() => {
    setPageSize(mergedOptions.pageSize);
  }, [mergedOptions.pageSize]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setPage(1);
      isInitializedRef.current = true;
      void fetchRecords(1, pageSize, filterText);
    },
    [fetchRecords, filterText, pageSize],
  );

  const selectItem = useCallback(
    async (item: TItem) => {
      const can = await Promise.resolve(mergedOptions.canSelect(item));
      if (!can) return;
      if (onItemSelected) onItemSelected(item);
      onClose();
    },
    [mergedOptions, onItemSelected, onClose],
  );

  const totalPages = useMemo(() => {
    return pageSize > 0 ? Math.max(1, Math.ceil(total / pageSize)) : 1;
  }, [total, pageSize]);

  const goToPage = useCallback(
    (nextPage: number) => {
      const clamped = Math.min(Math.max(1, nextPage), totalPages);
      setPage(clamped);
      void fetchRecords(clamped, pageSize, filterText);
    },
    [fetchRecords, pageSize, filterText, totalPages],
  );

  const handlePageSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const size = parseInt(e.target.value, 10) || DEFAULT_PAGE_SIZE;
      setPageSize(size);
      setPage(1);
      void fetchRecords(1, size, filterText);
    },
    [fetchRecords, filterText],
  );

  return (
    <Modal
      title={mergedOptions.title}
      open={isOpen}
      onCancel={onClose}
      afterOpenChange={(open) => {
        if (open && mergedOptions.isFilterEnabled) {
          delayedFocus(firstInputRef);
        }
      }}
      width={800}
      footer={
        <div className="d-flex justify-content-end gap-2 mt-6">
          <button
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={onClose}
          >
            {L("Cancel")}
          </button>
        </div>
      }
      destroyOnHidden
    >
      <div className="modal-content">
        <div className="modal-body">
          <form onSubmit={handleSearchSubmit} autoComplete="off">
            {mergedOptions.isFilterEnabled && (
              <div className="input-group mb-4">
                <input
                  ref={firstInputRef}
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder={L("SearchWithThreeDot")}
                  className="form-control"
                  type="text"
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  aria-label={L("Search")}
                >
                  <i className="flaticon-search-1" aria-hidden="true"></i>
                </button>
              </div>
            )}

            <div className="table-responsive position-relative">
              {loading && (
                <div
                  className="d-flex align-items-center justify-content-center position-absolute top-0 start-0 w-100 h-100 bg-body bg-opacity-25"
                  style={{ zIndex: 1 }}
                >
                  <span
                    className="spinner-border text-primary"
                    role="status"
                    aria-hidden="true"
                  ></span>
                </div>
              )}

              <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                <thead>
                  <tr className="fw-bold text-muted">
                    <th style={{ width: "15%" }}>{L("Select")}</th>
                    {resolvedColumns.map((col, idx) => (
                      <th
                        key={col.key ?? idx}
                        className={col.className}
                        style={col.width ? { width: col.width } : undefined}
                      >
                        {col.title}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                          onClick={() => selectItem(record)}
                          title={L("Select")}
                          aria-label={L("Select")}
                        >
                          <i
                            className="la la-chevron-circle-right"
                            aria-hidden="true"
                          ></i>
                        </button>
                      </td>
                      {resolvedColumns.map((col, colIndex) => (
                        <td key={`${col.key ?? colIndex}`}>
                          {" "}
                          {col.render
                            ? col.render(record, index)
                            : col.dataIndex
                              ? String(record[col.dataIndex])
                              : null}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!loading && total === 0 && (
              <div className="text-center py-3">{L("NoData")}</div>
            )}

            <div className="d-flex justify-content-end align-items-center mt-3 gap-2">
              <div className="text-muted">
                {L("TotalRecordsCount", [total])}
              </div>

              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                    <button
                      className="page-link"
                      onClick={() => goToPage(page - 1)}
                      aria-label="Previous"
                    >
                      &laquo;
                    </button>
                  </li>
                  {Array.from({ length: totalPages })
                    .slice(0, 10)
                    .map((_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <li
                          key={pageNumber}
                          className={`page-item ${
                            page === pageNumber ? "active" : ""
                          }`}
                        >
                          <button
                            className="page-link"
                            onClick={() => goToPage(pageNumber)}
                          >
                            {pageNumber}
                          </button>
                        </li>
                      );
                    })}
                  <li
                    className={`page-item ${
                      page === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => goToPage(page + 1)}
                      aria-label="Next"
                    >
                      &raquo;
                    </button>
                  </li>
                </ul>
              </nav>
              <div className="d-flex align-items-center">
                <select
                  id="lookup-page-size"
                  className="form-select form-select-sm w-auto"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                >
                  {[10, 20, 50, 100].map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default CommonLookupModal;
