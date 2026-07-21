"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { MedicalFileRow } from "../_types";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

async function validateAdmin(): Promise<void> {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get('access_token')?.value;
  if (!accessToken) throw new Error("Unauthorized: No session token found");
  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== 'admin') throw new Error("Forbidden: Admin access required");
}

/** Fetches medical files (labs, x-rays, reports...) for a given patient. */
export async function getMedicalFilesByPatient(
  patientId: string
): Promise<MedicalFileRow[]> {
  await validateAdmin();
  const files = await prisma.medicalFile.findMany({
    where: { patientId },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true,
      fileName: true,
      fileType: true,
      sourceType: true,
      fileUrl: true,
      uploadedAt: true,
    },
  });

  return files;
}

/** Deletes a medical file record and revalidates the tables page. */
export async function deleteMedicalFile(fileId: string) {
  await validateAdmin();
  await prisma.medicalFile.delete({ where: { id: fileId } });
  revalidatePath("/admin/tables");
}
