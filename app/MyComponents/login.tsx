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
type LoginState = {
    user: { email: string, password: string, name: string }
    error?: string
}

const initialState: LoginState = {
    user: { email: "", password: "", name: "" },
}

function Login() {
    const [state, formAction, isPending] = useActionState(
        loginFormAction,
        initialState,
        
    )

    useEffect(() => {
        if (state?.error) {
            toast.error(state.error);
        }
    }, [state?.error]);
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
                                <Field data-invalid={!!state?.error}>
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
                                </Field>
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
                    </CardFooter>
                </Card>
            </section>

            {/* right photo section */}
            <section className="hidden md:flex w-1/2 bg-[#007b66] items-center justify-center text-white p-12">
        <div className="flex flex-col items-center text-center">
            <Image src={"/logo.png"} alt="Logo" width={100} height={100} className="mb-4" />
            <h1 className="text-3xl font-bold mb-4">عيادتي</h1>
            <div className="relative w-64 h-64 mb-6">
                <Image src={"/doctor"} alt="Doctor" fill className="rounded-full object-cover border-4 border-white/20" />
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
    const name = fomrData.get("name") as string
    const password = fomrData.get("password") as string
    if (!email || !password || !name) {
        return { message: "email and password are required" }

    }
    try {
        const response = await fetch("api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                password,
                name
            }),
        });
        const data = await response.json();
        if (!response.ok) {
            return { message: "error", error: data.error }
        }
        return { message: "user is logged in successfully", user: data.user }
    } catch (error) {
        if (error instanceof Error) {
            return { message: "error", error: error.message }
        }
        return { message: "error", error }
    }

}