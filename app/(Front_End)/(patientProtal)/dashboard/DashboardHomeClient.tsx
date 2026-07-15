"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Calendar, FileText, Pill, Heart, Thermometer, ShieldAlert, Dumbbell, MessageSquare, Video, ArrowLeft, Activity } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DashboardHomeClientProps {
  initialData: any;
}

export default function DashboardHomeClient({ initialData }: DashboardHomeClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP animation for stagger entrance
  useGSAP(() => {
    gsap.fromTo(".animate-card",
      {
        opacity: 0,
        y: 40,
      },
      {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.1,
        ease: "power2.out"
    });
  }, { scope: containerRef });

  if (!initialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <ShieldAlert className="w-12 h-12 text-[#e67e22] mb-4" />
        <h3 className="font-cairo text-lg font-bold text-[#1C1C1E]">لم نتمكن من العثور على بيانات المريض</h3>
        <p className="font-sans text-slate-500 text-sm mt-1">يرجى التأكد من تسجيل الدخول والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { patient, stats, nextAppointment, latestVisit } = initialData;

  // Format Arabic greeting
  const hour = new Date().getHours();
  let greetingText = "مرحباً بك";
  if (hour < 12) {
    greetingText = "صباح الخير";
  } else {
    greetingText = "مساء الخير";
  }

  // Format Date to friendly Arabic (e.g. 24 أكتوبر)
  const formatArabicDate = (dateString: Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).replace("م", "مساءً").replace("ص", "صباحاً");
  };

  return (
    <div ref={containerRef} className="space-y-8" dir="rtl">
      {/* Top Banner Greeting */}
      <div className="animate-card flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-l from-[#1A6B5A]/90 to-[#1A6B5A] text-white p-8 rounded-lg shadow-md relative overflow-hidden">
        {/* Subtle decorative shapes */}
        <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-[-30px] right-[20%] w-32 h-32 bg-[#2DBFA0]/15 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative z-10 space-y-2">
          <h1 className="font-cairo text-2xl md:text-3xl font-extrabold">
            {greetingText}، {patient?.name || "عزيزي المريض"} 👋
          </h1>
          <p className="font-sans font-medium text-white/80 text-sm md:text-base max-w-xl">
            نتمنى لك يوماً مليئاً بالصحة والعافية. هنا يمكنك تتبع خطتك العلاجية، مواعيدك القادمة، ومراجعة سجلاتك الطبية بكل سهولة وأمان.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Next Appointment Card (Left/Main Side - taking 2 cols on wide screens) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Next Appointment Display */}
          <Card className="animate-card border-none shadow-sm overflow-hidden bg-white rounded-lg">
            <CardHeader className="bg-[#1A6B5A]/5 border-b border-slate-100/50 pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="font-cairo text-[#1A6B5A] text-lg font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  الموعد القادم
                </CardTitle>
                {nextAppointment ? (
                  <Badge className="bg-[#2DBFA0] hover:bg-[#2DBFA0]/90 text-white font-sans text-xs font-bold px-3 py-1 rounded-full">
                    {nextAppointment.daysRemainingText}
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200 font-sans text-xs font-medium px-3 py-1 rounded-full">
                    لا يوجد موعد مجدول
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {nextAppointment ? (
                <div className="space-y-6">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#1A6B5A]/10 text-[#1A6B5A] flex items-center justify-center font-bold font-cairo">
                      د
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-cairo font-bold text-[#1C1C1E] text-base">
                        {nextAppointment.doctorName}
                      </h4>
                      <p className="font-sans font-medium text-[#2DBFA0] text-sm">
                        {nextAppointment.doctorSpecialty || "ممارس عام"}
                      </p>
                    </div>
                  </div>

                  {/* Scheduled Date/Time & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-100 p-4 rounded-xl">
                    <div className="space-y-1">
                      <span className="font-sans text-xs font-medium text-slate-400">تاريخ ووقت الموعد</span>
                      <p className="font-cairo font-bold text-sm text-[#1C1C1E]">
                        {formatArabicDate(nextAppointment.scheduledAt)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-sans text-xs font-medium text-slate-400">موقع العيادة</span>
                      <p className="font-cairo font-bold text-sm text-[#1C1C1E]">
                        مركز الشفاء الطبي، عيادة رقم 202
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Button className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo font-semibold rounded-lg px-6 transition-all duration-300">
                      تعديل الموعد
                    </Button>
                    <Button variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50 font-cairo font-semibold rounded-lg px-6 border border-red-100 transition-all duration-300">
                      إلغاء الموعد
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-sans text-slate-400 text-sm">ليس لديك أي مواعيد قادمة في الوقت الحالي.</p>
                  <Button asChild className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo font-semibold rounded-lg px-6 mt-4 transition-all duration-300">
                    <Link href="/services">احجز موعداً الآن</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vitals / Last Visit Summary */}
          <Card className="animate-card border-none shadow-sm overflow-hidden bg-white rounded-lg">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="font-cairo text-[#1C1C1E] text-lg font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#2DBFA0]" />
                ملخص آخر زيارة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {latestVisit ? (
                <div className="space-y-6">
                  {/* Diagnosis */}
                  <div className="space-y-2">
                    <span className="font-sans text-xs font-medium text-[#2DBFA0] bg-[#2DBFA0]/10 px-2.5 py-1 rounded-full">
                      التشخيص الحالي
                    </span>
                    <p className="font-sans text-sm md:text-base font-semibold text-[#1C1C1E] leading-relaxed bg-[#fcf8fb] p-4 rounded-xl border border-slate-100">
                      {latestVisit.diagnosis || "لم يتم تسجيل تشخيص بعد."}
                    </p>
                  </div>

                  {/* Vitals Grid */}
                  <div className="space-y-3">
                    <h5 className="font-cairo font-bold text-[#1C1C1E] text-sm">المؤشرات الحيوية المقاسة:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {/* Heart Rate */}
                      <div className="bg-white border border-slate-100 hover:border-[#2DBFA0]/30 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-sm">
                        <Heart className="w-6 h-6 text-red-500 mb-2" />
                        <span className="font-sans text-xs font-medium text-slate-400">نبض القلب</span>
                        <span className="font-cairo font-bold text-sm text-[#1C1C1E] mt-1">
                          {latestVisit.heartRate || "72"} bpm
                        </span>
                      </div>

                      {/* Blood Pressure */}
                      <div className="bg-white border border-slate-100 hover:border-[#2DBFA0]/30 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-sm">
                        <Activity className="w-6 h-6 text-blue-500 mb-2" />
                        <span className="font-sans text-xs font-medium text-slate-400">ضغط الدم</span>
                        <span className="font-cairo font-bold text-sm text-[#1C1C1E] mt-1">
                          {latestVisit.bloodPressure || "120/80"}
                        </span>
                      </div>

                      {/* Temperature */}
                      <div className="bg-white border border-slate-100 hover:border-[#2DBFA0]/30 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-sm">
                        <Thermometer className="w-6 h-6 text-amber-500 mb-2" />
                        <span className="font-sans text-xs font-medium text-slate-400">درجة الحرارة</span>
                        <span className="font-cairo font-bold text-sm text-[#1C1C1E] mt-1">
                          {latestVisit.temperatureC || "37.2"}°C
                        </span>
                      </div>

                      {/* Weight */}
                      <div className="bg-white border border-slate-100 hover:border-[#2DBFA0]/30 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-sm">
                        <Dumbbell className="w-6 h-6 text-emerald-500 mb-2" />
                        <span className="font-sans text-xs font-medium text-slate-400">الوزن</span>
                        <span className="font-cairo font-bold text-sm text-[#1C1C1E] mt-1">
                          {latestVisit.weightKg || "78"} كجم
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Prescriptions buttons */}
                  {latestVisit.prescriptionItems && latestVisit.prescriptionItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
                      <Button asChild variant="outline" className="border-[#1A6B5A] text-[#1A6B5A] hover:bg-[#1A6B5A]/5 font-cairo font-semibold rounded-lg transition-all duration-300">
                        <Link href="/dashboard/records">عرض الوصفة الطبية</Link>
                      </Button>
                      <Button variant="ghost" className="text-slate-500 hover:bg-slate-50 font-cairo font-semibold rounded-lg transition-all duration-300">
                        طلب إعادة صرف
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="font-sans text-slate-400 text-sm">لا تتوفر تفاصيل للزيارات السابقة في حسابك.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards (Quick stats + Actions - taking 1 col) */}
        <div className="space-y-8">
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 1: Total Visits */}
            <Card className="animate-card border-none shadow-sm bg-white rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="font-sans text-xs font-medium text-slate-400">إجمالي الزيارات</span>
                  <h3 className="font-cairo font-extrabold text-xl text-[#1C1C1E]">
                    {stats.totalVisits} زيارة
                  </h3>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Last Visit */}
            <Card className="animate-card border-none shadow-sm bg-white rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="font-sans text-xs font-medium text-slate-400">آخر زيارة</span>
                  <h3 className="font-cairo font-extrabold text-lg text-[#1C1C1E] leading-tight">
                    {stats.lastVisitTimeAgo}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Active Prescriptions */}
            <Card className="animate-card border-none shadow-sm bg-white rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1.5">
                  <span className="font-sans text-xs font-medium text-slate-400">وصفات نشطة</span>
                  <h3 className="font-cairo font-extrabold text-xl text-[#1C1C1E]">
                    {stats.activePrescriptionsCount} وصفات
                  </h3>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
                  <Pill className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions List */}
          <Card className="animate-card border-none shadow-sm bg-white rounded-lg">
            <CardHeader className="pb-3 border-b border-slate-50">
              <CardTitle className="font-cairo text-base font-bold text-[#1C1C1E]">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 p-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/services"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-100 hover:bg-[#1A6B5A]/5 hover:border-[#1A6B5A]/20 transition-all duration-300 text-center"
                >
                  <Calendar className="w-5 h-5 text-[#1A6B5A] mb-2" />
                  <span className="font-cairo font-semibold text-xs text-slate-700">حجز موعد</span>
                </Link>

                <Link
                  href="/dashboard/records"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-100 hover:bg-[#1A6B5A]/5 hover:border-[#1A6B5A]/20 transition-all duration-300 text-center"
                >
                  <FileText className="w-5 h-5 text-[#1A6B5A] mb-2" />
                  <span className="font-cairo font-semibold text-xs text-slate-700">السجل الطبي</span>
                </Link>

                <Link
                  href="/dashboard/records"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-100 hover:bg-[#1A6B5A]/5 hover:border-[#1A6B5A]/20 transition-all duration-300 text-center"
                >
                  <Pill className="w-5 h-5 text-[#1A6B5A] mb-2" />
                  <span className="font-cairo font-semibold text-xs text-slate-700">الوصفات الطبية</span>
                </Link>

                <Link
                  href="/contact"
                  className="flex flex-col items-center justify-center p-4 rounded-lg border border-slate-100 hover:bg-[#1A6B5A]/5 hover:border-[#1A6B5A]/20 transition-all duration-300 text-center"
                >
                  <MessageSquare className="w-5 h-5 text-[#1A6B5A] mb-2" />
                  <span className="font-cairo font-semibold text-xs text-slate-700">تواصل معنا</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Online Consult CTA Banner */}
      <div className="animate-card bg-slate-900 text-white rounded-lg p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden transition-all duration-500 hover:shadow-lg">
        {/* Animated accent circle background */}
        <div className="absolute right-[-40px] top-[-40px] w-40 h-40 bg-[#2DBFA0]/15 rounded-full blur-2xl" />
        
        <div className="flex items-start md:items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-xl bg-white/10 text-[#2DBFA0] flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="font-cairo font-bold text-lg md:text-xl">استشر طبيبك عن بعد</h3>
            <p className="font-sans text-slate-400 text-xs md:text-sm">
              احصل على استشارة طبية فورية من منزلك مع مكالمات الفيديو المشفرة والآمنة لتوفير وقتك.
            </p>
          </div>
        </div>

        <Button className="bg-[#2DBFA0] hover:bg-[#2DBFA0]/90 text-slate-900 font-cairo font-bold rounded-lg px-6 self-start md:self-auto transition-transform duration-300 hover:scale-105 shrink-0 flex items-center gap-2">
          ابدأ استشارتك الآن
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
