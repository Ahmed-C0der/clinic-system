"use server"

import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// ============================================================
// Types
// ============================================================
export type AppointmentWithPatient = Prisma.AppointmentGetPayload<{
  include: { patient: { include: { user: true } } }
}>

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string }

// ============================================================
// Validation schemas
// ============================================================
const patientCodeSchema = z
  .string()
  .trim()
  .min(1, "كود المريض مطلوب")
  .max(50, "كود المريض غير صالح")
  .regex(/^[a-zA-Z0-9-]+$/, "كود المريض يحتوي على رموز غير مسموحة")

// ============================================================
// Helpers
// ============================================================
const getTodayRange = () => ({
  gte: new Date(new Date().setHours(0, 0, 0, 0)),
  lt: new Date(new Date().setHours(23, 59, 59, 999)),
})

// ============================================================
// Actions
// ============================================================

/**
 * يجيب كل المواعيد بتاريخ النهاردة وحالتها "waiting"
 */
export const getAppointments = async (): Promise<
  ActionResult<AppointmentWithPatient[]>
> => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        scheduledAt: getTodayRange(),
        status: "waiting",
      },
      include: {
        patient: {
          include: { user: true },
        },
      },
      orderBy: { scheduledAt: "asc" },
    })

    return { success: true, data: appointments }
  } catch (error) {
    console.error("getAppointments error:", error)
    return {
      success: false,
      error: "حدث خطأ أثناء تحميل قائمة الانتظار، حاول مرة أخرى",
    }
  }
}

/**
 * يبحث عن المريض بالـ patientCode، ولو عنده موعد "scheduled" النهاردة
 * بيحوّل حالته لـ "waiting"
 */
export const searchByPatientCode = async (
  rawPatientCode: string
): Promise<ActionResult<AppointmentWithPatient>> => {
  // ---- validation ----
  const parsed = patientCodeSchema.safeParse(rawPatientCode)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "كود المريض غير صالح",
    }
  }
  const patientCode = parsed.data

  try {
    const patient = await prisma.patient.findUnique({
      where: { patientCode },
    })

    if (!patient) {
      return { success: false, error: "لا يوجد مريض بهذا الكود" }
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        scheduledAt: getTodayRange(),
        status: "scheduled",
      },
      include: {
        patient: { include: { user: true } },
      },
    })

    if (!appointment) {
      return {
        success: false,
        error: "لا يوجد موعد مجدول لهذا المريض النهاردة",
      }
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "waiting" },
      include: {
        patient: { include: { user: true } },
      },
    })

    revalidatePath("/receptionist/appointments")
    return { success: true, data: updatedAppointment }
  } catch (error) {
    console.error("searchByPatientCode error:", error)
    return {
      success: false,
      error: "حدث خطأ أثناء البحث عن المريض، حاول مرة أخرى",
    }
  }
}