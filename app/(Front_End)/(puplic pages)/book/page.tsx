"use client";
import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  Layers, 
  Activity, 
  HelpCircle,
  ToggleLeft,
  ToggleRight,
  ShieldCheck,
  CheckCircle,
  Stethoscope
} from "lucide-react";
import Image from "next/image";



export default function BookingPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // State for Booking Selections
  const [selectedService, setSelectedService] = useState<string>("استشارة باطنية وعلاج عام");
  const [selectedPrice, setSelectedPrice] = useState<string>("١٢٠ ر.س");
  const [selectedIcon, setSelectedIcon] = useState<string>("stethoscope");
  const [selectedDate, setSelectedDate] = useState<string>("٢٢ يونيو ٢٠٢٦");
  const [selectedTime, setSelectedTime] = useState<string>("١٠:٣٠ صباحاً");
  
  // State for Form Inputs
  const [patientName, setPatientName] = useState<string>("");
  const [patientPhone, setPatientPhone] = useState<string>("");
  const [patientEmail, setPatientEmail] = useState<string>("");
  const [patientNotes, setPatientNotes] = useState<string>("");
  const [isReturning, setIsReturning] = useState<boolean>(false);

  const [bookingFinished, setBookingFinished] = useState<boolean>(false);

  // Available interactive services
  const [servicesList , setServicesList] = useState([
    { id: "1", name: "استشارة طبية قلبية متخصصة", price: "١٥٠ ر.س", icon: "heart", text: "تشخيص ورسم تخطيطي لسلامة الشرايين وعضلة القلب" },
    { id: "2", name: "استشارة باطنية وعلاج عام", price: "١٢٠ ر.س", icon: "stethoscope", text: "الفحص السريري العام والمتابعات المستعجلة والغدد" },
    { id: "3", name: "فحص السكري والتراكمي الفوري", price: "١٩٠ ر.س", icon: "activity", text: "تنظيم الجرعات وقياس المؤشر التراكمي وتغذية الأوعية" },
    { id: "4", name: "جلسة تخطيط القلب مع مجهود كامل", price: "٢٥٠ ر.س", icon: "layers", text: "مراقبة دقات القلب على المشاية الطبية تحت إشراف مباشر" }
  ]);

  // Calendar dates mock (June 2026)
  // Available weekdays are green (e.g. June 18, 19, 21, 22, 23, 24, 25, 28, 29, 30)
  // Weekends/Full days are gray (June 20, 26, 27)
  const calendarDays = [
    { day: "١٧", name: "الاربعاء", status: "past" },
    { day: "١٨", name: "الخميس", status: "available" },
    { day: "١٩", name: "الجمعة", status: "off" },
    { day: "٢٠", name: "السبت", status: "off" },
    { day: "٢١", name: "الأحد", status: "available" },
    { day: "٢٢", name: "الاثنين", status: "available" },
    { day: "٢٣", name: "الثلاثاء", status: "available" },
    { day: "٢٤", name: "الأربعاء", status: "available" },
    { day: "٢٥", name: "الخميس", status: "available" },
    { day: "٢٦", name: "الجمعة", status: "off" },
    { day: "٢٧", name: "السبت", status: "off" },
    { day: "٢٨", name: "الأحد", status: "available" },
    { day: "٢٩", name: "الاثنين", status: "available" },
    { day: "٣٠", name: "الثلاثاء", status: "available" }
  ];

  const timeSlots = [
    "٩:٠٠ صباحاً",
    "١٠:٣٠ صباحاً",
    "١١:١٥ صباحاً",
    "١:٠٠ ظهراً",
    "٤:٣٠ مساءً",
    "٥:١٥ مساءً",
    "٦:٠0 مساءً",
    "٧:٣٠ مساءً"
  ];

  const handleServiceSelect = (name: string, price: string, icon: string) => {
    setSelectedService(name);
    setSelectedPrice(price);
    setSelectedIcon(icon);
  };

  const submitBooking = () => {
    if (!patientName || !patientPhone) {
      alert("الرجاء ملء حقل الاسم الجغرافي ورقم الهاتف أولاً لإتمام الحجز بنجاح.");
      return;
    }
    setBookingFinished(true);
  };

  const renderServiceIcon = (icon: string, size = 18) => {
    switch (icon) {
      case "heart":
        return <Heart size={size} />;
      case "activity":
        return <Activity size={size} />;
      case "layers":
        return <Layers size={size} />;
      default:
        return <Stethoscope size={size} />;
    }
  };

  return (
    <div className="animate-fade-in text-[#1C1C1E] bg-[#F9FAFB] min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Step Indicator Header bar */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm text-right">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl md:text-2xl font-bold text-[#1A6B5A] font-heading mb-4 text-center">
              حجز موعد طبي إلكتروني مباشر
            </h1>
            
            {/* 4 Steps Indicator Progress Bar */}
            <div className="flex justify-between items-center relative mt-6">
              <div className="absolute left-0 right-0 h-1 bg-gray-100 top-1/2 -translate-y-1/2 z-0" />
              <div 
                className="absolute right-0 h-1 bg-[#1A6B5A] top-1/2 -translate-y-1/2 z-0 transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />
              
              {[
                { stepNum: 1, label: "اختر الخدمة" },
                { stepNum: 2, label: "اختر الموعد" },
                { stepNum: 3, label: "بياناتك" },
                { stepNum: 4, label: "التأكيد" }
              ].map((s) => (
                <div key={s.stepNum} className="relative z-10 flex flex-col items-center">
                  <div 
                    onClick={() => {
                      if (!bookingFinished && s.stepNum < currentStep) {
                        setCurrentStep(s.stepNum);
                      }
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-heading text-xs font-bold transition-all cursor-pointer ${
                      bookingFinished 
                        ? "bg-emerald-100 text-[#1A6B5A]"
                        : currentStep === s.stepNum
                        ? "bg-[#1A6B5A] text-white shadow-md scale-110"
                        : currentStep > s.stepNum
                        ? "bg-[#2DBFA0] text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {currentStep > s.stepNum || bookingFinished ? (
                      <Check size={16} />
                    ) : (
                      s.stepNum
                    )}
                  </div>
                  <span className={`text-[10px] md:text-xs font-tajawal mt-2 font-bold ${
                    currentStep === s.stepNum ? "text-[#1A6B5A]" : "text-gray-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Finished Success Banner */}
        {bookingFinished ? (
          <div className="bg-white max-w-2xl mx-auto p-8 rounded-xl border border-emerald-100 shadow-md text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
              <CheckCircle size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl md:text-2xl font-bold font-heading text-[#1A6B5A]">تم تأكيد موعدك بنجاح!</h2>
              <span className="text-xs bg-emerald-100 text-[#1A6B5A] px-3 py-1 rounded-full font-bold font-tajawal">رقم الطلب الإلكتروني: EXP-2026-098</span>
              <p className="text-xs text-gray-500 font-body py-2 max-w-md mx-auto">
                عزيزي {patientName}، تم توثيق وحجز موعدكم بنجاح ومزامنته بملف د. يوسف عبدالرحمن. تم إرسال رسالة نصية قصيرة وخطوط التوجيه مع رابط المتابعة المباشرة لهاتفك المحمول.
              </p>
            </div>

            {/* Quick Summary details in box */}
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 text-right grid grid-cols-2 gap-4 text-xs font-body">
              <div>
                <span className="text-gray-400 block mb-1">الخدمة المطلوبة</span>
                <span className="font-bold text-[#1A6B5A] font-heading">{selectedService}</span>
              </div>
              <div className="text-left">
                <span className="text-gray-400 block mb-1">التكلفة الإجمالية</span>
                <span className="font-bold text-[#1A6B5A] font-tajawal text-sm">{selectedPrice}</span>
              </div>
              <div className="border-t border-emerald-100/60 pt-2 font-body">
                <span className="text-gray-400 block mb-1">اليوم والتاريخ</span>
                <span className="font-bold text-gray-800">{selectedDate}</span>
              </div>
              <div className="border-t border-emerald-100/60 pt-2 text-left">
                <span className="text-gray-400 block mb-1">الساعة والوقت</span>
                <span className="font-bold text-gray-800">{selectedTime}</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                id="booking-print-btn"
                className="flex-1 py-2 rounded-xl bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal cursor-pointer"
                onClick={() => window.print()}
              >
                طباعة بطاقة الحجز الفوري
              </button>
              <button 
                id="booking-restart-btn"
                onClick={() => {
                  setCurrentStep(1);
                  setBookingFinished(false);
                  setPatientName("");
                  setPatientPhone("");
                  setPatientEmail("");
                  setPatientNotes("");
                }}
                className="flex-1 py-2 rounded-xl border border-[#1A6B5A] text-[#1A6B5A] hover:bg-emerald-50 text-xs font-bold font-tajawal cursor-pointer"
              >
                حجز موعد جديد
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-10 gap-8 items-start">
            
            {/* Left 60%: multi-step form (takes 6 columns on md) */}
            <div className="md:col-span-6 bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-right space-y-6">
              
              {/* STEP 1: SERVICE SELECTION */}
              {currentStep === 1 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-heading text-[#1A6B5A]">الخطوة الأولى: حدد نوع الخدمة الطبية المطلوبة</h3>
                    <p className="text-xs text-gray-400 font-body">الرجاء اختيار العيادة أو الفحص التخصصي لبناء تكلفة الحجز وجدول الساعات المناسب لك</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {servicesList.map((svc) => (
                      <div 
                        key={svc.id}
                        id={`svc-card-${svc.id}`}
                        onClick={() => handleServiceSelect(svc.name, svc.price, svc.icon)}
                        className={`p-4 rounded-xl border text-right cursor-pointer transition-all space-y-3 relative overflow-hidden ${
                          selectedService === svc.name 
                            ? "border-[#1A6B5A] bg-emerald-50/40 ring-1 ring-[#1A6B5A]" 
                            : "border-gray-100 hover:border-gray-200"
                        }`}
                      >
                        {selectedService === svc.name && (
                          <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#1A6B5A] text-white flex items-center justify-center text-[10px]">
                            <Check size={10} />
                          </div>
                        )}
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          selectedService === svc.name ? "bg-[#1A6B5A] text-white" : "bg-emerald-50 text-[#1A6B5A]"
                        }`}>
                          {renderServiceIcon(svc.icon, 18)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold font-heading text-gray-800 leading-normal">{svc.name}</h4>
                          <p className="text-[10px] text-gray-400 mt-1 font-body">{svc.text}</p>
                        </div>
                        <div className="text-left font-bold text-xs text-[#1A6B5A] font-tajawal">
                          {svc.price}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <button 
                      id="step1-next-btn"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <span>الخطوة التالية: الموعد</span>
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: DATE & TIME SLOT SELECT */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-heading text-[#1A6B5A]">الخطوة الثانية: حدد تاريخ الزيارة والوقت المناسب</h3>
                    <p className="text-xs text-gray-400 font-body">يمكنك اختيار يوم عمل أخضر من التقويم التفاعلي أدناه ثم تحديد ساعة الكشف المناسبة لجدولك.</p>
                  </div>

                  {/* Month header */}
                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between text-xs font-bold text-gray-600">
                    <span>يونيو ٢٠٢٦ (ذو الحجة ١٤٤٧ هـ)</span>
                    <span className="text-[10px] py-0.5 px-2 bg-[#1A6B5A]/10 text-[#1A6B5A] rounded font-tajawal">الأيام المتاحة (باللون الأخضر)</span>
                  </div>

                  {/* Horizontal Scrollable Calendar simulation */}
                  <div className="flex gap-2 overflow-x-auto pb-3 pt-1">
                    {calendarDays.map((cal, idx) => (
                      <button 
                        key={idx}
                        id={`cal-day-btn-${cal.day}`}
                        disabled={cal.status === "off" || cal.status === "past"}
                        onClick={() => setSelectedDate(`${cal.day} يونيو ٢٠٢٦`)}
                        className={`min-w-[68px] p-3 rounded-xl border flex flex-col items-center justify-center shrink-0 transition-all font-body ${
                          cal.status === "past"
                            ? "bg-gray-50/50 border-gray-50 text-gray-300 cursor-not-allowed"
                            : cal.status === "off"
                            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed"
                            : selectedDate.startsWith(cal.day)
                            ? "border-[#1A6B5A] bg-[#1A6B5A] text-white shadow-sm ring-1 ring-[#1A6B5A]"
                            : "border-emerald-100 hover:border-emerald-200 bg-emerald-50/20 text-[#1A6B5A]"
                        }`}
                      >
                        <span className="text-[10px] text-gray-400 block mb-1 font-tajawal">{cal.name}</span>
                        <span className="text-base font-bold font-heading">{cal.day}</span>
                      </button>
                    ))}
                  </div>

                  {/* Time slots pills */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold font-heading text-gray-700 flex items-center gap-1.5">
                      <Clock size={14} className="text-[#1A6B5A]" />
                      <span>الأوقات وساعات الحضور المباشر ليوم ({selectedDate}):</span>
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {timeSlots.map((time, idx) => (
                        <button 
                          key={idx}
                          id={`time-pills-${idx}`}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-xl border text-xs font-tajawal font-medium transition-all cursor-pointer ${
                            selectedTime === time
                              ? "border-[#1A6B5A] bg-[#1A6B5A] text-white font-bold"
                              : "border-gray-200 hover:border-[#1A6B5A] text-gray-600 bg-white"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Buttons for step 2 */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <button 
                      id="step2-back-btn"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                      <span>الخطوة السابقة</span>
                    </button>
                    
                    <button 
                      id="step2-next-btn"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <span>الخطوة التالية: بياناتك</span>
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: PERSONAL DETAILS FORM */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-heading text-[#1A6B5A]">الخطوة الثالثة: أدخل معلومات وعلامات المريض الشخصية</h3>
                    <p className="text-xs text-gray-400 font-body">سيتم حجز هذا الموعد وإدراجه تلقائياً باسم المريض الموضح في الحقول أدناه</p>
                  </div>

                  <div className="space-y-4">
                    {/* Switch: returning patient */}
                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                      <div className="text-right">
                        <span className="font-bold text-[#1A6B5A] font-heading block">هل أنت مريض مسجل مسبقاً بالعيادة؟</span>
                        <span className="text-[10px] text-gray-500"> تفعيل السويتش يتيح للاستقبال مزامنة الملف فورياً برقم الهوية الوطنية أو الملف الرقمي للسرعة</span>
                      </div>
                      <button 
                        id="returning-toggle-btn"
                        type="button"
                        onClick={() => setIsReturning(!isReturning)}
                        className="text-[#1A6B5A] focus:outline-none cursor-pointer"
                      >
                        {isReturning ? <ToggleRight size={38} className="text-[#1A6B5A]" /> : <ToggleLeft size={38} className="text-gray-300" />}
                      </button>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 font-heading mb-1.5">الاسم ثلاثي أو رباعي للمريض *</label>
                        <div className="relative">
                          <User size={14} className="absolute right-3 top-3.5 text-gray-400" />
                          <input 
                            type="text"
                            required
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder="أحمد بن فيصل الماجد"
                            className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 font-heading mb-1.5">رقم رخصة الجوال والاتصال الفوري *</label>
                        <div className="relative">
                          <Phone size={14} className="absolute right-3 top-3.5 text-gray-400" />
                          <input 
                            type="tel"
                            required
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            placeholder="05XXXXXXXX"
                            className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A] text-right"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 font-heading mb-1.5">البريد الإلكتروني (اختياري)</label>
                        <div className="relative">
                          <Mail size={14} className="absolute right-3 top-3.5 text-gray-400" />
                          <input 
                            type="email"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            placeholder="patient@email.com"
                            className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                          />
                        </div>
                      </div>

                      {isReturning && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 font-heading mb-1.5">رقم الهوية الوطنية أو الملف الطبي سابقاً *</label>
                          <div className="relative">
                            <ShieldCheck size={14} className="absolute right-3 top-3.5 text-gray-400" />
                            <input 
                              type="text"
                              required
                              placeholder="10XXXXXXXX"
                              className="w-full px-3 py-2.5 pr-9 border border-yellow-200 bg-yellow-50/10 rounded-xl text-xs font-body focus:outline-none focus:border-[#196d5b]"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 font-heading mb-1.5">أعراض صحية أو ملاحظات تود كتابتها للطبيب (اختياري)</label>
                      <div className="relative">
                        <FileText size={14} className="absolute right-3 top-3 text-gray-400" />
                        <textarea 
                          rows={3}
                          value={patientNotes}
                          onChange={(e) => setPatientNotes(e.target.value)}
                          placeholder="مثلاً: أعاني من خفقان في الصدر من يومين، أو رغبة في مراجعة كشوفات السكري."
                          className="w-full px-3 py-2.5 pr-9 border border-gray-200 rounded-xl text-xs font-body focus:outline-none focus:border-[#1A6B5A]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons for step 3 */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <button 
                      id="step3-back-btn"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                      <span>الخطوة السابقة</span>
                    </button>
                    
                    <button 
                      id="step3-next-btn"
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-2 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                    >
                      <span>الخطوة التالية والأخيرة</span>
                      <ArrowLeft size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & CONFIRM */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-heading text-[#1A6B5A]">الخطوة الرابعة: مراجعة خطة حجز الموعد وتأكيد الحضور</h3>
                    <p className="text-xs text-gray-400 font-body">الرجاء الاطلاع الدقيق على البيانات لتأكيد حجز مقعدك بالعيادة الطبية:</p>
                  </div>

                  {/* Detailed layout in summary format */}
                  <div className="border border-emerald-100 rounded-xl p-5 bg-emerald-50/20 divide-y divide-emerald-100 space-y-4">
                    <div className="pb-3 text-sm flex justify-between items-center">
                      <span className="font-bold text-[#1A6B5A] font-heading font-semibold">باقة الاستشارة والخدمة</span>
                      <div className="flex items-center gap-2">
                        {renderServiceIcon(selectedIcon, 16)}
                        <span className="font-body text-gray-800 text-xs">{selectedService}</span>
                      </div>
                    </div>

                    <div className="py-3 text-xs flex justify-between items-center">
                      <span className="font-bold text-[#1A6B5A] font-heading font-semibold">تاريخ الدكتور والوقت</span>
                      <div className="font-body text-gray-700 font-medium">
                        🗓️ {selectedDate} | ⏰ {selectedTime}
                      </div>
                    </div>

                    <div className="py-3 text-xs flex justify-between items-center">
                      <span className="font-bold text-[#1A6B5A] font-heading font-semibold">بيانات المريض الأساسية</span>
                      <div className="font-body text-gray-700 text-left">
                        <p className="font-bold">{patientName || "(لا يوجد اسم)"}</p>
                        <p>{patientPhone || "(لا يوجد هاتف)"}</p>
                        {patientEmail && <p className="text-[10px] text-gray-400">{patientEmail}</p>}
                      </div>
                    </div>

                    <div className="pt-3 text-xs flex justify-between items-center">
                      <span className="font-bold text-[#1A6B5A] font-heading font-semibold">التكلفة والرسوم الطبية المقدرة</span>
                      <span className="font-bold font-tajawal text-sm text-[#1A6B5A]">{selectedPrice}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-yellow-50 text-yellow-800 text-[10px] rounded-xl border border-yellow-200 font-body leading-normal">
                    ⚠️ تماشيًا مع لوائح المواعيد الطبية المعتمدة، نعتذر عن حجز أكثر من موعد واحد بنفس رقم الهاتف في نفس اليوم لمنع الزحام. يمكنك دائماً التعديل بشكل مجاني.
                  </div>

                  {/* Navigation Buttons for step 4 */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                    <button 
                      id="step4-back-btn"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-bold font-tajawal rounded-xl flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight size={14} />
                      <span>تعديل البيانات</span>
                    </button>
                    
                    <button 
                      id="step4-confirm-btn"
                      onClick={submitBooking}
                      className="px-8 py-3 bg-[#1A6B5A] text-white hover:bg-[#155447] text-xs font-bold font-tajawal rounded-xl shadow-md cursor-pointer transition-all"
                    >
                      تأكيد وحفظ موعد الحجز الفوري
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right 40%: sticky sidebar with doctor photo + booking summary (takes 4 columns on md) */}
            <div className="md:col-span-4 lg:sticky lg:top-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden text-right">
              
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
                <Image 
                  src="/doctor.png"
                  alt="الطبيب المعالج"
                  className="w-10 h-10 rounded-full object-cover border border-emerald-50 shrink-0"
                  width={40}
                  height={40}
                  
                />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 font-heading">د. يوسف عبدالرحمن</h4>
                  <p className="text-[10px] text-gray-400 font-body">استشاري الأمراض الباطنية المعتمد</p>
                </div>
              </div>

              {/* Dynamic live summary widgets */}
              <div className="p-5 space-y-4">
                <h5 className="font-heading font-bold text-xs text-[#1A6B5A] border-b border-gray-100 pb-2">ملخص حجزك المباشر</h5>
                
                <div className="space-y-3 pb-3 border-b border-gray-100/60 font-body text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">الخدمة:</span>
                    <span className="font-bold text-gray-800 text-xs shrink font-heading max-w-[180px] truncate block text-left" title={selectedService}>
                      {selectedService}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">التاريخ المختار:</span>
                    <span className="font-bold font-tajawal text-gray-800">{selectedDate}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400">ساعة الحضور:</span>
                    <span className="font-bold font-tajawal text-gray-800">{selectedTime}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-400 font-bold text-[#1A6B5A]">صفة المريض:</span>
                    <span className="font-bold text-emerald-600 font-heading text-[10px]">
                      {isReturning ? "مريض عيادة مسجل" : "مريض جديد بالمنظومة"}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="font-heading font-bold text-xs text-gray-800">إجمالي المطلوب سداده:</span>
                  <span className="font-bold font-tajawal text-[#1A6B5A] text-lg">{selectedPrice}</span>
                </div>

                {/* Patient safety check bullet */}
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 flex items-start gap-2 text-[10px] text-gray-600 leading-normal font-body">
                  <ShieldCheck size={14} className="text-[#1A6B5A] shrink-0 mt-0.5" />
                  <p>تأمين صحي مباشر وربط فوري للتسهيل التلقائي لرسائل الضمان والتسجيل الإحصائي الموحد.</p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
