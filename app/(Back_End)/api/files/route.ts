import { verifyAccessToken } from "@/lib/auth";
import { MedicalFileSource, MedicalFileType } from "@/lib/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

async function Post(req: NextRequest) {
    const cokiesStore = await cookies()
    const access_token = cokiesStore.get("access_token")?.value
    if (!access_token) {
        return NextResponse.json({
            success: false,
            error: "user not authanticated"
        })

    }
    const user = verifyAccessToken(access_token)
    const body = await req.json()
   const {
  fileName,
  fileType,
  fileUrl,
  sourceType,
  fileSizeBytes,
  patientId,
} = body;

if (
  !fileName ||
  !fileType ||
  !fileUrl ||
  fileSizeBytes == null ||
  !patientId
) {
  return NextResponse.json(
    {
      success: false,
      error: "All required file fields are required",
    },
    { status: 400 }
  );
}

const medicalFile = await prisma.medicalFile.create({
  data: {
    fileName,
    fileType,
    fileUrl,
    fileSizeBytes,
    sourceType,
    patient: {
      connect: {
        id: patientId,
      },
    },
  },
});

return NextResponse.json({
  success: true,
  data: medicalFile,
});
}