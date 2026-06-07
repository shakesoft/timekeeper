import type { InputTypeConfigurationDefinition } from "./types";
import SingleLineStringInput from "./input-components/SingleLineStringInput";
import CheckboxInput from "./input-components/CheckboxInput";
import ComboboxInput from "./input-components/ComboboxInput";
import MultiSelectComboboxInput from "./input-components/MultiSelectComboboxInput";

export const INPUT_TYPES = {
  SINGLE_LINE_STRING: "SINGLE_LINE_STRING",
  CHECKBOX: "CHECKBOX",
  COMBOBOX: "COMBOBOX",
  MULTISELECTCOMBOBOX: "MULTISELECTCOMBOBOX",
} as const;

export const InputTypeConfigurationDefinitions: InputTypeConfigurationDefinition[] =
  [
    {
      name: "SINGLE_LINE_STRING",
      component: SingleLineStringInput,
      hasValues: false,
    },
    { name: "CHECKBOX", component: CheckboxInput, hasValues: false },
    { name: "COMBOBOX", component: ComboboxInput, hasValues: true },
    {
      name: "MULTISELECTCOMBOBOX",
      component: MultiSelectComboboxInput,
      hasValues: true,
    },
  ];

export const getByName = (
  name: string,
): InputTypeConfigurationDefinition | null => {
  const def = InputTypeConfigurationDefinitions.find((d) => d.name === name);
  return def ?? null;
};
