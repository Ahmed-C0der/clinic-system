/**
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Heart, Stethoscope, Clock, Volume2, ArrowRight } from "lucide-react";

interface TvDisplayPageProps {
  onExitTv?: () => void;
}

export function TvDisplayPage({ onExitTv }: TvDisplayPageProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("الأربعاء، ١٧ يونيو ٢٠٢٦ م");

  // Dynamic ticking clock simulation
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      const ampm = hours >= 12 ? "م" : "ص";
      
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 instead of 0
      
      const strMinutes = minutes < 10 ? "0" + minutes : minutes;
      const strSeconds = seconds < 10 ? "0" + seconds : seconds;
      
      setCurrentTime(`${hours}:${strMinutes}:${strSeconds} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Today queue list simulation
  const queueList = [
    { num: "٢", name: "سعيد بن علي القحطاني", wait: "١٠ دقائق متبقية" },
    { num: "٣", name: "منيرة عبدالرحمن الفهد", wait: "٢٠ دقيقة متبقية" },
    { num: "٤", name: "فراس بن تركي العتيبي", wait: "٣٥ دقيقة متبقية" },
    { num: "٥", name: "عبدالله بن فهد الدوسري", wait: "٥٠ دقيقة متبقية" }
  ];

  return (
    <div className="bg-[#1A6B5A] text-white min-h-screen p-8 flex flex-col justify-between overflow-hidden select-none font-heading relative">
      
      {/* Exit Button - hidden from final view if unnecessary, but essential for navigation (print hidden) */}
      {onExitTv && (
        <button 
          onClick={onExitTv}
          className="absolute top-4 left-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-tajawal cursor-pointer z-[999]"
        >
          <span>خروج من وضع التلفزيون (Exit TV)</span>
        </button>
      )}

      {/* TOP HEADER BLOCK */}
      <div className="flex justify-between items-center border-b-2 border-emerald-500/50 pb-6 shrink-0">
        
        {/* Date and dynamic ticking clock (Left segment) */}
        <div className="text-left space-y-2">
          <div className="text-3xl md:text-5xl font-mono font-bold text-[#2DBFA0] tracking-wider">
            {currentTime || "10:30:00 ص"}
          </div>
          <div className="text-xl text-emerald-100 font-tajawal font-bold mt-1">
            {currentDate}
          </div>
        </div>

        {/* Brand Clinic identity (Right segment) */}
        <div className="flex items-center gap-4 text-right">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-white">العيادة الطبية المتكاملة</h1>
            <p className="text-lg text-[#2DBFA0] font-body">شاشة غرفة الانتظار والمواعيد الحية</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-[#2DBFA0] text-gray-900 flex items-center justify-center shadow-lg">
            <Heart size={38} className="fill-current" />
          </div>
        </div>

      </div>

      {/* MAIN TWO-COLUMN TV REGION */}
      <div className="grid lg:grid-cols-10 gap-10 my-auto py-8">
        
        {/* LEFT COLUMN 35%: "يُكشف الآن" Box in accent bg (takes 3.5 columns on lg) */}
        <div className="lg:col-span-4 bg-[#2DBFA0] text-gray-900 p-8 rounded-2xl flex flex-col justify-between items-center text-center shadow-2xl relative border-4 border-white/20">
          
          <div className="space-y-4 w-full">
            <div className="w-20 h-20 rounded-full bg-white/20 text-[#1A6B5A] flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Stethoscope size={44} />
            </div>
            
            <span className="text-2xl font-bold font-heading text-[#1A6B5A] block tracking-wide uppercase shrink-0">
              ⚡ يُكشف عليه الآن
            </span>
            <span className="text-xs font-body text-emerald-950 block -mt-1 font-semibold">بالمستودع / غرفه د. يوسف ١</span>
          </div>

          {/* Huge active patient name text (64px+) */}
          <div className="my-8 w-full">
            <h2 className="text-4xl md:text-6xl font-bold font-heading text-[#1A6B5A] tracking-normal leading-normal select-none py-4 px-2 rounded-xl bg-white/40 border border-white/50 break-words">
              سلمان الشمري
            </h2>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#1A6B5A] font-bold font-tajawal mt-2">
            <Volume2 size={24} className="animate-pulse" />
            <span className="text-lg">يرجى من المريض الدخول فور إشارة الصوت</span>
          </div>

        </div>

        {/* RIGHT COLUMN 65%: Waiting list queue list (takes 6 columns on lg) */}
        <div className="lg:col-span-6 space-y-6 text-right">
          
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-3xl font-bold font-heading text-white">قائمة الانتظار والمراجعة التالية</h3>
            <span className="text-lg text-emerald-200 font-body">مسجل تلقائي</span>
          </div>

          {/* List of patients below */}
          <div className="space-y-4">
            {queueList.map((q, idx) => (
              <div 
                key={idx}
                className={`p-6 rounded-2xl flex justify-between items-center text-right border transition-all ${
                  idx === 0 
                    ? "bg-white/10 border-[#2DBFA0] scale-105 shadow-md" 
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center gap-6">
                  {/* Big rank cycle */}
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center font-heading text-xl font-bold shrink-0 ${
                    idx === 0 ? "bg-[#2DBFA0] text-[#1A6B5A]" : "bg-white/10 text-emerald-100"
                  }`}>
                    {q.num}
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-3xl font-bold font-heading text-white leading-none">
                      {q.name}
                    </h4>
                    <span className="text-sm text-emerald-200 font-body block mt-2">رقم الحجز: REG-0{idx + 3}</span>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className={`text-xl md:text-2xl font-tajawal font-bold px-4 py-1.5 rounded-xl ${
                    idx === 0 ? "bg-[#2DBFA0] text-gray-900" : "bg-white/10 text-emerald-200"
                  }`}>
                    ⏰ {q.wait}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* BOTTOM MARQUEE TICKER BANNER */}
      <div className="bg-gray-950/40 p-4 rounded-xl overflow-hidden shrink-0 border border-white/5">
        <div className="whitespace-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,_transparent_0,_#000_10px,_#000_100%_-_10px,_transparent_100%)]">
          <div className="inline-block animate-marquee font-body text-xl md:text-2xl text-emerald-100 font-semibold tracking-wide">
            🌱 العيادة الطبية المتكاملة ترحب بكم • نصيحة قلبية: يرجى شرب لتر ونصف ماء يومياً لحفظ صحة الشرايين وعمل الكلى بنشاط • الرجاء مراجعة موظف الاستقبال للإبلاغ عن أي تأخير أو طلب تسوية تأمين • العيادة مغلقة غداً الجمعة لأعمال الصيانة والراحة الأسبوعية لجميع الفرق.
          </div>
        </div>
      </div>

    </div>
  );
}
