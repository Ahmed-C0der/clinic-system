"use client"

import React, { useActionState, useEffect } from 'react'

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
// import loginFormAction from '../(Front_End)/action/login'
import { toast } from "sonner"
import Image from 'next/image'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '../(Front_End)/sotres/userStore'
import { Role } from '@/lib/generated/prisma/enums'
interface LoginState {
    message: string;
    error?: any;
    user?: {
        email: string;
        password?: string;
        name?: string;
    };
    success:boolean;
}

const initialState: LoginState = {
    message: "",
    user: { email: "", password: "", name: "" },
    success:false
};

function Login() {
    const [state, formAction, isPending] = useActionState(
        loginFormAction,
        initialState,

    )
      const {setUser:setUserGlobal } = useUserStore((state)=>state)


    // useEffect(() => {
    //     fetch("/api/auth/me")
    //         .then(res => res.ok && res.json().then(data => {
    //             if (data?.user?.role) {
    //                 const roleMap: Record<string, string> = {
    //                     admin: "/analytics",
    //                     doctor: "/doctor-dashboard",
    //                     patient: "/dashboard",
    //                     receptionist: "/receptionist",
    //                 }
    //                 window.location.href = roleMap[data.user.role] || "/login"
    //             }
    //         }))
    //         .catch(() => {})
    // }, [])

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state?.error]);
    useEffect(()=>{
        if(state?.success){
            toast.success(state.message);
            setUserGlobal({id:state.user!.id, email:state.user!.email, name:state.user!.name, role:state.user!.role});
            switch (state.user.role){
                case Role.admin : redirect("/analytics")
                case Role.doctor : redirect("/doctor-dashboard")
                case Role.patient : redirect("/dashboard")
                case Role.receptionist : redirect("/receptionist")
            }

        }
    },[state?.success])
    return (
        <main className="flex min-h-screen">
            {/* login field */}
            <section className="flex-2/3 flex items-center justify-center p-8">
                <Card className="w-full sm:max-w-md">
                    <CardHeader>
                        <CardTitle>تسجيل الدخول</CardTitle>
                        <CardDescription>
                            أدخل بريدك الإلكتروني وكلمة المرور للوصول إلى حسابك.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form id="login-form" action={formAction}>
                            <FieldGroup>
                                {/* <Field data-invalid={!!state?.error}>
                                    <FieldLabel htmlFor="login-name">
                                        الاسم
                                    </FieldLabel>
                                    <Input
                                        id="login-name"
                                        name="name"
                                        type="text"
                                        defaultValue={state?.user?.name}
                                        aria-invalid={!!state?.error}
                                        required
                                    />
                                </Field> */}
                                <Field data-invalid={!!state?.error}>
                                    <FieldLabel htmlFor="login-email">
                                        البريد الإلكتروني
                                    </FieldLabel>
                                    <Input
                                        id="login-email"
                                        name="email"
                                        type="email"
                                        defaultValue={state?.user?.email}
                                        aria-invalid={!!state?.error}
                                        required
                                    />
                                </Field>

                                <Field data-invalid={!!state?.error}>
                                    <FieldLabel htmlFor="login-password">
                                        كلمة المرور
                                    </FieldLabel>
                                    <Input
                                        id="login-password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        aria-invalid={!!state?.error}
                                        required
                                    />
                                    <FieldDescription>
                                        يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.
                                    </FieldDescription>

                                </Field>
                            </FieldGroup>
                        </form>
                    </CardContent>

                    <CardFooter className="flex-col gap-2">
                        <Button
                            type="submit"
                            form="login-form"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
                        </Button>
                        <div className='text-center'>
                        <p>لا يوجد لديك حساب ؟</p>
                        <Link href={"/register"} className="text-red-600 text-center">تسجيل حساب جديد</Link>
                        </div>
                        <div className="flex items-center justify-center">
                            <p>نسيت كلمة المرور ؟</p>
                            <Link href={"/forgot-password"} className="text-red-600 text-center">إعادة تعيين كلمة المرور</Link>
                        </div>
                    </CardFooter>
                </Card>
            </section>

            {/* right photo section */}
            <section className="hidden md:flex w-1/2 bg-[#007b66] items-center justify-center text-white p-12">
        <div className="flex flex-col items-center text-center">
            <Image src={"/logo.png"} alt="Logo" width={100} height={100} className="mb-4" />
            <h1 className="text-3xl font-bold mb-4">عيادتي</h1>
            <div className="relative w-64 h-64 mb-6">
                <Image src={"/doctor_male.png"} alt="Doctor" fill className="rounded-full object-cover border-4 border-white/20" />
            </div>
            <p className="text-lg">رعاية طبية تليق بك</p>
            <p className="text-sm opacity-80 mt-2">نحن هنا لنقدم لك أفضل تجربة صحية من خلال تكنولوجيا حديثة وكادر طبي متميز يهتم بأدق التفاصيل.</p>
        </div>
      </section>
        </main>
    )
}

export default Login

async function loginFormAction(prevState: any, fomrData: FormData) {
    const email = fomrData.get("email") as string
    const password = fomrData.get("password") as string
    if (!email || !password ) {
        return { message: "email and password are required" }

    }
    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: "error", error: data.error }
        }
        return { message: "user is logged in successfully", user: data.user  , success:true}
    } catch (error) {
        if (error instanceof Error) {
            return { message: "error", error: error.message,success:false }
        }
        return { message: "error", error,success:false }
    }

}
