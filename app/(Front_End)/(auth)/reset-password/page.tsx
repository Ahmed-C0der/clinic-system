"use client"
import { useActionState, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from "next/link"
import { Eye, EyeOff, Check, Circle, ArrowLeft, Headphones } from "lucide-react"
import { toast } from "sonner"

export default function ResetPassword() {
    const params = useSearchParams()
    const router = useRouter()
    const token = params.get("token")

    const [state, action, isPending] = useActionState<any, FormData>(resetPasswordAction, {
        message: "",
        error: "",
        success: false,
        password: "",
        confirmPassword: "",
        token: ""
    })

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Password validation criteria
    const hasMinLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    useEffect(() => {
        if (state.error) {
            toast.error(state.error)
        }
        if (state.success) {
            toast.success(state.message || "تم إعادة تعيين كلمة المرور بنجاح")
            router.push("/login")
        }
    }, [state.success, state.error, state.message, router])

    if (!token) {
        return (
            <div className="min-h-screen bg-[#f8fafc]/80 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(10,77,62,0.04)] p-8 max-w-md">
                    <p className="text-red-500 font-bold mb-4">الرمز البرمجي للتحقق غير متوفر أو غير صالح.</p>
                    <Link href="/forgot-password" className="text-[#0a4d3e] font-bold hover:underline">
                        طلب رابط جديد لإعادة تعيين كلمة المرور
                    </Link>
                </div>
            </div>
        )
    }

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
            </header>

            {/* Central Card */}
            <main className="flex-1 flex items-center justify-center p-6 z-10">
                <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_20px_50px_rgba(10,77,62,0.04)] p-8 sm:p-10 w-full max-w-md transition-all duration-300 hover:shadow-[0_24px_60px_rgba(10,77,62,0.06)]">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a4d3e] mb-3">
                            إعادة تعيين كلمة المرور
                        </h1>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            يرجى إدخال كلمة المرور الجديدة الخاصة بك أدناه.
                        </p>
                    </div>

                    <form action={action} className="space-y-6">
                        <input type="hidden" name="token" value={token} />

                        {/* New Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="block text-sm font-bold text-[#0a4d3e]">
                                كلمة المرور الجديدة
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a4d3e]/20 focus:border-[#0a4d3e] text-left dir-ltr transition-all duration-200 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute left-4 text-slate-400 hover:text-[#0a4d3e] transition-colors focus:outline-none"
                                    aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#0a4d3e]">
                                تأكيد كلمة المرور الجديدة
                            </label>
                            <div className="relative flex items-center">
                                <input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0a4d3e]/20 focus:border-[#0a4d3e] text-left dir-ltr transition-all duration-200 font-medium"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute left-4 text-slate-400 hover:text-[#0a4d3e] transition-colors focus:outline-none"
                                    aria-label={showConfirmPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Security Requirements Checklist */}
                        <div className="bg-slate-50 border border-slate-100/80 rounded-2xl p-4.5 space-y-3">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                متطلبات الأمان
                            </h3>
                            <div className="space-y-2.5">
                                {/* Min 8 chars */}
                                <div className="flex items-center gap-2.5">
                                    {hasMinLength ? (
                                        <Check className="w-4.5 h-4.5 text-emerald-500 stroke-[3]" />
                                    ) : (
                                        <Circle className="w-4.5 h-4.5 text-slate-300" />
                                    )}
                                    <span className={`text-sm font-bold transition-colors duration-200 ${hasMinLength ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        8 أحرف على الأقل
                                    </span>
                                </div>

                                {/* Uppercase letter */}
                                <div className="flex items-center gap-2.5">
                                    {hasUppercase ? (
                                        <Check className="w-4.5 h-4.5 text-emerald-500 stroke-[3]" />
                                    ) : (
                                        <Circle className="w-4.5 h-4.5 text-slate-300" />
                                    )}
                                    <span className={`text-sm font-bold transition-colors duration-200 ${hasUppercase ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        حرف كبير واحد على الأقل
                                    </span>
                                </div>

                                {/* A number */}
                                <div className="flex items-center gap-2.5">
                                    {hasNumber ? (
                                        <Check className="w-4.5 h-4.5 text-emerald-500 stroke-[3]" />
                                    ) : (
                                        <Circle className="w-4.5 h-4.5 text-slate-300" />
                                    )}
                                    <span className={`text-sm font-bold transition-colors duration-200 ${hasNumber ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        رقم واحد على الأقل
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isPending}
                            className="w-full bg-[#0a4d3e] hover:bg-[#083c31] text-white font-bold py-3.5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2.5 shadow-[0_4px_12px_rgba(10,77,62,0.15)] hover:shadow-[0_6px_20px_rgba(10,77,62,0.25)] active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed text-base"
                        >
                            <span>{isPending ? "جاري تعيين كلمة المرور..." : "تحديث كلمة المرور"}</span>
                            {!isPending && <ArrowLeft className="w-5 h-5" />}
                        </button>
                    </form>

                    {/* Back to Login below card */}
                    <div className="mt-6 text-center">
                        <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-[#0a4d3e] hover:text-[#083c31] font-bold hover:underline transition-colors">
                            <span>العودة إلى تسجيل الدخول</span>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col items-center justify-center z-10">
                <div className="flex items-center justify-center gap-5 text-xs font-bold text-slate-400">
                    <Link href="/privacy" className="hover:text-slate-600 transition-colors">سياسة الخصوصية</Link>
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

async function resetPasswordAction(prevState: any, formData: FormData) {
    const password = formData.get("password")
    const confirmPassword = formData.get("confirmPassword")
    const token = formData.get("token")

    if (password !== confirmPassword) {
        return {
            error: "كلمة المرور غير متطابقة",
            success: false,
            message: "كلمة المرور غير متطابقة"
        }
    }

    try {
        const res = await fetch(`/api/auth/reset-password?token=${token}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newPassword: password })
        })
        const data = await res.json()
        if (!res.ok) {
            return {
                error: data.message || "حدث خطأ أثناء تغيير كلمة المرور",
                success: false,
                message: ""
            }
        }
        return {
            error: undefined,
            success: true,
            message: "تم اعادة تعيين كلمة المرور بنجاح"
        }
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
            success: false,
            message: ""
        }
    }
}
