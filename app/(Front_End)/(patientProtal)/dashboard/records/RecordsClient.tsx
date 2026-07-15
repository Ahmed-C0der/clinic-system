"use client";

import React, { useRef } from "react";
import { ClipboardList, Calendar, User, FileText, Download, ShieldCheck, Heart, Thermometer, Activity, Dumbbell, AlertTriangle } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecordsClientProps {
  initialData: {
    visits: any[];
    medicalFiles: any[];
  } | null;
}

export default function RecordsClient({ initialData }: RecordsClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate timeline nodes
    gsap.from(".animate-timeline-node", {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    });
    
    // Animate file cards
    gsap.from(".animate-file-card", {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      stagger: 0.08,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  if (!initialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <AlertTriangle className="w-12 h-12 text-[#e67e22] mb-4" />
        <h3 className="font-cairo text-lg font-bold text-[#1C1C1E]">حدث خطأ في تحميل السجل الطبي</h3>
        <p className="font-sans text-slate-500 text-sm mt-1">يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { visits, medicalFiles } = initialData;

  // Format Arabic Date
  const formatArabicDate = (dateString: Date) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Format Time
  const formatArabicTime = (dateString: Date) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).replace("ص", "صباحاً").replace("م", "مساءً");
  };

  // Format File Size
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "غير معروف";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div ref={containerRef} className="space-y-8" dir="rtl">
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="font-cairo text-2xl font-bold text-[#1C1C1E]">سجلي الطبي الكامل</h1>
        <p className="font-sans text-slate-400 text-xs md:text-sm mt-1">
          مراجعة تفاصيل زياراتك السابقة، التقارير الطبية، ونتائج التحاليل والوصفات المقررة.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Visits Timeline (Takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-lg">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="font-cairo text-[#1C1C1E] text-base font-bold">التسلسل الزمني للزيارات</CardTitle>
              <CardDescription className="font-sans text-xs">سجل مفصل لكل الكشوفات والاستشارات السابقة</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {visits.length > 0 ? (
                <div className="relative border-r border-slate-100 pr-6 space-y-12">
                  {visits.map((visit) => (
                    <div key={visit.id} className="animate-timeline-node relative">
                      {/* Timeline dot */}
                      <span className="absolute right-[-31px] top-1.5 w-3 h-3 bg-[#2DBFA0] border-2 border-white rounded-full shadow-sm ring-4 ring-[#2DBFA0]/15" />
                      
                      {/* Visit Date Header */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-[#1A6B5A]/10 hover:bg-[#1A6B5A]/15 text-[#1A6B5A] border-none font-sans text-xs font-semibold px-2.5 py-1 rounded-full">
                          {formatArabicDate(visit.visitDate)}
                        </Badge>
                        <span className="font-sans text-xs text-slate-400">
                          {formatArabicTime(visit.visitDate)}
                        </span>
                      </div>

                      {/* Card Content for the Visit */}
                      <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-5 space-y-4 transition-all duration-300 hover:border-slate-200">
                        {/* Doctor */}
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#1A6B5A]/10 text-[#1A6B5A] flex items-center justify-center font-bold text-sm">
                            د
                          </div>
                          <div>
                            <h4 className="font-cairo font-bold text-sm text-[#1C1C1E]">{visit.doctorName}</h4>
                            <p className="font-sans text-xs text-slate-400">{visit.doctorSpecialty || "باطنية"}</p>
                          </div>
                        </div>

                        {/* Chief Complaint / Diagnosis */}
                        <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-100">
                          {visit.chiefComplaint && (
                            <p className="font-sans text-xs text-slate-400">
                              الشكوى الأساسية: <span className="text-slate-600 font-semibold">{visit.chiefComplaint}</span>
                            </p>
                          )}
                          <p className="font-sans text-sm text-[#1C1C1E] mt-1 font-semibold">
                            التشخيص: {visit.diagnosis || "الحالة مستقرة."}
                          </p>
                        </div>

                        {/* Vitals Pills */}
                        <div className="flex flex-wrap gap-2 text-xs">
                          {visit.weightKg && (
                            <span className="flex items-center gap-1 bg-[#1A6B5A]/5 text-[#1A6B5A] px-2.5 py-1 rounded-full font-medium">
                              <Dumbbell className="w-3.5 h-3.5" />
                              وزن {visit.weightKg} كجم
                            </span>
                          )}
                          {visit.bloodPressure && (
                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-medium">
                              <Activity className="w-3.5 h-3.5" />
                              ضغط {visit.bloodPressure}
                            </span>
                          )}
                          {visit.temperatureC && (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full font-medium">
                              <Thermometer className="w-3.5 h-3.5" />
                              حرارة {visit.temperatureC}°C
                            </span>
                          )}
                          {visit.heightCm && (
                            <span className="flex items-center gap-1 bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full font-medium">
                              طول {visit.heightCm} سم
                            </span>
                          )}
                        </div>

                        {/* Prescriptions Items Details inside Timeline */}
                        {visit.prescriptionItems && visit.prescriptionItems.length > 0 && (
                          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                            <span className="font-sans text-xs text-slate-400">
                              تحتوي هذه الزيارة على وصفة طبية ({visit.prescriptionItems.length} أدوية)
                            </span>
                            <Button variant="outline" className="border-[#1A6B5A] text-[#1A6B5A] hover:bg-[#1A6B5A]/5 font-cairo text-xs font-semibold rounded-lg py-1 px-3">
                              عرض الوصفة الطبية
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="font-sans text-slate-500 text-sm">لا تتوفر أي زيارات سابقة في سجلاتك الطبية.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medical Files Card (Takes 1 col) */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-white rounded-lg">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="font-cairo text-[#1C1C1E] text-base font-bold">الملفات الطبية</CardTitle>
              <CardDescription className="font-sans text-xs">نتائج تحاليل المختبر والأشعة السينية والتقارير</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {medicalFiles.length > 0 ? (
                <div className="space-y-4">
                  {medicalFiles.map((file) => (
                    <div
                      key={file.id}
                      className="animate-file-card bg-white border border-slate-100 rounded-lg p-4 flex items-center justify-between gap-4 transition-all duration-300 hover:border-[#2DBFA0]/30 hover:shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1A6B5A]/10 text-[#1A6B5A] rounded-xl flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5 max-w-[140px] md:max-w-none">
                          <h4 className="font-sans font-bold text-xs text-[#1C1C1E] truncate" title={file.fileName}>
                            {file.fileName}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span>{formatArabicDate(file.uploadedAt)}</span>
                            <span>•</span>
                            <span>{formatFileSize(file.fileSizeBytes)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-[#1A6B5A] hover:bg-[#1A6B5A]/10 hover:text-[#1A6B5A] shrink-0 rounded-lg"
                        asChild
                      >
                        <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="font-sans text-xs">لم يتم رفع أي تقارير أو نتائج تحاليل بعد.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
