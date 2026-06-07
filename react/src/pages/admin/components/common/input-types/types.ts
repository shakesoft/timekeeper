export type InputTypeName =
  | "SINGLE_LINE_STRING"
  | "CHECKBOX"
  | "COMBOBOX"
  | "MULTISELECTCOMBOBOX";

export interface InputTypeComponentProps {
  selectedValues: string[];
  allValues: string[];
  onChange: (values: string[]) => void;
  onInstance?: (instance: unknown) => void;
}

export interface InputTypeConfigurationDefinition {
  name: InputTypeName;
  component: React.ComponentType<InputTypeComponentProps>;
  hasValues: boolean;
}
