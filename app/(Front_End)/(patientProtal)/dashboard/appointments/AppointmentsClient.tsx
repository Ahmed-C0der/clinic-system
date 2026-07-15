"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Calendar, Plus, Clock, MapPin, CheckCircle, XCircle, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AppointmentsClientProps {
  initialData: {
    upcoming: any[];
    past: any[];
  } | null;
}

export default function AppointmentsClient({ initialData }: AppointmentsClientProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".animate-item", {
      opacity: 0,
      x: -30,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    });
  }, { dependencies: [activeTab], scope: containerRef });

  if (!initialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <AlertCircle className="w-12 h-12 text-[#e67e22] mb-4" />
        <h3 className="font-cairo text-lg font-bold text-[#1C1C1E]">حدث خطأ في تحميل المواعيد</h3>
        <p className="font-sans text-slate-500 text-sm mt-1">يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { upcoming, past } = initialData;
  const currentList = activeTab === "upcoming" ? upcoming : past;

  // Format date helper: "15" and "أكتوبر"
  const getDayAndMonth = (dateString: Date) => {
    const d = new Date(dateString);
    const day = d.getDate();
    const month = d.toLocaleDateString("ar-EG", { month: "short" });
    return { day: day < 10 ? `0${day}` : day, month };
  };

  const getFriendlyTime = (dateString: Date) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit", hour12: true }).replace("م", "مساءً").replace("ص", "صباحاً");
  };

  return (
    <div ref={containerRef} className="space-y-6" dir="rtl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h1 className="font-cairo text-2xl font-bold text-[#1C1C1E]">مواعيدي</h1>
          <p className="font-sans text-slate-400 text-xs md:text-sm mt-1">
            إدارة مواعيدك الطبية الحالية ومراجعة سجل مواعيدك السابقة مع الأطباء.
          </p>
        </div>
        <Button asChild className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo font-bold rounded-lg px-5 py-3 transition-transform duration-300 hover:scale-105">
          <Link href="/services" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>احجز موعداً جديداً</span>
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main list area (takes 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Selector */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`pb-3 font-cairo font-bold text-sm px-6 border-b-2 transition-all duration-300 relative ${
                activeTab === "upcoming"
                  ? "border-[#1A6B5A] text-[#1A6B5A]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              المواعيد القادمة
              {upcoming.length > 0 && (
                <span className="mr-2 bg-[#1A6B5A] text-white text-[10px] px-1.5 py-0.5 rounded-full font-sans">
                  {upcoming.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`pb-3 font-cairo font-bold text-sm px-6 border-b-2 transition-all duration-300 ${
                activeTab === "past"
                  ? "border-[#1A6B5A] text-[#1A6B5A]"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              المواعيد السابقة
            </button>
          </div>

          {/* Appointments Grid/List */}
          {currentList.length > 0 ? (
            <div className="space-y-4">
              {currentList.map((app) => {
                const { day, month } = getDayAndMonth(app.scheduledAt);
                return (
                  <Card key={app.id} className="animate-item border-none shadow-sm bg-white rounded-lg overflow-hidden hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                      {/* Left: Date Block & Info Group */}
                      <div className="flex items-center gap-5 w-full sm:w-auto">
                        {/* Date Block */}
                        <div className="w-16 h-20 bg-[#1A6B5A] text-white flex flex-col items-center justify-center rounded-xl shrink-0">
                          <span className="font-sans text-2xl font-black leading-none">{day}</span>
                          <span className="font-cairo text-xs font-semibold mt-1">{month}</span>
                        </div>

                        {/* Text details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-cairo font-bold text-[#1C1C1E] text-base">{app.serviceName}</h3>
                            {activeTab === "upcoming" ? (
                              <Badge className="bg-[#2DBFA0]/15 text-[#1A6B5A] hover:bg-[#2DBFA0]/25 border-none font-sans text-[10px] font-bold px-2 py-0.5 rounded-full">
                                مؤكد
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-400 border border-slate-200 font-sans text-[10px] font-medium px-2 py-0.5 rounded-full">
                                مكتمل
                              </Badge>
                            )}
                          </div>
                          <p className="font-sans font-medium text-slate-600 text-sm">مع {app.doctorName}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {getFriendlyTime(app.scheduledAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              عيادة القاهرة، الطابق الثالث
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex gap-2 self-end sm:self-auto w-full sm:w-auto justify-end border-t border-slate-50 sm:border-t-0 pt-3 sm:pt-0">
                        {activeTab === "upcoming" ? (
                          <>
                            <Button variant="outline" className="border-slate-200 hover:bg-[#1A6B5A]/5 hover:text-[#1A6B5A] text-slate-600 font-cairo text-xs font-semibold rounded-lg">
                              تغيير الموعد
                            </Button>
                            <Button variant="ghost" className="text-red-500 hover:bg-red-50 font-cairo text-xs font-semibold rounded-lg border border-red-50">
                              إلغاء الموعد
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo text-xs font-semibold rounded-lg px-4">
                              إعادة حجز
                            </Button>
                            <Button variant="outline" className="border-slate-200 text-slate-500 font-cairo text-xs font-semibold rounded-lg">
                              عرض التفاصيل
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="animate-item border-none shadow-sm bg-white rounded-lg py-12 text-center">
              <CardContent className="flex flex-col items-center justify-center">
                <Calendar className="w-12 h-12 text-slate-300 mb-3" />
                <p className="font-sans text-slate-500 text-sm">
                  {activeTab === "upcoming" ? "لا توجد مواعيد قادمة مجدولة حالياً." : "لا توجد مواعيد سابقة مسجلة."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Info/Alert Cards (takes 1 col) */}
        <div className="space-y-6">
          {/* Reminder Card */}
          <Card className="border-none shadow-sm bg-white rounded-lg">
            <CardContent className="p-6 space-y-4">
              <div className="w-10 h-10 bg-[#2DBFA0]/10 text-[#1A6B5A] rounded-xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-cairo font-bold text-[#1C1C1E] text-sm">تذكير تلقائي بالموعد</h4>
                <p className="font-sans text-slate-500 text-xs leading-relaxed">
                  سنرسل لك رسالة تذكير تلقائية تحتوي على تفاصيل الموعد واسم الطبيب قبل الموعد بـ 24 ساعة عبر تطبيق الواتساب أو رسالة نصية قصيرة SMS للتأكيد.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Health Tip Card */}
          <Card className="border-none shadow-sm bg-gradient-to-br from-[#1A6B5A] to-[#1A6B5A]/90 text-white rounded-lg overflow-hidden relative">
            <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <CardContent className="p-6 space-y-4 relative z-10">
              <div className="w-10 h-10 bg-white/10 text-[#2DBFA0] rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-2">
                <h4 className="font-cairo font-bold text-white text-sm">نصيحة طبية هامة</h4>
                <p className="font-sans text-white/80 text-xs leading-relaxed">
                  الرجاء الحرص على الحضور قبل موعد الحجز بـ 15 دقيقة على الأقل لإتمام إجراءات التسجيل وقياس المؤشرات الحيوية في قسم الاستقبال. لا تنسى إحضار نتائج التحاليل السابقة إن وجدت.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
