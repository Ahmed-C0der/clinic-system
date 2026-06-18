/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Heart, 
  Search, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  CreditCard, 
  Bell, 
  Video, 
  CheckCircle, 
  ChevronDown, 
  Printer, 
  TrendingUp, 
  Eye, 
  Play, 
  Tv, 
  DollarSign, 
  Filter,
  UserCheck
} from "lucide-react";
import { ViewId } from "../types";

interface ReceptionPagesProps {
  initialSubTab?: "dashboard" | "patients" | "queue" | "invoices";
  onNavigateToTv: () => void;
  onNavigateToPrint: () => void;
}

export function ReceptionPages({ initialSubTab = "dashboard", onNavigateToTv, onNavigateToPrint }: ReceptionPagesProps) {
  const [activeSubTab, setActiveSubTab] = useState<"dashboard" | "patients" | "queue" | "invoices">(initialSubTab);
  
  // Interactive Queue state for live queue
  const [queue, setQueue] = useState([
    { num: 1, name: "عمر خالد الدوسري", wait: "داخل الكشف", state: "active" },
    { num: 2, name: "سعيد بن علي القحطاني", wait: "١٠ دقيقة متبقية", state: "waiting" },
    { num: 3, name: "منيرة عبدالرحمن الفهد", wait: "٢٢ دقيقة متبقية", state: "waiting" },
    { num: 4, name: "فهد بن مساعد العتيبي", wait: "٣٥ دقيقة متبقية", state: "waiting" }
  ]);
  
  const [queueHistory, setQueueHistory] = useState([
    { num: 0, name: "ماجد المطيري", state: "completed" },
    { num: 0, name: "حصة الغامدي", state: "completed" }
  ]);

  // Patients Search Filter
  const [patientSearch, setPatientSearch] = useState("");
  
  // Invoices data table
  const invoices = [
    { id: "INV-8091", patient: "بندر بن سلمان", date: "١٧ يونيو ٢٠٢٦", total: "١٢٠ ر.س", paid: "١٢٠ ر.س", status: "paid" },
    { id: "INV-8092", patient: "سارة محمد العلي", date: "١٧ يونيو ٢٠٢٦", total: "٢٥٠ ر.س", paid: "١٠٠ ر.س", status: "partial" },
    { id: "INV-8093", patient: "عبدالرحمن الرويلي", date: "١٧ يونيو ٢٠٢٦", total: "١٥٠ ر.س", paid: "٠ ر.س", status: "pending" },
    { id: "INV-8094", patient: "ندى عبدالعزيز", date: "١٦ يونيو ٢٠٢٦", total: "١٩٠ ر.س", paid: "١٩٠ ر.س", status: "paid" }
  ];

  const handleCallNextPatient = () => {
    if (queue.length === 0) {
      alert("انتهت قائمة الانتظار الحالية لليوم!");
      return;
    }
    const nextActive = queue[0];
    const updatedHistory = [{ ...nextActive, state: "completed" }, ...queueHistory];
    const updatedQueue = queue.slice(1).map((item, idx) => ({
      ...item,
      num: idx + 1,
      wait: idx === 0 ? "داخل الكشف" : item.wait,
      state: idx === 0 ? "active" : "waiting"
    }));
    
    setQueue(updatedQueue);
    setQueueHistory(updatedHistory);
    alert(`استدعاء مكبر الصوت الطبي: المريض (${nextActive.name}) يرجى الحضور لغرفة الكشف رقم ١ فوراً.`);
  };

  const handleAddWalkIn = () => {
    const name = prompt("فضلاً أدخل الاسم الكامل للمريض الجديد (Walk-In):");
    if (!name) return;
    const item = {
      num: queue.length + 1,
      name,
      wait: `${(queue.length * 15) + 10} دقيقة متبقية`,
      state: queue.length === 0 ? "active" : "waiting"
    };
    setQueue([...queue, item]);
  };

  return (
    <div className="animate-fade-in text-[#1C1C1E] bg-[#F9FAFB] min-h-screen">
      
      {/* SHARED RECEPTION NAVBAR */}
      <nav className="bg-[#1A6B5A] text-white py-4 px-4 md:px-8 border-b border-white/5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo Right */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#2DBFA0]">
              <Heart size={20} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-heading">لوحة الاستقبال والجدولة</h2>
              <p className="text-[10px] text-emerald-200">العيادة الطبية المتكاملة</p>
            </div>
          </div>

          {/* Nav pills links */}
          <div className="flex bg-white/5 p-1 rounded-xl gap-1 shrink-0 font-tajawal text-xs">
            <button 
              id="subtab-dash"
              onClick={() => setActiveSubTab("dashboard")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeSubTab === "dashboard" ? "bg-[#2DBFA0] text-gray-950" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              لوحة التحكم
            </button>
            <button 
              id="subtab-pats"
              onClick={() => setActiveSubTab("patients")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeSubTab === "patients" ? "bg-[#2DBFA0] text-gray-950" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              سجلات المرضى
            </button>
            <button 
              id="subtab-queue"
              onClick={() => setActiveSubTab("queue")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeSubTab === "queue" ? "bg-[#2DBFA0] text-gray-950" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              قائمة الانتظار
            </button>
            <button 
              id="subtab-bills"
              onClick={() => setActiveSubTab("invoices")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                activeSubTab === "invoices" ? "bg-[#2DBFA0] text-gray-950" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              الفواتير والمالية
            </button>
          </div>

          {/* Profile Left */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold font-heading block text-white">أمل الشمري</span>
              <span className="text-[10px] text-emerald-200 font-body">مسؤولة مكتب الاستقبال</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#2DBFA0]/20 text-white flex items-center justify-center font-bold text-xs ring-1 ring-[#2DBFA0]">
              أش
            </div>
          </div>

        </div>
      </nav>

      {/* SUB-PAGES BODY */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* ==========================================================================
           PAGE 11: RECEPTION DASHBOARD
           ========================================================================== */}
        {activeSubTab === "dashboard" && (
          <div className="grid lg:grid-cols-10 gap-6 items-start text-right">
            
            {/* Right column 30%: stats + actions (takes 3 columns on lg) */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-gray-150/50 shadow-sm space-y-4">
                <h4 className="font-heading font-semibold text-xs text-gray-800">مؤشرات الاستقبال واليومية</h4>
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">الدخل العام اليوم</span>
                      <span className="font-bold font-tajawal text-sm text-[#1A6B5A]">١,٨4٠ ر.س</span>
                    </div>
                    <span className="text-[10px] py-0.5 px-2 bg-[#1A6B5A]/10 text-[#1A6B5A] rounded font-bold font-tajawal">+١٢%</span>
                  </div>
                  <div className="p-3 bg-teal-50/20 rounded-xl border border-teal-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">مسجلي الانتظار الآن</span>
                      <span className="font-bold text-sm text-[#1A6B5A]">{queue.length} مرضى</span>
                    </div>
                    <span className="w-2.5 h-2.5 bg-[#2DBFA0] rounded-full animate-ping" />
                  </div>
                  <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-gray-400 block mb-0.5">متوسط وقت الانتظار</span>
                      <span className="font-bold text-sm text-[#1A6B5A]">١٨ دقيقة</span>
                    </div>
                    <span className="text-[10px] text-gray-450 font-body">ممتاز</span>
                  </div>
                </div>
              </div>

              {/* Quick actions box */}
              <div className="bg-[#1A6B5A] text-white p-5 rounded-xl border border-[#1A6B5A] shadow-sm space-y-3">
                <h4 className="font-heading font-semibold text-xs text-white">إجراءات الاستقبال المباشرة</h4>
                <div className="space-y-1.5 flex flex-col font-tajawal text-xs text-right">
                  <button onClick={handleAddWalkIn} className="w-full text-right py-2 px-3 hover:bg-white/10 rounded-lg flex items-center justify-between cursor-pointer">
                    <span>إضافة Walk-In (حالة مستعجلة)</span>
                    <Plus size={14} />
                  </button>
                  <button onClick={() => alert("جاري الاتصال بجهاز نقاط البيع ومدى الصيرفة لشحن بطاقة الفاتورة...")} className="w-full text-right py-2 px-3 hover:bg-white/10 rounded-lg flex items-center justify-between cursor-pointer">
                    <span>نقاط البيع وسداد مدى</span>
                    <CreditCard size={14} />
                  </button>
                  <button onClick={onNavigateToTv} className="w-full text-right py-2 px-3 hover:bg-white/10 rounded-lg flex items-center justify-between cursor-pointer text-[#2DBFA0] font-bold">
                    <span>تشغيل شاشة التلفزيون (TV Mode)</span>
                    <Tv size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Middle column 40%: waiting queue */}
            <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-heading font-bold text-sm text-[#1A6B5A]">قائمة الانتظار وغرفة الكشف المباشرة</h3>
                  <span className="text-[10px] text-gray-400 font-body">إجمالي المسجلين بغرفة الباب: {queue.length} حالياً</span>
                </div>
                
                <button 
                  id="call-next-dashboard"
                  onClick={handleCallNextPatient}
                  className="px-3 py-1.5 bg-[#2DBFA0] hover:bg-emerald-400 text-gray-950 text-[11px] font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <UserCheck size={14} />
                  <span>استدعاء التالي</span>
                </button>
              </div>

              {/* Waiting list simulation */}
              <div className="space-y-3">
                {queue.map((item) => (
                  <div 
                    key={item.num}
                    className={`p-4 rounded-xl border flex justify-between items-center text-right ${
                      item.state === "active" 
                        ? "border-[#1A6B5A] bg-emerald-50/60 ring-2 ring-[#1A6B5A]/20" 
                        : "border-gray-150 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading text-xs font-bold leading-none ${
                        item.state === "active" ? "bg-[#1A6B5A] text-white" : "bg-gray-100 text-gray-500"
                      }`}>
                        {item.num}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 font-heading leading-tight">{item.name}</h4>
                        <span className="text-[9px] text-gray-400 font-body">رقم الملف: PAT-2026-{(20 + item.num * 3)}</span>
                      </div>
                    </div>
                    <div>
                      <span className={`text-[10px] font-tajawal font-bold px-2 py-0.5 rounded-lg ${
                        item.state === "active" ? "bg-[#1A6B5A] text-white animate-pulse" : "bg-teal-50 text-[#1A6B5A]"
                      }`}>
                        {item.wait}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Left column 30%: today's schedule list */}
            <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="font-heading font-bold text-xs text-gray-800">مواعيد كشوفات الصباح اليوم</h4>
                <button 
                  id="dash-add-booking"
                  onClick={() => alert("سيتم فتح صفحة الحجز لإنهاء موعد إضافي للسيستم.")}
                  className="text-[10px] text-emerald-600 font-bold font-tajawal"
                >
                  + إضافة حجز
                </button>
              </div>

              <div className="space-y-3 divide-y divide-gray-100">
                {[
                  { time: "٠٩:٠٠ ص", name: "سعيد القحطاني", state: "تم الحضور" },
                  { time: "١٠:١٥ ص", name: "منيرة الفهد", state: "بالانتظار" },
                  { time: "١٠:٣٠ ص", name: "سلمان الشمري (أنت)", state: "الحجز مؤكد" },
                  { time: "١١:٠٠ ص", name: "فراس الحربي", state: "الحجز مؤكد" }
                ].map((appt, idx) => (
                  <div key={idx} className="pt-2 text-xs font-body flex justify-between items-center">
                    <div>
                      <span className="text-gray-400 font-bold font-tajawal block text-[10px]">{appt.time}</span>
                      <span className="font-bold text-gray-800">{appt.name}</span>
                    </div>
                    <span className={`text-[9px] font-tajawal px-2 py-0.5 rounded ${
                      appt.state === "تم الحضور" ? "bg-emerald-50 text-emerald-800" :
                      appt.state === "بالانتظار" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {appt.state}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================================================
           PAGE 12: REGULATION OF PATIENTS DATA
           ========================================================================== */}
        {activeSubTab === "patients" && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-right">
            
            <div className="p-5 bg-gray-50/50 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="font-heading font-bold text-sm text-[#1A6B5A]">سجلات وملفات المرضى الإلكترونية</h2>
                <p className="text-[10px] text-gray-400 font-body">إدارة وتعديل بيانات وقرائن عوائل العيادة</p>
              </div>

              {/* Large search card */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute right-3 top-3 text-gray-400" />
                <input 
                  type="text"
                  placeholder="ابحث هاتف أو باسم المريض..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full px-3 py-2 pr-9 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                />
              </div>

              <button 
                onClick={() => alert("سيتم توجيهك لإنشاء استمارة ملف مريض ورقي جديد.")}
                className="px-4 py-1.5 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>إضافة سجل طبي جديد</span>
              </button>
            </div>

            {/* Alternating row color table code */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs divide-y divide-gray-150">
                <thead className="bg-gray-100 font-heading font-bold text-gray-600 text-[11px]">
                  <tr>
                    <th className="p-4">رقم السجل</th>
                    <th className="p-4">الاسم الكامل للمريض</th>
                    <th className="p-4">رقم الجوال والاتصال</th>
                    <th className="p-4">آخر زيارة</th>
                    <th className="p-4">عدد الزيارات</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4 text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-body select-none">
                  {[
                    { id: "PAT-2026-6701", name: "سلمان بن بندر الشمري", phone: "0540004944", lastVisit: "١٢ مايو ٢٠٢٦", visits: "٦ مرات", status: "نشط" },
                    { id: "PAT-2026-6702", name: "سعيد بن علي القحطاني", phone: "0554199823", lastVisit: "١٧ يونيو ٢٠٢٦", visits: "مرتان", status: "نشط" },
                    { id: "PAT-2026-6703", name: "منيرة عبدالرحمن الفهد", phone: "0563829101", lastVisit: "البداية اليوم", visits: "زيارة واحدة", status: "جديد" },
                    { id: "PAT-2026-6704", name: "فارس بن تركي المطيري", phone: "0548172935", lastVisit: "١٢ يناير ٢٠٢٦", visits: "٤ مرات", status: "نشط" }
                  ]
                  .filter(p => p.name.includes(patientSearch) || p.phone.includes(patientSearch))
                  .map((p, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="p-4 font-mono text-[10px] text-gray-500">{p.id}</td>
                      <td className="p-4 font-bold text-gray-800 font-heading text-[11px]">{p.name}</td>
                      <td className="p-4">{p.phone}</td>
                      <td className="p-4">{p.lastVisit}</td>
                      <td className="p-4">{p.visits}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-tajawal font-bold px-2 py-0.5 rounded-full ${
                          p.status === "نشط" ? "bg-emerald-50 text-emerald-800" : "bg-blue-50 text-blue-800"
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-left flex gap-1 justify-end">
                        <button onClick={() => alert(`مراجعة الملف الطبي للمريض: ${p.name}`)} className="p-1 text-[#1A6B5A] hover:bg-emerald-50 rounded" title="استعراض الملف"><Eye size={14} /></button>
                        <button onClick={() => alert(`تسجيل حجز موعد مخصص للمريض: ${p.name}`)} className="p-1 text-teal-600 hover:bg-teal-50 rounded" title="جدولة موعد"><Calendar size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ==========================================================================
           PAGE 13: LIVE QUEUE PAGE
           ========================================================================== */}
        {activeSubTab === "queue" && (
          <div className="grid lg:grid-cols-10 gap-8 items-start text-right animate-fade-in">
            
            {/* Main waiting area: takes 7 columns on lg */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold font-heading text-gray-800">قائمة الانتظار المباشرة لغرفة الكشوفات</h2>
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-body">مسجل بنصف الملاحظة الصوتية الحية للتلفزيونات</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    id="live-tv-mode"
                    onClick={onNavigateToTv}
                    className="px-4 py-1.5 border border-gray-250 text-gray-600 hover:bg-gray-50 text-xs font-bold font-tajawal rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Tv size={14} />
                    <span>مزامنة شاشة التلفزيون</span>
                  </button>
                  
                  <button 
                    onClick={handleAddWalkIn}
                    className="px-4 py-1.5 bg-[#1A6B5A] text-white text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>إضافة Walk-in +</span>
                  </button>
                </div>
              </div>

              {/* Large multi-state list of queue */}
              <div className="space-y-4">
                
                {/* 1. State: ACTIVE patient "داخل الكشف" */}
                {queue.filter(q => q.state === "active").map((item, idx) => (
                  <div key={idx} className="bg-[#1A6B5A] text-white p-6 rounded-xl relative overflow-hidden flex flex-col sm:flex-row justify-between items-center gap-6 shadow-md border-r-8 border-[#2DBFA0]">
                    <div className="space-y-2">
                      <span className="text-[10px] bg-[#2DBFA0] text-gray-950 px-2 py-0.5 rounded-full font-bold font-tajawal">جاري فحص المريض الطبي الآن</span>
                      <h3 className="text-lg md:text-2xl font-bold font-heading">{item.name}</h3>
                      <p className="text-xs text-emerald-100 font-body">غرفة د. يوسف عبدالرحمن - الاستشارة الباطنية وعلاج عام</p>
                    </div>

                    <button 
                      id="finish-and-call-next"
                      onClick={handleCallNextPatient}
                      className="px-5 py-2 bg-white text-[#1A6B5A] font-bold font-tajawal text-xs rounded-xl hover:bg-emerald-50 cursor-pointer"
                    >
                      إنهاء استدعاء التالي
                    </button>
                  </div>
                ))}

                {/* 2. State: WAITING list */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 divide-y divide-gray-100 space-y-3">
                  <h4 className="font-heading font-medium text-xs text-gray-400 pb-2 pr-1">قائمة المحجوزين الحالية خلف الباب</h4>
                  
                  {queue.filter(q => q.state === "waiting").map((item) => (
                    <div key={item.num} className="pt-3 flex justify-between items-center text-xs font-body">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#1A6B5A] flex items-center justify-center font-bold font-heading">
                          {item.num}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 font-heading text-[11px]">{item.name}</h4>
                          <span className="text-[10px] text-gray-400">رقم الكرت: CLN-{item.num * 10}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 font-tajawal text-[10px]">⏰ {item.wait}</span>
                        <button 
                          onClick={() => alert(`سيتم استدعاء المريض: ${item.name} الآن.`)}
                          className="px-2 py-1 bg-emerald-100 text-[#1A6B5A] hover:bg-emerald-200 text-[10px] font-bold font-tajawal rounded-lg"
                        >
                          استدعاء
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {queue.filter(q => q.state === "waiting").length === 0 && (
                    <p className="text-xs text-center text-gray-400 py-6 font-body">لا يوجد مرضى بغرفة الانتظار حالياً.</p>
                  )}
                </div>

                {/* 3. State: COMPLETED history */}
                {queueHistory.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-xs font-body opacity-60">
                    <h4 className="font-heading font-medium text-xs text-gray-400 pb-2 border-b border-gray-50">الزيارات المنتهية لليوم من الطبيب المعالج</h4>
                    <div className="divide-y divide-gray-50">
                      {queueHistory.map((item, idx) => (
                        <div key={idx} className="py-2.5 flex justify-between items-center">
                          <span className="text-gray-500 font-heading text-[11px]">✓ {item.name}</span>
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">تم الكشف والمغادرة</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Side remaining list column: takes 3 columns on lg */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-gray-150/50 shadow-sm text-right space-y-3">
                <h4 className="font-heading font-semibold text-xs text-gray-800">مواعيد كشوفات الظهيرة اليوم</h4>
                <div className="space-y-3 font-body text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>ندى العلي:</span>
                    <span>١٢:٣٠ م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>خالد الهويمل:</span>
                    <span>٠١:٠٠ م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>مساعد الحربي:</span>
                    <span>٠١:٣٠ م</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================================================
           PAGE 14: INVOICES MANAGEMENT
           ========================================================================== */}
        {activeSubTab === "invoices" && (
          <div className="space-y-6 animate-fade-in text-right">
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="font-heading font-bold text-sm text-[#1A6B5A]">الفواتير والتحصيل المالي للعيادات</h2>
                <p className="text-[10px] text-gray-400 font-body">إرسال، تسوية، ومتابعة قسائم سداد المرضى</p>
              </div>

              <button 
                onClick={() => alert("سيتم بناء فاتورة تفصيلية جديدة بمزايا التأمين...")}
                className="px-4 py-1.5 bg-[#1A6B5A] text-white text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>إنشاء فاتورة جديدة +</span>
              </button>
            </div>

            {/* Summary Row inside invoice */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-150/40 shadow-sm">
                <span className="text-[10px] text-gray-450 block">مقبوضات ومستحقات اليوم العادية</span>
                <div className="text-base font-bold font-heading text-slate-700 mt-1">٢,٣٤٠ ر.س</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-105/40 shadow-sm">
                <span className="text-[10px] text-emerald-600 block font-bold">تم سداده واستلامه (مدفوع)</span>
                <div className="text-base font-bold font-heading text-emerald-800 mt-1">١,٩٤٠ ر.س</div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-150/40 shadow-sm">
                <span className="text-[10px] text-amber-600 font-bold block">متبقي قيد المراجعة والتحصيل</span>
                <div className="text-base font-bold font-heading text-amber-800 mt-1">٤٠٠ ر.س</div>
              </div>
            </div>

            {/* Data table representation */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 font-heading font-bold text-xs text-gray-700">
                سجل الفواتير وقسائم سداد مدى اليوم
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs divide-y divide-gray-150">
                  <thead className="bg-[#1A6B5A]/5 font-heading font-bold text-[#1A6B5A] text-[11px]">
                    <tr>
                      <th className="p-3">رقم الفاتورة</th>
                      <th className="p-3">اسم المريض</th>
                      <th className="p-3">تاريخ الفاتورة</th>
                      <th className="p-3">الإجمالي الكلي</th>
                      <th className="p-3">المدفوع مدى</th>
                      <th className="p-3">الحالة الصحية</th>
                      <th className="p-3 text-left">إجراءات ميزت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-body">
                    {invoices.map((inv, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="p-3 font-mono text-[10px] text-gray-500">{inv.id}</td>
                        <td className="p-3 font-bold font-heading text-gray-800 text-[11px]">{inv.patient}</td>
                        <td className="p-3 text-gray-500">{inv.date}</td>
                        <td className="p-3 font-bold font-tajawal text-[#1A6B5A]">{inv.total}</td>
                        <td className="p-3 font-tajawal">{inv.paid}</td>
                        <td className="p-3">
                          <span className={`text-[9px] font-tajawal font-bold px-2 py-0.5 rounded-md ${
                            inv.status === "paid" ? "bg-emerald-50 text-emerald-800" :
                            inv.status === "partial" ? "bg-amber-50 text-amber-800" : "bg-red-50 text-red-800"
                          }`}>
                            {inv.status === "paid" ? "مدفوع بالكامل" :
                             inv.status === "partial" ? "سداد جزئي بالتأمين" : "معلق لم يسدد بعد"}
                          </span>
                        </td>
                        <td className="p-3 text-left flex gap-1 justify-end">
                          <button onClick={onNavigateToPrint} className="p-1 text-[#1A6B5A] hover:bg-emerald-50 rounded" title="طباعة الفاتورة والروشتة"><Printer size={14} /></button>
                          <button onClick={() => alert(`تسجيل دفعة سداد جديدة للفاتورة: ${inv.id}`)} className="p-1 text-emerald-600 hover:bg-teal-50 rounded" title="تسجيل الدفعة وتوثيقها"><CreditCard size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
