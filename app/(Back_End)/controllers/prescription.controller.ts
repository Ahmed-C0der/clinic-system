import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// ============================================================
// Errors — throw these from the service, catch them once in
// your route handlers to map to HTTP status codes (404/422).
// ============================================================
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
    items: { orderBy: { id: 'asc' as const } },
  };

  // ---------------- Create ----------------

  static async create(input: unknown) {
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

  static async getById(id: string) {
    const prescription = await prisma.prescription.findFirst({
      where: { id, deletedAt: null },
      include: this.withItems,
    });
    if (!prescription) throw new NotFoundError('Prescription not found');
    return prescription;
  }

  // ---------------- Update (notes only — items are managed separately) ----------------

  static async updateNotes(id: string, input: unknown) {
    const { notes } = updateNotesSchema.parse(input);
    await this.assertExists(id);

    return prisma.prescription.update({
      where: { id },
      data: { notes },
      include: this.withItems,
    });
  }

  // ---------------- PDF export ----------------

  static async generatePdfBuffer(id: string): Promise<Buffer> {
    const prescription = await this.getById(id);
    // Lazy import keeps the heavy PDF renderer out of hot paths that
    // never touch the export endpoint.
    const { renderPrescriptionPdf } = await import('@/lib/pdf/prescription-pdf');
    return renderPrescriptionPdf(prescription);
  }

  // ---------------- Item sub-resource ----------------

  static async addItem(prescriptionId: string, input: unknown) {
    const data = prescriptionItemSchema.parse(input);
    await this.assertExists(prescriptionId);

    return prisma.prescriptionItem.create({
      data: { ...data, prescriptionId },
    });
  }

  static async updateItem(prescriptionId: string, itemId: string, input: unknown) {
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

  static async removeItem(prescriptionId: string, itemId: string) {
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