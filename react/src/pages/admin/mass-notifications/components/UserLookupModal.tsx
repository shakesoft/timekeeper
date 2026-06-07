import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Table } from "antd";
import {
  MassNotificationUserLookupTableDto,
  NameValueDto,
  NotificationServiceProxy,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../../hooks/useDataTable";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: (selectedUsers: NameValueDto[]) => void;
}

const UserLookupModal: React.FC<Props> = ({ isVisible, onClose, onSave }) => {
  const notificationService = useServiceProxy(NotificationServiceProxy, []);

  const [filterText, setFilterText] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<
    MassNotificationUserLookupTableDto[]
  >([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number, sorting: string) =>
      notificationService.getAllUserForLookupTable(
        filterText,
        sorting,
        skipCount,
        maxResultCount,
      ),
    [filterText, notificationService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<MassNotificationUserLookupTableDto>(fetchFunction);

  useEffect(() => {
    if (isVisible) {
      fetchData();
      setSelectedUsers([]);
      setSelectedRowKeys([]);
    } else {
      setSelectedUsers([]);
      setSelectedRowKeys([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleSave = () => {
    const mapped: NameValueDto[] = selectedUsers.map((u) =>
      NameValueDto.fromJS({
        name: u.displayName ?? "",
        value: String(u.id),
      }),
    );
    onSave(mapped);
    onClose();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (
      _selectedRowKeys: React.Key[],
      selectedRows: MassNotificationUserLookupTableDto[],
    ) => {
      setSelectedRowKeys(_selectedRowKeys);
      setSelectedUsers(selectedRows);
    },
  };

  const columns = [
    { title: L("Name"), dataIndex: "displayName", sorter: true },
  ];

  return (
    <Modal
      title={L("SearchUser")}
      open={isVisible}
      onCancel={onClose}
      afterOpenChange={(opened) => {
        if (opened) {
          delayedFocus(searchInputRef);
        }
      }}
      footer={[
        <button
          key="cancel"
          type="button"
          className="btn btn-light-primary fw-bold"
          onClick={onClose}
        >
          {L("Cancel")}
        </button>,
        <button
          key="save"
          type="button"
          className="btn btn-primary fw-bold"
          onClick={handleSave}
          disabled={selectedUsers.length === 0}
        >
          {L("Select")}
        </button>,
      ]}
      width={600}
    >
      <form
        className="mb-3"
        onSubmit={(e) => {
          e.preventDefault();
          fetchData();
        }}
      >
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder={L("SearchWithThreeDot")}
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            ref={searchInputRef}
          />
          <button type="submit" className="btn btn-primary">
            <i className="la la-search"></i>
          </button>
        </div>
      </form>
      <Table<MassNotificationUserLookupTableDto>
        dataSource={records}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
        rowSelection={{
          type: "checkbox",
          ...rowSelection,
        }}
      />
    </Modal>
  );
};
export default UserLookupModal;
