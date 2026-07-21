"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth"

async function validateAdmin(): Promise<void> {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get('access_token')?.value;
  if (!accessToken) throw new Error("Unauthorized: No session token found");
  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== 'admin') throw new Error("Forbidden: Admin access required");
}

export type AdminUserRow = {
  id: string
  patientId: string | null
  name: string
  email: string
  phone: string | null
  gender: "male" | "female" | "other"
  role: "admin" | "doctor" | "receptionist" | "patient"
  visitsCount: number
}

/**
 * Users table data for /admin-dashboard/tables.
 * visitsCount is derived (not stored): sum of Visit rows across all of a
 * patient's Appointments. Non-patient users (admin/doctor/receptionist)
 * get visitsCount = 0 and no expand affordance.
 */
export async function getUsersTableData(): Promise<AdminUserRow[]> {
  await validateAdmin();
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: {
      patient: {
        include: {
          appointments: {
            select: { visits: { select: { id: true } } },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return users.map((user): AdminUserRow => {
    const visitsCount =
      user.patient?.appointments.reduce((sum, appt) => sum + appt.visits.length, 0) ?? 0

    return {
      id: user.id,
      patientId: user.patient?.id ?? null,
      name: user.name,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      role: user.role,
      visitsCount,
    }
  })
}

/** Medical files belonging to a single patient, most recent first. */
export async function getPatientMedicalFiles(patientId: string) {
  await validateAdmin();
  return prisma.medicalFile.findMany({
    where: { patientId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      fileUrl: true,
      uploadedAt: true,
    },
  })
}