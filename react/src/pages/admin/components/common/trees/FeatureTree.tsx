import {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  type Key,
} from "react";
import { Tree } from "antd";
import type { CheckInfo } from "@rc-component/tree/lib/Tree";
import { FlatFeatureDto, NameValueDto } from "@api/generated/service-proxies";
import {
  arrayToTree,
  getAllChildrenKeys,
  type AppDataNode,
} from "../../../../../lib/tree-helper";

interface FeatureTreeProps {
  editData?: FeatureTreeEditModel;
}

interface FeatureTreeEditModel {
  features: FlatFeatureDto[];

  featureValues: NameValueDto[];
}

export interface FeatureTreeRef {
  getGrantedFeatures: () => NameValueDto[];
  areAllValuesValid: () => boolean;
}

const FeatureTree = forwardRef<FeatureTreeRef, FeatureTreeProps>(
  ({ editData }, ref) => {
    const [treeData, setTreeData] = useState<AppDataNode<FlatFeatureDto>[]>([]);
    const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
    const [inputValues, setInputValues] = useState<{ [key: string]: string }>(
      {},
    );

    useEffect(() => {
      if (!editData?.features) {
        return;
      }

      const tree = arrayToTree(
        editData.features as Array<FlatFeatureDto & Record<string, unknown>>,
        "parentName",
        "name",
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTreeData(tree);

      const initialCheckedKeys: string[] = [];
      const initialInputValues: { [key: string]: string } = {};

      editData.features.forEach((feature) => {
        const featureValue = editData.featureValues.find(
          (f) => f.name === feature.name,
        );
        const value = featureValue ? featureValue.value : feature.defaultValue;

        if (feature.inputType?.name === "CHECKBOX") {
          if (value?.toLowerCase() === "true") {
            initialCheckedKeys.push(feature.name!);
          }
        } else if (value) {
          initialInputValues[feature.name!] = value;
        }
      });

      setCheckedKeys(initialCheckedKeys);
      setInputValues(initialInputValues);
    }, [editData]);

    const isFeatureValueValid = (
      feature: FlatFeatureDto,
      value: string,
    ): boolean => {
      const validator = feature.inputType?.validator;
      if (!validator) return true;

      if (validator.name === "STRING") {
        if (value === undefined || value === null) {
          return !!validator.attributes?.AllowNull;
        }
        if (typeof value !== "string") return false;
        const min = validator.attributes?.MinLength ?? 0;
        const max = validator.attributes?.MaxLength ?? 0;
        if (min > 0 && value.length < min) return false;
        if (max > 0 && value.length > max) return false;
        const regex = validator.attributes?.RegularExpression;
        if (regex) {
          try {
            return new RegExp(regex).test(value);
          } catch {
            return false;
          }
        }
        return true;
      }

      if (validator.name === "NUMERIC") {
        const num = parseInt(value, 10);
        if (isNaN(num)) return false;
        const min = validator.attributes?.MinValue ?? Number.MIN_SAFE_INTEGER;
        const max = validator.attributes?.MaxValue ?? 0;
        if (num < min) return false;
        if (max > 0 && num > max) return false;
        return true;
      }
      return true;
    };

    useImperativeHandle(ref, () => ({
      getGrantedFeatures: () => {
        if (!editData?.features) return [];

        return editData.features.map((feature) => {
          let value = "false";
          if (feature.inputType?.name === "CHECKBOX") {
            value = checkedKeys.includes(feature.name!) ? "true" : "false";
          } else if (inputValues[feature.name!]) {
            value = inputValues[feature.name!];
          }
          return new NameValueDto({ name: feature.name, value: value });
        });
      },
      areAllValuesValid: () => {
        if (!editData?.features) return true;
        for (const feature of editData.features) {
          const fName = feature.name as string;
          let value: string;
          if (feature.inputType?.name === "CHECKBOX") {
            value = checkedKeys.includes(fName) ? "true" : "false";
          } else if (inputValues[fName]) {
            value = inputValues[fName];
          } else {
            value = feature.defaultValue || "";
          }
          if (!isFeatureValueValid(feature, value)) return false;
        }
        return true;
      },
    }));

    const onCheck = (
      checked: { checked: Key[]; halfChecked: Key[] } | Key[],
      info: CheckInfo<AppDataNode<FlatFeatureDto>>,
    ) => {
      const checkedArray = Array.isArray(checked) ? checked : checked.checked;
      let newCheckedKeys = checkedArray.map((key) => String(key));

      if (info.checked) {
        let parent = info.node.parent;
        while (parent) {
          const parentKey = String(parent.key);
          if (!newCheckedKeys.includes(parentKey)) {
            newCheckedKeys.push(parentKey);
          }
          parent = parent.parent;
        }
      } else {
        const childrenKeys = getAllChildrenKeys(info.node);
        newCheckedKeys = newCheckedKeys.filter(
          (key) => !childrenKeys.includes(key),
        );
      }
      setCheckedKeys(newCheckedKeys);
    };

    const handleInputChange = (name: string, value: string) => {
      setInputValues((prev) => ({ ...prev, [name]: value }));
    };

    const renderTitle = (node: AppDataNode<FlatFeatureDto>) => {
      const inputTypeName = node.data?.inputType?.name ?? "";
      const featureName = node.data?.name ?? "";

      return (
        <span className="d-flex align-items-center gap-2">
          <span>
            {typeof node.title === "function" ? node.title(node) : node.title}
          </span>
          {inputTypeName === "SINGLE_LINE_STRING" && (
            <input
              className="form-control form-control-sm"
              style={{ width: "100px" }}
              value={inputValues[featureName]}
              onChange={(e) => handleInputChange(featureName, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          )}
          {inputTypeName === "COMBOBOX" && (
            <select
              className="form-control"
              style={{ width: "150px" }}
              value={inputValues[featureName]}
              onChange={(e) =>
                handleInputChange(
                  featureName,
                  (e.target as HTMLSelectElement).value,
                )
              }
              onClick={(e) => e.stopPropagation()}
            >
              <option value=""></option>
              {node.data.inputType?.itemSource?.items?.map(
                (item: { value?: string | number; displayText?: string }) => (
                  <option key={String(item.value)} value={String(item.value)}>
                    {item.displayText}
                  </option>
                ),
              )}
            </select>
          )}
        </span>
      );
    };

    return (
      <Tree
        checkable
        selectable={false}
        defaultExpandAll
        checkedKeys={checkedKeys}
        onCheck={onCheck}
        treeData={treeData}
        titleRender={renderTitle}
        showLine={true}
      />
    );
  },
);

export default FeatureTree;
