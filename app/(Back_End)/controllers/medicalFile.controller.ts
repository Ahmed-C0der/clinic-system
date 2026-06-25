// TODO : Review Medical File controller
// src/app/controllers/medicalFiles.controller.ts
import { z }                         from "zod";
import { prisma }                    from "@/lib/prisma";
import { authenticate }              from "@/lib/auth";
import { getPaginationParams }       from "@/lib/utils";
import { uploadMedicalFile }         from "@/lib/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import {
  Role,
  MedicalFileType,
  MedicalFileSource,
} from "@/lib/generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME_TYPES: Record<MedicalFileType, string[]> = {
  lab:    ["application/pdf", "image/jpeg", "image/png"],
  xray:   ["image/jpeg", "image/png", "image/dicom", "application/dicom"],
  report: ["application/pdf", "application/msword",
           "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  other:  ["application/pdf", "image/jpeg", "image/png", "image/gif",
           "application/octet-stream"],
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom errors
// ─────────────────────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(message: string) { super(message); this.name = "NotFoundError"; }
}

export class ValidationError extends Error {
  constructor(message: string) { super(message); this.name = "ValidationError"; }
}

export class ForbiddenError extends Error {
  constructor(message: string) { super(message); this.name = "ForbiddenError"; }
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────────────────────────────────────

const uploadFieldsSchema = z.object({
  file_type:   z.nativeEnum(MedicalFileType),
  visit_id:    z.string().uuid().optional(),
  source_type: z.nativeEnum(MedicalFileSource).optional().default(MedicalFileSource.manual),
});

const listQuerySchema = z.object({
  file_type: z.nativeEnum(MedicalFileType).optional(),
  visit_id:  z.string().uuid().optional(),
  from:      z.coerce.date().optional(),
  to:        z.coerce.date().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Build an uploadedAt date filter, extending `to` to end-of-day. */
function buildDateFilter(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (from) filter.gte = from;
  if (to) {
    const d = new Date(to);
    d.setUTCHours(23, 59, 59, 999);
    filter.lte = d;
  }
  return filter;
}

/**
 * Verify that the requesting user is allowed to access a patient's files.
 * Rules:
 *   - admin / receptionist / doctor → always allowed
 *   - patient                       → only their own files
 */
async function assertPatientAccess(
  auth:      { user: { role: string; patientId?: string } },
  patientId: string,
) {
  const publicRoles: string[] = [Role.admin, Role.receptionist, Role.doctor];
  if (publicRoles.includes(auth.user.role)) return;

  if (auth.user.role === Role.patient) {
    // Resolve the patient row that belongs to this user
    if (auth.user.patientId !== patientId) {
      throw new ForbiddenError("You can only access your own medical files");
    }
    return;
  }

  throw new ForbiddenError("Insufficient permissions");
}

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────

export class MedicalFilesController {

  // ── POST /api/v2/patients/:id/files ─────────────────────────────────────

  /**
   * Upload a medical file (multipart/form-data).
   * Allowed roles: admin, receptionist, doctor, patient (own files only).
   * Max size: 20 MB.
   */
  static async upload(req: NextRequest, patientId: string) {
    const auth = await authenticate(req, [
      Role.admin, Role.receptionist, Role.doctor, Role.patient,
    ]);
    if (auth instanceof NextResponse) return auth;

    // ── Access check ──────────────────────────────────────────────────────
    try {
      await assertPatientAccess(auth, patientId);
    } catch (err) {
      if (err instanceof ForbiddenError)
        return NextResponse.json({ error: err.message }, { status: 403 });
      throw err;
    }

    // ── Patient must exist ────────────────────────────────────────────────
    const patient = await prisma.patient.findFirst({
      where:  { id: patientId, deletedAt: null },
      select: { id: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // ── Parse multipart form ──────────────────────────────────────────────
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json({ error: "Invalid multipart/form-data" }, { status: 400 });
    }

    const rawFile = formData.get("file");
    if (!rawFile || !(rawFile instanceof File)) {
      return NextResponse.json({ error: "file field is required" }, { status: 400 });
    }

    // ── Validate form fields ──────────────────────────────────────────────
    const parsed = uploadFieldsSchema.safeParse({
      file_type:   formData.get("file_type"),
      visit_id:    formData.get("visit_id")    ?? undefined,
      source_type: formData.get("source_type") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { file_type, visit_id, source_type } = parsed.data;

    // ── File size guard ───────────────────────────────────────────────────
    if (rawFile.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB` },
        { status: 413 },
      );
    }

    // ── MIME type guard ───────────────────────────────────────────────────
    const allowed = ALLOWED_MIME_TYPES[file_type];
    if (!allowed.includes(rawFile.type)) {
      return NextResponse.json(
        { error: `File type '${rawFile.type}' is not allowed for ${file_type}` },
        { status: 415 },
      );
    }

    // ── Validate visit belongs to patient (if provided) ───────────────────
    if (visit_id) {
      const visit = await prisma.visit.findFirst({
        where:  { id: visit_id, appointment: { patientId } },
        select: { id: true },
      });
      if (!visit) {
        return NextResponse.json(
          { error: "Visit not found or does not belong to this patient" },
          { status: 404 },
        );
      }
    }

    // ── Upload to Cloudinary ──────────────────────────────────────────────
    const arrayBuffer = await rawFile.arrayBuffer();
    const buffer      = Buffer.from(arrayBuffer);

    // Sanitise filename: strip spaces/special chars, keep extension
    const safeName = rawFile.name
      .replace(/[^a-zA-Z0-9.\-_]/g, "_")
      .slice(0, 200);

    const cloudinaryFileName = `${file_type}_${patientId}_${Date.now()}_${safeName}`;

    let uploadResult: { secure_url: string; bytes: number };
    try {
      uploadResult = await uploadMedicalFile(buffer, cloudinaryFileName, patientId);
    } catch (err) {
      console.error("[MedicalFiles] Cloudinary upload failed:", err);
      return NextResponse.json({ error: "File upload failed" }, { status: 502 });
    }

    // ── Persist MedicalFile record ────────────────────────────────────────
    const medicalFile = await prisma.medicalFile.create({
      data: {
        patientId,
        visitId:       visit_id    ?? null,
        sourceType:    source_type,
        fileType:      file_type,
        fileName:      safeName,
        fileUrl:       uploadResult.secure_url,
        fileSizeBytes: uploadResult.bytes,
      },
    });

    return NextResponse.json(
      { success: true, data: medicalFile },
      { status: 201 },
    );
  }

  // ── GET /api/v2/patients/:id/files ──────────────────────────────────────

  /**
   * List medical files for a patient with optional filters + pagination.
   * Allowed roles: admin, receptionist, doctor, patient (own files only).
   */
  static async list(req: NextRequest, patientId: string) {
    const auth = await authenticate(req, [
      Role.admin, Role.receptionist, Role.doctor, Role.patient,
    ]);
    if (auth instanceof NextResponse) return auth;

    // ── Access check ──────────────────────────────────────────────────────
    try {
      await assertPatientAccess(auth, patientId);
    } catch (err) {
      if (err instanceof ForbiddenError)
        return NextResponse.json({ error: err.message }, { status: 403 });
      throw err;
    }

    // ── Patient must exist ────────────────────────────────────────────────
    const patient = await prisma.patient.findFirst({
      where:  { id: patientId, deletedAt: null },
      select: { id: true },
    });
    if (!patient) return NextResponse.json({ error: "Patient not found" }, { status: 404 });

    // ── Parse query params ────────────────────────────────────────────────
    const { searchParams } = new URL(req.url);
    const queryParsed = listQuerySchema.safeParse({
      file_type: searchParams.get("file_type") ?? undefined,
      visit_id:  searchParams.get("visit_id")  ?? undefined,
      from:      searchParams.get("from")      ?? undefined,
      to:        searchParams.get("to")        ?? undefined,
    });

    if (!queryParsed.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: queryParsed.error.flatten() },
        { status: 400 },
      );
    }

    const { file_type, visit_id, from, to } = queryParsed.data;
    const { page, limit, skip }             = getPaginationParams(req);
    const uploadedAtFilter                  = buildDateFilter(from, to);

    const where = {
      patientId,
      ...(file_type        && { fileType:   file_type }),
      ...(visit_id         && { visitId:    visit_id }),
      ...(uploadedAtFilter && { uploadedAt: uploadedAtFilter }),
    };

    const [total, files] = await Promise.all([
      prisma.medicalFile.count({ where }),
      prisma.medicalFile.findMany({
        where,
        orderBy: { uploadedAt: "desc" },
        take:    limit,
        skip,
        select: {
          id:            true,
          fileName:      true,
          fileType:      true,
          fileUrl:       true,
          fileSizeBytes: true,
          sourceType:    true,
          visitId:       true,
          uploadedAt:    true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: files,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }

  // ── DELETE /api/v2/patients/:id/files/:fileId ────────────────────────────

  /**
   * Delete a medical file record and remove it from Cloudinary.
   * Allowed roles: admin, receptionist.
   * Patients and doctors cannot delete files (read-only for them).
   */
  static async remove(req: NextRequest, patientId: string, fileId: string) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist]);
    if (auth instanceof NextResponse) return auth;

    // ── Find file and verify it belongs to this patient ───────────────────
    const file = await prisma.medicalFile.findFirst({
      where: { id: fileId, patientId },
    });
    if (!file) {
      return NextResponse.json(
        { error: "File not found or does not belong to this patient" },
        { status: 404 },
      );
    }

    // ── Delete from Cloudinary ────────────────────────────────────────────
    // Extract public_id from the secure_url
    // Cloudinary URLs follow: .../upload/v{version}/{public_id}.{ext}
    try {
      const { v2: cloudinary } = await import("cloudinary");
      const urlParts  = file.fileUrl.split("/upload/");
      if (urlParts.length === 2) {
        // Remove version segment (v1234567890/) and extension
        const withoutVersion = urlParts[1].replace(/^v\d+\//, "");
        const publicId       = withoutVersion.replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      }
    } catch (err) {
      // Log but don't block DB deletion — file may already be gone from Cloudinary
      console.error("[MedicalFiles] Cloudinary deletion failed:", err);
    }

    // ── Delete DB record ──────────────────────────────────────────────────
    await prisma.medicalFile.delete({ where: { id: fileId } });

    return NextResponse.json({ success: true });
  }
}