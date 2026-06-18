/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Heart, 
  Calendar, 
  Users, 
  FileText, 
  Clipboard, 
  Clock, 
  Plus, 
  Search, 
  Play, 
  Trash2, 
  CheckCircle, 
  ChevronLeft, 
  Upload, 
  ChevronRight, 
  Thermometer, 
  Activity, 
  Scale, 
  Sliders, 
  UserPlus,
  BookOpen,
  ArrowRight,
  Printer
} from "lucide-react";
import { DOCTOR_PHOTO_URL } from "./PublicPages";
import { ViewId } from "../types";

interface DoctorPagesProps {
  onNavigateToPrint: () => void;
}

export function DoctorPages({ onNavigateToPrint }: DoctorPagesProps) {
  // Current view context inside Doctor Panel
  // "dashboard" or "examination"
  const [doctorSubView, setDoctorSubView] = useState<"dashboard" | "examination">("dashboard");
  
  // Custom states for the clinical examination form (Page 16)
  const [patientWeight, setPatientWeight] = useState("٨٢");
  const [patientHeight, setPatientHeight] = useState("١٧٨");
  const [patientBp, setPatientBp] = useState("142/90");
  const [patientTemp, setPatientTemp] = useState("٣٧.١");
  const [chiefComplaint, setChiefComplaint] = useState("يعاني المريض من خفقان خفيف وضيق تنفس عند الاستيقاظ في الصباح المستمر منذ يومين.");
  const [diagnosisValue, setDiagnosisValue] = useState("");
  const [diagnosisTags, setDiagnosisTags] = useState<string[]>([
    "فرط ضغط الدم الشرياني الخفيف",
    "ارتفاع مؤقت في الدهون الثلاثية"
  ]);
  const [notesValue, setNotesValue] = useState("يرجى مراجعة قياسات الضغط بانتظام يومياً في المنزل وتسجيلها بملف الواتس. يحتاج تقليل الصوديوم والابتعاد الفوري عن السردين والاملاح.");

  // Prescribed medicines dynamic rows
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, name: "Concor 5mg Tab", dosage: "حبه واحدة صباحاً كشف", freq: "مرة واحدة يومياً", duration: "٥ أيام" },
    { id: 2, name: "Lipitor 10mg Capsule", dosage: "حبة مع دهون الصباح", freq: "مرة واحدة مساءً", duration: "٣٠ يوماً" }
  ]);

  const [medInput, setMedInput] = useState("");
  const [dosageInput, setDosageInput] = useState("حبة واحدة");
  const [freqInput, setFreqInput] = useState("مرة واحدة غداً");
  const [durInput, setDurInput] = useState("٧ أيام");

  const handleAddDiagnosisTag = () => {
    if (!diagnosisValue.trim()) return;
    if (!diagnosisTags.includes(diagnosisValue.trim())) {
      setDiagnosisTags([...diagnosisTags, diagnosisValue.trim()]);
    }
    setDiagnosisValue("");
  };

  const handleRemoveTag = (tag: string) => {
    setDiagnosisTags(diagnosisTags.filter(t => t !== tag));
  };

  const handleAddMedicine = () => {
    if (!medInput.trim()) {
      alert("يرجى كتابة اسم الدواء أولاً من شريط البحث لإدراجه بالروشتة.");
      return;
    }
    const item = {
      id: Date.now(),
      name: medInput,
      dosage: dosageInput,
      freq: freqInput,
      duration: durInput
    };
    setPrescriptions([...prescriptions, item]);
    setMedInput("");
  };

  const handleRemoveMedicine = (id: number) => {
    setPrescriptions(prescriptions.filter(p => p.id !== id));
  };

  const submitClinicExam = () => {
    alert("تم حفظ وإنهاء كشف المريض بنجاح! السجل تم تحديثه تلقائياً في السحابة الصحية.");
    setDoctorSubView("dashboard");
  };

  return (
    <div className="animate-fade-in text-[#1C1C1E] bg-[#F9FAFB] min-h-screen">
      
      {/* 1. DOCTOR DASHBOARD (WITH SIDEBAR) */}
      {doctorSubView === "dashboard" ? (
        <div className="flex flex-col md:flex-row">
          
          {/* Right Sidebar */}
          <aside className="w-full md:w-64 bg-[#1A6B5A] text-white flex flex-col justify-between shrink-0 p-6 md:min-h-screen text-right">
            <div className="space-y-8">
              {/* Doctor Avatar Badge */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <img 
                  src={DOCTOR_PHOTO_URL} 
                  alt="الدكتور يوسف" 
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0"
                />
                <div>
                  <h3 className="text-xs font-bold font-heading text-white">د. يوسف عبدالرحمن</h3>
                  <p className="text-[9px] text-[#2DBFA0] font-body">استشاري القلب والأوعية الدموية</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1.5">
                <button 
                  onClick={() => setDoctorSubView("dashboard")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right bg-[#2DBFA0] text-gray-950 flex items-center justify-between shadow-sm cursor-pointer"
                >
                  <span>لوحة طبيبي (لوحتي)</span>
                  <ChevronLeft size={14} />
                </button>
                <button 
                  onClick={() => setDoctorSubView("examination")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-heading font-semibold text-right hover:bg-white/5 text-gray-200 flex items-center justify-between cursor-pointer"
                >
                  <span>صفحة الكشف المباشر</span>
                  <ChevronLeft size={14} className="opacity-40" />
                </button>
              </nav>
            </div>

            <div className="pt-6 border-t border-white/10 mt-8 space-y-3 text-[10px] text-emerald-150">
              <p>🗓️ العمل الجاري اليوم: عيادة الباطني رقم ١</p>
              <div className="p-2 bg-white/5 rounded-lg">
                تم استدعاء ٥ مرضى ومتبقي ٣ في الصالة التوجيهية للانتظار.
              </div>
            </div>
          </aside>

          {/* Main Dashboard Panel layout */}
          <main className="flex-1 p-6 md:p-10 space-y-8 text-right">
            
            {/* Top Greeting */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-150 pb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#1A6B5A] font-heading">صباح الخير د. يوسف عبدالرحمن</h1>
                <p className="text-xs text-gray-400 font-body">الجمعة ١٧ يونيو ٢٠٢٦ | لديك ٨ مرضى مسجلين اليوم</p>
              </div>
              
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-yellow-50 text-amber-700 text-[10px] rounded-full border border-yellow-105 font-bold font-tajawal animate-pulse">عيادتك نشطة وحية الآن</span>
              </div>
            </header>

            {/* Stats Row inside dr dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block font-body">مرضى اليوم بالعيادة</span>
                <span className="text-lg font-bold font-heading text-[#1A6B5A] block mt-1">٨ مرضى</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block font-body">مرضى الأسبوع الحالي</span>
                <span className="text-lg font-bold font-heading text-[#1A6B5A] block mt-1">٤٢ ملفاً</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block font-body">الوصفات الطبية المنبثقة</span>
                <span className="text-lg font-bold font-heading text-[#1A6B5A] block mt-1">٣٠ قسيمة</span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <span className="text-[10px] text-gray-400 block font-body">المراجعات ومواعيد المتابعة</span>
                <span className="text-lg font-bold font-heading text-[#1A6B5A] block mt-1">١٢ متابعة</span>
              </div>
            </div>

            {/* Today's Schedule + Recent patients split */}
            <div className="grid lg:grid-cols-10 gap-8 items-start">
              
              {/* Today's active queue schedule: takes 6 columns on lg */}
              <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-heading font-bold text-sm text-[#1A6B5A] border-b border-gray-100 pb-2">جدول كشوفات وعيادة اليوم</h3>
                
                <div className="space-y-4">
                  {/* Current Patient Card with high accent */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] bg-[#1A6B5A] text-white px-2 py-0.5 rounded font-bold font-tajawal">يعاين الآن في غرفتك الطبيّة</span>
                      <h4 className="text-xs font-bold text-gray-800 font-heading">سلمان بن بندر الشمري (أنت)</h4>
                      <p className="text-[10px] text-gray-400 font-body">رقم الملف: PAT-2026-6701 | العمر: ٣٤ سنة | كشف عام باطني</p>
                    </div>

                    <button 
                      id="dr-start-exam-btn"
                      onClick={() => setDoctorSubView("examination")}
                      className="px-4 py-2 bg-[#1A6B5A] hover:bg-[#155447] text-white text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      <Play size={10} fill="currentColor" />
                      <span>بدء كسر الملف والكشف</span>
                    </button>
                  </div>

                  {/* Following patients in today schedule */}
                  <div className="divide-y divide-gray-100 space-y-2">
                    {[
                      { time: "١١:٠٠ ص", name: "خالد سعيد عبدالكريم", desc: "كشف إعادة السكري ومستوى الضغط", stat: "بالانتظار" },
                      { time: "١١:٣٠ ص", name: "ندى عبدالعزيز المزيني", desc: "استشارة كولسترول القلب والغدد اللمحة", stat: "الحجز مؤكد" }
                    ].map((row, i) => (
                      <div key={i} className="pt-3 flex justify-between items-center text-xs font-body">
                        <div>
                          <span className="text-[10px] text-gray-400 font-tajawal font-bold block">{row.time} - {row.stat}</span>
                          <h5 className="font-bold text-gray-800 font-heading leading-snug">{row.name}</h5>
                          <p className="text-[10px] text-gray-400">{row.desc}</p>
                        </div>
                        <button 
                          onClick={() => {
                            alert("سيتم نقل الملف فوراً للبدء بالفحص السريري.");
                            setDoctorSubView("examination");
                          }}
                          className="px-3 py-1 border border-[#1A6B5A] text-[#1A6B5A] hover:bg-emerald-50 text-[10px] font-bold font-tajawal rounded-lg"
                        >
                          استدعاء فوري
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              </div>

              {/* Recent patients overview mini: takes 4 columns on lg */}
              <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-heading font-bold text-xs text-gray-800 border-b border-gray-100 pb-2">آخر ملفات كشفت وطبّقت اليوم</h3>
                
                <div className="space-y-4 text-xs font-body divide-y divide-gray-50">
                  {[
                    { name: "أحمد بندر الحربي", diag: "ضغط شرياني مرتفع", date: "منذ ساعة واحدة" },
                    { name: "فاطمة أحمد العلي", diag: "مراجعة خمول الغدة الدرقية", date: "منذ ساعتين" },
                    { name: "خالد تركي الدوسري", diag: "تنظيم دهون ثلاثية للقلب", date: "منذ ٣ ساعات" }
                  ].map((p, idx) => (
                    <div key={idx} className="pt-2 flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-700 font-heading text-[11px]">{p.name}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">التشخيص: {p.diag}</p>
                      </div>
                      <span className="text-[9px] text-gray-300 shrink-0">{p.date}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </main>
        </div>
      ) : (
        /* ==========================================================================
           PAGE 16: MEDICAL EXAMINATION PAGE (FULL-WIDTH, NO SIDEBAR)
           ========================================================================== */
        <div className="space-y-6 p-4 md:p-8 animate-fade-in text-right">
          
          {/* Top Patient demographic bar */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <button 
                id="exam-back-dash"
                onClick={() => setDoctorSubView("dashboard")} 
                className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-all cursor-pointer"
                title="العودة للوحة"
              >
                <ChevronRight size={18} />
              </button>
              <div>
                <span className="text-[9px] bg-[#1A6B5A] text-white px-2 py-0.5 rounded font-bold font-tajawal">جاري تدوين ملف المريض الطبي</span>
                <h2 className="text-base md:text-xl font-bold font-heading text-gray-850 mt-1">سلمان بن بندر الشمري (أنت)</h2>
                <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 font-body mt-1">
                  <span>الملف الرقمي: PAT-2026-6701</span>
                  <span>•</span>
                  <span>العمر: ٣٤ سنة</span>
                  <span>•</span>
                  <span>الجنس: ذكر</span>
                  <span>•</span>
                  <span>فصيلة الدم: O+</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => alert("استعراض تاريخ الزيارات السابقة للمريض تفصيلياً...")} 
                className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-xs font-bold font-tajawal text-gray-600 rounded-xl cursor-pointer"
              >
                استعراض أرشيف الزيارات الكامل
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-10 gap-6 items-start">
            
            {/* Left 65% Column: examination and diagnosis forms (takes 6 columns on lg) */}
            <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
              
              {/* VITALS SECTION ROW: 4 inputs */}
              <div className="space-y-3">
                <h4 className="font-heading font-bold text-xs text-[#1A6B5A] border-b border-gray-105 pb-1 flex items-center gap-1.5">
                  <Activity size={14} />
                  <span>١. العلامات الحيوية المقاسة فوراً بالعيادة</span>
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1 font-heading">الوزن (كجم)</label>
                    <div className="relative">
                      <Scale size={12} className="absolute left-3 top-2.5 text-gray-400" />
                      <input 
                        type="text" 
                        value={patientWeight}
                        onChange={(e) => setPatientWeight(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a6b5a] font-body"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1 font-heading">الطول (سم)</label>
                    <input 
                      type="text" 
                      value={patientHeight}
                      onChange={(e) => setPatientHeight(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a6b5a] font-body"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1 font-heading">ضغط الدم (Bp)</label>
                    <div className="relative">
                      <Activity size={12} className="absolute left-3 top-2.5 text-[#1A6B5A]" />
                      <input 
                        type="text" 
                        value={patientBp}
                        onChange={(e) => setPatientBp(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-250 rounded-lg focus:outline-none focus:border-[#1a6b5a] font-body font-bold text-[#1A6B5A]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1 font-heading font-semibold">حرارة الجسم (م°)</label>
                    <div className="relative">
                      <Thermometer size={12} className="absolute left-3 top-2.5 text-red-500" />
                      <input 
                        type="text" 
                        value={patientTemp}
                        onChange={(e) => setPatientTemp(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1a6b5a] font-body"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* CHIEF COMPLAINT INPUT area */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 font-heading">٢. الشكوى الطبية الرئيسية والأعراض المقررة للمريض</label>
                <textarea 
                  rows={2}
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="فضلاً اكتب الشكوى التفصيلية بدقة..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                />
              </div>

              {/* DIAGNOSIS FIELD WITH QUICK-ADD TAGS */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-700 font-heading">٣. تشخيص الاستشاري المعالج والرموز الطبية الملحقة</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={diagnosisValue}
                    onChange={(e) => setDiagnosisValue(e.target.value)}
                    placeholder="مثال: فرط السكري النوع الثاني، اضطرابات الصمام الشرياني"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                  />
                  <button 
                    id="add-diag-tag-btn"
                    type="button"
                    onClick={handleAddDiagnosisTag}
                    className="px-4 py-1.5 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl cursor-pointer shrink-0"
                  >
                    أدخل كعلامة +
                  </button>
                </div>

                {/* Display active tag chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {diagnosisTags.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-[#1A6B5A] text-[10px] font-semibold rounded-lg font-heading">
                      <span>{tag}</span>
                      <button 
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-500 hover:text-red-700 font-bold focus:outline-none cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* GENERAL CLINIC NOTES OR PLAN */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 font-heading">٤. التوجيهات الطبية والخطة الغذائية والسلوكية الموصوفة</label>
                <textarea 
                  rows={2}
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                />
              </div>

              {/* PRESCRIPTION BUILDER SECTION: medicine rows with search & add */}
              <div className="space-y-4">
                <h4 className="font-heading font-bold text-xs text-[#1A6B5A] border-b border-gray-105 pb-1">
                  ٥. كتابة الروشتة وعلاج المريض المباشر (الحد الأقصى اليوم بخصوص الصيدلية)
                </h4>
                
                {/* Inputs for adding new medicine */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1 font-heading">اسم الدواء الموصوف المكتوب</label>
                    <input 
                      type="text" 
                      placeholder="Concor 5mg Tab"
                      value={medInput}
                      onChange={(e) => setMedInput(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#1a6b5a] font-body"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1 font-heading">جرعة الدواء (Dosage)</label>
                    <input 
                      type="text" 
                      placeholder="حبة واحدة صباحاً غدا"
                      value={dosageInput}
                      onChange={(e) => setDosageInput(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-[#1a6b5a]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-gray-400 mb-1 font-heading">التكرار والتردد (Freq)</label>
                    <input 
                      type="text" 
                      placeholder="مرة واحدة يومياً"
                      value={freqInput}
                      onChange={(e) => setFreqInput(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                    />
                  </div>
                  <div className="flex items-end gap-1.5">
                    <div className="flex-1">
                      <label className="block text-[9px] text-gray-400 mb-1 font-heading">الفترة والدورة (Cycle)</label>
                      <input 
                        type="text" 
                        placeholder="٥ أيام"
                        value={durInput}
                        onChange={(e) => setDurInput(e.target.value)}
                        className="w-full px-2 py-1.5 border border-gray-200 rounded-lg bg-white"
                      />
                    </div>
                    <button 
                      id="exam-add-med-btn"
                      type="button"
                      onClick={handleAddMedicine}
                      className="px-3 py-2 bg-[#1A6B5A] text-white hover:bg-[#155447] font-bold rounded-lg cursor-pointer font-tajawal shrink-0 text-xs"
                    >
                      إضافة دواء
                    </button>
                  </div>
                </div>

                {/* List of currently prescribed meds */}
                <div className="border border-gray-105 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs font-body">
                  {prescriptions.map((m) => (
                    <div key={m.id} className="p-3 bg-white flex justify-between items-center">
                      <div>
                        <span className="font-heading font-medium text-[#1A6B5A] text-xs block">{m.name}</span>
                        <span className="text-[10px] text-gray-400">جرعة: {m.dosage} | تكرار: {m.freq} | الفترة: {m.duration}</span>
                      </div>
                      
                      <button 
                        onClick={() => handleRemoveMedicine(m.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-full shrink-0"
                        title="حذف هذا الدواء الموصوف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  
                  {prescriptions.length === 0 && (
                    <p className="text-center font-body text-gray-400 text-xs py-4 bg-gray-50/50">لا توجد أدوية مضافة للروشتة حالياً.</p>
                  )}
                </div>
              </div>

              {/* FILE UPLOAD ZONE: drag drop representation */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-gray-700 font-heading">٦. رفع تقرير أشعة خارجية أو تحاليل طبية سابقة للملف</label>
                <div className="border-2 border-dashed border-gray-200 hover:border-emerald-300 bg-gray-50/30 hover:bg-emerald-50/10 p-5 rounded-xl text-center cursor-pointer transition-all">
                  <Upload size={28} className="text-[#1A6B5A] mx-auto mb-2 opacity-60" />
                  <p className="text-xs font-bold text-gray-700 font-heading leading-snug">اسحب وأفلت ملفات الأشعة وصور التحاليل هنا</p>
                  <p className="text-[9px] text-gray-400 font-body mt-1">يُسمح برفع ملفات PDF أو الصور الطبية الرقمية بحد أقصى ١٠ ميجابايت للملف</p>
                </div>
              </div>

            </div>

            {/* Right 35% Column: Patient condensed history list (takes 4 columns on lg) */}
            <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 text-right">
              <h3 className="font-heading font-bold text-xs text-gray-800 border-b border-gray-100 pb-2">آخر ٥ زيارات وعمليات مسجلة للمريض</h3>
              
              <div className="relative border-r border-[#1a6b5a30] mr-2 pl-2 space-y-5">
                
                <div className="relative">
                  <div className="absolute top-1 -right-[12px] w-2.5 h-2.5 bg-[#1A6B5A] rounded-full" />
                  <div className="mr-4 space-y-1">
                    <span className="text-[9px] font-tajawal font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">١٢ مايو ٢٠٢٦ م</span>
                    <h5 className="text-[11px] font-bold font-heading text-gray-800">ارتفاع ضغط شرياني بسيط وضيق بالتنفس</h5>
                    <p className="text-[10px] text-gray-500 font-body">الصبر من ضيق الصدر. دواء كونكور 5 مجم حبة.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-1 -right-[12px] w-2.5 h-2.5 bg-gray-300 rounded-full" />
                  <div className="mr-4 space-y-1">
                    <span className="text-[9px] font-tajawal font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">٢٤ مارس ٢٠٢٦ م</span>
                    <h5 className="text-[11px] font-bold font-heading text-gray-800">تحاليل ومخطر دهون سكري شامل</h5>
                    <p className="text-[10px] text-gray-500 font-body">فحص دوري والدهون جيدة جداً وتحتاج تقليل الدهون فقط.</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute top-1 -right-[12px] w-2.5 h-2.5 bg-gray-300 rounded-full" />
                  <div className="mr-4 space-y-1">
                    <span className="text-[9px] font-tajawal font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">٠٨ يناير ٢٠٢٦ م</span>
                    <h5 className="text-[11px] font-bold font-heading text-gray-800">كشف ضغط ومجهاد قلب جهد</h5>
                    <p className="text-[10px] text-gray-500 font-body">رسم تخطيط ومجهود القلب على المشاية - سليم تماماً.</p>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Sticky Bottom Bar for Page 16 actions */}
          <div className="pt-6 border-t border-gray-100 mt-2 flex flex-col sm:flex-row gap-4 justify-between items-center font-tajawal text-xs bg-white p-4 rounded-xl shadow-md border border-emerald-100">
            <div className="text-right sm:text-left text-gray-500 text-[10px] font-body leading-normal">
              تحذير: سيؤدي النقر على حفظ وإنهاء إلى تحديث علامات المريض ومزامنة الروشتة تلقائياً مع نظام الصيدلية والاستقبال.
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                id="exam-save-close"
                onClick={submitClinicExam}
                className="flex-1 sm:flex-none px-6 py-3 bg-[#1A6B5A] text-white hover:bg-[#155447] font-bold rounded-xl shadow-sm cursor-pointer"
              >
                حفظ وإنهاء الكشك الطبي
              </button>
              
              <button 
                onClick={() => alert("تم حفظ تقدم الكشف كبيانات مؤقتة بنجاح.")}
                className="px-4 py-3 border border-gray-250 text-gray-650 hover:bg-gray-50 font-bold rounded-xl cursor-pointer"
              >
                حفظ مؤقت للملف
              </button>

              <button 
                id="exam-print-rx"
                onClick={onNavigateToPrint}
                className="px-4 py-3 border border-emerald-150 text-emerald-800 hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center gap-1 font-bold"
              >
                <Printer size={14} />
                <span>طباعة الوصفة الروشتة</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
