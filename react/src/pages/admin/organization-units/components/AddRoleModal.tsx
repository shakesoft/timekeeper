import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Table } from "antd";
import {
  NameValueDto,
  OrganizationUnitServiceProxy,
  FindOrganizationUnitRolesInput,
  RolesToOrganizationUnitInput,
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

const AddRoleModal: React.FC<Props> = ({
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
      const input = new FindOrganizationUnitRolesInput();
      input.organizationUnitId = organizationUnitId ?? 0;
      input.filter = filterText;
      input.skipCount = skipCount;
      input.maxResultCount = maxResultCount;
      return organizationUnitService.findRoles(input);
    },
    [filterText, organizationUnitId, organizationUnitService],
  );

  const { records, loading, pagination, handleTableChange, fetchData } =
    useDataTable<NameValueDto>(fetchFunction);

  useEffect(() => {
    if (isVisible) {
      fetchData();
    } else {
      setSelectedRowKeys([]);
      setFilterText("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleSave = async () => {
    if (!selectedRowKeys.length) {
      onClose();
      return;
    }
    const input = new RolesToOrganizationUnitInput({
      organizationUnitId: organizationUnitId ?? 0,
      roleIds: selectedRowKeys as number[],
    });
    await organizationUnitService.addRolesToOrganizationUnit(input);
    onSave();
    onClose();
  };

  const columns = [{ title: L("Name"), dataIndex: "name", sorter: true }];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  return (
    <Modal
      title={L("SelectRoles")}
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
        rowKey="value"
        rowSelection={{
          type: "checkbox",
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
      />
    </Modal>
  );
};
export default AddRoleModal;
