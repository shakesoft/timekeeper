import React, {
  useState,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Tree, Dropdown, App } from "antd";
import type { MenuProps } from "antd";
import {
  OrganizationUnitDto,
  OrganizationUnitServiceProxy,
} from "@api/generated/service-proxies";
import { usePermissions } from "../../../../hooks/usePermissions";
import { arrayToTree, type AppDataNode } from "../../../../lib/tree-helper";
import type {
  IBasicOrganizationUnitInfo,
  OrganizationUnitTreeRef,
} from "../types";
import CreateOrEditUnitModal from "./CreateOrEditUnitModal";
import { useServiceProxy } from "@/api/service-proxy-factory";
import L from "@/lib/L";

interface Props {
  onOuSelect: (ou: IBasicOrganizationUnitInfo | null) => void;
}

const OrganizationTree = forwardRef<OrganizationUnitTreeRef, Props>(
  ({ onOuSelect }, ref) => {
    const { isGranted } = usePermissions();
    const organizationUnitService = useServiceProxy(
      OrganizationUnitServiceProxy,
      [],
    );
    const { modal } = App.useApp();
    const [treeData, setTreeData] = useState<
      AppDataNode<OrganizationUnitDto>[]
    >([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingOu, setEditingOu] = useState<
      IBasicOrganizationUnitInfo | undefined
    >();

    const canManage = isGranted(
      "Pages.Administration.OrganizationUnits.ManageOrganizationTree",
    );

    const fetchTreeData = useCallback(async () => {
      const result = await organizationUnitService.getOrganizationUnits();
      const tree = arrayToTree<OrganizationUnitDto>(
        result.items ?? [],
        "parentId",
        "id",
      );
      setTreeData(tree);
    }, [organizationUnitService]);

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTreeData();
    }, [fetchTreeData]);

    useImperativeHandle(ref, () => ({
      reload: fetchTreeData,
    }));

    const getContextMenuItems = (
      node: AppDataNode<OrganizationUnitDto>,
    ): MenuProps => {
      const items: MenuProps["items"] = [];
      if (canManage) {
        items.push({
          key: "edit",
          label: L("Edit"),
          onClick: () => {
            setEditingOu(node.data);
            setModalVisible(true);
          },
        });
        items.push({
          key: "addSub",
          label: L("AddSubUnit"),
          onClick: () => {
            setEditingOu({
              parentId: node.data.id,
            } as IBasicOrganizationUnitInfo);
            setModalVisible(true);
          },
        });
        items.push({
          key: "delete",
          label: L("Delete"),
          danger: true,
          onClick: () => {
            modal.confirm({
              title: L("AreYouSure"),
              content: L("OrganizationUnitDeleteWarningMessage", {
                0: node.data.displayName ?? "",
              }),
              onOk: async () => {
                await organizationUnitService.deleteOrganizationUnit(
                  node.data.id,
                );
                await fetchTreeData();
              },
            });
          },
        });
      }
      return { items };
    };

    return (
      <div className="card card-custom">
        <div className="card-header">
          <div className="card-title">{L("OrganizationTree")}</div>
          <div className="card-toolbar">
            {canManage && (
              <button
                type="button"
                className="btn btn-sm btn-outline btn-outline-primary"
                onClick={() => {
                  setEditingOu({});
                  setModalVisible(true);
                }}
              >
                <i className="fa fa-plus"></i> {L("AddRootUnit")}
              </button>
            )}
          </div>
        </div>
        <div className="card-body">
          <Tree
            treeData={treeData}
            onSelect={(_, info) => onOuSelect(info.node.data)}
            draggable={false}
            showLine={true}
            blockNode
            defaultExpandAll
            titleRender={(node) => (
              <Dropdown
                menu={getContextMenuItems(node)}
                trigger={["contextMenu"]}
              >
                <div>{node.title as React.ReactNode}</div>
              </Dropdown>
            )}
          />
        </div>
        <CreateOrEditUnitModal
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSave={fetchTreeData}
          organizationUnit={editingOu}
        />
      </div>
    );
  },
);
export default OrganizationTree;
