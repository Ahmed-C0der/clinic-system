"use client"

import { useState } from "react"
import { Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react"

const kpiData = [
  { label: "إجمالي الإيرادات", value: "٥٤,٩٠٠ ر.س", change: "+٨.٤%", up: true },
  { label: "مرضى جدد", value: "١٤٢", change: "+١٥.٢%", up: true },
  { label: "نسبة الحضور", value: "٩٦.٢%", change: "-٠.٥%", up: false },
  { label: "متوسط وقت الكشف", value: "٢٢ دقيقة", change: "+٢.٤%", up: true },
]

const barData = [
  { day: "السبت", pct: 60 },
  { day: "الأحد", pct: 85 },
  { day: "الإثنين", pct: 95 },
  { day: "الثلاثاء", pct: 75 },
  { day: "الأربعاء", pct: 40 },
  { day: "الخميس", pct: 92 },
]

const recentActivity = [
  { date: "١٧ يونيو", patient: "سلمان بن بندر الباطني", service: "استشارة باطنية وعلاج عام", amount: "١٢٠ ر.س", status: "تم التحصيل", statusType: "success" },
  { date: "١٧ يونيو", patient: "سعيد بن علي القحطاني", service: "فحص السكري والتراكمي", amount: "١٩٠ ر.س", status: "تم التحصيل", statusType: "success" },
  { date: "١٧ يونيو", patient: "منيرة عبدالرحمن الفهد", service: "تخطيط وعضلة القلب بالصدى", amount: "٣٨٠ ر.س", status: "قيد المراجعة", statusType: "pending" },
  { date: "١٦ يونيو", patient: "فارس بن تركي المطيري", service: "كشف استشاري وإيكو جهدي", amount: "٢٩٠ ر.س", status: "تم التحصيل", statusType: "success" },
  { date: "١٦ يونيو", patient: "هند بنت فهد السبيعي", service: "تحليل شامل ووظائف كبد", amount: "٢٤٠ ر.س", status: "تم التحصيل", statusType: "success" },
  { date: "١٥ يونيو", patient: "عبدالله بن محمد القرشي", service: "متابعة ضغط وسكري", amount: "١٥٠ ر.س", status: "ملغي", statusType: "cancelled" },
  { date: "١٥ يونيو", patient: "نورة بنت خالد الدوسري", service: "أشعة موجات فوق صوتية", amount: "٣٢٠ ر.س", status: "قيد المراجعة", statusType: "pending" },
  { date: "١٤ يونيو", patient: "طلال بن سعد العتيبي", service: "تخطيط قلب بالمجهود", amount: "٤٥٠ ر.س", status: "تم التحصيل", statusType: "success" },
  { date: "١٤ يونيو", patient: "مريم بنت علي الزهراني", service: "استشارة أطفال ورضع", amount: "١٨٠ ر.س", status: "تم التحصيل", statusType: "success" },
  { date: "١٣ يونيو", patient: "ياسر بن إبراهيم التميمي", service: "تحليل غدة درقية", amount: "٢١٠ ر.س", status: "تم التحصيل", statusType: "success" },
]

function statusBadge(status: string, type: string) {
  const base = "text-[10px] font-bold px-2.5 py-0.5 rounded-full"
  if (type === "success") return `${base} bg-emerald-50 text-emerald-700`
  if (type === "pending") return `${base} bg-amber-50 text-amber-700`
  return `${base} bg-red-50 text-red-600`
}

export default function AdminDashboardPage() {
  const [dateRange] = useState("آخر ٣٠ يوماً — يونيو ٢٠٢٦")

  return (
    <div className="space-y-6 text-right animate-fade-in">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-on-surface">لوحة الإحصائيات والأداء</h1>
          <p className="text-sm text-muted-foreground">التقرير الإجمالي لنشاط العيادة الطبي والمالي</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-xs font-semibold text-muted-foreground shadow-sm">
          <Calendar size={14} className="text-[#1A6B5A]" />
          <span>{dateRange}</span>
        </div>
      </header>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-border shadow-sm space-y-2">
            <span className="text-xs text-muted-foreground">{kpi.label}</span>
            <div className="flex justify-between items-center">
              <span className="text-lg md:text-xl font-bold text-on-surface">{kpi.value}</span>
              <span className={`text-xs font-bold flex items-center gap-0.5 ${
                kpi.up ? "text-emerald-600" : "text-red-500"
              }`}>
                {kpi.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                <span>{kpi.change}</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#1A6B5A]">الإيرادات اليومية — آخر ٣٠ يوماً</h3>
          <span className="text-xs text-muted-foreground">ريال سعودي</span>
        </div>
        <div className="h-64 relative">
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

            <path
              d="M 0 190 Q 60 170 120 150 T 240 100 T 360 130 T 480 80 T 600 55"
              fill="none"
              stroke="#1A6B5A"
              strokeWidth="3"
              strokeLinecap="round"
            />

            <path
              d="M 0 190 Q 60 170 120 150 T 240 100 T 360 130 T 480 80 T 600 55 L 600 200 L 0 200 Z"
              fill="url(#revenueGrad)"
            />

            <circle cx="600" cy="55" r="5" fill="#2DBFA0" stroke="#1A6B5A" strokeWidth="2.5" />
          </svg>

          <div className="absolute top-2 left-2 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-[10px] leading-relaxed shadow-lg border border-gray-800">
            <span className="text-[#2DBFA0] font-bold block">اليوم</span>
            <span>٢,٨٠٠ ر.س</span>
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>١ يونيو</span>
          <span>١٠ يونيو</span>
          <span>٢٠ يونيو</span>
          <span>٣٠ يونيو</span>
        </div>
      </div>

      {/* Two Charts Side by Side */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart — توزيع الخدمات */}
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm space-y-4">
          <h4 className="font-bold text-sm text-on-surface">توزيع الخدمات</h4>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="w-32 h-32 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f0f0f0" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#1A6B5A" strokeWidth="3.5"
                  strokeDasharray="50 100" strokeDashoffset="0" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#2DBFA0" strokeWidth="3.5"
                  strokeDasharray="30 100" strokeDashoffset="-50" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#fbbf24" strokeWidth="3.5"
                  strokeDasharray="20 100" strokeDashoffset="-80" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-on-surface">١٠٠%</span>
                <span className="text-[9px] text-muted-foreground">الإجمالي</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#1A6B5A]" />
                <span>٥٠% — الباطنة والتشخيص</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#2DBFA0]" />
                <span>٣٠% — تخطيط القلب</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-[#fbbf24]" />
                <span>٢٠% — تحاليل المختبر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart — أيام الأسبوع */}
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
                    <span className={statusBadge(row.status, row.statusType)}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
