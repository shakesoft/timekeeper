import React, { useCallback, useEffect, useState } from "react";
import { Table, Pagination } from "antd";
import {
  CommonLookupServiceProxy,
  FindUsersInput,
  FindUsersOutputDto,
  useServiceProxy,
} from "@/api/service-proxy-factory";
import L from "@/lib/L";

type Props = {
  onSelect: (item: FindUsersOutputDto) => void;
};

const FriendsLookupTable: React.FC<Props> = ({ onSelect }) => {
  const commonLookupService = useServiceProxy(CommonLookupServiceProxy, []);
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [records, setRecords] = useState<FindUsersOutputDto[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const input = new FindUsersInput();
      input.filter = filter;
      input.skipCount = (page - 1) * pageSize;
      input.maxResultCount = pageSize;
      input.excludeCurrentUser = true;
      const res = await commonLookupService.findUsers(input);
      setTotal(res.totalCount);
      setRecords(res.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [commonLookupService, filter, page, pageSize]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder={L("Search")}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              load();
            }
          }}
        />
      </div>
      <Table
        rowKey={(r) => String(r.id)}
        dataSource={records}
        loading={loading}
        pagination={false}
        columns={[
          {
            title: L("Select"),
            render: (_v: unknown, r: FindUsersOutputDto) => (
              <button
                type="button"
                className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                onClick={() => onSelect(r)}
                title={L("Select")}
                aria-label={L("Select")}
              >
                <i
                  className="la la-chevron-circle-right"
                  aria-hidden="true"
                ></i>
              </button>
            ),
            width: 60,
            align: "center",
          },
          { title: L("Name"), dataIndex: "name" },
          { title: L("Surname"), dataIndex: "surname" },
          { title: L("Email"), dataIndex: "emailAddress" },
        ]}
      />
      <div className="d-flex justify-content-end mt-3">
        <Pagination
          current={page}
          pageSize={pageSize}
          total={total}
          onChange={(p, ps) => {
            setPage(p);
            setPageSize(ps);
          }}
        />
      </div>
    </div>
  );
};

export default FriendsLookupTable;
