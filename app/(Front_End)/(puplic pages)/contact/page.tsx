"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

gsap.registerPlugin(ScrollTrigger);

// ── info cards data ───────────────────────────────────────────────────────────
const infoCards = [
  {
    icon: <MapPin size={20} />,
    bg: "bg-emerald-50",
    title: "عنوان العيادة الرئيسي",
    lines: [
      "طريق الملك عبدالعزيز، حي الياسمين، الرياض، المملكة العربية السعودية",
    ],
  },
  {
    icon: <Phone size={20} />,
    bg: "bg-teal-50",
    title: "هاتف الدعم والاستقبال",
    lines: ["920004944", "جوال / واتساب: 0540004944"],
    accentLine: 1,
  },
  {
    icon: <Mail size={20} />,
    bg: "bg-emerald-50",
    title: "البريد الإلكتروني للعيادة",
    lines: ["info@integratedclinic.sa", "للاستفسارات الرسمية والتقارير"],
  },
  {
    icon: <Clock size={20} />,
    bg: "bg-[#2DBFA0]/15",
    title: "ساعات العمل الرسمية",
    lines: ["السبت - الخميس: ٩:٠٠ ص - ٩:٠٠ م"],
    redLine: "الجمعة مغلق للراحة الأسبوعية",
  },
];

// ── component ─────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const infoColRef = useRef<HTMLDivElement>(null);
  const formColRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: "power3.out",
      });

      // Info cards stagger from right (RTL)
      gsap.from(".info-card", {
        scrollTrigger: {
          trigger: infoColRef.current,
          start: "top 80%",
        },
        opacity: 0,
        x: 40,
        stagger: 0.12,
        duration: 0.6,
        ease: "power2.out",
      });

      // Form column slides from left
      gsap.from(formColRef.current, {
        scrollTrigger: {
          trigger: formColRef.current,
          start: "top 80%",
        },
        opacity: 0,
        x: -40,
        duration: 0.7,
        ease: "power2.out",
      });

      // Map section
      gsap.from(mapRef.current, {
        scrollTrigger: {
          trigger: mapRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="text-[#1C1C1E] bg-[#F9FAFB] min-h-screen" dir="rtl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <section
        className="bg-emerald-50/50 py-12 px-4 text-center border-b border-emerald-100"
        ref={headerRef}
      >
        <h1 className="text-2xl md:text-4xl font-bold text-[#1A6B5A] font-heading">
          تواصل معنا الآن
        </h1>
        <p className="text-gray-500 font-body text-xs mt-2 max-w-xl mx-auto">
          يسعدنا الرد على جميع استفساراتكم وحجز مواعيدكم الطبية الطارئة على مدار
          الساعة من الإداريين المعتمدين والممرضين.
        </p>
      </section>

      {/* ── Two Columns ───────────────────────────────────────────────────── */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto grid md:grid-cols-2 gap-8">

        {/* Info column */}
        <div className="space-y-6" ref={infoColRef}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoCards.map((card, i) => (
              <Card key={i} className="info-card border-gray-100 shadow-sm">
                <CardContent className="p-5 flex items-start gap-4 text-right">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.bg} text-[#1A6B5A] flex items-center justify-center shrink-0`}
                  >
                    {card.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-gray-800 font-heading">
                      {card.title}
                    </h4>
                    {card.lines.map((line, li) => (
                      <p
                        key={li}
                        className={`text-[11px] font-body leading-relaxed ${
                          card.accentLine === li
                            ? "text-emerald-600 font-bold font-tajawal"
                            : "text-gray-500"
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                    {card.redLine && (
                      <p className="text-[10px] text-red-500">{card.redLine}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Notes card */}
          <Card className="bg-emerald-50/30 border-emerald-100 shadow-none">
            <CardContent className="p-5 text-right space-y-2">
              <h4 className="text-xs font-bold font-heading text-[#1A6B5A]">
                ملاحظات هامة للزيارات والمراجعات
              </h4>
              <p className="text-[11px] text-gray-600 font-body leading-relaxed">
                يرجى التكرم بالحضور قبل الموعد بقرابة ١٥ دقيقة لإنهاء تسجيل
                علاماتك الحيوية ومراجعة الاستقبال وتجهيز ملفك الطبي الإلكتروني
                لضمان سلاسة الخدمة وعدم تضارب المواعيد مع المرضى الآخرين.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Form column */}
        <div ref={formColRef}>
          <Card className="border-gray-100 shadow-sm">
            <CardContent className="p-6 text-right space-y-4">
              <h3 className="text-base font-bold font-heading text-[#1A6B5A]">
                أرسل لنا استفسارك أو تعليقك مباشرة
              </h3>

              {formSubmitted ? (
                // ── Success state ──────────────────────────────────────────
                <div className="p-6 bg-emerald-50 text-[#1A6B5A] border border-emerald-100 rounded-xl text-center space-y-3">
                  <CheckCircle2 size={36} className="mx-auto text-[#2DBFA0]" />
                  <h4 className="font-heading font-bold text-sm">
                    تم إرسال رسالتك بنجاح!
                  </h4>
                  <p className="text-xs font-body text-gray-600">
                    نشكرك على تواصلك، سيقوم موظف الاستقبال والتنسيق بالرد عليك
                    واتساب أو اتصال خلال ساعة عمل واحدة.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormSubmitted(false)}
                    className="text-xs font-bold font-tajawal text-[#1A6B5A] h-auto p-0 hover:underline hover:bg-transparent"
                  >
                    أرسل رسالة أخرى مخصصة
                  </Button>
                </div>
              ) : (
                // ── Form ──────────────────────────────────────────────────
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setFormSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  {/* Name */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700 font-heading">
                      الاسم ثلاثي أو رباعي *
                    </Label>
                    <Input
                      type="text"
                      required
                      placeholder="محمد بن خالد القحطاني"
                      className="text-xs font-body focus-visible:ring-[#1A6B5A] rounded-xl border-gray-200"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700 font-heading">
                      رقم رخصة الجوال والاتصال *
                    </Label>
                    <p className="text-[10px] text-gray-400 font-body">
                      يرجى كتابة الرقم بالصيغة الدولية (+966...)
                    </p>
                    <Input
                      type="tel"
                      required
                      placeholder="054XXXXXXX"
                      className="text-xs font-body focus-visible:ring-[#1A6B5A] rounded-xl border-gray-200"
                    />
                  </div>

                  {/* Select — shadcn replaces native <select> */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700 font-heading">
                      نوع الاستفسار أو الملاحظة
                    </Label>
                    <Select defaultValue="appointment">
                      <SelectTrigger className="text-xs font-body rounded-xl border-gray-200 focus:ring-[#1A6B5A]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="appointment" className="text-xs font-body">
                          استفسار عن موعد طبي أو كشف
                        </SelectItem>
                        <SelectItem value="pricing" className="text-xs font-body">
                          طلب تسعيرة لعملية أو تحليل شامل
                        </SelectItem>
                        <SelectItem value="feedback" className="text-xs font-body">
                          ملاحظة جودة الخدمة والمشرفين
                        </SelectItem>
                        <SelectItem value="other" className="text-xs font-body">
                          أخرى
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700 font-heading">
                      تفاصيل الاستفسار أو رسالتك الخاصة *
                    </Label>
                    <Textarea
                      rows={4}
                      required
                      placeholder="فضلاً اكتب تفاصيل استفسارك أو مشكلتك هنا بوضوح لتزويدك بالجواب الشامل..."
                      className="text-xs font-body focus-visible:ring-[#1A6B5A] rounded-xl border-gray-200 resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full py-2.5 bg-[#1A6B5A] text-white hover:bg-[#155447] font-tajawal font-bold rounded-xl shadow-md transition-all text-xs h-auto"
                  >
                    إرسال الاستفسار الآن للتنسيقية
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ── Map Placeholder ───────────────────────────────────────────────── */}
      <section
        className="px-4 md:px-8 max-w-7xl mx-auto pb-12"
        ref={mapRef}
      >
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-right">
            <h4 className="font-heading font-bold text-xs text-gray-800">
              موقع العيادة على الخريطة الجغرافية
            </h4>
            <span className="text-[10px] text-gray-400 font-body">
              شارع الملك عبدالعزيز، حي الياسمين
            </span>
          </div>

          {/* Visual map simulation */}
          <div className="bg-emerald-50/40 h-64 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(#2dbfa030_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />
            <div className="absolute top-[40%] left-0 right-0 h-4 bg-emerald-100/50" />
            <div className="absolute left-[30%] top-0 bottom-0 w-4 bg-emerald-100/50" />
            <div className="absolute left-[65%] top-0 bottom-0 w-4 bg-emerald-100/50" />

            <div className="relative bg-white p-4 rounded-xl shadow-lg border border-emerald-100 max-w-xs text-center z-10 space-y-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto animate-bounce">
                <MapPin size={24} fill="currentColor" />
              </div>
              <h5 className="font-heading font-bold text-xs text-[#1A6B5A]">
                مركز العيادة الطبية المتكامل
              </h5>
              <p className="text-[9px] text-gray-500 font-body leading-normal">
                تتوفر مواقف مجانية سيارات تحت الأرض وتسهيلات كراسي حركة
              </p>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="inline-block text-[10px] text-emerald-600 font-bold font-tajawal underline"
              >
                افتح في خرائط جوجل للتوجيه المباشر
              </a>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}