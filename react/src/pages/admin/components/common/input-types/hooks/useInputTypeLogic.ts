import { useCallback, useMemo } from "react";

export const useStringArray = (value?: string | string[] | null): string[] => {
  return useMemo(() => {
    if (!value) return [];
    return Array.isArray(value) ? value.filter((v) => v != null) : [value];
  }, [value]);
};

export const useFilter = <T extends string>() => {
  return useCallback((allValues: T[], query: string): T[] => {
    if (!query) return allValues;
    const q = query.toLowerCase();
    return allValues.filter((v) => v.toLowerCase().includes(q));
  }, []);
};
