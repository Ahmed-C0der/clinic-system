"use client"

import React, { useState } from "react";
import { 
  FileText, 
  ChevronLeft, 
  Plus, 
  Activity, 
  Printer, 
  Video, 
  Download, 
  Heart, 
  HeartHandshake, 
  Bell,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function PatientPortal() {
  const [appointmentFilter, setAppointmentFilter] = useState<"upcoming" | "past">("upcoming");
  const pathName = usePathname()
  // Mock patient data
  const patientName = "سلمان بن بندر الشمري";
  const patientAge = "٣٤ سنة";
  const patientBlood = "O+";
  const patientCode = "PAT-2026-6701";

  // Upcoming appointment mock data
  const nextAppointment = {
    doctor: "د. يوسف عبدالرحمن",
    specialty: "استشاري الباطنة والقلب العام",
    date: "الإثنين، ٢٢ يونيو ٢٠٢٦",
    time: "١٠:٣٠ صباحاً",
    countdown: "متبقي ٥ أيام و ٣ ساعات"
  };

  const stats = [
    { label: "زيارات عيادة مسجلة", value: "٦ كشوفات", desc: "منذ يناير ٢٠٢٥ م" },
    { label: "أخر كشف وقياس", value: "١٢ مايو ٢٠٢٦", desc: "تشخيص ضغط الدم" },
    { label: "الوصفات النشطة المستمرة", value: "وصفة واحدة", desc: "حبوب تنظيم الصالحية" }
  ];

  return (
    <div className="animate-fade-in dir-rtl text-[#1C1C1E] bg-[#F9FAFB] min-h-screen flex flex-col md:flex-row">
      
      {/* 1. RIGHT SIDEBAR: patient avatar + name + nav links */}
      

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        
        {/* Top Header bar */}
        <header className="flex justify-between items-center border-b border-gray-150 pb-4">
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 font-heading">مرحباً سلمان بن بندر</h1>
            <p className="text-xs text-gray-400 font-body">نتمنى لك يوماً صحياً ومريحاً دائماً</p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 relative">
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
              <Bell size={18} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#1A6B5A]/5 border border-emerald-150/40 rounded-full text-[10px] font-tajawal text-[#1A6B5A]">
              <span>فصيلة الدم {patientBlood}</span>
              <Heart size={10} className="fill-[#1A6B5A]" />
            </div>
          </div>
        </header>

        {/* SWITCH SUB-VIEWS */}
        {pathName === "dashboard" && (
          <div className="space-y-6 animate-fade-in text-right">
            
            {/* NEXT APPOINTMENT CARD: dark green bg */}
            <div className="bg-[#1A6B5A] text-white p-6 rounded-xl border border-[#1A6B5A] shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              {/* Background abstract decoration */}
              <div className="absolute top-0 left-0 w-48 h-48 rounded-full bg-[#2DBFA0]/10 -translate-x-1/2 -translate-y-1/2 blur-2xl" />
              
              <div className="space-y-3 relative z-10">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#2DBFA0] text-gray-950 font-bold text-[10px] font-tajawal">
                  <Activity size={10} />
                  <span>{nextAppointment.countdown}</span>
                </span>
                <h3 className="text-base md:text-xl font-bold font-heading">زيارتك الاستشارية القادمة للعيادة</h3>
                <div className="space-y-1 text-xs text-emerald-100">
                  <p className="font-semibold text-white">{nextAppointment.doctor} - <span className="text-[10px] text-emerald-300 font-normal">{nextAppointment.specialty}</span></p>
                  <p>🗓️ {nextAppointment.date} | ⏰ {nextAppointment.time}</p>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto relative z-10 shrink-0">
                <button 
                  id="dash-modify-appt"
                  onClick={() => alert("سيقوم موظف الاستقبال بالتواصل معك لإجراء التعديل مجاناً.")}
                  className="flex-1 md:flex-none px-4 py-2 bg-white/10 text-white hover:bg-white/20 text-xs font-bold font-tajawal rounded-xl"
                >
                  تعديل الموعد
                </button>
                <button 
                  id="dash-cancel-appt"
                  onClick={() => alert("هل أنت متأكد من إلغاء الاستشارة؟ يرجى إخطار العيادة هاتفياً.")}
                  className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-tajawal rounded-xl"
                >
                  إلغاء الحجز
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS ROW: 4 icon buttons row */}
            <div className="space-y-3">
              <h3 className="font-heading font-bold text-xs text-gray-700">إجراءات تفاعلية سريعة</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <Link 
                  href={"/book"}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md text-right transition-all space-y-2 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#1A6B5A] flex items-center justify-center">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-gray-800">حجز موعد جديد</h4>
                    <p className="text-[9px] text-gray-400">تأكيد فوري بالعيادة</p>
                  </div>
                </Link>

                <button 
                  onClick={() => alert("استشارة مرئية مباشرة عبر الفيديو قريباً مع الطبيب المناوب.")}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md text-right transition-all space-y-2 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#2DBFA0]/15 text-[#1A6B5A] flex items-center justify-center">
                    <Video size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-gray-800">طبيب أونلاين</h4>
                    <p className="text-[9px] text-gray-400">مكالمات مرئية سريعة</p>
                  </div>
                </button>

                <Link 
                href={"/records"}
                
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md text-right transition-all space-y-2 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#1A6B5A] flex items-center justify-center">
                    <FileText size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-gray-800">تحميل تقاريري</h4>
                    <p className="text-[9px] text-gray-400">سجلات ملف PDF الطائر</p>
                  </div>
                </Link>

                <button 
                  onClick={() => alert("الفاتورة مدفوعة بالكامل بالتأمين المشترك. لا توجد قسائم مستحقة حالياً.")}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md text-right transition-all space-y-2 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-yellow-50 text-[#1A6B5A] flex items-center justify-center">
                    <HeartHandshake size={20} fill="currentColor" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-heading text-gray-800">سداد الفواتير</h4>
                    <p className="text-[9px] text-gray-400">الدفع الآمن ببطاقة كاشر</p>
                  </div>
                </button>

              </div>
            </div>

            {/* THREE STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map((s, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-150/40 shadow-sm">
                  <span className="text-[10px] text-gray-450 block font-body">{s.label}</span>
                  <div className="text-base font-bold font-heading text-[#1A6B5A] mt-1.5">{s.value}</div>
                  <p className="text-[9px] text-gray-400 font-body block mt-1">{s.desc}</p>
                </div>
              ))}
            </div>

            {/* LAST VISIT SUMMARY CARD WITH DIAGNOSIS */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h4 className="text-xs font-bold font-heading text-gray-800">تفاصيل وخلاصة التشخيص في زيارتك الأخيرة للعيادة</h4>
                <div className="text-[10px] text-gray-400 font-body">التاريخ: ١٢ مايو ٢٠٢٦ م</div>
              </div>
              
              <div className="space-y-2 text-xs font-body">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-400 block mb-1">الشكوى الرئيسية للمريض:</span>
                    <span className="font-bold text-gray-800">خفقان مبدئي وضيق بسيط بالتنفس عند استيقاظ الصباح.</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-1">التشخيص الطبي للاستشاري:</span>
                    <span className="font-bold px-2.5 py-1 bg-yellow-105/40 text-rose-800 rounded-lg text-xs">فرط ضغط شرياني خفيف ومؤشر دهون ثلاثي أعلى بقليل</span>
                  </div>
                </div>

                <div className="pt-3">
                  <span className="text-gray-400 block mb-1">العلاج والوصفة الإرشادية:</span>
                  <span className="font-medium text-gray-700">حبوب Concor 5mg حبة يومياً قبل الإفطار بانتظام، مع تقليل الموالح وممارسة المشي الخفيف يومياً.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-xs font-tajawal">
                <Link 
                  id="dash-view-rec-link"
                  href={"/records"}
                  className="text-[#1A6B5A] hover:text-[#2DBFA0] font-bold select-none cursor-pointer"
                >
                  استعرض السجل الكامل والتخطيط الصدري
                </Link>
                <button 
                  id="dash-print-rx"
                  onClick={() => alert("جاري تجهيز وبناء الوصفة الطبية لطباعتها...")}
                  className="text-gray-450 hover:text-[#1A6B5A] flex items-center gap-1 select-none"
                >
                  <Printer size={12} />
                  <span>طباعة الروشتة</span>
                </button>
              </div>
            </div>

          </div>
        )}

        {/* SUB-VIEW 2: MY APPOINTMENTS */}
        {pathName === "appointments" && (
          <div className="space-y-6 animate-fade-in text-right">
            
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold font-heading text-[#1A6B5A]">إدارة ومتابعة المواعيد الطبية</h2>
              
              <Link 
                id="appt-book-btn"
                href={"/book"}
                className="px-4 py-1.5 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>احجز موعداً جديداً فوراً</span>
              </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex border-b border-gray-150 gap-4">
              <button 
                id="tab-upcoming"
                onClick={() => setAppointmentFilter("upcoming")}
                className={`pb-2 text-xs font-bold font-heading relative transition-all cursor-pointer ${
                  appointmentFilter === "upcoming" ? "text-[#1A6B5A]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>المواعيد القادمة المؤكدة</span>
                {appointmentFilter === "upcoming" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A6B5A]" />}
              </button>

              <button 
                id="tab-past"
                onClick={() => setAppointmentFilter("past")}
                className={`pb-2 text-xs font-bold font-heading relative transition-all cursor-pointer ${
                  appointmentFilter === "past" ? "text-[#1A6B5A]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span>الزيارات والمواعيد السابقة</span>
                {appointmentFilter === "past" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A6B5A]" />}
              </button>
            </div>

            {/* APPOINTMENT CARDS LIST */}
            <div className="space-y-4">
              {appointmentFilter === "upcoming" ? (
                /* Upcoming cards - 1 card */
                <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-right">
                  <div className="flex items-center gap-4">
                    {/* Date badge */}
                    <div className="w-16 h-16 rounded-xl bg-[#1A6B5A] text-white flex flex-col items-center justify-center font-heading shrink-0 shadow-sm">
                      <span className="text-[10px] opacity-70">يونيو</span>
                      <span className="text-xl font-bold">٢٢</span>
                    </div>
                    {/* Details */}
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-[#1A6B5A] px-2 py-0.5 rounded-full font-bold">مؤكد وبانتظار الحضور</span>
                      <h4 className="text-xs font-bold text-gray-800 font-heading mt-1">{nextAppointment.doctor}</h4>
                      <p className="text-[11px] text-gray-400 font-body">الاستشارة الباطنية وعلاج عام | ⏰ ١٠:٣٠ صباحاً</p>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => alert("سيقوم التنسيق الطبي بالتواصل معك لتأجيل الموعد.")}
                      className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-bold font-tajawal rounded-xl"
                    >
                      إعادة جدولة
                    </button>
                    <button 
                      onClick={() => alert("يرجى الاتصال بالعيادة لإلغاء الحجز الفعلي.")}
                      className="px-3.5 py-1.5 text-red-500 hover:bg-red-50 text-xs font-bold font-tajawal rounded-xl"
                    >
                      إلغاء الموعد
                    </button>
                  </div>
                </div>
              ) : (
                /* Past cards - list of past */
                <div className="space-y-3">
                  {[
                    { day: "١٢", month: "مايو", svc: "طلب فحص غدد هرمونية", doc: "د. يوسف عبدالرحمن", res: "مكتمل", rating: "ممتاز" },
                    { day: "٢٤", month: "مارس", svc: "استشارة طب باطني دوري", doc: "د. يوسف عبدالرحمن", res: "مكتمل", rating: "جيد جداً" },
                    { day: "٠٨", month: "يناير", svc: "تخطيط شرياني وعضلي جهدي", doc: "د. عبدالرحمن العوضي", res: "الملف مغلق", rating: "ممتاز" }
                  ].map((p, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        {/* Gray date badge */}
                        <div className="w-14 h-14 rounded-xl bg-gray-100 text-gray-600 flex flex-col items-center justify-center font-heading shrink-0">
                          <span className="text-[9px] opacity-70">{p.month}</span>
                          <span className="text-base font-bold">{p.day}</span>
                        </div>
                        <div>
                          <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded-full font-bold">{p.res}</span>
                          <h4 className="text-xs font-bold text-gray-800 font-heading mt-1">{p.svc}</h4>
                          <p className="text-[10px] text-gray-400 font-body">الطبيب المعالج: {p.doc} | رضاك عن الزيارة: {p.rating}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link 
                        href={"/records"}
                          className="px-3 py-1.5 border border-emerald-100 text-emerald-800 hover:bg-emerald-50 text-xs font-bold font-tajawal rounded-xl"
                        >
                          عرض تفاصيل التشخيص
                        </Link>
                        <Link 
                        href={"/book"}
                          className="px-3 py-1.5 text-xs font-bold font-tajawal text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50"
                        >
                          حجز إعادة كشف
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUB-VIEW 3: MEDICAL RECORDS */}
        {pathName === "records" && (
          <div className="space-y-6 animate-fade-in text-right">
            
            <h2 className="text-base font-bold font-heading text-[#1A6B5A]">الملف والسجل الطبي الموحد للمريض</h2>

            {/* Timeline: vertical RTL aligned */}
            <div className="space-y-4">
              <h3 className="font-heading font-bold text-xs text-gray-500 mb-3 border-b border-gray-100 pb-1">مراحل الكشف ومخطط الزيارات التاريخي</h3>
              
              <div className="relative border-r-2 border-emerald-150 mr-4 pl-4 space-y-6">
                
                {/* Milestone 1 */}
                <div className="relative">
                  <div className="absolute top-1.5 -right-[23px] w-4 h-4 bg-[#1A6B5A] rounded-full border-4 border-white" />
                  <div className="mr-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                      <span className="font-bold text-[#1A6B5A] font-heading font-semibold">١٢ مايو ٢٠٢٦ م | كشف باطني عام</span>
                      <span className="text-[9px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-bold">بواسطة: د. يوسف عبدالرحمن</span>
                    </div>

                    <p className="text-xs font-body text-gray-600 leading-normal">
                      ملاحظة تشخيصية: فرط ضغط الدم البسيط وضيق الصباح. تم تعيين دواء كونكور ومتابعة الجرعة الشاشية.
                    </p>

                    {/* Vitals Pills weight / temp / pressure */}
                    <div className="flex flex-wrap gap-2 pt-1 font-body text-[10px]">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg text-gray-600">
                        ⚖️ الوزن: ٨٢ كجم
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-amber-700 rounded-lg font-bold">
                        🩸 الضغط: 142/90 mmHg
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-650 rounded-lg">
                        🌡️ الحرارة: ٣٧.١ م
                      </span>
                    </div>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative">
                  <div className="absolute top-1.5 -right-[23px] w-4 h-4 bg-[#2DBFA0] rounded-full border-4 border-white" />
                  <div className="mr-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
                      <span className="font-bold text-[#1A6B5A] font-heading font-semibold">٢٤ مارس ٢٠٢٦ م | تحاليل دم دورية</span>
                      <span className="text-[10px] text-gray-400">مختبر العيادة الموحد</span>
                    </div>

                    <p className="text-xs font-body text-gray-600">
                      تشخيص دهون ثلاثية وكوليسترول الدم لموازنة كشوفات السكري. النتائج جيدة جداً وتحتاج تقليل الدهون الحيوانية فقط.
                    </p>

                    <div className="flex flex-wrap gap-2 pt-1 font-body text-[10px]">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-lg text-gray-600">
                        ⚖️ الوزن: ٨٤ كجم
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg font-bold">
                        🩸 الضغط: 130/85 mmHg
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Medical Files Section below */}
            <div className="space-y-3 pt-4">
              <h3 className="font-heading font-bold text-xs text-gray-550">مرفقات وصور التحاليل المخبرية والأشعة</h3>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { file: "تقرير تخطيط القلب جهدي الصدري PDF", date: "١٢ مايو ٢٠٢٦", size: "٢.٤ ميجابايت" },
                  { file: "نتائج فحص كوليسترول الدم الصباحي", date: "٢٤ مارس ٢٠٢٦", size: "١.١ ميجابايت" }
                ].map((f, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center text-right">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-800 font-heading leading-tight">{f.file}</h4>
                        <p className="text-[9px] text-gray-400 font-body mt-1">تاريخ الرفع: {f.date} | الحجم: {f.size}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => alert(`جاري سحب عينة من مخزن الملفات الطائرة وبدء تحميل: ${f.file}`)}
                      className="w-8 h-8 rounded-full bg-emerald-50 text-[#1A6B5A] hover:bg-[#2DBFA0] hover:text-gray-900 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>
<aside className="w-full md:w-64 bg-[#1A6B5A] text-white flex flex-col justify-between shrink-0 p-6 md:min-h-screen text-right">
        <div className="space-y-8">
          
          {/* Patient Card profile */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center text-[#2DBFA0] border border-white/10 shrink-0 font-bold font-heading text-lg">
              س
            </div>
            <div>
              <h3 className="text-xs font-bold font-heading text-white">{patientName}</h3>
              <span className="text-[9px] text-[#2DBFA0] font-mono leading-none">{patientCode}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            <Link 
            href={"/dashboard"}
              id="pat-nav-dash"
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right transition-all flex items-center justify-between cursor-pointer ${
                pathName === "dashboard" ? "bg-[#2DBFA0] text-gray-900 shadow-sm" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              <span>الرئيسية (لوحتي)</span>
              <ChevronLeft size={14} className={pathName === "dashboard" ? "opacity-100" : "opacity-40"} />
            </Link>

            <Link 
              id="pat-nav-appts"
              href={"/appointments"}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right transition-all flex items-center justify-between cursor-pointer ${
                pathName === "/appointments" ? "bg-[#2DBFA0] text-gray-900 shadow-sm" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              <span>مواعيدي الطبية</span>
              <ChevronLeft size={14} className={pathName === "appointments" ? "opacity-100" : "opacity-40"} />
            </Link>

            <Link 
              id="pat-nav-recs"
              href={"/records"}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right transition-all flex items-center justify-between cursor-pointer ${
                pathName === "/records" ? "bg-[#2DBFA0] text-gray-900 shadow-sm" : "hover:bg-white/5 text-gray-200"
              }`}
            >
              <span>سجلي الطبي الكامل</span>
              <ChevronLeft size={14} className={pathName === "/records" ? "opacity-100" : "opacity-40"} />
            </Link>
          </nav>
        </div>

        {/* Logout session item */}
        <div className="pt-6 border-t border-white/10 mt-8 space-y-4">
          <div className="bg-white/5 p-3 rounded-lg text-[10px] text-emerald-200 leading-relaxed">
            🔔 تحتاج دعم فني أو واجهتك مشكلة؟ اتصل بقسم الاستقبال الطائر لدينا.
          </div>
          <button 
            onClick={()=>console.log("logout sesstion")}
            className="w-full py-2 px-3 border border-white/20 text-white rounded-xl text-xs font-tajawal hover:bg-white/5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={14} />
            <span>تسجيل الخروج من البوابة</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
