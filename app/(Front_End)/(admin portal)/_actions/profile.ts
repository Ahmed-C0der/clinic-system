"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId, verifyAccessToken } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { accessTokenPayload } from "@/lib/models";
import { redirect } from "next/navigation";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: "male" | "female" | "other";
  profileImg: string | null;
};

export type ProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

/** Fetches the signed-in admin's own profile for the edit form. */
export async function getOwnProfile(): Promise<AdminProfile|{
  status : string,
  message : string
}> {
  const cookiesStore = await cookies()
  const access_token = cookiesStore.get("access_token")?.value
  const payload = verifyAccessToken(access_token!) as accessTokenPayload
  if (!payload) return { status: "error", message: "Unauthorized: missing or invalid token." };
  const userId = payload?.id

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      profileImg: true,
    },
  });

  return user;
}

/** Updates name / phone / gender / profileImg for the signed-in admin. */
export async function updateOwnProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const userId = await getCurrentUserId();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const gender = String(formData.get("gender") ?? "");
  const profileImg = String(formData.get("profileImg") ?? "").trim();

  if (!name) {
    return { status: "error", message: "الاسم مطلوب" };
  }
  if (!["male", "female", "other"].includes(gender)) {
    return { status: "error", message: "الرجاء اختيار الجنس" };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone: phone || null,
        gender: gender as "male" | "female" | "other",
        profileImg: profileImg || null,
      },
    });
  } catch (err) {
    return { status: "error", message: "تعذر حفظ التغييرات، حاول مجدداً" };
  }

  revalidatePath("/admin/profile");
  return { status: "success", message: "تم حفظ التغييرات بنجاح" };
}

/** Changes the signed-in admin's password after verifying the current one. */
export async function updateOwnPassword(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login")
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (newPassword.length < 8) {
    return { status: "error", message: "كلمة المرور يجب ألا تقل عن 8 أحرف" };
  }
  if (newPassword !== confirmPassword) {
    return { status: "error", message: "كلمتا المرور غير متطابقتين" };
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { passwordHash: true },
  });

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return { status: "error", message: "كلمة المرور الحالية غير صحيحة" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return { status: "success", message: "تم تغيير كلمة المرور بنجاح" };
}
