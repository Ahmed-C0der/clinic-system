"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Heart,
  CheckCircle2,
  Layers,
  Award,
  Phone,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import axios from "axios";

gsap.registerPlugin(ScrollTrigger);
const pricingRows = [
  {
    svc: "الكشف الاستشاري العادي لغير المؤمنين",
    dur: "٢٠ دقيقة",
    price: "١٣٠ ر.س",
  },
  {
    svc: "تخطيط وعضلة القلب بالمجهر والصدى (إيكو)",
    dur: "٤٥ دقيقة",
    price: "٣٨٠ ر.س",
  },
  {
    svc: "جهاز هولتر لمراقبة الضغط وعضلة القلب (٢٤ ساعة)",
    dur: "استقصائي يوم كامل",
    price: "٢٩٠ ر.س",
  },
  {
    svc: "زيارة استشارية منزلية للمصابين بالعجز الحركي",
    dur: "٦٠ دقيقة",
    price: "٤٨٠ ر.س",
  },
];
// ── constants ────────────────────────────────────────────────────────────────


// ── component ─────────────────────────────────────────────────────────────────
export default function ServicesPage() {


const [faqs,setFaqs]=useState([])

  const [services, setServices] = useState([]);



useEffect(() => {
  async function getInfo() {
  const response = await axios.get("/api/clinic/topServices");
  setServices(response.data);
  const response2 = await axios.get("/api/clinic/CommonQuestion");
  setFaqs(response2.data);
}
  getInfo();
}, []);






  const headerRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header fade down
      gsap.from(headerRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: "power3.out",
      });

      // Service cards stagger on scroll
      gsap.from(".service-card", {
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 40,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });

      // Pricing table rows slide in from right (RTL)
      gsap.from(".pricing-row", {
        scrollTrigger: {
          trigger: pricingRef.current,
          start: "top 85%",
        },
        opacity: 0,
        x: 30,
        stagger: 0.1,
        duration: 0.55,
        ease: "power2.out",
      });

      // FAQ section fade up
      gsap.from(faqRef.current, {
        scrollTrigger: {
          trigger: faqRef.current,
          start: "top 85%",
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: "power2.out",
      });

      // CTA fade up
      gsap.from(ctaRef.current, {
        scrollTrigger: {
          trigger: ctaRef.current,
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
        className="bg-emerald-50/50 py-12 px-4 md:px-8 text-center border-b border-emerald-100"
        ref={headerRef}
      >
        <h1 className="text-2xl md:text-4xl font-bold text-[#1A6B5A] font-heading">
          خدماتنا الطبية ورعايتنا المتميزة
        </h1>
        <p className="text-gray-500 font-body text-xs mt-2 max-w-xl mx-auto">
          نحن في العيادة الطبية المتكاملة نعتز بتقديم خدمات رعاية صحية في مختلف
          التفرعات الطبية العامة والمتخصصة بسعر مناسب وضمان الدقة والسرية.
        </p>
      </section>

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto" ref={gridRef}>
        <div className="grid md:grid-cols-3 gap-6">
          {services.map((item, idx) => (
            <Card
              key={idx}
              className="service-card border-gray-100 shadow-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-6 flex flex-col justify-between h-full text-right space-y-3">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#1A6B5A] flex items-center justify-center">
                    {/* {item.icon} */}

                    <Image src={"/logo.png"} alt={item.} width={200} height={200} />
                    {/* add an icon instead */}
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-[#1A6B5A] hover:bg-emerald-50 font-tajawal text-xs shrink-0"
                    >
                      {item.price}
                    </Badge>
                    <h3 className="font-heading font-bold text-sm text-gray-800 text-right">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-500 font-body leading-relaxed">
                    {item.text}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs font-bold font-tajawal text-[#1A6B5A] hover:text-[#2DBFA0] p-0 h-auto gap-1"
                    asChild
                  >
                    <Link href="/booking">
                      <span>أحجز هذا العرض المباشر</span>
                      <ArrowLeft size={12} />
                    </Link>
                  </Button>
                  <span className="text-[10px] text-gray-400">كشف وتخطيط</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Pricing Table ─────────────────────────────────────────────────── */}
      <section className="py-10 px-4 md:px-8 max-w-4xl mx-auto" ref={pricingRef}>
        <Card className="border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#1A6B5A] text-white text-right font-heading font-bold text-sm">
            جدول تسعير الخدمات التخصصية
          </div>
          <Table>
            <TableHeader>
              <TableRow className="text-right">
                <TableHead className="text-right font-heading text-gray-700 text-xs">
                  الخدمة
                </TableHead>
                <TableHead className="text-right font-heading text-gray-700 text-xs">
                  المدة
                </TableHead>
                <TableHead className="text-left font-heading text-gray-700 text-xs">
                  السعر
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricingRows.map((row, idx) => (
                <TableRow key={idx} className="pricing-row text-xs">
                  <TableCell className="font-bold text-gray-800 text-right">
                    {row.svc}
                  </TableCell>
                  <TableCell className="text-gray-400 font-body text-right">
                    {row.dur}
                  </TableCell>
                  <TableCell className="text-[#1A6B5A] font-bold font-tajawal text-left">
                    {row.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section
        className="py-12 bg-emerald-50/20 px-4 md:px-8"
        ref={faqRef}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-[#1A6B5A]">
              الأسئلة الطبية والإدارية الشائعة
            </h2>
          </div>

          {/* shadcn Accordion replaces the manual open/close state */}
          <Accordion type="single" collapsible defaultValue="item-0" className="space-y-3">
            {faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 overflow-hidden"
              >
                <AccordionTrigger className="text-right font-semibold text-xs text-gray-800 font-heading hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-xs text-gray-500 font-body leading-relaxed pb-4">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section
        className="bg-[#1A6B5A] text-white py-12 px-4 text-center"
        ref={ctaRef}
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-xl md:text-2xl font-bold font-heading">
            هل تريد خطة مخصصة لحالتك الصحية المحددة؟
          </h2>
          <p className="text-xs text-emerald-100 font-body">
            اطرح جميع استفساراتك الطبية وتلقّ جواباً وافياً وشخصياً من الطبيب فوراً.
          </p>
          <div className="pt-2">
            <Button
              asChild
              className="px-8 py-3 bg-[#2DBFA0] text-gray-900 font-tajawal font-bold rounded-xl shadow-md hover:bg-emerald-400 transition-all text-xs h-auto"
            >
              <Link href="/booking">احجز موعداً للمعاينة فوراً</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}