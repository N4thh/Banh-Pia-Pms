"use client";

import { useEffect, useState } from "react";
import { axiosClient } from "@/src/api/axios-client";
import StatsCalendar, { StatsWeekSelection } from "./StatsCalendar";
import OrdersByWeekdayChart from "./OrdersByWeekdayChart";
import CakeOverviewPieChart from "./CakeOverviewPieChart";
import MetricLineChart from "./MetricLineChart";
import VisitorsDoubleBarChart from "./VisitorsDoubleBarChart";
import DevicesPieChart from "./DevicesPieChart";

type WeekdayIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type CakeBreakDown = {
  totalCakes: number;
  totalOrders: number;
  byEggCount: Record<string, number>;
  byKind: Record<string, number>;
  byCakeIdEggCount: Record<string, Record<string, number>>;
};

type DailyStat = {
  date: string;
  weekdayIndex: WeekdayIndex;
  weekday: string;
  orders: number;
  cakes: number;
  visits: number;
  revenue: number;
  profit: number;
  newVisitors: number;
  returningVisitors: number;
};

type WeekdayStat = {
  weekdayIndex: WeekdayIndex;
  label: string;
  orders: number;
  cakes: number;
  visits: number;
  revenue: number;
  profit: number;
  newVisitors: number;
  returningVisitors: number;
};

type MetricComparison = {
  current: number;
  previous: number;
  changePercent: number | null;
  direction: "up" | "down" | "flat";
  isNew?: boolean;
};

type Comparison = {
  orders: MetricComparison;
  cakes: MetricComparison;
  visits: MetricComparison;
  revenue: MetricComparison;
  profit: MetricComparison;
  newVisitors: MetricComparison;
  returningVisitors: MetricComparison;
};

type StatsOverviewResponse = {
  range: {
    rangeStart: string;
    rangeEnd: string;
    weeks: number;
    dayCount: number;
    isPartial: boolean;
  };
  summary: {
    orders: number;
    cakes: number;
    visits: number;
    revenue: number;
    profit: number;
    newVisitors: number;
    returningVisitors: number;
  };
  comparison: Comparison | null;
  daily: DailyStat[];
  byWeekday: WeekdayStat[];
  cakeBreakdownByDate: Record<string, CakeBreakDown>;
  devices: {
    mobile: number;
    desktop: number;
    other: number;
    total: number;
  };
};
const formatMoney = (value: number) =>
  `${value.toLocaleString("vi-VN")} đ`;

type StatFormProps = {
  selectedWeeks?: StatsWeekSelection;
  mobile?: boolean;
};

export default function StatForm({ selectedWeeks, mobile = false }: StatFormProps) {
  const [startDate, setStartDate] = useState<string | null>(selectedWeeks?.startDate ?? null);
  const [weeks, setWeeks] = useState(selectedWeeks?.weeks ?? 0);
  const [stats, setStats] = useState<StatsOverviewResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedWeeks) {
      setStartDate(selectedWeeks.startDate);
      setWeeks(selectedWeeks.weeks);
    }
  }, [selectedWeeks]);

  useEffect(() => {
    let isCurrentRequest = true;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!startDate || weeks === 0) {
          setStats(null);
          setLoading(false);
          return;
        }

        const params = new URLSearchParams({
          startDate,
          weeks: String(weeks),
        });
        const response = await axiosClient.get<StatsOverviewResponse>(
          `/admin/stats/overview?${params.toString()}`,
        );

        // axiosClient đã return response.data ở interceptor.
        if (isCurrentRequest) {
          setStats(response as unknown as StatsOverviewResponse);
        }
      } catch (err: unknown) {
        if (!isCurrentRequest) return;
        setError(err instanceof Error ? err.message : "Không thể tải thống kê");
      } finally {
        if (isCurrentRequest) setLoading(false);
      }
    };

    void fetchStats();

    return () => {
      isCurrentRequest = false;
    };
  }, [startDate, weeks]);

  const comparisonLabel = (metric: MetricComparison | undefined) => {
    if (!metric || metric.changePercent === null) return "—";
    const sign = metric.changePercent > 0 ? "+" : "";
    return `${sign}${metric.changePercent}%`;
  };

  return (
    <section className={`flex w-full min-w-0 max-w-full gap-4 text-[#3D2008] ${mobile ? "flex-col overflow-visible" : "overflow-hidden"}`}>
      {!mobile && (
        <StatsCalendar
          selectedWeeks={selectedWeeks}
          onSelect={(selection) => {
            setStartDate(selection?.startDate ?? null);
            setWeeks(selection?.weeks ?? 0);
          }}
        />
      )}

      {loading && <p>Đang tải thống kê...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Stat */}
      <div className="min-w-0 flex-1">
        {stats && !loading && (
          <div className="flex min-w-0 flex-col">
            <div className={mobile
              ? "flex min-w-0 gap-3 overflow-x-auto rounded-2xl bg-[#FFFDF7] shadow-2xl no-scrollbar"
              : "grid min-w-0 grid-cols-1 gap-3 overflow-hidden rounded-2xl bg-[#FFFDF7] shadow-2xl sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"}>
              <KpiCard
                label="Tổng đơn"
                value={`${stats.summary.orders} đơn`}
                change={comparisonLabel(stats.comparison?.orders)}
                direction={stats.comparison?.orders?.direction}
              />
              <KpiCard
                label="Tổng bánh"
                value={`${stats.summary.cakes} bánh`}
                change={comparisonLabel(stats.comparison?.cakes)}
                direction={stats.comparison?.cakes?.direction}
              />
              <KpiCard
                label="Lượt truy cập"
                value={`${stats.summary.visits} lượt`}
                change={comparisonLabel(stats.comparison?.visits)}
                direction={stats.comparison?.visits?.direction}
              />
              <KpiCard
                label="Doanh thu"
                value={formatMoney(stats.summary.revenue)}
                change={comparisonLabel(stats.comparison?.revenue)}
                direction={stats.comparison?.revenue?.direction}
              />
              <KpiCard
                label="Lợi nhuận"
                value={formatMoney(stats.summary.profit)}
                change={comparisonLabel(stats.comparison?.profit)}
                direction={stats.comparison?.profit?.direction}
              />
            </div>
            {/* Doanh số đơn trong tuần   +    PieChart: overall số bánh bán ra */}
            <div className={`flex min-w-0 gap-4 ${mobile ? "flex-col" : "flex-wrap"}`}>
              <div className={`mt-5 min-w-0 ${mobile ? "w-full" : "w-[65%]"}`}>
                <OrdersByWeekdayChart
                  data={stats.byWeekday}
                />
              </div>

              <div className={`mt-5 min-w-0 ${mobile ? "w-full" : "w-[33%]"}`}>
                <CakeOverviewPieChart
                  cakeBreakdownByDate={stats.cakeBreakdownByDate}
                  daily={stats.daily}
                />
              </div>
            </div>

            {/* LineChart */}
            <div className="mt-5 min-w-0">
              <MetricLineChart daily={stats.daily} />
            </div>

            {/* Double Bar chart: New + returning visitors + Piechart: devices */}
            <div className={`flex min-w-0 gap-4 w-full ${mobile ? "flex-col" : "flex-wrap"}`}>
              <div className={`mt-5 min-w-0 ${mobile ? "w-full" : "w-[72%]"}`}>
                <VisitorsDoubleBarChart data={stats.daily} />
              </div>
              <div className={`mt-5 min-w-0 ${mobile ? "w-full" : "w-[26%]"}`}>
                <DevicesPieChart devices={stats.devices} />
              </div>
            </div>

          </div>
        )}
      </div>
    </section>
  );
}

type MetricDirection = "up" | "down" | "flat";
function KpiCard({ label, value, change, direction }: { label: string; value: string; change: string; direction?: MetricDirection; }) {
  const changeColor = direction === "up"
    ? "#34C759"
    : direction === "down"
      ? "#FF5F57"
      : undefined;

  return (
    <article className="relative min-w-40 shrink-0 p-4 after:absolute after:left-0 after:top-[15%] after:h-[70%] after:w-px after:bg-[#3D2008]/20 first:after:hidden">
      <p className="text-sm text-[#3D2008]/65"> {label}</p>
      <p className="mt-2 text-xl font-semibold"> {value} </p>
      <p className="mt-1 text-xs" style={{ color: changeColor }} >
        {change === "—"
          ? ""
          : `${change} so với tuần trước`}
      </p>
    </article>
  )
}
