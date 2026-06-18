"use client"

import { useActionState, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import registerFormAction from "../(Front_End)/action/register"

interface RegisterState {
  error?: string
}

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)
  const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
    registerFormAction,
    {}
  )

  return (
    <main className="flex min-h-screen" dir="rtl">
      <section className="hidden w-[45%] bg-[#1A6B5A] lg:flex flex-col items-center justify-center gap-6 p-12 text-white">
        <div className="flex size-24 items-center justify-center rounded-full bg-white/10">
          <Stethoscope className="size-12 text-[#2DBFA0]" />
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold">
          عيادة الأمل
        </h1>
        <p className="max-w-xs text-center text-lg leading-relaxed opacity-90">
          رعاية صحية متكاملة بثقة وتميز
        </p>
      </section>

      <section className="flex w-full lg:w-[55%] items-center justify-center bg-[#F9FAFB] p-6">
        <Card className="w-full max-w-md rounded-2xl shadow-lg">
          <CardContent className="p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-[#1C1C1E]">
              إنشاء حساب مريض
            </h2>

            {/* Step indicator */}
            <div className="mb-6 flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                  step >= 1
                    ? "bg-[#2DBFA0] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                ١
              </div>
              <div
                className={`h-1 flex-1 rounded ${
                  step >= 2 ? "bg-[#2DBFA0]" : "bg-muted"
                }`}
              />
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${
                  step >= 2
                    ? "bg-[#2DBFA0] text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                ٢
              </div>
            </div>

            <form action={formAction} className="flex flex-col gap-5">
              {step === 1 && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="fullName">الاسم الكامل</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="dob">تاريخ الميلاد</Label>
                    <Input id="dob" name="dob" type="date" required />
                  </div>

                  <fieldset className="flex flex-col gap-1.5">
                    <Label asChild>
                      <legend>الجنس</legend>
                    </Label>
                    <div className="flex gap-4">
                      <Label className="flex items-center gap-2 text-sm font-normal tracking-normal normal-case">
                        <input
                          type="radio"
                          name="gender"
                          value="male"
                          className="accent-[#2DBFA0]"
                        />
                        ذكر
                      </Label>
                      <Label className="flex items-center gap-2 text-sm font-normal tracking-normal normal-case">
                        <input
                          type="radio"
                          name="gender"
                          value="female"
                          className="accent-[#2DBFA0]"
                        />
                        أنثى
                      </Label>
                    </div>
                  </fieldset>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="phone">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="05xxxxxxxx"
                      required
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full bg-[#2DBFA0] text-white hover:bg-[#2DBFA0]/80"
                    size="lg"
                  >
                    التالي
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="example@mail.com"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        placeholder="••••••••"
                        required
                        className="pe-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {state?.error && (
                    <p className="text-xs text-destructive">{state.error}</p>
                  )}

                  <Label className="flex items-center gap-2 text-sm font-normal tracking-normal normal-case">
                    <Checkbox name="terms" required />
                    أوافق على{" "}
                    <Link
                      href="/terms"
                      className="text-[#2DBFA0] hover:underline"
                    >
                      الشروط والأحكام
                    </Link>
                  </Label>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                      size="lg"
                    >
                      السابق
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="flex-1 bg-[#2DBFA0] text-white hover:bg-[#2DBFA0]/80"
                      size="lg"
                    >
                      {isPending ? "جاري التحميل..." : "إنشاء حساب"}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <Separator className="my-6" />

            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-[#2DBFA0] hover:underline"
              >
                تسجيل الدخول
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}

export default RegisterPage