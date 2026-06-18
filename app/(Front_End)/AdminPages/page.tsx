/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Heart, 
  Settings, 
  Users, 
  TrendingUp, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  Plus, 
  Minus, 
  CheckCircle, 
  Sliders, 
  Activity, 
  ShieldCheck, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  UserCheck,
  BellRing
} from "lucide-react";

export function AdminPages() {
  const [adminTab, setAdminTab] = useState<"analytics" | "settings">("analytics");
  
  // Settings Interactive Statuses (Page 18)
  const [weeklySchedule, setWeeklySchedule] = useState([
    { day: "السبت", active: true, start: "٠٩:٠٠ ص", end: "٠٩:٠٠ م", breakStart: "٠١:٣٠ م", breakEnd: "٠٢:٣٠ م" },
    { day: "الأحد", active: true, start: "٠٩:٠٠ ص", end: "٠٩:٠٠ م", breakStart: "٠١:٣٠ م", breakEnd: "٠٢:٣٠ م" },
    { day: "الإثنين", active: true, start: "٠٩:٠٠ ص", end: "٠٩:٠٠ م", breakStart: "٠١:٣٠ م", breakEnd: "٠٢:٣٠ م" },
    { day: "الثلاثاء", active: true, start: "٠٩:٠٠ ص", end: "٠٩:٠٠ م", breakStart: "٠١:٣٠ م", breakEnd: "٠٢:٣٠ م" },
    { day: "الأربعاء", active: true, start: "٠٩:٠٠ ص", end: "٠٩:٠٠ م", breakStart: "٠١:٣٠ م", breakEnd: "٠٢:٣٠ م" },
    { day: "الخميس", active: true, start: "٠٩:٠٠ ص", end: "٠٥:٠٠ م", breakStart: "٠١:٠٠ م", breakEnd: "٠٢:٠٠ م" },
    { day: "الجمعة", active: false, start: "-- : --", end: "-- : --", breakStart: "-- : --", breakEnd: "-- : --" }
  ]);

  const [apptDuration, setApptDuration] = useState(25); // 25 mins
  const [maxAppts, setMaxAppts] = useState(30);

  const handleToggleDay = (idx: number) => {
    const updated = [...weeklySchedule];
    updated[idx].active = !updated[idx].active;
    if (!updated[idx].active) {
      updated[idx].start = "-- : --";
      updated[idx].end = "-- : --";
      updated[idx].breakStart = "-- : --";
      updated[idx].breakEnd = "-- : --";
    } else {
      updated[idx].start = "٠٩:٠٠ ص";
      updated[idx].end = "٠٩:٠٠ م";
      updated[idx].breakStart = "٠١:٣٠ م";
      updated[idx].breakEnd = "٠٢:٣٠ م";
    }
    setWeeklySchedule(updated);
  };

  const handleSaveSettings = () => {
    alert("تم حفظ وتحديث أوقات العمل وجدولة العيادة العامة في النظام بنجاح!");
  };

  return (
    <div className="animate-fade-in text-[#1C1C1E] bg-[#F9FAFB] min-h-screen flex flex-col md:flex-row">
      
      {/* 1. ADMIN SIDEBAR (nav: الإحصائيات / الإعدادات) */}
      <aside className="w-full md:w-64 bg-[#1A6B5A] text-white flex flex-col justify-between shrink-0 p-6 md:min-h-screen text-right">
        <div className="space-y-8">
          
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-[#2DBFA0]/20 flex items-center justify-center text-[#2DBFA0] border border-white/10 shrink-0">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold font-heading">لوحة تحكم المدير</h3>
              <p className="text-[10px] text-emerald-200">العيادة الطبية المتكاملة</p>
            </div>
          </div>

          <nav className="flex flex-col gap-1.5">
            <button 
              id="admin-nav-analytics"
              onClick={() => setAdminTab("analytics")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right transition-all flex items-center justify-between cursor-pointer ${
                adminTab === "analytics" ? "bg-[#2DBFA0] text-gray-950 shadow-sm" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              <span>الإحصائيات والتحليلات</span>
              <ChevronLeft size={14} className={adminTab === "analytics" ? "opacity-100" : "opacity-45"} />
            </button>

            <button 
              id="admin-nav-settings"
              onClick={() => setAdminTab("settings")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right transition-all flex items-center justify-between cursor-pointer ${
                adminTab === "settings" ? "bg-[#2DBFA0] text-gray-950 shadow-sm" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              <span>إعدادات أوقات العمل</span>
              <ChevronLeft size={14} className={adminTab === "settings" ? "opacity-100" : "opacity-45"} />
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 mt-8 space-y-2 text-[10px] text-emerald-250">
          <p>👑 الصلاحيات النشطة: مدير النظام</p>
          <p className="text-[9px] text-[#2DBFA0] bg-white/5 p-2 rounded-lg">يُسمح بتعديل الرسوم وقاعدة بيانات المرضى والجدولة.</p>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* ==========================================================================
           PAGE 17: ADMIN ANALYTICS DASHBOARD
           ========================================================================== */}
        {adminTab === "analytics" && (
          <div className="space-y-6 text-right animate-fade-in">
            
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800 font-heading">لوحة الإحصائيات والأداء الكلي</h1>
                <p className="text-xs text-gray-400 font-body">التقرير الإجمالي لنشاط العيادة الطبي والمالي</p>
              </div>

              {/* Datepicker simulation */}
              <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-tajawal text-gray-500 font-semibold flex items-center gap-2">
                <span>تاريخ التقرير: آخر ٣٠ يوماً (يونيو ٢٠٢٦)</span>
                <Calendar size={14} className="text-[#1A6B5A]" />
              </div>
            </header>

            {/* KPI ROW: 4 cards with % change arrows */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-right">
              
              {/* Box 1 */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 block font-body">إجمالي الإيرادات الكلية</span>
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-bold font-heading text-gray-800 font-bold">٥٤,٩٠٠ ر.س</span>
                  <span className="text-[10px] font-bold font-tajawal text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                    <span>+٨.٤%</span>
                  </span>
                </div>
              </div>

              {/* Box 2 */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 block font-body">المرضى الجدد المسجلين</span>
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-bold font-heading text-gray-800 font-bold">١٤٢ مريضاً</span>
                  <span className="text-[10px] font-bold font-tajawal text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                    <span>+١٥.٢%</span>
                  </span>
                </div>
              </div>

              {/* Box 3 */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 block font-body">نسبة حضور المرضى الفعلي</span>
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-bold font-heading text-gray-800 font-bold">٩٦.٢ %</span>
                  <span className="text-[10px] font-bold font-tajawal text-red-500 flex items-center gap-0.5">
                    <ArrowDownRight size={10} />
                    <span>-٠.٥%</span>
                  </span>
                </div>
              </div>

              {/* Box 4 */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                <span className="text-[10px] text-gray-400 block font-body">متوسط الكشف والمعاينة</span>
                <div className="flex justify-between items-center">
                  <span className="text-lg md:text-xl font-bold font-heading text-gray-800 font-bold">٢٢ دقيقة</span>
                  <span className="text-[10px] font-bold font-tajawal text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight size={10} />
                    <span>+٢.٤%</span>
                  </span>
                </div>
              </div>

            </div>

            {/* REVENUE LINE CHART: 30 days, accent color line, light green area fill */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-heading font-bold text-xs text-[#1A6B5A]">مخطط وحصيلة الإيرادات الكلية والمدفوعات (آخر ٣٠ يوماً)</h3>
                <span className="text-[10px] text-gray-400 font-body">معدل الدخل الإجمالي اليومي الموزون</span>
              </div>

              {/* Interactive SVG lines representations */}
              <div className="h-64 relative flex items-end">
                <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2DBFA0" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1A6B5A" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f1f1" strokeWidth="1" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f1f1" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f1f1" strokeWidth="1" />
                  
                  {/* Filled Area */}
                  <path 
                    d="M 0 200 Q 100 130 200 90 T 400 120 T 500 65 L 500 200 Z" 
                    fill="url(#chartGrad)" 
                  />
                  
                  {/* Accent Line */}
                  <path 
                    d="M 0 200 Q 100 130 200 90 T 400 120 T 500 65" 
                    fill="none" 
                    stroke="#1A6B5A" 
                    strokeWidth="3.5" 
                  />
                  
                  {/* Hover dots */}
                  <circle cx="200" cy="90" r="5" fill="#2DBFA0" stroke="#1A6B5A" strokeWidth="2.5" />
                  <circle cx="500" cy="65" r="5" fill="#2DBFA0" stroke="#1A6B5A" strokeWidth="2.5" />
                </svg>

                {/* Legend bar */}
                <div className="absolute top-2 left-2 bg-gray-900 text-white p-2 rounded-lg text-[9px] font-mono leading-none border border-gray-800">
                  <span className="text-[#2DBFA0] font-bold block mb-1">اليوم ٢٨ يونيو:</span>
                  <span>٢,٨٠٠ ر.س</span>
                </div>
              </div>

              {/* Chart labels bottom */}
              <div className="flex justify-between font-mono text-[9px] text-gray-400 font-bold px-2">
                <span>١ يونيو</span>
                <span>١٠ يونيو</span>
                <span>٢٠ يونيو</span>
                <span>٣٠ يونيو</span>
              </div>
            </div>

            {/* TWO CHARTS SIDE BY SIDE: Pie chart + Bar chart */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Pie: توزيع الخدمات */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-xs text-gray-800">توزيع الخدمات ونسب استخدام المرضى</h4>
                
                <div className="flex flex-col sm:flex-row justify-around items-center gap-4">
                  {/* SVG Pie Representation */}
                  <div className="w-32 h-32 relative">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f1f1" strokeWidth="3.5" />
                      
                      {/* Segment 1: Heart (50%) */}
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#1A6B5A" strokeWidth="3.5" strokeDasharray="50 100" strokeDashoffset="0" />
                      {/* Segment 2: Medicine (30%) */}
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2DBFA0" strokeWidth="3.5" strokeDasharray="30 100" strokeDashoffset="-50" />
                      {/* Segment 3: Lab (20%) */}
                      <circle cx="18" cy="18" r="15.91" fill="none" stroke="#fbbf24" strokeWidth="3.5" strokeDasharray="20 100" strokeDashoffset="-80" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center font-heading text-xs font-bold text-gray-800">
                      <span>١٠٠%</span>
                      <span className="text-[9px] text-gray-400">التوزيع الكلي</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-[10px] font-tajawal font-bold text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#1A6B5A] rounded" />
                      <span>٥٠% - خدمات الباطنة والتشخيص</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#2DBFA0] rounded" />
                      <span>٣٠% - تخطيط ورنين القلب جهدي</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-[#fbbf24] rounded" />
                      <span>٢٠% - تحاليل المختبر السريعة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bar: أيام الأسبوع */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h4 className="font-heading font-bold text-xs text-gray-800">نسبة تضخم المراجعات وحضور المرضى بالأيام</h4>
                
                <div className="h-32 flex items-end justify-between font-body text-[9px] text-gray-400">
                  {[
                    { day: "السبت", pct: "٦٠%" },
                    { day: "الأحد", pct: "٨٥%" },
                    { day: "الإثنين", pct: "٩٥%" },
                    { day: "الثلاثاء", pct: "٧٥%" },
                    { day: "الأربعاء", pct: "٤٠%" },
                    { day: "الخميس", pct: "٩٢%" }
                  ].map((bar, idx) => (
                    <div key={idx} className="flex flex-col items-center gap-2 w-1/6">
                      <div 
                        className="w-4 bg-gradient-to-t from-[#1A6B5A] to-[#2DBFA0] rounded-t transition-all duration-500" 
                        style={{ height: bar.pct }}
                      />
                      <span className="text-gray-500 font-bold font-heading">{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RECENT ACTIVITY TABLE: last 10 rows */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-right">
              <div className="p-4 bg-gray-50 border-b border-gray-100 font-heading font-bold text-xs text-gray-700">
                سجل التدقيق والمراجعات المالية اليومية لغرفة الاستقبال
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#1A6B5A]/5 font-heading font-bold text-[#1A6B5A] text-[10px]">
                    <tr>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">اسم المريض</th>
                      <th className="p-3">نوع الخدمة الطبية</th>
                      <th className="p-3">الدخل والأرباح</th>
                      <th className="p-3">الحالة المالية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-body">
                    {[
                      { date: "١٧ يونيو", patient: "سلمان بن بندر الباطني", service: "استشارة باطنية وعلاج عام", text: "١٢٠ ر.س", status: "تم التحصيل" },
                      { date: "١٧ يونيو", patient: "سعيد بن علي القحطاني", service: "فحص السكري والتراكمي", text: "١٩٠ ر.س", status: "تم التحصيل" },
                      { date: "١٧ يونيو", patient: "منيرة عبدالرحمن الفهد", service: "تخطيط وعضلة القلب بالصدى", text: "٣٨٠ ر.س", status: "قيد المراجعة" },
                      { date: "١٦ يونيو", patient: "فارس بن تركي المطيري", service: "كشف استشاري وإيكو جهدي", text: "٢٩٠ ر.س", status: "تم التحصيل" }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 text-gray-400">{row.date}</td>
                        <td className="p-3 font-bold text-gray-700 font-heading text-[11px]">{row.patient}</td>
                        <td className="p-3">{row.service}</td>
                        <td className="p-3 font-bold font-tajawal text-[#1A6B5A]">{row.text}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-tajawal font-bold px-2 py-0.5 rounded ${
                            row.status === "تم التحصيل" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                          }`}>
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
        )}

        {/* ==========================================================================
           PAGE 18: CLINIC SETTINGS
           ========================================================================== */}
        {adminTab === "settings" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-right animate-fade-in space-y-6 p-6">
            
            <div className="border-b border-gray-100 pb-3">
              <h2 className="font-heading font-bold text-base text-[#1A6B5A]">أوقات وتأريض جدول ساعات عمل العيادة</h2>
              <p className="text-[10px] text-gray-400 font-body">يتيح هذا القسم للمدير تعيين الساعات وتحديد فترات الراحة لتأريض استمارات الحجز الفورية تلقائياً</p>
            </div>

            {/* 7-row days table: day name | ON/OFF toggle | start time | end time | break start | break end */}
            <div className="overflow-x-auto border border-gray-105 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#1A6B5A]/5 font-heading font-bold text-[#1A6B5A] text-[11px]">
                  <tr>
                    <th className="p-3">اليوم</th>
                    <th className="p-3">الحالة النشطة</th>
                    <th className="p-3">وقت بدء الدوام</th>
                    <th className="p-3">إغلاق العيادة</th>
                    <th className="p-3">بدء الاستراحة</th>
                    <th className="p-3">نهاية الاستراحة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-body">
                  {weeklySchedule.map((row, idx) => (
                    <tr key={idx} className={row.active ? "bg-white" : "bg-gray-50 text-gray-300 opacity-60"}>
                      <td className="p-3 font-bold font-heading text-gray-800">{row.day}</td>
                      <td className="p-3">
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={row.active} 
                            onChange={() => handleToggleDay(idx)}
                            className="sr-only peer" 
                          />
                          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2DBFA0]" />
                          <span className="mr-2 text-[10px] font-tajawal font-bold">
                            {row.active ? "متاح للعمل" : "عطلة أسبوعية"}
                          </span>
                        </label>
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          disabled={!row.active}
                          value={row.start}
                          onChange={(e) => {
                            const updated = [...weeklySchedule];
                            updated[idx].start = e.target.value;
                            setWeeklySchedule(updated);
                          }}
                          className="px-2 py-1 border border-gray-200 rounded text-center w-20 text-[11px]" 
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          disabled={!row.active}
                          value={row.end}
                          onChange={(e) => {
                            const updated = [...weeklySchedule];
                            updated[idx].end = e.target.value;
                            setWeeklySchedule(updated);
                          }}
                          className="px-2 py-1 border border-gray-200 rounded text-center w-20 text-[11px]" 
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          disabled={!row.active}
                          value={row.breakStart}
                          onChange={(e) => {
                            const updated = [...weeklySchedule];
                            updated[idx].breakStart = e.target.value;
                            setWeeklySchedule(updated);
                          }}
                          className="px-2 py-1 border border-gray-200 rounded text-center w-20 text-[11px]" 
                        />
                      </td>
                      <td className="p-3">
                        <input 
                          type="text" 
                          disabled={!row.active}
                          value={row.breakEnd}
                          onChange={(e) => {
                            const updated = [...weeklySchedule];
                            updated[idx].breakEnd = e.target.value;
                            setWeeklySchedule(updated);
                          }}
                          className="px-2 py-1 border border-gray-200 rounded text-center w-20 text-[11px]" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Appointment duration stepper below table */}
            <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              
              <div className="space-y-2 text-right">
                <span className="block text-xs font-bold font-heading text-gray-700">⏱️ معدل فترة وزمن الكشف للمريض الواحد</span>
                <p className="text-[10px] text-gray-400">تستخدم لتقسيم الساعات أوتوماتيكياً في محرك تقويم جدول الحجوزات</p>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => apptDuration > 10 && setApptDuration(apptDuration - 5)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold font-tajawal text-[#1A6B5A]">{apptDuration} دقيقة كشف</span>
                  <button 
                    onClick={() => apptDuration < 90 && setApptDuration(apptDuration + 5)}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Max appointments per day slider */}
              <div className="space-y-2 text-right">
                <span className="block text-xs font-bold font-heading text-gray-700">🔏 الحد الأقصى للمقاعد الطبية المجدولة يومياً</span>
                <p className="text-[10px] text-gray-400">لمنع فرط الضغط بالعيادة (الموصى به من البورد: ٣٠ مريض حد أقصى)</p>
                
                <div className="flex items-center gap-4 pt-1.5">
                  <input 
                    type="range" 
                    min="10" 
                    max="60" 
                    value={maxAppts}
                    onChange={(e) => setMaxAppts(Number(e.target.value))}
                    className="h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#1A6B5A] flex-1" 
                  />
                  <span className="text-xs font-bold font-tajawal text-[#1A6B5A] shrink-0">{maxAppts} مريض / يومياً</span>
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="pt-6 border-t border-gray-100">
              <button 
                id="admin-save-settings-btn"
                onClick={handleSaveSettings}
                className="w-full py-3 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl shadow-md cursor-pointer transition-all text-center"
              >
                تطبيق وحفظ إعدادات جدول ساعات عمل العيادة
              </button>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
