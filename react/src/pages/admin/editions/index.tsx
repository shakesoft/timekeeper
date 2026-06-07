import React, { useState, useEffect, useCallback } from "react";
import { Table, Dropdown, App } from "antd";
import type { MenuProps } from "antd";
import { usePermissions } from "../../../hooks/usePermissions";
import CreateOrEditEditionModal from "./components/CreateOrEditEditionModal";
import MoveTenantsModal from "./components/MoveTenantsModal";
import {
  EditionListDto,
  EditionServiceProxy,
} from "@api/generated/service-proxies";
import PageHeader from "../components/common/PageHeader";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";
import { useTheme } from "@/hooks/useTheme";

const EditionsPage: React.FC = () => {
  const { modal } = App.useApp();
  const { isGranted } = usePermissions();
  const editionService = useServiceProxy(EditionServiceProxy, []);
  const { containerClass } = useTheme();
  const [loading, setLoading] = useState(false);
  const [editions, setEditions] = useState<EditionListDto[]>([]);

  const [isCreateOrEditModalVisible, setCreateOrEditModalVisible] =
    useState(false);
  const [editingEditionId, setEditingEditionId] = useState<
    number | undefined
  >();

  const [isMoveTenantsModalVisible, setMoveTenantsModalVisible] =
    useState(false);
  const [movingTenantsEditionId, setMovingTenantsEditionId] = useState<
    number | undefined
  >();

  const fetchEditions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await editionService.getEditions();
      setEditions(result.items ?? []);
    } finally {
      setLoading(false);
    }
  }, [editionService]);

  useEffect(() => {
    fetchEditions();
  }, [fetchEditions]);

  const deleteEdition = (edition: EditionListDto) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("EditionDeleteWarningMessage", edition.displayName),
      onOk: async () => {
        await editionService.deleteEdition(edition.id!);
        fetchEditions();
      },
    });
  };

  const getMenuItems = (record: EditionListDto): MenuProps => {
    const items: MenuProps["items"] = [];
    if (isGranted("Pages.Editions.Edit")) {
      items.push({
        key: "edit",
        label: L("Edit"),
        onClick: () => {
          setEditingEditionId(record.id);
          setCreateOrEditModalVisible(true);
        },
      });
    }
    if (isGranted("Pages.Editions.Delete")) {
      items.push({
        key: "delete",
        label: L("Delete"),
        onClick: () => deleteEdition(record),
        danger: true,
      });
    }
    if (isGranted("Pages.Editions.MoveTenantsToAnotherEdition")) {
      if (items.length > 0) items.push({ type: "divider" });
      items.push({
        key: "move",
        label: L("MoveTenantsToAnotherEdition"),
        onClick: () => {
          setMovingTenantsEditionId(record.id);
          setMoveTenantsModalVisible(true);
        },
      });
    }
    return { items };
  };

  const columns = [
    {
      title: L("Actions"),
      width: 130,
      align: "center" as const,
      render: (_text: string, record: EditionListDto) => (
        <Dropdown menu={getMenuItems(record)} trigger={["click"]}>
          <button
            type="button"
            className="btn btn-primary btn-sm dropdown-toggle d-inline-flex align-items-center"
          >
            <i className="fa fa-cog me-1"></i>
            {L("Actions")}
          </button>
        </Dropdown>
      ),
    },
    { title: L("EditionName"), dataIndex: "displayName" },
    {
      title: L("Price"),
      render: (_text: string, record: EditionListDto) =>
        record.monthlyPrice || record.annualPrice
          ? `${record.monthlyPrice}$ / ${record.annualPrice}$`
          : L("Free"),
    },
  ];

  return (
    <>
      <PageHeader
        title={L("Editions")}
        description={L("EditionsHeaderInfo")}
        actions={
          isGranted("Pages.Editions.Create") && (
            <button
              type="button"
              className="btn btn-primary d-inline-flex align-items-center"
              onClick={() => {
                setEditingEditionId(undefined);
                setCreateOrEditModalVisible(true);
              }}
            >
              <i className="fa fa-plus me-2 align-middle" />
              <span className="align-middle">{L("CreateNewEdition")}</span>
            </button>
          )
        }
      />
      <div className={containerClass}>
        <div className="card card-body">
          <Table
            dataSource={editions}
            columns={columns}
            loading={loading}
            rowKey="id"
          />
        </div>

        <CreateOrEditEditionModal
          isVisible={isCreateOrEditModalVisible}
          onClose={() => setCreateOrEditModalVisible(false)}
          onSave={fetchEditions}
          editionId={editingEditionId}
        />
        <MoveTenantsModal
          isVisible={isMoveTenantsModalVisible}
          onClose={() => setMoveTenantsModalVisible(false)}
          sourceEditionId={movingTenantsEditionId}
        />
      </div>
    </>
  );
};
export default EditionsPage;
