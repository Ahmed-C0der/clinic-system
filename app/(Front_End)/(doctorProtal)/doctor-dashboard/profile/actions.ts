"use server"

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { verifyAccessToken } from "@/lib/auth";
import { cookies } from "next/headers";

export type DoctorProfileActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function updateDoctorProfile(
  _prevState: DoctorProfileActionState,
  formData: FormData
): Promise<DoctorProfileActionState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  if (!accessToken) {
    return { status: "error", message: "غير مصرح به" };
  }

  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== "doctor") {
    return { status: "error", message: "غير مصرح به" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const licenseNumber = String(formData.get("licenseNumber") ?? "").trim();
  const specialty = String(formData.get("specialty") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const consultationFee = formData.get("consultationFee");
  const slotDuration = formData.get("slotDuration");

  if (!name) {
    return { status: "error", message: "الاسم مطلوب" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: payload.id },
        data: {
          name,
          phone: phone || null,
        },
      });

      const doctorData: any = {};
      if (licenseNumber) doctorData.licenseNumber = licenseNumber;
      if (specialty) doctorData.specialty = specialty;
      if (bio) doctorData.bio = bio;
      if (consultationFee) doctorData.consultationFee = Number(consultationFee);
      if (slotDuration) doctorData.slotDuration = Number(slotDuration);

      if (Object.keys(doctorData).length > 0) {
        await tx.doctor.update({
          where: { userId: payload.id },
          data: doctorData,
        });
      }
    });

    revalidatePath("/doctor-dashboard/profile");
    return { status: "success", message: "تم حفظ التغييرات بنجاح" };
  } catch (error) {
    console.error(error);
    return { status: "error", message: "تعذر حفظ التغييرات، حاول مجدداً" };
  }
}
