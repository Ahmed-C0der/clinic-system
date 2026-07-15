import Link from 'next/link'
import React from 'react'
import { Stethoscope, Home, Calendar, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="relative min-h-screen bg-white flex flex-col justify-between overflow-hidden font-sans">
            {/* Commented Nav Bar as requested */}
            {/* 
            <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-100 z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-[#0a4d3e] text-white p-2.5 rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(10,77,62,0.15)]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <rect x="3" y="9" width="18" height="12" rx="2" ry="2" />
                            <path d="M9 21V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v12" />
                            <path d="M12 12v6M9 15h6" />
                        </svg>
                    </div>
                    <span className="text-[#0a4d3e] font-black text-xl tracking-wide">عيادة الشفاء</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
                    <Link href="/" className="hover:text-[#0a4d3e] transition-colors">الرئيسية</Link>
                    <Link href="/services" className="hover:text-[#0a4d3e] transition-colors">الخدمات</Link>
                    <Link href="/about" className="hover:text-[#0a4d3e] transition-colors">عن الطبيب</Link>
                    <Link href="/contact" className="hover:text-[#0a4d3e] transition-colors">اتصل بنا</Link>
                </nav>
                <Link href="/doctors" className="bg-[#0a4d3e] hover:bg-[#083c31] text-white font-bold py-2.5 px-6 rounded-2xl text-sm transition-all shadow-[0_4px_12px_rgba(10,77,62,0.15)]">
                    احجز موعداً
                </Link>
            </header>
            */}

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 z-10">
                <div className="text-center max-w-2xl mx-auto space-y-8">
                    
                    {/* 404 Heading with green Stethoscope icon */}
                    <div className="flex items-center justify-center gap-4 text-[#0a4d3e]">
                        <span className="text-8xl sm:text-9xl font-black select-none tracking-tighter">4</span>
                        <div className="animate-pulse bg-[#0a4d3e]/5 p-6 rounded-full flex items-center justify-center">
                            <Stethoscope className="w-16 h-16 sm:w-20 sm:h-20 stroke-[1.5]" />
                        </div>
                        <span className="text-8xl sm:text-9xl font-black select-none tracking-tighter">4</span>
                    </div>

                    {/* Messages */}
                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0a4d3e] tracking-tight">
                            عذراً، هذه الصفحة غير موجودة
                        </h1>
                        <p className="text-slate-500 font-bold text-base sm:text-lg max-w-md mx-auto leading-relaxed">
                            يبدو أن الصفحة التي تبحث عنها قد تم حذفها أو تم تغيير عنوانها، يرجى العودة إلى المسار الصحيح.
                        </p>
                    </div>

                    {/* Main Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        {/* Go to Home */}
                        <Link href="/" className="w-full sm:w-auto">
                            <span className="w-full bg-[#0a4d3e] hover:bg-[#083c31] text-white font-bold py-3.5 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(10,77,62,0.12)] hover:shadow-[0_8px_20px_rgba(10,77,62,0.2)] active:scale-[0.98] cursor-pointer">
                                <Home className="w-5 h-5" />
                                <span>العودة للرئيسية</span>
                            </span>
                        </Link>

                        {/* Book Appointment */}
                        <Link href="/doctors" className="w-full sm:w-auto">
                            <span className="w-full border-2 border-[#0a4d3e] hover:bg-[#0a4d3e]/5 text-[#0a4d3e] font-bold py-3 px-8 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer">
                                <Calendar className="w-5 h-5" />
                                <span>احجز موعداً</span>
                            </span>
                        </Link>
                    </div>

                    {/* Secondary Navigation Badges */}
                    <div className="pt-8 space-y-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            أو يمكنك الانتقال إلى:
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <Link href="/services">
                                <span className="bg-[#0a4d3e]/5 hover:bg-[#0a4d3e]/10 text-[#0a4d3e] font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-200 inline-block cursor-pointer">
                                    الخدمات
                                </span>
                            </Link>
                            <Link href="/about">
                                <span className="bg-[#0a4d3e]/5 hover:bg-[#0a4d3e]/10 text-[#0a4d3e] font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-200 inline-block cursor-pointer">
                                    عن الطبيب
                                </span>
                            </Link>
                            <Link href="/contact">
                                <span className="bg-[#0a4d3e]/5 hover:bg-[#0a4d3e]/10 text-[#0a4d3e] font-bold px-5 py-2.5 rounded-full text-sm transition-all duration-200 inline-block cursor-pointer">
                                    تواصل معنا
                                </span>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
