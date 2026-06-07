import React, { useEffect, useMemo, useState } from "react";
import { Modal, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult, FilterValue } from "antd/es/table/interface";
import {
  AuditLogServiceProxy,
  EntityChangeListDto,
} from "@api/generated/service-proxies";
import { useDataTable } from "@hooks/useDataTable";
import EntityChangeDetailModal from "./EntityChangeDetailModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { Dayjs } from "dayjs";
import { formatDate } from "../timing/lib/datetime-helper";
import AppConsts from "@/lib/app-consts";

export interface EntityTypeHistoryModalOptions {
  entityTypeFullName: string;
  entityTypeDescription: string;
  entityId: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  options?: EntityTypeHistoryModalOptions;
}

const EntityTypeHistoryModal: React.FC<Props> = ({
  open,
  onClose,
  options,
}) => {
  const auditLogService = useServiceProxy(AuditLogServiceProxy, []);

  const fetchFn = useMemo(() => {
    return async (
      skipCount: number,
      maxResultCount: number,
      sorting: string,
    ) => {
      const res = await auditLogService.getEntityTypeChanges(
        options?.entityTypeFullName,
        options?.entityId,
        sorting,
        maxResultCount,
        skipCount,
      );
      return {
        totalCount: res.totalCount,
        items: res.items as EntityChangeListDto[],
      };
    };
  }, [auditLogService, options?.entityTypeFullName, options?.entityId]);

  const {
    records,
    loading,
    pagination,
    handleTableChange,
    fetchData,
    setRecords,
  } = useDataTable<EntityChangeListDto>(fetchFn);

  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState<
    EntityChangeListDto | undefined
  >(undefined);

  useEffect(() => {
    if (open) {
      fetchData();
    } else {
      setRecords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, setRecords]);

  const onChange = (
    p: TablePaginationConfig,
    _f: Record<string, FilterValue | null>,
    s: SorterResult<EntityChangeListDto> | SorterResult<EntityChangeListDto>[],
  ) => {
    handleTableChange(p, s);
  };

  const columns: ColumnsType<EntityChangeListDto> = [
    {
      title: L("Select"),
      key: "select",
      width: 80,
      render: (_, record) => (
        <button
          key="select"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={() => {
            setSelectedChange(record);
            setDetailOpen(true);
          }}
        >
          {L("Select")}
        </button>
      ),
    },
    { title: L("Action"), dataIndex: "changeTypeName" },
    { title: L("UserName"), dataIndex: "userName" },
    {
      title: L("Time"),
      dataIndex: "changeTime",
      render: (v: Dayjs) =>
        v ? formatDate(v, AppConsts.timing.shortDateFormat) : "",
    },
  ];

  const title = options
    ? `${L("ChangeLogs")}: ${L(options.entityTypeFullName)} (${
        options.entityTypeDescription
      })`
    : L("ChangeLogs");

  return (
    <>
      <Modal
        title={title}
        open={open}
        onCancel={onClose}
        style={{ top: 24 }}
        width={1000}
        footer={[
          <button
            key="cancel"
            type="button"
            className="btn btn-light-primary fw-bold"
            onClick={onClose}
          >
            {L("Cancel")}
          </button>,
        ]}
      >
        <div className="primeng-datatable-container">
          <Table<EntityChangeListDto>
            rowKey="id"
            loading={loading}
            dataSource={records}
            columns={columns}
            pagination={pagination}
            onChange={onChange}
          />
          {!loading && (pagination.total ?? 0) === 0 && (
            <div className="primeng-no-data">{L("NoData")}</div>
          )}
        </div>
      </Modal>

      <EntityChangeDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        entityChange={selectedChange}
      />
    </>
  );
};

export default EntityTypeHistoryModal;
