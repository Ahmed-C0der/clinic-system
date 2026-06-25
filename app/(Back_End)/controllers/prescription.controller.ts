import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/lib/generated/prisma/enums';
import { getPaginationParams } from '@/lib/utils';
import { generatePrescriptionPDF } from '@/app/services/medicalFile.service';


export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}




export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// ============================================================
// Validation schemas
// ============================================================
const prescriptionItemSchema = z.object({
  medicineName: z.string().trim().min(1).max(150),
  dosage: z.string().trim().max(50).optional(),
  frequency: z.string().trim().max(100).optional(),
  duration: z.string().trim().max(50).optional(),
  instructions: z.string().trim().max(2000).optional(),
});

const createPrescriptionSchema = z.object({
  visitId: z.string().uuid(),
  notes: z.string().trim().max(2000).optional(),
  items: z
    .array(prescriptionItemSchema)
    .min(1, 'At least one medication item is required'),
});

const updateNotesSchema = z.object({
  notes: z.string().trim().max(2000).nullable(),
});

const updateItemSchema = prescriptionItemSchema.partial();

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// ============================================================
// Service
// ============================================================
export class PrescriptionService {
  /** Consistent include shape used across reads — keeps item ordering stable for the UI. */
  private static readonly withItems = {
    items: { orderBy: { medicineName: 'asc' as const } },
  };

  //----------------list----------------


  static async list(req: NextRequest) {
    const auth = authenticate(req, [Role.admin , Role.doctor , Role.receptionist , Role.patient])
    if (auth instanceof NextResponse) return auth
    const { page, limit, skip } = getPaginationParams(req)

    const [total, prescriptions] = await Promise.all([
      prisma.prescription.count({
        where: { deletedAt: null }
      })
      , prisma.prescription.findMany({
        include: this.withItems,
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' as const },
        take: limit,
        skip
      })
    ])

    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      message: 'Prescriptions fetched successfully',
      data: prescriptions,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,

      }
    });

  }
  // ---------------- Create ----------------

  static async create(req: NextRequest,input: unknown) {
    const auth = authenticate(req, [Role.admin,Role.doctor, Role.receptionist])
    if (auth instanceof NextResponse) return auth
    const data = createPrescriptionSchema.parse(input);
    const visit = await prisma.visit.findFirst({
      where: { id: data.visitId, deletedAt: null },
      select: { id: true },
    });
    if (!visit) throw new NotFoundError('Visit not found');

    return prisma.prescription.create({
      data: {
        visitId: data.visitId,
        notes: data.notes,
        items: { create: data.items },
      },
      include: this.withItems,
    });
  }

  // ---------------- Read ----------------

  static async getById( req: NextRequest,id: string,authUsers:string[]) {
    const auth = authenticate(req, authUsers.length>0 ? authUsers : [Role.admin,Role.doctor, Role.receptionist])
    if (auth instanceof NextResponse) return auth
    const prescription = await prisma.prescription.findFirst({
      where: { id, deletedAt: null },
      include: this.withItems,
    });
    if (!prescription) throw new NotFoundError('Prescription not found');
    return prescription;
  }

  // ---------------- Update (notes only — items are managed separately) ----------------

  static async updateNotes(req: NextRequest,id: string, input: unknown,) {
    const { notes } = updateNotesSchema.parse(input);
    await this.assertExists(id);
    const auth = authenticate(req, [Role.admin,Role.doctor, Role.receptionist])
    if (auth instanceof NextResponse) return auth
    return prisma.prescription.update({
      where: { id },
      data: { notes },
      include: this.withItems,
    });
  }

  // ---------------- PDF export ----------------

  static async generatePdf( req: NextRequest, id: string) {
    const auth = authenticate(req, [Role.admin,Role.doctor, Role.receptionist,Role.patient])
    if (auth instanceof NextResponse) return auth
    const medicalFile = await generatePrescriptionPDF(id);
    return NextResponse.json({
      success: true,
      fileUrl: medicalFile.fileUrl,   
    });
  }

  // ---------------- Item sub-resource ----------------

  static async addItem(req: NextRequest,prescriptionId: string, input: unknown) {
    const auth = authenticate(req, [Role.admin,Role.doctor, Role.receptionist])
    if (auth instanceof NextResponse) return auth
    const data = prescriptionItemSchema.parse(input);
    await this.assertExists(prescriptionId);

    return prisma.prescriptionItem.create({
      data: { ...data, prescriptionId },
    });
  }

  static async updateItem(req: NextRequest,prescriptionId: string, itemId: string, input: unknown) {
    const auth = authenticate(req, [Role.admin,Role.doctor, Role.receptionist])
    if (auth instanceof NextResponse) return auth
    const data = updateItemSchema.parse(input);
    if (Object.keys(data).length === 0) {
      throw new ValidationError('No fields provided to update');
    }
    await this.assertItemBelongsTo(prescriptionId, itemId);

    return prisma.prescriptionItem.update({
      where: { id: itemId },
      data,
    });
  }

  static async removeItem(req:NextRequest,prescriptionId: string, itemId: string) {
    const auth = authenticate(req, [Role.admin,Role.doctor, Role.receptionist])
    if (auth instanceof NextResponse) return auth
    await this.assertItemBelongsTo(prescriptionId, itemId);

    // Business rule: a prescription must always have at least one item.
    // If the doctor wants to remove the last one, they should void/delete
    // the prescription itself (soft delete) instead.
    const remaining = await prisma.prescriptionItem.count({
      where: { prescriptionId },
    });
    if (remaining <= 1) {
      throw new ValidationError(
        'Cannot remove the last medication item — delete the prescription instead'
      );
    }

    await prisma.prescriptionItem.delete({ where: { id: itemId } });
    return { success: true as const };
  }

  // ---------------- internal guards ----------------

  private static async assertExists(id: string) {
    const exists = await prisma.prescription.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!exists) throw new NotFoundError('Prescription not found');
  }

  private static async assertItemBelongsTo(prescriptionId: string, itemId: string) {
    await this.assertExists(prescriptionId);
    const item = await prisma.prescriptionItem.findFirst({
      where: { id: itemId, prescriptionId },
      select: { id: true },
    });
    if (!item) throw new NotFoundError('Prescription item not found');
  }
}