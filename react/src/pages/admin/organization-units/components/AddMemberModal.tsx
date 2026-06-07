import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Table } from "antd";
import {
  OrganizationUnitServiceProxy,
  FindOrganizationUnitUsersInput,
  UsersToOrganizationUnitInput,
  FindOrganizationUnitUsersOutputDto,
} from "@api/generated/service-proxies";
import { useDataTable } from "../../../../hooks/useDataTable";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useDelayedFocus } from "@/hooks/useDelayedFocus";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSave: () => void;
  organizationUnitId?: number;
}

const AddMemberModal: React.FC<Props> = ({
  isVisible,
  onClose,
  onSave,
  organizationUnitId,
}) => {
  const organizationUnitService = useServiceProxy(
    OrganizationUnitServiceProxy,
    [],
  );
  const [filterText, setFilterText] = useState("");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const delayedFocus = useDelayedFocus();

  const fetchFunction = useCallback(
    (skipCount: number, maxResultCount: number) => {
      const input = new FindOrganizationUnitUsersInput();
      input.organizationUnitId = organizationUnitId ?? 0;
      input.filter = filterText;
      input.skipCount = skipCount;
      input.maxResultCount = maxResultCount;
      return organizationUnitService.findUsers(input);
    },
    [filterText, organizationUnitId, organizationUnitService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<FindOrganizationUnitUsersOutputDto>(fetchFunction);

  useEffect(() => {
    if (isVisible) {
      fetchData();
    } else {
      setSelectedRowKeys([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleSave = async () => {
    if (!selectedRowKeys.length) {
      onClose();
      return;
    }
    if (!organizationUnitId) {
      onClose();
      return;
    }
    const input = new UsersToOrganizationUnitInput({
      organizationUnitId: organizationUnitId,
      userIds: selectedRowKeys as number[],
    });
    await organizationUnitService.addUsersToOrganizationUnit(input);
    onSave();
    onClose();
  };

  const columns = [
    { title: L("Name"), dataIndex: "name" },
    { title: L("Surname"), dataIndex: "surname" },
    { title: L("Email"), dataIndex: "emailAddress" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <Modal
      title={L("SelectMembers")}
      open={isVisible}
      onCancel={onClose}
      width={800}
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
          disabled={!selectedRowKeys.length}
        >
          <i className="fa fa-save"></i> <span>{L("Save")}</span>
        </button>,
      ]}
    >
      <form onSubmit={handleSearch} autoComplete="new-password">
        <div className="input-group mb-2">
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            name="filterText"
            className="form-control"
            placeholder={L("SearchWithThreeDot")}
            type="text"
            ref={searchInputRef}
          />
          <button className="btn btn-primary" type="submit">
            <i className="flaticon-search-1" aria-label={L("Search")}></i>
          </button>
        </div>
      </form>
      <Table
        dataSource={records}
        columns={columns}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        rowKey="id"
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />
    </Modal>
  );
};
export default AddMemberModal;
