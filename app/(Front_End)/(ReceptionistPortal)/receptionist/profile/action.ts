"use server"
// TODO: edit return statement to suit edit on the type
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import bcrypt from "bcrypt" 
import { Gender, Prisma } from "@/lib/generated/prisma/client"

// ============================================================
// Types
// ============================================================
export type UserProfile = Prisma.UserGetPayload<{
  select: {
    id: true
    name: true
    email: true
    phone: true
    gender: true
    profileImg: true
    role: true
  }
}>

export type ActionResult<T> =
  | { success: true; data: T ,error:null}
  | { success: false; error: string , data:null }

// ============================================================
// Validation schemas
// ============================================================
const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم يجب أن يكون حرفين على الأقل")
    .max(150, "الاسم طويل جداً"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("البريد الإلكتروني غير صالح")
    .max(255, "البريد الإلكتروني طويل جداً"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{8,20}$/, "رقم الهاتف غير صالح")
    .optional()
    .or(z.literal("")),
  gender: z.enum([Gender.male, Gender.female], {
    errorMap: () => ({ message: "النوع غير صالح" }),
  }),
})

const profileImgSchema = z
  .string()
  .trim()
  .min(1, "رابط الصورة مطلوب")
  .max(1000, "رابط الصورة غير صالح")

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "كلمة المرور الحالية مطلوبة"),
    newPassword: z
      .string()
      .min(8, "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل")
      .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير واحد على الأقل")
      .regex(/[0-9]/, "يجب أن تحتوي على رقم واحد على الأقل"),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "كلمة المرور الجديدة يجب أن تكون مختلفة عن الحالية",
    path: ["newPassword"],
  })

// ============================================================
// Actions
// ============================================================

/**
 * يجيب بيانات البروفايل الخاصة بالمستخدم الحالي
 */
export const getCurrentUserProfile = async (): Promise<
  ActionResult<UserProfile>
> => {
  const currentUser = await getCurrentUserProfile()
  if (!currentUser) {
    return { success: false, error: "يجب تسجيل الدخول أولاً",data:null }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.data?.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        profileImg: true,
        role: true,
      },
    })

    if (!user) {
      return { success: false, error: "المستخدم غير موجود",data:null }
    }

    return { success: true, data: user,error:null }
  } catch (error) {
    console.error("getCurrentUserProfile error:", error)
    return { success: false, error: "حدث خطأ أثناء تحميل بيانات البروفايل",data:null }
  }
}

/**
 * يعدّل الاسم / الإيميل / الهاتف / النوع
 */
export const updateProfile = async (
  input: z.infer<typeof updateProfileSchema>
): Promise<ActionResult<UserProfile>> => {
  const currentUser = await getCurrentUserProfile()
  if (!currentUser) {
    return { success: false, error: "يجب تسجيل الدخول أولاً",data:null }
  }

  const parsed = updateProfileSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",data:null
    }
  }

  const { name, email, phone, gender } = parsed.data

  try {
    // تأكيد إن الإيميل مش مستخدم من حساب تاني
    const existingUser = await prisma.user.findFirst({
      where: { email, NOT: { id: currentUser.data?.id } },
      select: { id: true },
    })

    if (existingUser) {
      return { success: false, error: "البريد الإلكتروني مستخدم بالفعل",data:null }
    }

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.data?.id },
      data: {
        name,
        email,
        phone: phone && phone.length > 0 ? phone : null,
        gender,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        profileImg: true,
        role: true,
      },
    })

    revalidatePath("/profile")
    return { success: true, data: updatedUser ,error:null}
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { success: false, error: "البريد الإلكتروني مستخدم بالفعل",data:null }
    }
    console.error("updateProfile error:", error)
    return { success: false, error: "حدث خطأ أثناء تحديث البيانات",data:null }
  }
}

/**
 * يحدّث رابط الصورة الشخصية بعد رفعها (من EditableAvatar)
 */
export const updateProfileImage = async (
  imageUrl: string
): Promise<ActionResult<Pick<UserProfile, "id" | "profileImg">>> => {
  const currentUser = await getCurrentUserProfile()
  if (!currentUser) {
    return { success: false, error: "يجب تسجيل الدخول أولاً",data:null }
  }

  const parsed = profileImgSchema.safeParse(imageUrl)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "رابط الصورة غير صالح",data:null
    }
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.data?.id },
      data: { profileImg: parsed.data },
      select: { id: true, profileImg: true },
    })

    revalidatePath("/profile")
    return { success: true, data: updatedUser,error:null }
  } catch (error) {
    console.error("updateProfileImage error:", error)
    return { success: false, error: "حدث خطأ أثناء تحديث الصورة الشخصية",data:null }
  }
}

/**
 * يغيّر كلمة المرور بعد التأكد من كلمة المرور الحالية
 */
export const changePassword = async (
  input: z.infer<typeof changePasswordSchema>
): Promise<ActionResult<null>> => {
  const currentUser = await getCurrentUserProfile()
  if (!currentUser) {
    return { success: false, error: "يجب تسجيل الدخول أولاً",data:null }
  }

  const parsed = changePasswordSchema.safeParse(input)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة",data:null
    }
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.data?.id },
      select: { passwordHash: true },
    })

    if (!user) {
      return { success: false, error: "المستخدم غير موجود",data:null }
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash
    )

    if (!isCurrentPasswordValid) {
      return { success: false, error: "كلمة المرور الحالية غير صحيحة",data:null }
    }

    const newPasswordHash = await bcrypt.hash(parsed.data.newPassword, 10)

    await prisma.user.update({
      where: { id: currentUser.data?.id },
      data: { passwordHash: newPasswordHash },
    })

    return { success: true, data: null,error:null }
  } catch (error) {
    console.error("changePassword error:", error)
    return { success: false, error: "حدث خطأ أثناء تغيير كلمة المرور",data:null }
  }
}