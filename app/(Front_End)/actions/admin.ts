"use server"

import { prisma } from "@/lib/prisma"

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