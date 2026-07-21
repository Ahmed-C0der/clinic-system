"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { AdminUserRow } from "../_types";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

async function validateAdmin(): Promise<void> {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get('access_token')?.value;
  if (!accessToken) throw new Error("Unauthorized: No session token found");
  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== 'admin') throw new Error("Forbidden: Admin access required");
}

/**
 * Fetches every user for the admin "Users / Patients" table.
 * visitsCount = number of appointments belonging to the user's linked
 * Patient record (0 when the user has no patient profile, e.g. staff).
 */
export async function getAdminUsers(): Promise<AdminUserRow[]> {
  await validateAdmin();
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      gender: true,
      role: true,
      isActive: true,
      profileImg: true,
      patient: {
        select: {
          id: true,
          _count: { select: { appointments: true } },
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    gender: u.gender,
    role: u.role,
    isActive: u.isActive,
    profileImg: u.profileImg,
    patientId: u.patient?.id ?? null,
    visitsCount: u.patient?._count.appointments ?? 0,
  }));
}

/** Soft-deletes a user (sets deletedAt) and refreshes the admin tables page. */
export async function softDeleteUser(userId: string) {
  await validateAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
  revalidatePath("/admin/tables");
}

/** Toggles a user's active/suspended state. */
export async function toggleUserActive(userId: string, isActive: boolean) {
  await validateAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
  revalidatePath("/admin/tables");
}
