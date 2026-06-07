import type { DataNode } from "antd/es/tree";

export interface TreeItem {
  displayName?: string;
}

export interface AppDataNode<T extends TreeItem = TreeItem> extends DataNode {
  data: T;
  children?: AppDataNode<T>[];
  parent?: AppDataNode<T>;
}

export const arrayToTree = <T extends TreeItem>(
  items: T[],
  parentIdField: string,
  idField: string,
): AppDataNode<T>[] => {
  const itemMap: { [key: string]: AppDataNode<T> } = {};

  items.forEach((item) => {
    const rec = item as Record<string, unknown>;
    const key = String(rec[idField]);
    itemMap[key] = {
      key: key,
      title: item.displayName as string,
      children: [],
      data: item,
    };
  });

  const tree: AppDataNode<T>[] = [];

  items.forEach((item) => {
    const rec = item as Record<string, unknown>;
    const key = String(rec[idField]);
    const parentKey = rec[parentIdField];

    if (
      parentKey !== undefined &&
      parentKey !== null &&
      itemMap[String(parentKey)]
    ) {
      const child = itemMap[key];
      const parent = itemMap[String(parentKey)];
      child.parent = parent;
      parent.children?.push(child);
    } else {
      tree.push(itemMap[key]);
    }
  });

  return tree;
};

export const getAllChildrenKeys = <T extends TreeItem = TreeItem>(
  node: AppDataNode<T>,
): string[] => {
  let keys: string[] = [];
  if (node.children) {
    for (const child of node.children) {
      keys.push(child.key as string);
      keys = keys.concat(getAllChildrenKeys(child));
    }
  }
  return keys;
};
