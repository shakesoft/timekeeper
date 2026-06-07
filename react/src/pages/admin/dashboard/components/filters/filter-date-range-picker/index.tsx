import React, { useContext, useMemo } from "react";
import { DashboardContext } from "../../../customizable-dashboard/types";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker } from "antd";
import { getDate } from "@/pages/admin/components/common/timing/lib/datetime-helper";
import L from "@/lib/L";

const FilterDateRangePicker: React.FC = () => {
  const ctx = useContext(DashboardContext);
  const value: [Dayjs | null, Dayjs | null] | null = useMemo(() => {
    if (!ctx?.selectedDateRange) return null;
    const [s, e] = ctx.selectedDateRange;
    return [s ? dayjs(s) : null, e ? dayjs(e) : null];
  }, [ctx?.selectedDateRange]);

  const onStartChange = (value: Dayjs | null) => {
    if (!ctx) return;
    const start = value ?? getDate();
    const end = ctx.selectedDateRange?.[1] ?? new Date();
    ctx.setSelectedDateRange([start, end]);
  };

  const onEndChange = (value: Dayjs | null) => {
    if (!ctx) return;
    const start = ctx.selectedDateRange?.[0] ?? getDate();
    const end = value ?? getDate();
    ctx.setSelectedDateRange([start, end]);
  };

  return (
    <div className="d-flex align-items-center gap-2">
      <div className="d-flex flex-column flex-grow-1">
        <p className="text-muted fw-bold text-start mt-2 ms-1 mb-1">
          {L("StartTime")}
        </p>
        <DatePicker
          className="form-control form-control-sm w-100"
          value={value?.[0] ? value[0] : undefined}
          onChange={onStartChange}
        />
      </div>
      <div className="d-flex flex-column flex-grow-1">
        <p className="text-muted fw-bold text-start mt-2 ms-1 mb-1">
          {L("EndTime")}
        </p>
        <DatePicker
          className="form-control form-control-sm w-100"
          value={value?.[1] ? value[1] : undefined}
          onChange={onEndChange}
        />
      </div>
    </div>
  );
};

export default FilterDateRangePicker;
