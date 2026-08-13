"use client";

import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";

type DailyStat = {
  date: string;
  weekdayIndex: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  weekday: string;
  orders: number;
  cakes: number;
  visits: number;
  revenue: number;
  profit: number;
};

const METRICS = [
  { key: "revenue" as const, label: "Doanh thu", unit: "Đơn vị: Triệu", divisor: 1_000_000, color: "#C2973F", isMoney: true },
  { key: "orders" as const, label: "Tổng đơn", unit: "Đơn vị: Đơn", divisor: 1, color: "#C2973F" },
  { key: "cakes" as const, label: "Tổng bánh", unit: "Đơn vị: Bánh", divisor: 1, color: "#C2973F" },
  { key: "visits" as const, label: "Lượt truy cập", unit: "Đơn vị: Lượt", divisor: 1, color: "#C2973F" },
  { key: "profit" as const, label: "Lợi nhuận", unit: "Đơn vị: Triệu", divisor: 1_000_000, color: "#C2973F", isMoney: true },
];

type MetricKey = (typeof METRICS)[number]["key"];

const formatMetricValue = (value: number, isMoney?: boolean) =>
  isMoney ? `${Math.round(value).toLocaleString("vi-VN")} đ` : `${value}`;

const formatAxisValue = (value: number, isMoney?: boolean) =>
  isMoney ? `${value} triệu` : `${value}`;

function aggregateByWeekday(daily: DailyStat[]) {
  const map = new Map<number, { orders: number; cakes: number; visits: number; revenue: number; profit: number }>();
  for (const day of daily) {
    const entry = map.get(day.weekdayIndex) ?? { orders: 0, cakes: 0, visits: 0, revenue: 0, profit: 0 };
    entry.orders += day.orders;
    entry.cakes += day.cakes;
    entry.visits += day.visits;
    entry.revenue += day.revenue;
    entry.profit += day.profit;
    map.set(day.weekdayIndex, entry);
  }
  return map;
}

export default function MetricLineChart({ daily }: { daily: DailyStat[] }) {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("revenue");
  const metric = METRICS.find((m) => m.key === selectedMetric) ?? METRICS[0];

  const agg = useMemo(() => aggregateByWeekday(daily), [daily]);

  const labels = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const values = Array.from({ length: 7 }, (_, i) => {
    const entry = agg.get(i + 1);
    return entry ? Math.round(((entry[selectedMetric] as number) / metric.divisor) * 10) / 10 : 0;
  });
  
  const total = values.reduce((sum, v) => sum + v, 0);
  const count = values.filter((v) => v > 0).length;
  const avg = count > 0 ? Math.round((total / count) * 10) / 10 : 0;
  const maxDay = labels[values.indexOf(Math.max(...values))];

  const option = {
     textStyle: {
      fontFamily: "Be Vietnam Pro",
    },    
    animationDuration: 500,
    grid: { top: 35, right: 40, bottom: 28, left: 20, containLabel: true },
    tooltip: {
      trigger: "axis",
      formatter: (params: Array<{ name: string; value: number }>) => {
        const p = params[0];
        const rawValue = p.value * metric.divisor;
        return `${p.name}<br/>${metric.label}: <b>${formatMetricValue(rawValue, metric.isMoney)}</b>`;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        fontSize: 13, 
      }
    },
    yAxis: {
      type: "value",
      min: 0,
      minInterval:  1,
      axisLabel: {
        formatter: (value: number) => formatAxisValue(value, metric.isMoney),
        fontSize: 15, 
      },
      name: metric.unit,
      nameTextStyle: {
        fontSize: 13,
        fontFamily: "Be Vietnam Pro",
      },
      splitLine: { lineStyle: { color: "#3D2008", opacity: 0.1 } },
    },
    series: [
      {
        type: "line",
        data: values,
        // Basic line chart: đoạn nối thẳng giữa các điểm, không smooth/area fill.
        smooth: false,
        lineStyle: { width: 2, color: metric.color },
        itemStyle: { color: metric.color },
        symbol: "circle",
        symbolSize: 6,
        showSymbol: true,
      },
    ],
  };

  return (
    <div className="rounded-2xl border border-[#3D2008]/10 bg-[#FFFDF7] p-4 shadow-xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{metric.label} trong tuần</h2>
        </div>
        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as MetricKey)}
          className="rounded-lg border border-[#3D2008]/25 bg-white px-3 py-1.5 text-sm"
        >
          {METRICS.map((m) => (
            <option key={m.key} value={m.key}>{m.label}</option>
          ))}
        </select>
      </div>
      <ReactECharts option={option} style={{ height: 300, width: "100%" }} />
      <div className="flex justify-between text-xs text-[#3D2008]">
        <span className="flex flex-col items-center gap-1
          text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]">{metric.label}: 
          <span className="font-medium
            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]"
            >{formatMetricValue(total * metric.divisor, metric.isMoney)}
          </span>
        </span>

        <span className="flex flex-col items-center gap-1
          text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]">Trung bình mỗi ngày: 
          <span className="font-medium
            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">
            {formatMetricValue(avg * metric.divisor, metric.isMoney)}
          </span> 
        </span>

        <span className="flex flex-col items-center gap-1
          text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px]">Ngày cao nhất: 
          <span className="font-medium
            text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px]">{maxDay}
          </span>
        </span>
      </div>
    </div>
  );
}
