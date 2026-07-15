"use server"
import z from "zod"

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

export async function registerFormAction(prevState: any, formData: FormData) {
 
  const raw = {
    email: formData.get("email"),
    name: formData.get("name"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone"),
    gender: formData.get("gender"),
    dob: formData.get("dob"),
  }
  console.log(raw)

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
    return { message: "تم إنشاء الحساب بنجاح", success: true, patient, user: data.user }
  } catch (error) {
    if (error instanceof Error) {
      return { message: "error", error: error.message }
    }
    return { message: "error", error }
  }
}