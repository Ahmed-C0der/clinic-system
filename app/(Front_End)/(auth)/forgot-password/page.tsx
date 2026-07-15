"use client"
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Mail, ArrowLeft, Headphones, SendHorizontal } from "lucide-react";

export default function ForgotPassword() {
    const router = useRouter()
    const [state, action, isPending] = useActionState(
        forgotPasswordAction,
        {
            error: "",
            success: false,
            email: ""
        }
    )

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error || "حدث خطأ في ارسال بريد الكتروني لتأكيد التغيير")
        }
    }, [state?.error])

    useEffect(() => {
        if (state?.success) {
            toast.success("تم ارسال بريد الكتروني لتأكيد التغيير")
            router.push("/reset-password")
        }
    }, [state?.success, router])

    return (
        <div className="relative min-h-screen bg-[#f8fafc]/80 flex flex-col justify-between overflow-hidden font-sans">
            {/* Shield Watermark */}
            <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 opacity-[0.03] text-[#0a4d3e] pointer-events-none select-none hidden md:block">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="M12 8v8M9 12h6" strokeWidth="1.5" />
                </svg>
            </div>

            {/* Header Row */}
            <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
                {/* Right Logo */}
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

                {/* Left Back to Login */}
                <Link href="/login" className="group flex items-center gap-2 text-sm text-[#0a4d3e] hover:text-[#083c31] font-bold transition-all duration-200">
                    <ArrowLeft className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-1" />
                    <span>العودة لتسجيل الدخول</span>
                </Link>
            </header>

            {/* Central Form Container */}
            <main className="flex-1 flex items-center justify-center p-6 z-10">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(10,77,62,0.04)] p-8 sm:p-10 w-full max-w-md transition-all duration-300 hover:shadow-[0_24px_60px_rgba(10,77,62,0.06)]">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a4d3e] mb-3">
                            استعادة كلمة المرور
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
                            أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة المرور الخاصة بك.
                        </p>
                    </div>

                    <form action={action} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-bold text-[#0a4d3e]">
                                البريد الإلكتروني
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    placeholder="name@example.com"
                                    defaultValue={state.email}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pr-12 pl-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a4d3e]/20 focus:border-[#0a4d3e] text-left dir-ltr transition-all duration-200 font-medium"
                                    required
                                />
                                <Mail className="absolute right-4 text-slate-400 w-5 h-5 pointer-events-none" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#0a4d3e] hover:bg-[#083c31] text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(10,77,62,0.15)] hover:shadow-[0_6px_20px_rgba(10,77,62,0.25)] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed text-base"
                        >
                            <span>{isPending ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}</span>
                            {!isPending && <SendHorizontal className="w-5 h-5 transform rotate-180" />}
                        </button>
                    </form>
                </div>
            </main>

            {/* Footer and Support */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col items-center justify-center z-10">
                <div className="text-center">
                    <p className="text-sm text-slate-600 flex items-center justify-center gap-1.5 font-semibold">
                        <span>هل تواجه مشكلة؟</span>
                        <a href="mailto:support@shefa-clinic.com" className="text-[#0a4d3e] hover:underline font-bold flex items-center gap-1 transition-all">
                            <span>تواصل مع الدعم الفني</span>
                            <Headphones className="w-4 h-4" />
                        </a>
                    </p>
                </div>

                <div className="mt-8 flex items-center justify-center gap-5 text-xs font-bold text-slate-400">
                    <Link href="/privacy" className="hover:text-slate-600 transition-colors">سياسة الخصوصية</Link>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <Link href="/terms" className="hover:text-slate-600 transition-colors">الشروط والأحكام</Link>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <Link href="/contact" className="hover:text-slate-600 transition-colors">اتصل بنا</Link>
                </div>

                <p className="mt-4 text-center text-xs text-slate-400 font-bold">
                    © 2026 عيادة الشفاء الطبية. جميع الحقوق محفوظة.
                </p>
            </footer>
        </div>
    )
}

async function forgotPasswordAction(prevState: any, formData: FormData) {
    const email = formData.get("email")
    try {
        const res = await fetch("/api/auth/forgot-password",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            }
        )
        const data = await res.json()
        if (!res.ok) return {
            error: data.error || "حدث خطأ",
            success: false,
            email: email as string
        }
        return {
            error: undefined,
            success: true,
            email: email as string,
        }

    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
            success: false,
            email: email as string
        }
    }
}