import React, { useEffect, useMemo, useState } from "react";
import { Checkbox } from "antd";
import { Line, type LineConfig } from "@ant-design/plots";
import { TenantDashboardServiceProxy } from "@api/generated/service-proxies";
import { useServiceProxy } from "@/api/service-proxy-factory";
import useCurrencySign from "@/hooks/useCurrencySign";

interface RegionalStat {
  countryName?: string;
  sales?: number;
  change?: number[];
  averagePrice?: number;
  totalPrice?: number;
}

const colors = ["#00c5dc", "#f4516c", "#34bfa3", "#ffb822"];

const WidgetRegionalStatistics: React.FC = () => {
  const tenantDashboardService = useServiceProxy(
    TenantDashboardServiceProxy,
    [],
  );
  const currencySign = useCurrencySign();
  const [stats, setStats] = useState<RegionalStat[]>([]);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await tenantDashboardService.getRegionalStats();
      if (mounted) setStats(result.stats ?? []);
    })();
    return () => {
      mounted = false;
    };
  }, [tenantDashboardService]);

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(index);
    } else {
      newSelected.delete(index);
    }
    setSelectedRows(newSelected);
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return `${currencySign}0.00`;
    return `${currencySign}${value.toFixed(2)}`;
  };

  const MiniLineChart: React.FC<{ data: number[]; color: string }> = ({
    data,
    color,
  }) => {
    const chartData = useMemo(
      () => data.map((value, index) => ({ x: index + 1, y: value })),
      [data],
    );

    const config = useMemo(
      () =>
        ({
          data: chartData,
          xField: "x",
          yField: "y",
          smooth: true,
          color: color,
          point: { size: 0 },
          xAxis: false,
          yAxis: false,
          legend: false,
          tooltip: false,
          autoFit: true,
          height: 50,
        }) satisfies Partial<LineConfig>,
      [chartData, color],
    );

    return <Line {...config} />;
  };

  return (
    <div className="card card-custom h-100">
      <div className="card-header align-items-center border-0">
        <h3 className="card-title align-items-start flex-column">
          <span className="fw-bolder text-gray-900">Regional Stats</span>
        </h3>
      </div>
      <div className="card-body" style={{ overflowY: "auto" }}>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th className="m-widget11__label">#</th>
                <th className="m-widget11__app">Country</th>
                <th className="m-widget11__sales">Sales</th>
                <th className="m-widget11__change">Change</th>
                <th className="m-widget11__price">Avg Price</th>
                <th className="m-widget11__total">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat, index) => (
                <tr key={index}>
                  <td>
                    <label className="form-check form-check-custom form-check-solid py-1">
                      <Checkbox
                        checked={selectedRows.has(index)}
                        onChange={(e) =>
                          handleCheckboxChange(index, e.target.checked)
                        }
                      />
                    </label>
                  </td>
                  <td>{stat.countryName}</td>
                  <td>{formatCurrency(stat.sales)}</td>
                  <td>
                    <div
                      className="m-widget11__chart"
                      style={{ height: 50, width: 100 }}
                    >
                      {stat.change && stat.change.length > 0 && (
                        <MiniLineChart
                          data={stat.change}
                          color={colors[index % colors.length]}
                        />
                      )}
                    </div>
                  </td>
                  <td>{formatCurrency(stat.averagePrice)}</td>
                  <td>{formatCurrency(stat.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WidgetRegionalStatistics;
