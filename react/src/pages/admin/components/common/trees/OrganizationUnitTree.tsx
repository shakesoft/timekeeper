import React, {
  useEffect,
  useImperativeHandle,
  useState,
  forwardRef,
  useMemo,
  type Key,
} from "react";
import { Tree } from "antd";
import type { CheckInfo } from "@rc-component/tree/lib/Tree";
import { OrganizationUnitDto } from "@api/generated/service-proxies";
import L from "@/lib/L";
import {
  arrayToTree,
  getAllChildrenKeys,
  type AppDataNode,
} from "../../../../../lib/tree-helper";

interface Props {
  allOrganizationUnits: OrganizationUnitDto[];
  selectedOrganizationUnitIds?: number[];
  cascadeSelectEnabled?: boolean;
  onChange?: (selectedIds: number[]) => void;
}

export interface OrganizationUnitsTreeRef {
  getSelectedOrganizationIds: () => number[];
  getSelectedOrganizations: () => Array<{ id: number; displayName: string }>;
}

const OrganizationUnitTree = forwardRef<OrganizationUnitsTreeRef, Props>(
  (
    {
      allOrganizationUnits,
      selectedOrganizationUnitIds = [],
      cascadeSelectEnabled = true,
      onChange,
    },
    ref,
  ) => {
    const [treeData, setTreeData] = useState<
      AppDataNode<OrganizationUnitDto>[]
    >([]);
    const [checkedKeys, setCheckedKeys] = useState<React.Key[]>([]);
    const [filter, setFilter] = useState("");

    useEffect(() => {
      const tree = arrayToTree<OrganizationUnitDto>(
        allOrganizationUnits ?? [],
        "parentId",
        "id",
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTreeData(tree);
    }, [allOrganizationUnits]);

    useEffect(() => {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCheckedKeys(selectedOrganizationUnitIds.map((id) => String(id)));
    }, [selectedOrganizationUnitIds]);

    useImperativeHandle(ref, () => ({
      getSelectedOrganizationIds: () =>
        (checkedKeys ?? []).map((k) => Number(k)),
      getSelectedOrganizations: () => {
        const idSet = new Set(checkedKeys.map((k) => Number(k)));
        return (allOrganizationUnits || [])
          .filter((ou) => idSet.has(ou.id!))
          .map((ou) => ({ id: ou.id!, displayName: ou.displayName! }));
      },
    }));

    const filteredTreeData = useMemo(() => {
      if (!filter) return treeData;

      const filterNodes = (
        nodes: AppDataNode<OrganizationUnitDto>[],
      ): AppDataNode<OrganizationUnitDto>[] => {
        return nodes.reduce<AppDataNode<OrganizationUnitDto>[]>((acc, node) => {
          const titleText =
            typeof node.title === "function"
              ? ""
              : node.title?.toString() || "";
          const isMatch = titleText
            .toLowerCase()
            .includes(filter.toLowerCase());

          if (node.children && node.children.length) {
            const filteredChildren = filterNodes(node.children);
            if (filteredChildren.length > 0 || isMatch) {
              acc.push({ ...node, children: filteredChildren });
            }
          } else if (isMatch) {
            acc.push(node);
          }
          return acc;
        }, []);
      };

      return filterNodes(treeData);
    }, [filter, treeData]);

    const handleCheck = (
      checked: { checked: Key[]; halfChecked: Key[] } | Key[],
      info: CheckInfo<AppDataNode<OrganizationUnitDto>>,
    ) => {
      const rawKeys = Array.isArray(checked) ? checked : checked.checked;
      let newCheckedKeys: string[] = rawKeys.map((k) => String(k));

      if (!cascadeSelectEnabled) {
        setCheckedKeys(newCheckedKeys);
        onChange?.(newCheckedKeys.map((k) => Number(k)));
        return;
      }

      if (info.checked) {
        let parent = info.node.parent as
          | AppDataNode<OrganizationUnitDto>
          | undefined;
        while (parent) {
          const parentKey = String(parent.key!);
          if (!newCheckedKeys.includes(parentKey)) {
            newCheckedKeys.push(parentKey);
          }
          parent = parent.parent as
            | AppDataNode<OrganizationUnitDto>
            | undefined;
        }
      } else {
        const childrenKeys = getAllChildrenKeys(info.node);
        newCheckedKeys = newCheckedKeys.filter(
          (key) => !childrenKeys.includes(key),
        );
      }

      setCheckedKeys(newCheckedKeys);
      onChange?.(newCheckedKeys.map((k) => Number(k)));
    };

    return (
      <div>
        <div className="my-3">
          <input
            type="text"
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={L("SearchWithThreeDot")!}
          />
        </div>
        <Tree<AppDataNode<OrganizationUnitDto>>
          checkable
          defaultExpandAll
          checkedKeys={checkedKeys}
          onCheck={handleCheck}
          treeData={filteredTreeData}
          blockNode
          showLine={true}
        />
      </div>
    );
  },
);

export default OrganizationUnitTree;
