// TODO : review this controller
import { z } from "zod";
import { Decimal } from "@/lib/generated/prisma/runtime/library";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { getPaginationParams } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { InvoiceStatus, PaymentMethod, Role } from "@/lib/generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// Custom error classes (reuse pattern from doctor.controller.ts)
// ─────────────────────────────────────────────────────────────────────────────

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Zod validation schemas
// ─────────────────────────────────────────────────────────────────────────────

/** A single line-item on the invoice (description + qty + unit price). */
const invoiceItemSchema = z.object({
  description: z.string().trim().min(1).max(255),
  quantity: z.number().int().positive().default(1),
  unitPrice: z.number().nonnegative(),
});

/**
 * POST /api/v2/invoices
 * Body: visitId, discount (optional), items[]
 * patientId and doctorId are resolved from the visit -> appointment relation.
 */
const createInvoiceSchema = z.object({
  visitId: z.string().uuid(),
  discount: z.number().nonnegative().default(0),
  items: z.array(invoiceItemSchema).min(1, "At least one line item is required"),
});

/**
 * PUT /api/v2/invoices/:id
 * All fields optional; at least one required.
 * Only allowed while invoice is pending or partial (not fully paid).
 */
const updateInvoiceSchema = z
  .object({
    discount: z.number().nonnegative().optional(),
    items: z.array(invoiceItemSchema).min(1).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, "No fields provided to update");

/**
 * POST /api/v2/invoices/:id/payments
 * Records one payment (full or partial).
 */
const recordPaymentSchema = z.object({
  amount: z.number().positive(),
  method: z.nativeEnum(PaymentMethod),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Helper: generate sequential invoice number  e.g. "INV-20260624-0042"
// ─────────────────────────────────────────────────────────────────────────────

async function generateInvoiceNumber(): Promise<string> {
  const today = new Date();
  const datePart = today.toISOString().slice(0, 10).replace(/-/g, ""); // "20260624"
  const prefix = `INV-${datePart}-`;

  // Count how many invoices were created today to build a zero-padded sequence.
  const startOfDay = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())
  );
  const endOfDay = new Date(startOfDay.getTime() + 86_400_000);

  const count = await prisma.invoice.count({
    where: { createdAt: { gte: startOfDay, lt: endOfDay } },
  });

  const sequence = String(count + 1).padStart(4, "0"); // "0001"
  return `${prefix}${sequence}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: compute item totals, subtotal, and grand total
// ─────────────────────────────────────────────────────────────────────────────

function computeTotals(
  items: Array<{ quantity: number; unitPrice: number; description: string }>,
  discount: number
) {
  const itemsWithTotals = items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const subtotal = itemsWithTotals.reduce((sum, i) => sum + i.total, 0);
  const total = Math.max(0, subtotal - discount);
  return { itemsWithTotals, subtotal, total };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: derive new status after a payment is recorded
// ─────────────────────────────────────────────────────────────────────────────

function deriveStatus(total: Decimal, paidAmount: Decimal): InvoiceStatus {
  if (paidAmount.gte(total)) return InvoiceStatus.paid;
  if (paidAmount.gt(new Decimal(0))) return InvoiceStatus.partial;
  return InvoiceStatus.pending;
}

// ─────────────────────────────────────────────────────────────────────────────
// Controller class
// ─────────────────────────────────────────────────────────────────────────────

export class InvoicesController {
  // ── POST /api/v2/invoices ─────────────────────────────────────────────────

  /**
   * Create a new invoice linked to a visit.
   * Resolves patientId + doctorId from visit -> appointment.
   * Enforces one-invoice-per-visit rule.
   * Allowed roles: doctor, receptionist, admin.
   */
  static async create(req: NextRequest) {
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const input = createInvoiceSchema.parse(body);

    // Resolve visit -> appointment to get patientId + doctorId
    const visit = await prisma.visit.findUnique({
      where: { id: input.visitId },
      include: {
        appointment: { select: { patientId: true, doctorId: true } },
      },
    });
    if (!visit) throw new NotFoundError("Visit not found");
    if (visit.deletedAt) throw new ValidationError("Cannot create an invoice for a deleted visit");

    const { patientId, doctorId } = visit.appointment;

    // Guard: one invoice per visit
    const existing = await prisma.invoice.findFirst({
      where: { visitId: input.visitId },
    });
    if (existing) {
      throw new ConflictError(
        `Visit already has an invoice (${existing.invoiceNumber}). Update it instead.`
      );
    }

    const { itemsWithTotals, subtotal, total } = computeTotals(input.items, input.discount);
    const invoiceNumber = await generateInvoiceNumber();

    const invoice = await prisma.invoice.create({
      data: {
        visitId: input.visitId,
        patientId,
        doctorId,
        invoiceNumber,
        subtotal,
        discount: input.discount,
        total,
        paidAmount: 0,
        status: InvoiceStatus.pending,
        items: {
          create: itemsWithTotals.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });

    await logAction({
      tableName: "invoices",
      recordId: invoice.id,
      action: "create",
      newValue: invoice,
      performedBy: auth.user.id,
    });

    return NextResponse.json({ invoice }, { status: 201 });
  }

  // ── GET /api/v2/invoices/:id ──────────────────────────────────────────────

  /**
   * Return the full invoice with line items, payments, patient, doctor, and visit.
   * Patients are only allowed to read their own invoices.
   */
  static async getById(req: NextRequest, invoiceId: string) {
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin, Role.patient]);
    if (auth instanceof NextResponse) return auth;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: { orderBy: { paidAt: "asc" } },
        patient: { select: { id: true, name: true, patientCode: true, phone: true } },
        doctor: {
          select: {
            id: true,
            specialty: true,
            user: { select: { name: true } },
          },
        },
        visit: { select: { id: true, visitDate: true } },
      },
    });

    if (!invoice) throw new NotFoundError("Invoice not found");

    // Patients may only read their own invoices
    if (auth.user.role === Role.patient && invoice.patientId !== auth.user.patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ invoice });
  }

  // ── PUT /api/v2/invoices/:id ──────────────────────────────────────────────

  /**
   * Update an invoice's discount and/or line items.
   * Blocked once the invoice is fully paid.
   * Recalculates subtotal, total, and status automatically.
   * Allowed roles: doctor, receptionist, admin.
   */
  static async update(req: NextRequest, invoiceId: string) {
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const input = updateInvoiceSchema.parse(body);

    const before = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });
    if (!before) throw new NotFoundError("Invoice not found");

    // Business rule: cannot edit a fully paid invoice
    if (before.status === InvoiceStatus.paid) {
      throw new ValidationError("Cannot update a fully paid invoice");
    }

    const newDiscount = input.discount ?? Number(before.discount);
    const rawItems: Array<{ description: string; quantity: number; unitPrice: number }> =
      input.items ??
      before.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      }));

    const { itemsWithTotals, subtotal, total } = computeTotals(rawItems, newDiscount);

    // Re-derive status: new total vs existing paidAmount
    const newStatus = deriveStatus(new Decimal(total), before.paidAmount);

    const updated = await prisma.$transaction(async (tx) => {
      // Replace line items only when new ones were supplied
      if (input.items) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId } });
        await tx.invoiceItem.createMany({
          data: itemsWithTotals.map((item) => ({
            invoiceId,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
          })),
        });
      }

      return tx.invoice.update({
        where: { id: invoiceId },
        data: {
          discount: newDiscount,
          subtotal,
          total,
          status: newStatus,
        },
        include: { items: true },
      });
    });

    await logAction({
      tableName: "invoices",
      recordId: invoiceId,
      action: "update",
      oldValue: before,
      newValue: updated,
      performedBy: auth.user.id,
    });

    return NextResponse.json({ invoice: updated });
  }

  // ── GET /api/v2/invoices/:id/pdf ──────────────────────────────────────────

  /**
   * Return a structured JSON payload ready for a PDF renderer.
   * (Route handler can pipe through @react-pdf/renderer, pdfmake, etc.)
   * Patients can only retrieve their own invoice PDF.
   */
  static async getPdf(req: NextRequest, invoiceId: string) {
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin, Role.patient]);
    if (auth instanceof NextResponse) return auth;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        payments: { orderBy: { paidAt: "asc" } },
        patient: { select: { name: true, patientCode: true, phone: true } },
        doctor: {
          select: {
            specialty: true,
            user: { select: { name: true } },
          },
        },
        visit: { select: { visitDate: true } },
      },
    });

    if (!invoice) throw new NotFoundError("Invoice not found");

    if (auth.user.role === Role.patient && invoice.patientId !== auth.user.patientId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const pdfPayload = {
      invoiceNumber: invoice.invoiceNumber,
      createdAt: invoice.createdAt,
      visitDate: invoice.visit.visitDate,
      patient: invoice.patient,
      doctor: {
        name: invoice.doctor.user.name,
        specialty: invoice.doctor.specialty,
      },
      items: invoice.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      total: Number(invoice.total),
      paidAmount: Number(invoice.paidAmount),
      balance: Math.max(0, Number(invoice.total) - Number(invoice.paidAmount)),
      status: invoice.status,
      payments: invoice.payments.map((p) => ({
        amount: Number(p.amount),
        method: p.method,
        paidAt: p.paidAt,
        notes: p.notes,
      })),
    };

    return NextResponse.json({ pdf: pdfPayload });
  }

  // ── POST /api/v2/invoices/:id/payments ────────────────────────────────────

  /**
   * Record a payment (full or partial) against an invoice.
   * - Rejects payments that exceed the outstanding balance.
   * - Atomically updates paidAmount and status on the invoice.
   * Allowed roles: receptionist, admin.
   */
  static async recordPayment(req: NextRequest, invoiceId: string) {
    const auth = await authenticate(req, [Role.receptionist, Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const body = await req.json();
    const input = recordPaymentSchema.parse(body);

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) throw new NotFoundError("Invoice not found");

    if (invoice.status === InvoiceStatus.paid) {
      throw new ValidationError("Invoice is already fully paid");
    }

    const outstanding = Number(invoice.total) - Number(invoice.paidAmount);
    // Small epsilon to absorb floating-point rounding (e.g. $0.001)
    if (input.amount > outstanding + 0.001) {
      throw new ValidationError(
        `Payment amount (${input.amount}) exceeds outstanding balance (${outstanding.toFixed(2)})`
      );
    }

    const { payment, updatedInvoice } = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount: input.amount,
          method: input.method,
          notes: input.notes,
        },
      });

      const newPaidAmount = Number(invoice.paidAmount) + input.amount;
      const newStatus = deriveStatus(invoice.total, new Decimal(newPaidAmount));

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      });

      return { payment, updatedInvoice };
    });

    await logAction({
      tableName: "payments",
      recordId: payment.id,
      action: "create",
      newValue: { payment, invoiceStatus: updatedInvoice.status },
      performedBy: auth.user.id,
    });

    return NextResponse.json(
      {
        payment,
        invoice: {
          id: updatedInvoice.id,
          paidAmount: Number(updatedInvoice.paidAmount),
          total: Number(updatedInvoice.total),
          status: updatedInvoice.status,
          balance: Math.max(0, Number(updatedInvoice.total) - Number(updatedInvoice.paidAmount)),
        },
      },
      { status: 201 }
    );
  }

  // ── GET /api/v2/invoices/:id/payments ─────────────────────────────────────

  /**
   * Paginated list of all payments recorded against a given invoice.
   * Allowed roles: doctor, receptionist, admin.
   */
  static async listPayments(req: NextRequest, invoiceId: string) {
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { id: true },
    });
    if (!invoice) throw new NotFoundError("Invoice not found");

    const { page, limit: take, skip } = getPaginationParams(req);

    const [total, payments] = await Promise.all([
      prisma.payment.count({ where: { invoiceId } }),
      prisma.payment.findMany({
        where: { invoiceId },
        orderBy: { paidAt: "desc" },
        take,
        skip,
      }),
    ]);

    return NextResponse.json({
      payments,
      meta: {
        page,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  }
}
