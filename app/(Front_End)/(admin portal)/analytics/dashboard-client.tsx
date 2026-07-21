"use client";

import { useState, useTransition } from "react";
import { Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import {
  getDashboardData,
  type KpiCard,
  type WeekdayOccupancy,
  type ServiceSlice,
  type RecentActivityRow,
  type DailyRevenuePoint,
} from "../_actions/adminDashboard";
import type { DateRangeKey } from "@/lib/date-range";

const PIE_COLORS = ["#1A6B5A", "#2DBFA0", "#fbbf24", "#60a5fa"];

const dateRanges: { label: string; value: DateRangeKey }[] = [
  { label: "اليوم", value: "today" },
  { label: "أسبوع", value: "week" },
  { label: "شهر", value: "month" },
  { label: "سنة", value: "year" },
  { label: "كل الوقت", value: "all" },
];

function statusBadge(statusType: string) {
  const base = "text-[10px] font-bold px-2.5 py-0.5 rounded-full";
  if (statusType === "success") return `${base} bg-emerald-50 text-emerald-700`;
  if (statusType === "pending") return `${base} bg-amber-50 text-amber-700`;
  return `${base} bg-red-50 text-red-600`;
}

export interface DashboardClientProps {
  initialKpis: KpiCard[];
  initialBarData: WeekdayOccupancy[];
  initialPieData: ServiceSlice[];
  initialRecentActivity: RecentActivityRow[];
  initialRevenueByDay: DailyRevenuePoint[];
  initialRangeLabel: string;
}

export default function DashboardClient({
  initialKpis,
  initialBarData,
  initialPieData,
  initialRecentActivity,
  initialRevenueByDay,
  initialRangeLabel,
}: DashboardClientProps) {
  const [rangeKey, setRangeKey] = useState<DateRangeKey>("month");
  const [rangeLabel, setRangeLabel] = useState(initialRangeLabel);
  const [kpis, setKpis] = useState(initialKpis);
  const [barData, setBarData] = useState(initialBarData);
  const [pieData, setPieData] = useState(initialPieData);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [revenueByDay, setRevenueByDay] = useState(initialRevenueByDay);
  const [isPending, startTransition] = useTransition();

  function handleRangeChange(value: DateRangeKey) {
    setRangeKey(value);
    startTransition(async () => {
      const data = await getDashboardData(value);
      setKpis(data.kpis);
      setBarData(data.barData);
      setPieData(data.pieData);
      setRecentActivity(data.recentActivity);
      setRevenueByDay(data.revenueByDay);
      setRangeLabel(data.rangeLabel);
    });
  }

  // Build an SVG polyline from real daily revenue points (0..600 x, 0..200 y, inverted)
  const maxRevenue = Math.max(1, ...revenueByDay.map((p) => p.amount));
  const stepX = revenueByDay.length > 1 ? 600 / (revenueByDay.length - 1) : 600;
  const linePoints = revenueByDay
    .map((p, i) => {
      const x = i * stepX;
      const y = 190 - (p.amount / maxRevenue) * 170;
      return `${x},${y}`;
    })
    .join(" ");
  const lastPoint = revenueByDay[revenueByDay.length - 1];
  const lastX = (revenueByDay.length - 1) * stepX;
  const lastY = revenueByDay.length ? 190 - (lastPoint.amount / maxRevenue) * 170 : 190;

  // Build the pie chart's stroke-dasharray offsets cumulatively from live data
  let cumulativeOffset = 0;
  const pieArcs = pieData.map((slice, i) => {
    const arc = { ...slice, color: PIE_COLORS[i % PIE_COLORS.length], offset: -cumulativeOffset };
    cumulativeOffset += slice.pct;
    return arc;
  });

  return (
    <div className="space-y-6 text-right animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface">لوحة الإحصائيات والأداء</h1>
          <p className="text-sm text-muted-foreground">التقرير الإجمالي لنشاط العيادة الطبي والمالي</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1 shadow-sm">
            {dateRanges.map((r) => (
              <button
                key={r.value}
                onClick={() => handleRangeChange(r.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  rangeKey === r.value
                    ? "bg-[#1A6B5A] text-white"
                    : "text-muted-foreground hover:bg-gray-50"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-muted-foreground shadow-sm">
            {isPending ? (
              <Loader2 size={14} className="text-[#1A6B5A] animate-spin" />
            ) : (
              <Calendar size={14} className="text-[#1A6B5A]" />
            )}
            <span>{rangeLabel}</span>
          </div>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-border shadow-sm space-y-2">
            <span className="text-xs text-muted-foreground">{kpi.label}</span>
            <div className="flex justify-between items-center">
              <span className="text-lg md:text-xl font-bold text-on-surface">{kpi.value}</span>
              <span
                className={`text-xs font-bold flex items-center gap-0.5 ${
                  kpi.up ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span>{kpi.change}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Line Chart (real data) */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#1A6B5A]">الإيرادات اليومية</h3>
          <span className="text-xs text-muted-foreground">ريال سعودي</span>
        </div>
        <div className="h-64 relative">
          {revenueByDay.length === 0 ? (
            <p className="text-xs text-muted-foreground py-24 text-center">لا توجد بيانات كافية لهذه الفترة</p>
          ) : (
            <>
              <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2DBFA0" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#1A6B5A" stopOpacity="0.02" />
                  </linearGradient>
                </defs>
                {[50, 100, 150].map((y) => (
                  <line key={y} x1="0" y1={y} x2="600" y2={y} stroke="#f0f0f0" strokeWidth="1" />
                ))}
                <polyline points={linePoints} fill="none" stroke="#1A6B5A" strokeWidth="3" strokeLinecap="round" />
                <polygon points={`0,200 ${linePoints} 600,200`} fill="url(#revenueGrad)" />
                <circle cx={lastX} cy={lastY} r="5" fill="#2DBFA0" stroke="#1A6B5A" strokeWidth="2.5" />
              </svg>
              <div className="absolute top-2 left-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] leading-relaxed shadow-lg border border-gray-800">
                <span className="text-[#2DBFA0] font-bold block">{lastPoint.dateLabel}</span>
                <span>{lastPoint.amount.toLocaleString("en-US")} ر.س</span>
              </div>
            </>
          )}
        </div>
        {revenueByDay.length > 0 && (
          <div className="flex justify-between text-[10px] text-muted-foreground px-1">
            <span>{revenueByDay[0].dateLabel}</span>
            <span>{revenueByDay[Math.floor(revenueByDay.length / 2)].dateLabel}</span>
            <span>{lastPoint.dateLabel}</span>
          </div>
        )}
      </div>

      {/* Two Charts Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart — توزيع الخدمات (real data) */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-on-surface">توزيع الخدمات</h4>
          {pieData.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">لا توجد بيانات كافية لهذه الفترة</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
                  {pieArcs.map((arc, i) => (
                    <circle
                      key={i}
                      cx="18"
                      cy="18"
                      r="15.9"
                      fill="none"
                      stroke={arc.color}
                      strokeWidth="3.5"
                      strokeDasharray={`${arc.pct} 100`}
                      strokeDashoffset={arc.offset}
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xs font-bold text-on-surface">١٠٠%</span>
                  <span className="text-[9px] text-muted-foreground">الإجمالي</span>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {pieArcs.map((arc, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: arc.color }} />
                    <span>
                      {arc.pct}% — {arc.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar Chart — أيام الأسبوع (real occupancy %) */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-on-surface">حضور المرضى حسب اليوم</h4>
          <div className="h-40 flex items-end justify-around gap-2">
            {barData.map((bar, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full max-w-[32px] rounded-t bg-gradient-to-t from-[#1A6B5A] to-[#2DBFA0] transition-all duration-500"
                  style={{ height: `${bar.pct}%` }}
                />
                <span className="text-[10px] text-muted-foreground font-medium">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-[#F9FAFB] border-b border-border">
          <h4 className="font-bold text-sm text-on-surface">آخر النشاطات</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#1A6B5A]/5 border-b border-border">
                <th className="text-right p-3 font-bold text-[#1A6B5A]">التاريخ</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">المريض</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">الخدمة</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">المبلغ</th>
                <th className="text-right p-3 font-bold text-[#1A6B5A]">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentActivity.map((row, i) => (
                <tr key={i} className="hover:bg-[#2DBFA0]/5 transition-colors">
                  <td className="p-3 text-muted-foreground">{row.date}</td>
                  <td className="p-3 font-semibold text-on-surface">{row.patient}</td>
                  <td className="p-3 text-muted-foreground">{row.service}</td>
                  <td className="p-3 font-semibold text-[#1A6B5A]">{row.amount}</td>
                  <td className="p-3">
                    <span className={statusBadge(row.statusType)}>{row.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
