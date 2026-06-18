"use client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { ArrowLeft, Heart, Layers, ShieldCheck, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Testimonial {
  name: string;
  rating: number;
  comment: string;
  service: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatItem({
  value,
  label,
  bordered,
}: {
  value: string;
  label: string;
  bordered?: boolean;
}) {
  return (
    <div
      className={`space-y-2 p-4 ${
        bordered ? "border-y sm:border-y-0 sm:border-x border-emerald-700/50" : ""
      }`}
    >
      <div className="text-4xl md:text-5xl font-bold font-heading text-[#2DBFA0]">
        {value}
      </div>
      <p className="text-sm text-emerald-100 font-tajawal">{label}</p>
    </div>
  );
}

function ServiceCard({
  icon,
  title,
  description,
  iconBg,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconBg: string;
}) {
  return (
    <Card className="hover:shadow-md transition-all text-right border-gray-100">
      <CardContent className="p-6 space-y-4">
        <div
          className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center text-[#1A6B5A]`}
        >
          {icon}
        </div>
        <h3 className="text-lg font-bold font-heading text-gray-800">{title}</h3>
        <p className="text-gray-500 font-body text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function StepItem({
  number,
  color,
  title,
  description,
}: {
  number: string;
  color: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-4 flex flex-col items-center">
      <div
        className={`w-16 h-16 rounded-full ${color} text-white flex items-center justify-center text-xl font-bold font-heading shadow-md`}
      >
        {number}
      </div>
      <h3 className="text-lg font-bold font-heading text-gray-800">{title}</h3>
      <p className="text-gray-500 font-body text-xs max-w-xs leading-relaxed text-center">
        {description}
      </p>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <Card className="hover:shadow-md transition-all border-gray-100 text-right">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3 ">
          <Avatar className="w-12 h-12 bg-emerald-100">
            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-heading text-xs font-bold">
              {testimonial.name[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-sm font-bold text-gray-800">{testimonial.name}</h4>
            <p className="text-[10px] text-gray-400">مريض تمت معالجته بالمركز</p>
          </div>
        </div>
        <Separator className="bg-gray-50" />
        <div className="flex justify-between items-center">
          <Badge
            variant="secondary"
            className="bg-emerald-50 text-[#1A6B5A] font-tajawal text-xs border-0"
          >
            {testimonial.service}
          </Badge>
          <div className="flex text-amber-400">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star key={i} size={14} fill="currentColor" />
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-sm italic font-body leading-relaxed">
          &ldquo;{testimonial.comment}&rdquo;
        </p>



      </CardContent>
    </Card>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HomepageView() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      name: "أحمد العتيبي",
      rating: 5,
      comment:
        "تعامل راقٍ جداً واحترافية من الطبيب وطاقم العمل. العيادة مجهزة بأحدث التقنيات الطبية.",
      service: "استشارة قلبية",
    },
    {
      name: "فاطمة محمد",
      rating: 4,
      comment:
        "أفضل عيادة قمت بزيارتها. نظام المواعيد دقيق جداً ولا يوجد وقت انتظار طويل.",
      service: "فحص دوري",
    },
    {
      name: "خالد الحربي",
      rating: 5,
      comment:
        "شرح لي الطبيب حالتي بالتفصيل ووصف لي العلاج المناسب. ممتن جداً للرعاية الطبية المتميزة.",
      service: "متابعة السكري",
    },
  ]);

  useEffect(() => {
    const getTestimonials = async () => {
      try {
        const res = await fetch("/api/clinic/views");
        if (!res.ok) {
          console.error("Failed to fetch testimonials");
          return;
        }
        const data = await res.json();
        if (data.length > 0) setTestimonials(data);
      } catch (error) {
        console.error("Failed to fetch testimonials", error);
      }
    };
    getTestimonials();
  }, []);

  return (
    <div className="animate-fade-in text-[#1C1C1E] bg-[#F9FAFB] min-h-screen">
      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-emerald-50/70 via-white to-transparent py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text */}
          <div className="space-y-6 text-right order-2 md:order-1">
            <Badge
              variant="outline"
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-[#1A6B5A] border-emerald-100 font-tajawal"
            >
              🌱 شريككم الموثوق في رحلة الصحة والعمر المديد
            </Badge>

            <h1 className="text-3xl md:text-5xl font-bold text-[#1A6B5A] leading-tight font-heading">
              رعاية طبية متميزة تليق بصحتكم وأسلوب حياتكم
            </h1>

            <p className="text-gray-600 leading-relaxed font-body text-base max-w-xl">
              نحن نلتزم بتقديم أعلى مستويات الرعاية الطبية الشخصية والمبنية على
              الأدلة العلمية. نجمع بين الخبرة الطبية المرموقة والتقنيات الحديثة
              لنضمن لكم حياة صحية ومريحة.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                asChild
                className="bg-[#1A6B5A] hover:bg-[#155447] font-tajawal font-medium rounded-xl shadow-md"
              >
                <Link id="hero-book-btn" href="/booking">
                  <span>احجز موعدك الآن</span>
                  <ArrowLeft size={16} className="mr-2" />
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="border-[#1A6B5A] text-[#1A6B5A] hover:bg-emerald-50/50 font-tajawal font-medium rounded-xl"
              >
                <Link id="hero-about-btn" href="/about">
                  اعرف المزيد عن الطبيب
                </Link>
              </Button>
            </div>
          </div>

          {/* Doctor Image */}
          <div className="flex justify-center order-1 md:order-2">
            <div className="relative">
              <div className="absolute inset-x-0 -bottom-6 -left-6 w-full h-full bg-[#2DBFA0]/10 rounded-2xl -z-10" />
              <Card className="p-3 max-w-sm border-emerald-50 shadow-lg">
                <CardContent className="p-0">
                  <Image
                    src="/doctor.png"
                    alt="الطبيب المعالج"
                    referrerPolicy="no-referrer"
                    className="rounded-xl w-full h-80 object-cover"
                    width={500}
                    height={500}
                  />
                  <div className="mt-4 p-3 bg-emerald-50/50 rounded-xl text-center">
                    <h4 className="font-heading font-semibold text-[#1A6B5A]">
                      د.ايهاب محمد عبدالله
                    </h4>
                    <p className="text-xs text-gray-500 font-body mt-1">
                      استشاري الأمراض الباطنية والقلب
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="bg-[#1A6B5A] text-white py-10 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <StatItem value="+١٥,٠٠٠" label="مريض يثقون بنا سنوياً" />
          <StatItem
            value="+١٨ سنة"
            label="من الخبرة الطبية الأكاديمية والعملية"
            bordered
          />
          <StatItem value="٩٩.٤%" label="نسبة رضا المرضى وعائلاتهم" />
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A6B5A] font-heading">
            خدمات عيادتنا المتميزة
          </h2>
          <p className="text-gray-500 text-sm font-body">
            نقدم خدمات شاملة ومتكاملة لرعاية صحتكم وصحة أفراد عائلتكم بأعلى
            مستويات الجودة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <ServiceCard
            icon={<Heart size={24} />}
            title="الاستشارات الطبية المتخصصة"
            description="تشخيص دقيق واستشارات قلبية وباطنية مبكرة بأساليب متطورة لضمان أفضل مسار علاجي بأمان وسرعة."
            iconBg="bg-emerald-50"
          />
          <ServiceCard
            icon={<Layers size={24} />}
            title="الفحوصات الطبية والمخبرية"
            description="تحاليل دم شاملة، تخطيط القلب ومراقبة ضغط الدم والسكري بأحدث أجهزة التحليل الذكي المعتمدة عالمياً."
            iconBg="bg-[#2DBFA0]/15"
          />
          <ServiceCard
            icon={<ShieldCheck size={24} />}
            title="برامج الطب الوقائي والمستمر"
            description="خطط وقائية متكاملة مصممة خصيصاً لكل فرد للوقاية من الأمراض المزمنة قبل حدوثها مع متابعة دورية مستمرة."
            iconBg="bg-teal-50"
          />
        </div>

        <div className="text-center mt-8">
          <Button
            asChild
            variant="link"
            className="text-[#1A6B5A] hover:text-[#2DBFA0] font-tajawal font-bold text-sm"
          >
            <Link id="view-all-services-btn" href="/services">
              <span>استعرض تفاصيل الخدمات والأسعار من هنا</span>
              <ArrowLeft size={16} className="mr-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Booking Steps ── */}
      <section className="bg-emerald-50/40 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A6B5A] font-heading">
              كيفية حجز موعدك ببساطة؟
            </h2>
            <p className="text-gray-500 text-sm font-body">
              ٣ خطوات بسيطة تفصلك عن حجز استشارتك مع الطبيب المختص وتأكيد الحضور
              تلقائياً
            </p>
          </div>

          <div className="relative">
            <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[2px] border-t-2 border-dashed border-emerald-200" />
            <div className="grid md:grid-cols-3 gap-8 relative z-10 text-center">
              <StepItem
                number="١"
                color="bg-[#1A6B5A]"
                title="اختر نوع الخدمة"
                description="تصفح خدماتنا المتخصصة والعيادات وحدد نوع الاستشارة التي تناسب وضعك الصحي حالياً."
              />
              <StepItem
                number="٢"
                color="bg-[#2DBFA0]"
                title="حدد اليوم والوقت"
                description="ابحث في جدول المواعيد المتاحة الفعلي، واختر الأسبوع والساعة الأنسب لجدول منزلك وعملك."
              />
              <StepItem
                number="٣"
                color="bg-[#1A6B5A]"
                title="أدخل البيانات وأكّد"
                description="أضف الاسم ورقم الهاتف فقط، سيتواصل معك النظام بالرسائل النصية لتأكيد الموعد فوراً."
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              asChild
              className="bg-[#1A6B5A] hover:bg-[#155447] font-tajawal font-medium rounded-xl shadow-md px-8"
            >
              <Link id="start-booking-btn" href="/booking">
                ابدء الحجز المباشر الآن
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A6B5A] font-heading">
            تجارب حية من مرضانا وعائلاتهم
          </h2>
          <p className="text-gray-500 text-sm font-body">
            صحة وسعادة مرضانا هي المعيار الأساسي لنجاحنا، ونفخر بشهاداتهم
            الموثقة
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <TestimonialCard key={idx} testimonial={t} />
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 md:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4 text-right">
            <div className="flex items-center gap-2 text-white">
              <span className="text-2xl font-bold font-heading text-[#2DBFA0]">
                العيادة المتكاملة
              </span>
              <Heart size={24} className="text-[#2DBFA0]" />
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              مركز الرعاية الطبية الأول بجدة والرياض لتقديم استشارات طبية وباطنية
              متميزة على يد نخبة من الأطباء والمتخصصين ذوي الخبرة العالمية.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-3 text-right">
            <h4 className="text-white font-heading font-semibold text-sm">
              روابط سريعة
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/about", label: "عن الطبيب" },
                { href: "/services", label: "الخدمات" },
                { href: "/contact", label: "اتصل بنا" },
              ].map(({ href, label }) => (
                <Button
                  key={href}
                  asChild
                  variant="link"
                  className="text-gray-400 hover:text-white text-xs p-0 h-auto justify-end"
                >
                  <Link href={href}>{label}</Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-3 text-right text-xs">
            <h4 className="text-white font-heading font-semibold text-sm">
              أوقات العمل
            </h4>
            <p>السبت - الخميس: ٩:٠٠ ص - ٩:٠٠ م</p>
            <p>الجمعة - العطلات الرسمية: مغلق للطوارئ فقط</p>
            <p className="text-xs text-emerald-400 font-bold">
              هاتف الدعم المباشر: 920004944
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}