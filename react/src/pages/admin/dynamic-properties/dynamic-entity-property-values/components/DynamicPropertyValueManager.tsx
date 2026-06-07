import { useServiceProxy } from "@/api/service-proxy-factory";
import DynamicInput from "@/pages/admin/components/common/input-types/DynamicInput";
import {
  CleanValuesInput,
  DynamicEntityPropertyValueServiceProxy,
  GetAllDynamicEntityPropertyValuesOutputItem,
  InsertOrUpdateAllValuesInput,
  InsertOrUpdateAllValuesInputItem,
} from "@api/generated/service-proxies";
import { usePermissions } from "@hooks/usePermissions";
import { Table, App } from "antd";
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import L from "@/lib/L";

interface Props {
  entityFullName: string;
  entityId: string;
}

export interface DynamicPropertyValueManagerRef {
  saveAll: () => void;
}

const DynamicPropertyValueManager = forwardRef<
  DynamicPropertyValueManagerRef,
  Props
>(({ entityFullName, entityId }, ref) => {
  const { isGranted } = usePermissions();
  const dynamicEntityPropertyValueService = useServiceProxy(
    DynamicEntityPropertyValueServiceProxy,
    [],
  );
  const { modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<
    GetAllDynamicEntityPropertyValuesOutputItem[]
  >([]);
  const [values, setValues] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    if (!entityFullName || !entityId) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    dynamicEntityPropertyValueService
      .getAllDynamicEntityPropertyValues(entityFullName, entityId)
      .then((data) => {
        setItems(data.items ?? []);
        const initialValues =
          data.items?.reduce(
            (acc, item) => {
              acc[item.propertyName!] = item.selectedValues ?? [];
              return acc;
            },
            {} as { [key: string]: string[] },
          ) ?? {};
        setValues(initialValues);
      })
      .finally(() => setLoading(false));
  }, [entityFullName, entityId, dynamicEntityPropertyValueService]);

  const handleValueChange = (propertyName: string, newValues: string[]) => {
    setValues((prev) => ({
      ...prev,
      [propertyName]: newValues,
    }));
  };

  const deleteAllValues = (
    item: GetAllDynamicEntityPropertyValuesOutputItem,
  ) => {
    modal.confirm({
      title: L("AreYouSure"),
      content: L("DeleteDynamicEntityPropertyValueMessage", item.propertyName),
      onOk: async () => {
        const input = new CleanValuesInput({
          dynamicEntityPropertyId: item.dynamicEntityPropertyId,
          entityId: entityId,
        });
        await dynamicEntityPropertyValueService.cleanValues(input);
        handleValueChange(item.propertyName!, []);
      },
    });
  };

  const saveAll = async () => {
    const inputItems = items.map(
      (item) =>
        new InsertOrUpdateAllValuesInputItem({
          dynamicEntityPropertyId: item.dynamicEntityPropertyId,
          entityId: entityId,
          values: values[item.propertyName!] || [],
        }),
    );

    const input = new InsertOrUpdateAllValuesInput({ items: inputItems });
    await dynamicEntityPropertyValueService.insertOrUpdateAllValues(input);
  };

  useImperativeHandle(ref, () => ({
    saveAll,
  }));

  const columns = [
    { title: L("PropertyName"), dataIndex: "propertyName", width: "20%" },
    {
      title: L("Values"),
      dataIndex: "values",
      render: (
        _text: unknown,
        record: GetAllDynamicEntityPropertyValuesOutputItem,
      ) => (
        <DynamicInput
          type={record.inputType?.name ?? ""}
          allValues={record.allValuesInputTypeHas}
          selectedValues={values[record.propertyName!] || []}
          onChange={(newValues) =>
            handleValueChange(record.propertyName!, newValues)
          }
        />
      ),
    },
    {
      title: L("Actions"),
      width: 100,
      render: (
        _text: unknown,
        record: GetAllDynamicEntityPropertyValuesOutputItem,
      ) =>
        isGranted("Pages.Administration.DynamicEntityPropertyValue.Delete") && (
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => deleteAllValues(record)}
          >
            {L("Delete")}
          </button>
        ),
    },
  ];

  return (
    <Table
      dataSource={items}
      columns={columns}
      loading={loading}
      rowKey="dynamicEntityPropertyId"
      pagination={false}
      size="small"
    />
  );
});

export default DynamicPropertyValueManager;
