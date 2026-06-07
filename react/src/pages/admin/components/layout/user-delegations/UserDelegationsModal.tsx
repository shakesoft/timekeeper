import React, { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Table, Pagination, App } from "antd";
import {
  UserDelegationServiceProxy,
  type UserDelegationDto,
  type PagedResultDtoOfUserDelegationDto,
} from "../../../../../api/generated/service-proxies";
import CreateNewUserDelegationModal, {
  type CreateNewUserDelegationModalHandle,
} from "./CreateNewUserDelegationModal";
import { formatDate } from "../../../components/common/timing/lib/datetime-helper";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import AppConsts from "@/lib/app-consts";

const DEFAULT_PAGE_SIZE = 10;

const UserDelegationsModal: React.FC = () => {
  const userDelegationService = useServiceProxy(UserDelegationServiceProxy, []);
  const { modal } = App.useApp();
  const [visible, setVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [records, setRecords] = useState<UserDelegationDto[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  const createRef = useRef<CreateNewUserDelegationModalHandle>(null);

  const fetchRecords = useCallback(
    async (nextPage: number, nextPageSize: number) => {
      setLoading(true);
      try {
        const skip = (nextPage - 1) * nextPageSize;
        const result: PagedResultDtoOfUserDelegationDto =
          await userDelegationService.getDelegatedUsers(
            nextPageSize,
            skip,
            "userName ASC",
          );
        setRecords(result.items || []);
        setTotal(result.totalCount || 0);
      } finally {
        setLoading(false);
      }
    },
    [userDelegationService],
  );

  useEffect(() => {
    const handler = () => setVisible(true);
    abp?.event?.on?.("app.show.userDelegationsModal", handler);
    return () => abp?.event?.off?.("app.show.userDelegationsModal", handler);
  }, []);

  useEffect(() => {
    if (visible) {
      void fetchRecords(1, pageSize);
      setPage(1);
    }
  }, [visible, fetchRecords, pageSize]);

  const onPageChange = (nextPage: number, nextPageSize?: number) => {
    const size = nextPageSize ?? pageSize;
    setPage(nextPage);
    setPageSize(size);
    void fetchRecords(nextPage, size);
  };

  const removeDelegation = (record: UserDelegationDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("UserDelegationDeleteWarningMessage", [record.username]),
      onOk: async () => {
        await userDelegationService.removeDelegation(record.id);
        abp?.notify?.info?.(L("SuccessfullyDeleted"));
        void fetchRecords(page, pageSize);
      },
    });
  };

  const columns = [
    {
      title: L("UserName"),
      key: "username",
      dataIndex: "username",
      width: "30%",
    },
    {
      title: L("StartTime"),
      key: "startTime",
      dataIndex: "startTime",
      width: "25%",
      render: (v: Dayjs) => formatDate(v, AppConsts.timing.longDateFormat),
    },
    {
      title: L("EndTime"),
      key: "endTime",
      dataIndex: "endTime",
      width: "25%",
      render: (v: Dayjs) => formatDate(v, AppConsts.timing.longDateFormat),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      render: (_: unknown, record: UserDelegationDto) => (
        <button
          type="button"
          className="btn btn-outline-danger btn-sm btn-icon"
          onClick={() => void removeDelegation(record)}
          aria-label={L("Delete")}
        >
          <i className="fa fa-trash d-block" />
        </button>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={L("UserDelegations")}
        open={visible}
        onCancel={() => setVisible(false)}
        width={900}
        footer={
          <div className="d-flex justify-content-end">
            <button
              type="button"
              className="btn btn-light-primary fw-bold"
              onClick={() => setVisible(false)}
            >
              {L("Close")}
            </button>
          </div>
        }
        destroyOnHidden
      >
        <div className="d-flex justify-content-end mb-3">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => createRef.current?.show()}
          >
            <i className="fa fa-plus btn-md-icon" />
            <span className="ms-2">{L("DelegateNewUser")}</span>
          </button>
        </div>

        <Table<UserDelegationDto>
          rowKey={(r) => String(r.id)}
          dataSource={records}
          columns={columns}
          loading={loading}
          pagination={false}
          scroll={{ x: true }}
        />

        {!loading && total === 0 && (
          <div className="text-center py-3">{L("NoData")}</div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div />
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            showSizeChanger
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={(totalCount) =>
              `${L("TotalRecordsCount", [totalCount])} `
            }
            onChange={onPageChange}
          />
        </div>
      </Modal>

      <CreateNewUserDelegationModal
        ref={createRef}
        onSaved={() => void fetchRecords(1, pageSize)}
      />
    </>
  );
};

export default UserDelegationsModal;
