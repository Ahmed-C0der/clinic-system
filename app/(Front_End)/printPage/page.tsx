/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart, Printer, FileText, ArrowRight } from "lucide-react";

interface PrintPageProps {
  onBackToClinic?: () => void;
}

export function PrintPage({ onBackToClinic }: PrintPageProps) {
  
  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="animate-fade-in text-[#1C1C1E] bg-gray-500 min-h-screen py-8 px-4 flex flex-col items-center">
      
      {/* Top Floating Control Toolbar (hidden during native print) */}
      <div className="print:hidden w-full max-w-4xl bg-white/95 backdrop-blur-md p-4 rounded-xl border border-gray-200 shadow-md mb-6 flex justify-between items-center z-10 sticky top-4">
        <div className="flex gap-2">
          {onBackToClinic && (
            <button 
              onClick={onBackToClinic}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-bold font-tajawal text-gray-600 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight size={14} />
              <span>العودة للوحة العيادة</span>
            </button>
          )}
        </div>
        
        <div className="flex gap-2 font-tajawal text-xs">
          <button 
            id="print-action-btn"
            onClick={handleTriggerPrint}
            className="px-5 py-2 bg-[#1A6B5A] text-white hover:bg-[#155447] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Printer size={14} />
            <span>طباعة الوصفة الطبية (A4)</span>
          </button>
          
          <button 
            onClick={() => alert("جاري تصدير وهندسة ملف PDF بملامح الألوان البارزة...")}
            className="px-4 py-2 border border-[#1A6B5A] text-[#1A6B5A] hover:bg-emerald-50 font-bold rounded-xl cursor-pointer"
          >
            تصدير كـ PDF إلكتروني
          </button>
        </div>
      </div>

      {/* A4 PRINT PAGE CONTAINER */}
      <div 
        id="a4-prescription-card"
        className="w-full max-w-[800px] min-h-[1100px] bg-white text-black p-10 md:p-14 shadow-2xl rounded-sm border border-gray-200 text-right space-y-8 print:shadow-none print:border-none print:p-0 print:my-0 flex flex-col justify-between"
      >
        
        <div className="space-y-8">
          
          {/* Header Area */}
          <div className="flex justify-between items-start border-b-4 border-[#1A6B5A] pb-6">
            
            {/* Dr metadata left */}
            <div className="space-y-1 text-xs text-gray-600">
              <h3 className="font-heading font-bold text-sm text-gray-800">الدكتور يوسف عبدالرحمن بن فهد</h3>
              <p className="font-body">استشاري القلب والأوعية الدموية والطب الباطني</p>
              <p className="font-body text-[11px] text-gray-400">عضوية الهيكل الطبي المرخص برقم: ١٠٤٩١-S</p>
              <p className="font-body text-[11px] text-emerald-700">الاستشاري والمدير الفني المعتمد بالمنطقة</p>
            </div>

            {/* Clinic Logo right */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <h1 className="text-xl font-bold font-heading text-[#1A6B5A]">العيادة الطبية المتكاملة</h1>
                <p className="text-[10px] text-gray-400 font-body">قريبون منك، لرعاية صحية شاملة</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#1A6B5A] to-[#2DBFA0] flex items-center justify-center text-white shadow-sm shrink-0">
                <Heart size={26} fill="currentColor" />
              </div>
            </div>

          </div>

          {/* 2x2 grid Patient Bar */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-150/80 grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-body">
            <div>
              <span className="text-gray-400 block mb-0.5">اسم المريض الكامل</span>
              <span className="font-bold text-gray-850 font-heading text-[11px]">سلمان بن بندر الشمري</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">عمر ومولد المريض</span>
              <span className="font-bold text-gray-800">٣٤ سنة (O+)</span>
            </div>
            <div>
              <span className="text-gray-400 block mb-0.5">تاريخ وصف الروشتة</span>
              <span className="font-bold text-gray-800">١٧ يونيو ٢٠٢٦ م</span>
            </div>
            <div className="text-left">
              <span className="text-gray-400 block mb-0.5">رقم تتبع الوصفة الموحد</span>
              <span className="font-bold text-[#1A6B5A] font-mono">RX-2026-6701-A</span>
            </div>
          </div>

          {/* Clinical Prescriptions Body */}
          <div className="space-y-6 pt-2">
            
            {/* Rx Large Title Symbol */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-serif font-black text-[#1A6B5A] tracking-wider italic">Rx</span>
              <span className="text-[10px] text-gray-400 border-b border-gray-150 pb-1 flex-1">الوصفات والعلاجات الصيدلانية الصادرة للاستعمال الفوري</span>
            </div>

            {/* Numbered Table containing pre-filled Medicines */}
            <div className="border border-gray-200 rounded-lg overflow-hidden font-body text-xs text-right">
              <table className="w-full text-right bg-white">
                <thead className="bg-[#1A6B5A]/5 text-[#1A6B5A] font-bold text-[11px]">
                  <tr>
                    <th className="p-3 w-10 text-center">م</th>
                    <th className="p-3">اسم الدواء الموصوف بدقة</th>
                    <th className="p-3">جرعة التناول</th>
                    <th className="p-3">التكرار اليومي</th>
                    <th className="p-3 text-left">فترة الدورة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-gray-750">
                  {[
                    { m: 1, name: "Concor 5mg Tab", dosage: "حبه واحدة صباحاً كشف", freq: "مرة واحدة يومياً", dur: "٥ أيام" },
                    { m: 2, name: "Lipitor 10mg Capsule", dosage: "حبة مع دهون الصباح", freq: "مرة واحدة مساءً", dur: "٣٠ يوماً" }
                  ].map((med, i) => (
                    <tr key={i}>
                      <td className="p-3 text-center text-gray-400 font-bold">{med.m}</td>
                      <td className="p-3 font-bold text-black font-heading text-[11px]">{med.name}</td>
                      <td className="p-3">{med.dosage}</td>
                      <td className="p-3">{med.freq}</td>
                      <td className="p-3 text-left font-bold text-emerald-800 font-tajawal">{med.dur}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* Diagnosis & Notes sections */}
          <div className="grid sm:grid-cols-2 gap-6 pt-4 text-xs font-body">
            
            {/* Diagnoses */}
            <div className="p-4 bg-[#1A6B5A]/5 rounded-xl border border-emerald-100/60 space-y-2">
              <h4 className="font-heading font-bold text-xs text-[#1A6B5A]">التشخيص الطبي للحالة:</h4>
              <p className="text-gray-700 leading-relaxed font-medium">
                • فرط ضغط الدم الشرياني الخفيف (درجة أولى)<br />
                • ارتفاع غير متماثل في مستوى الدهون الثلاثية بالدم
              </p>
            </div>

            {/* Notes */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 space-y-2">
              <h4 className="font-heading font-bold text-xs text-gray-800">ملاحظات الطبيب وارشادات النظام:</h4>
              <p className="text-gray-600 leading-relaxed">
                يرجى تجنب المأكولات المملحة والموالح بانتظام، مع ممارسة المشي الخفيفة ٢٥ دقيقة باليوم. يتم مراجعة قياسات ضغط الدم المعتمدة هاتفياً وبشكل دوري.
              </p>
            </div>

          </div>

        </div>

        {/* Footer Signatures Area */}
        <div className="border-t border-gray-200 pt-8 mt-12 flex justify-between items-end text-xs text-gray-600">
          
          {/* Clinic Stamp left */}
          <div className="text-center space-y-6">
            <div className="text-gray-400 font-tajawal font-bold text-[10px]">ختم واعتماد العيادة الطبية</div>
            {/* Stamp simulation */}
            <div className="w-20 h-20 rounded-full border-4 border-dashed border-emerald-600/30 flex flex-col justify-center items-center text-[10px] text-emerald-700/60 font-bold font-heading mx-auto transform -rotate-12 select-none">
              <Heart size={14} className="opacity-40" />
              <span>معتمد بالعيادة</span>
              <span className="text-[7px]">٢٠٢٦ م</span>
            </div>
          </div>

          {/* Validity disclaimer center */}
          <div className="text-center max-w-sm space-y-2 text-[10px] text-gray-400 leading-normal font-body">
            <p>⚠️ بروتوكول سلامة: هذه الوصفة معتمدة رقمياً بنبض الصيدليات وصالحة للتصريف بموجب التوقيع الفني لمرة واحدة خلال ٧ أيام كحد أقصى.</p>
          </div>

          {/* Doctor signature area right */}
          <div className="text-center space-y-6">
            <div className="text-gray-400 font-tajawal font-bold text-[10px]">توقيع الطبيب الاستشاري المعالج</div>
            {/* Signature simulated script */}
            <div className="w-32 h-10 border-b border-gray-300 font-serif italic text-base text-gray-800 text-center select-none font-medium">
              Dr. Yousif Al-Fahad
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
