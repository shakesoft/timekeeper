import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  type Key,
} from "react";
import { Tree } from "antd";
import type { CheckInfo } from "@rc-component/tree/lib/Tree";
import { FlatPermissionDto } from "@api/generated/service-proxies";
import {
  arrayToTree,
  type AppDataNode,
  getAllChildrenKeys,
} from "../../../../../lib/tree-helper";
import L from "@/lib/L";

interface PermissionTreeProps {
  permissions: FlatPermissionDto[];
  grantedPermissionNames: string[];
  singleSelect?: boolean;
  disableCascade?: boolean;
  showControls?: boolean;
  maxHeight?: string;
}

export interface PermissionTreeRef {
  getGrantedPermissionNames: () => string[];
  expandAll: () => void;
  collapseAll: () => void;
  setShowOnlyChecked: (value: boolean) => void;
}

const PermissionTree = forwardRef<PermissionTreeRef, PermissionTreeProps>(
  (
    {
      permissions,
      grantedPermissionNames,
      singleSelect,
      disableCascade,
      showControls = false,
      maxHeight = "400px",
    },
    ref,
  ) => {
    const [treeData, setTreeData] = useState<AppDataNode<FlatPermissionDto>[]>(
      [],
    );
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [filter, setFilter] = useState("");
    const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
    const [showOnlyChecked, setShowOnlyChecked] = useState<boolean>(false);
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const filteredTreeData = useMemo(() => {
      if (!filter) {
        if (!showOnlyChecked) return treeData;
        const filterToChecked = (
          nodes: AppDataNode<FlatPermissionDto>[],
        ): AppDataNode<FlatPermissionDto>[] => {
          return nodes.reduce<AppDataNode<FlatPermissionDto>[]>((acc, node) => {
            const isChecked = checkedKeys.includes(node.key as string);
            const children = node.children
              ? filterToChecked(node.children)
              : [];
            if (isChecked || children.length > 0) {
              acc.push({ ...node, children });
            }
            return acc;
          }, []);
        };
        return filterToChecked(treeData);
      }

      const filterNodes = (
        nodes: AppDataNode<FlatPermissionDto>[],
      ): AppDataNode<FlatPermissionDto>[] => {
        return nodes.reduce<AppDataNode<FlatPermissionDto>[]>((acc, node) => {
          const isMatch = node.title
            ?.toString()
            .toLowerCase()
            .includes(filter.toLowerCase());

          if (node.children) {
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

      const base = showOnlyChecked
        ? ((): AppDataNode<FlatPermissionDto>[] => {
            const filterToChecked = (
              nodes: AppDataNode<FlatPermissionDto>[],
            ): AppDataNode<FlatPermissionDto>[] => {
              return nodes.reduce<AppDataNode<FlatPermissionDto>[]>(
                (acc, node) => {
                  const isChecked = checkedKeys.includes(node.key as string);
                  const children = node.children
                    ? filterToChecked(node.children)
                    : [];
                  if (isChecked || children.length > 0) {
                    acc.push({ ...node, children });
                  }
                  return acc;
                },
                [],
              );
            };
            return filterToChecked(treeData);
          })()
        : treeData;
      return filterNodes(base);
    }, [filter, treeData, showOnlyChecked, checkedKeys]);

    useEffect(() => {
      const tree = arrayToTree<FlatPermissionDto>(
        permissions,
        "parentName",
        "name",
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTreeData(tree);
      setCheckedKeys(grantedPermissionNames);
      const collectKeys = (
        nodes: AppDataNode<FlatPermissionDto>[],
        acc: string[] = [],
      ): string[] => {
        nodes.forEach((n) => {
          if (n.key) acc.push(n.key as string);
          if (n.children) collectKeys(n.children, acc);
        });
        return acc;
      };
      setExpandedKeys(collectKeys(tree));
    }, [permissions, grantedPermissionNames]);

    useImperativeHandle(ref, () => ({
      getGrantedPermissionNames: () => {
        return checkedKeys;
      },
      expandAll: () => {
        const collectKeys = (
          nodes: AppDataNode<FlatPermissionDto>[],
          acc: string[] = [],
        ): string[] => {
          nodes.forEach((n) => {
            if (n.key) acc.push(n.key as string);
            if (n.children) collectKeys(n.children, acc);
          });
          return acc;
        };
        setExpandedKeys(collectKeys(treeData));
        setIsExpanded(true);
      },
      collapseAll: () => {
        setExpandedKeys([]);
        setIsExpanded(false);
      },
      setShowOnlyChecked: (value: boolean) => {
        setShowOnlyChecked(value);
      },
    }));

    const onCheck = (
      _checked: { checked: Key[]; halfChecked: Key[] } | Key[],
      info: CheckInfo<AppDataNode<FlatPermissionDto>>,
    ) => {
      if (singleSelect) {
        const newCheckedKeys = info.checked ? [String(info.node.key)] : [];
        setCheckedKeys(newCheckedKeys);
        return;
      }

      if (disableCascade) {
        const nodeKey = String(info.node.key);
        const newCheckedKeys = info.checked
          ? [...checkedKeys, nodeKey]
          : checkedKeys.filter((key) => key !== nodeKey);
        setCheckedKeys(newCheckedKeys);
        return;
      }

      let newCheckedKeys = [...checkedKeys];
      const nodeKey = String(info.node.key);

      if (info.checked) {
        if (!newCheckedKeys.includes(nodeKey)) {
          newCheckedKeys.push(nodeKey);
        }

        const childrenKeys = getAllChildrenKeys(info.node);
        childrenKeys.forEach((key) => {
          if (!newCheckedKeys.includes(key)) {
            newCheckedKeys.push(key);
          }
        });

        let parent = info.node.parent;
        while (parent) {
          const parentKey = String(parent.key);
          if (!newCheckedKeys.includes(parentKey)) {
            newCheckedKeys.push(parentKey);
          }
          parent = parent.parent;
        }
      } else {
        newCheckedKeys = newCheckedKeys.filter((key) => key !== nodeKey);

        const childrenKeys = getAllChildrenKeys(info.node);
        newCheckedKeys = newCheckedKeys.filter(
          (key) => !childrenKeys.includes(key),
        );
      }

      setCheckedKeys(newCheckedKeys);
    };

    return (
      <div>
        <div className="my-5">
          <input
            type="text"
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={L("SearchWithThreeDot")!}
          />
        </div>

        {showControls && (
          <div className="d-flex justify-content-between align-items-center mb-5">
            <div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                onClick={() => {
                  if (isExpanded) {
                    setExpandedKeys([]);
                    setIsExpanded(false);
                  } else {
                    const collectKeys = (
                      nodes: AppDataNode<FlatPermissionDto>[],
                      acc: string[] = [],
                    ): string[] => {
                      nodes.forEach((n) => {
                        if (n.key) acc.push(n.key as string);
                        if (n.children) collectKeys(n.children, acc);
                      });
                      return acc;
                    };
                    setExpandedKeys(collectKeys(treeData));
                    setIsExpanded(true);
                  }
                }}
                title={isExpanded ? L("CollapseAll")! : L("ExpandAll")!}
              >
                <i
                  className={`fa-solid ${isExpanded ? "fa-angles-up" : "fa-angles-down"}`}
                ></i>
                <span className="ms-2 text-muted">
                  {isExpanded ? L("CollapseAll") : L("ExpandAll")}
                </span>
              </button>
            </div>
            <div className="form-check form-switch">
              <input
                type="checkbox"
                className="form-check-input"
                id="ShowOnlyGrantedPermissions"
                checked={showOnlyChecked}
                onChange={(e) => setShowOnlyChecked(e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="ShowOnlyGrantedPermissions"
              >
                {showOnlyChecked
                  ? L("ShowAllPermissions")
                  : L("OnlyShowEnabledPermissions")}
              </label>
            </div>
          </div>
        )}

        <div style={{ maxHeight, overflowY: "auto" }}>
          <Tree<AppDataNode<FlatPermissionDto>>
            checkable
            checkStrictly={true}
            showLine={true}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            checkedKeys={checkedKeys}
            onCheck={onCheck}
            treeData={filteredTreeData}
          />
        </div>
      </div>
    );
  },
);

export default PermissionTree;
