import L from "@/lib/L";
import { AbpLoginResultType } from "@api/generated/service-proxies";

export const getLoginResultTypeOptions = (): {
  label: string;
  value: AbpLoginResultType | "";
}[] => {
  const options: { label: string; value: AbpLoginResultType | "" }[] = [
    { label: L("All"), value: "" },
  ];

  for (const member in AbpLoginResultType) {
    if (!isNaN(parseInt(member))) {
      options.push({
        label: L("AbpLoginResultType_" + AbpLoginResultType[member]),
        value: parseInt(member) as unknown as AbpLoginResultType,
      });
    }
  }

  return options;
};
