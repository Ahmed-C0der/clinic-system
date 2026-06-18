"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import Image from "next/image";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

gsap.registerPlugin(ScrollTrigger);

// ── constants ────────────────────────────────────────────────────────────────
const specialties = [
  "استشاري أمراض الباطنة العامة",
  "استشاري أمراض الأطفال",
  "استشاري أمراض الحميات",
  "علاج أمراض الجهاز الهضمي والكبد",
  "علاج أمراض الكلى والمسالك البولية",
  "متابعة الفحص الطبي السنوي والبرامج الصحية للوقاية والنمو",
];

const certifications = [
  {
    title: "عضوية الهيئة السعودية للتخصصات الصحية",
    desc: "مهني مسجل برتبة استشاري طب قلب باطني",
    id: "SCHS",
  },
  {
    title: "الزمالة الكندية لأمراض القلب من الكلية الملكية للأطباء والجراحين",
    desc: "تخصص دقيق وعلاجات تداخلية معقدة بكندا",
    id: "FRCPC",
  },
  {
    title: "شهادة البورد الأمريكي في طب ومجهر القلب الداخلي",
    desc: "أكاديمية تخطيط الشرايين ومؤشرات الجهد الأمريكية",
    id: "ABIM",
  },
  {
    title: "ترخيص الهيئة العامة للغذاء والدواء بالاستشارات العلاجية",
    desc: "شهادة معتمدة للصيدلة الإكلينيكية والطب السلوكي",
    id: "SFDA",
  },
];

const timeline = [
  {
    year: "٢٠١٦ م - الآن",
    role: "المدير الطبي واستشاري أول القلب والأوعية الدموية",
    place: "مستشفى الملك فيصل بجدة - العيادات التخصصية ومركز الاستشارات",
    color: "bg-[#1A6B5A]",
    textColor: "text-[#1A6B5A]",
    badgeBg: "bg-emerald-50",
  },
  {
    year: "٢٠١٠ م - ٢٠١٦ م",
    role: "أخصائي وباحث أمراض القلب والباطنة الجراحية",
    place: "مستشفيات القوات المسلحة بالمنطقة الوسطى (الرياض)",
    color: "bg-[#2DBFA0]",
    textColor: "text-[#2DBFA0]",
    badgeBg: "bg-[#2DBFA0]/10",
  },
  {
    year: "٢٠٠٧ م",
    role: "البورد الكندي والزمالة الملكية في أمراض القلب",
    place: "جامعة ماكجيل - مونتريال - كندا مع مرتبة الشرف الأولى",
    color: "bg-emerald-700",
    textColor: "text-emerald-800",
    badgeBg: "bg-emerald-50",
  },
];

// ── component ─────────────────────────────────────────────────────────────────
export default function AboutPage() {
  // refs for GSAP targets
  const heroRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const specialtiesRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const certsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    // ── Hero: text slides in from right (RTL), photo from left
    gsap.from(heroRef.current, {
      opacity: 0,
      y: 40,
      duration: 0.9,
      ease: "power3.out",
    });

    gsap.from(photoRef.current, {
      opacity: 0,
      x: -60,
      duration: 1,
      delay: 0.2,
      ease: "power3.out",
    });

    // ── Stats counter animation
    gsap.from(statsRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      delay: 0.5,
      ease: "power2.out",
    });

    // ── Specialties: stagger cards on scroll
    gsap.from(".specialty-card", {
      scrollTrigger: {
        trigger: specialtiesRef.current,
        start: "top 80%",
      },
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.6,
      ease: "power2.out",
    });

    // ── Timeline: each item reveals on scroll
    gsap.from(".timeline-item", {
      scrollTrigger: {
        trigger: timelineRef.current,
        start: "top 80%",
      },
      opacity: 0,
      x: 40,
      stagger: 0.18,
      duration: 0.7,
      ease: "power3.out",
    });

    // ── Cert cards horizontal entrance
    gsap.from(".cert-card", {
      scrollTrigger: {
        trigger: certsRef.current,
        start: "top 85%",
      },
      opacity: 0,
      y: 24,
      stagger: 0.12,
      duration: 0.6,
      ease: "power2.out",
    });

    // ── CTA fade-in
    gsap.from(ctaRef.current, {
      scrollTrigger: {
        trigger: ctaRef.current,
        start: "top 85%",
      },
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: "power2.out",
    });
  }, []);


  return (
    <div className="text-[#1C1C1E] bg-[#F9FAFB] min-h-screen" dir="rtl">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Doctor photo */}
          <div className="flex justify-center order-2 md:order-1" ref={photoRef}>
            <div className="relative">
              <div className="absolute inset-0 bg-[#1A6B5A]/15 rounded-3xl rotate-3 -z-10" />
              <Image
                src={"/doctor.png"}
                alt="د.ايهاب محمد احمد"
                referrerPolicy="no-referrer"
                className="rounded-3xl w-80 h-[420px] object-cover shadow-xl border border-white"
                width={320}
                height={420}
              />
            </div>
          </div>

          {/* Text content */}
          <div className="space-y-6 text-right order-1 md:order-2" ref={heroRef}>
            <Badge
              variant="secondary"
              className="bg-emerald-100 text-[#1A6B5A] hover:bg-emerald-100 font-tajawal text-xs"
            >
              👨‍⚕️ الطبيب المعالج والمدير الطبي للعيادة
            </Badge>

            <h1 className="text-3xl md:text-4xl font-bold text-[#1A6B5A] font-heading leading-tight">
              الدكتور ايهاب محمد احمد
            </h1>

            <p className="text-emerald-600 font-semibold font-tajawal text-sm">
              استشاري أمراض الاطفال و باطني و حميات
            </p>

            <p className="text-gray-600 leading-relaxed font-body text-sm">
              أهلاً بكم في عيادتنا. أعمل كأخصائي واستشاري للطب الباطني والقلب منذ ما يقرب من
              ١٨ عاماً في مستشفيات القوات المسلحة ومختلف المراكز الطبية المتخصصة بالمملكة.
              نلتزم دائماً بالحفاظ على مريضنا كعائلة وتقديم أفضل البروتوكولات الطبية
              لمساعدتهم على بلوغ جودة الحياة المطلوبة.
            </p>

            {/* Stats */}
            <Card className="border-gray-100 shadow-sm" ref={statsRef}>
              <CardContent className="p-4">
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-x-reverse divide-gray-100">
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-[#1A6B5A] font-heading">+١٨</div>
                    <div className="text-[10px] text-gray-500 font-body">سنة خبرة مهنية</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-[#1A6B5A] font-heading">+٤٥</div>
                    <div className="text-[10px] text-gray-500 font-body">بحث طبي منشور</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-[#1A6B5A] font-heading">+١٥ ألف</div>
                    <div className="text-[10px] text-gray-500 font-body">مريض ومريضة</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Specialties ───────────────────────────────────────────────────── */}
      <section className="bg-emerald-50/30 py-12 px-4 md:px-8" ref={specialtiesRef}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold font-heading text-[#1A6B5A]">
              تخصصات طبية دقيقة نركز عليها
            </h2>
            <Separator className="w-16 h-1 bg-[#2DBFA0] mx-auto mt-3 rounded" />
          </div>

          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {specialties.map((item, idx) => (
              <Card
                key={idx}
                className="specialty-card border-gray-100 shadow-none"
              >
                <CardContent className="p-4 flex items-start gap-3 text-right">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#1A6B5A] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <p className="text-xs font-body text-gray-700 leading-relaxed">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────────────────────── */}
      <section className="py-12 px-4 md:px-8 max-w-3xl mx-auto" ref={timelineRef}>
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold font-heading text-[#1A6B5A]">
            الخبرات الأكاديمية والمهنية
          </h2>
          <p className="text-gray-400 text-xs font-body mt-1">
            مشوار من العلم والعطاء الطبي المستمر
          </p>
        </div>

        <div className="relative border-r-2 border-emerald-100 mr-4 pl-4 space-y-8 text-right">
          {timeline.map((t, i) => (
            <div key={i} className="timeline-item relative">
              <div
                className={`absolute top-1.5 -right-[23px] w-4 h-4 ${t.color} rounded-full border-4 border-white`}
              />
              <div className="mr-6 space-y-1">
                <span
                  className={`text-xs font-semibold ${t.textColor} ${t.badgeBg} px-2 py-0.5 rounded font-tajawal`}
                >
                  {t.year}
                </span>
                <h4 className="text-base font-bold text-gray-800 font-heading">{t.role}</h4>
                <p className="text-xs text-gray-400 font-body">{t.place}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Certifications ────────────────────────────────────────────────── */}
      <section
        className="bg-white py-12 px-4 md:px-8 border-y border-gray-100"
        ref={certsRef}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-[#1A6B5A]">
              الشهادات والاعتمادات الرسمية
            </h2>
          </div>


          <Carousel opts={{
    align: "start",
    loop: true,
  }}>
            <CarouselContent>

              {certifications.map((c, i) => (
                <CarouselItem key={i}>
                  <Card
                    className="min-w-[280px] bg-[#F9FAFB] border-gray-100 shrink-0 snap-center hover:border-emerald-200 transition-all"
                  >
                    <CardContent className="p-5 flex flex-col justify-between h-full text-right space-y-2">
                      <div className="space-y-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#1A6B5A] flex items-center justify-center">
                          <Award size={20} />
                        </div>
                        <h5 className="font-heading font-bold text-xs text-gray-800 leading-normal">
                          {c.title}
                        </h5>
                        <p className="text-[10px] text-gray-500 font-body leading-relaxed">{c.desc}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-100 text-left mt-4">
                        <span className="text-[9px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {c.id}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselNext />
            <CarouselPrevious />
          </Carousel>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-[#1A6B5A] text-white py-12 px-6 text-center"
        ref={ctaRef}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl md:text-3xl font-bold font-heading">
            ابدأ أولى خطواتك نحو رعاية صحية مستمرة لك ولعائلتك
          </h2>
          <p className="text-[#2DBFA0] font-tajawal text-sm">
            نحن نهتم بأدق التفاصيل الصحية لتنعم بحرية كاملة وقوة متجددة يومياً
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="px-8 py-3 bg-[#2DBFA0] text-gray-900 font-tajawal font-bold rounded-xl shadow-md hover:bg-emerald-400 transition-all text-xs h-auto"
            >
              <Link href="/booking">احجز استشارتك مع دكتور يوسف الآن</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}