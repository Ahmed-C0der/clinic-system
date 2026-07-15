"use client"

import { z } from "zod"
import { useActionState, useEffect, useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Stethoscope } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { redirect, useRouter } from "next/navigation"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useUserStore } from "../(Front_End)/sotres/userStore"
const registerSchema = z
  .object({
    email: z.string().email("البريد الإلكتروني غير صالح"),
    name: z.string().min(1, "الاسم مطلوب"),
    password: z
      .string()
      .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
    confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
    phone: z
      .string()
      .regex(/^01[0125]\d{8}$/, "رقم الهاتف يجب أن يبدأ بـ 01 ويتكون من 10 أرقام"),
    gender: z.enum(["male", "female"], { message: "الجنس مطلوب" }),
    dob: z.string().min(1, "تاريخ الميلاد مطلوب"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "كلمة المرور غير متطابقة",
    path: ["confirmPassword"],
  })




function RegisterPage() {
  const {setPatientId} = useUserStore((state)=>state)
  const {setUser:setUserGlobal } = useUserStore((state)=>state)
  const {user:userFromGlobal , patientId:patientIdFromGlobal} = useUserStore();
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [step, setStep] = useState(1)
  const [user, setUser] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    phone: "",
    gender: "",
    dob: ""
  });
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value
    });
  }
  const router = useRouter();
  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await register();
    if (result?.success) {
      toast.success(result.message);
      setPatientId(result.patient!.id);
      setUserGlobal({id:result.user!.id, email:result.user!.email, name:result.user!.name, role:result.user!.role});
      router.replace("/login");
    } else {
      toast.error(result?.error);
    }
  }
  async function register() {
  
  const raw = {
    email: user.email,
    name: user.name,
    password: user.password,
    confirmPassword: user.confirmPassword,
    phone: user.phone,
    gender: user.gender,
    dob: user.dob,
  }
  console.log(`user is ${raw.email},${raw.name},${raw.password},${raw.confirmPassword},${raw.phone},${raw.gender},${raw.dob}`)

  const result = registerSchema.safeParse(raw)

  if (!result.success) {
    const messages = result.error.issues.map((i) => i.message)
    return { error: messages.join(" | ") }
  }

  const { confirmPassword: _, ...payload } = result.data

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await response.json()
    if (!response.ok) {
      return { message: "error", error: data.error }
    }
    
    const res2 = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: data.user.id,
        name: payload.name,
        phone: payload.phone,
        gender: payload.gender,
        dateOfBirth: payload.dob,
      }),
    })
    if (!res2.ok) {
      return { message: "error", error: "Error creating patient profile" }
    }
    const patient = await res2.json();
    return { message: "تم إنشاء الحساب بنجاح", success: true , patient , user:data.user }
  } catch (error) {
    if (error instanceof Error) {
      return { message: "error", error: error.message }
    }
    return { message: "error", error }
  }
}

  

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
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${step >= 1
                  ? "bg-[#2DBFA0] text-white"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                ١
              </div>
              <div
                className={`h-1 flex-1 rounded ${step >= 2 ? "bg-[#2DBFA0]" : "bg-muted"
                  }`}
              />
              <div
                className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${step >= 2
                  ? "bg-[#2DBFA0] text-white"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                ٢
              </div>
            </div>

            <form  className="flex flex-col gap-5">
  {/* الخطوة الأولى: نتحكم بالظهور عبر كلاس hidden */}
  <div className={`flex flex-col gap-5 ${step !== 1 ? "hidden" : ""}`}>
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="fullName">الاسم الكامل</Label>
      <Input
        onChange={onChangeHandler}
        id="fullName"
        value={user.name}
        name="name"
        placeholder="أدخل اسمك الكامل"
        required={step === 1} // مطلوب فقط إذا كنا في الخطوة الأولى لمنع اعتراض المتصفح
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <Label htmlFor="dob">تاريخ الميلاد</Label>
      <Input
        onChange={onChangeHandler}
        value={user.dob}
        name="dob"
        id="dob" 
        type="date" 
        required={step === 1} 
      />
    </div>

    <fieldset className="flex flex-col gap-1.5">
      <Label asChild>
        <legend>الجنس</legend>
      </Label>
      <div className="flex gap-4">
        <RadioGroup
          dir="rtl"
          name="gender"
          value={user.gender || ""} 
          onValueChange={(value) => {
            setUser({...user,gender:value})
            console.log("Gender changed to:", value);
            
            // onChangeHandler({ target: { name: "gender", value } } as any);
          }}
          className="flex gap-6 mt-2"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="male" id="male" className="accent-[#2DBFA0]" />
            <Label htmlFor="male" className="text-sm font-normal cursor-pointer select-none">
              ذكر
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="female" id="female" className="accent-[#2DBFA0]" />
            <Label htmlFor="female" className="text-sm font-normal cursor-pointer select-none">
              أنثى
            </Label>
          </div>
        </RadioGroup>
      </div>
    </fieldset>

    <div className="flex flex-col gap-1.5">
      <Label htmlFor="phone">رقم الهاتف</Label>
      <Input
        onChange={onChangeHandler}
        value={user.phone}
        name="phone"
        id="phone"
        type="tel"
        placeholder="01xxxxxxxx"
        required={step === 1}
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
  </div>

  {/* الخطوة الثانية: نتحكم بالظهور عبر كلاس hidden */}
  <div className={`flex flex-col gap-5 ${step !== 2 ? "hidden" : ""}`}>
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="email">البريد الإلكتروني</Label>
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="example@mail.com"
        required={step === 2}
        onChange={onChangeHandler}
        value={user.email}
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
          required={step === 2}
          className="pe-10"
          onChange={onChangeHandler}
          value={user.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
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
          required={step === 2}
          className="pe-10"
          onChange={onChangeHandler}
          value={user.confirmPassword}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          tabIndex={-1}
        >
          {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </div>

    <Label className="flex items-center gap-2 text-sm font-normal tracking-normal normal-case">
      <Checkbox name="terms" required={step === 2} />
      أوافق على{" "}
      <Link href="/terms" className="text-[#2DBFA0] hover:underline">
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
        onClick={onSubmitHandler}
        className="flex-1 bg-[#2DBFA0] text-white hover:bg-[#2DBFA0]/80"
        size="lg"
      >
        إنشاء حساب
      </Button>
    </div>
  </div>
</form>

            <Separator className="my-6" />

            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <Link
                href="/login"
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



