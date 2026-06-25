// TODO : review audit log controller

// src/app/controllers/reports.controller.ts
import { z }                         from "zod";
import { prisma }                    from "@/lib/prisma";
import { authenticate }              from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { Role, InvoiceStatus }       from "@/lib/generated/prisma/enums";

// ─────────────────────────────────────────────────────────────────────────────
// Shared helpers (private to this module)
// ─────────────────────────────────────────────────────────────────────────────

const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to:   z.coerce.date().optional(),
});

function parseDateRange(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  return dateRangeSchema.parse({
    from: searchParams.get("from") ?? undefined,
    to:   searchParams.get("to")   ?? undefined,
  });
}

function buildDateFilter(from?: Date, to?: Date) {
  if (!from && !to) return undefined;
  const filter: { gte?: Date; lte?: Date } = {};
  if (from) filter.gte = from;
  if (to) {
    const endOfDay = new Date(to);
    endOfDay.setUTCHours(23, 59, 59, 999);
    filter.lte = endOfDay;
  }
  return filter;
}

// ─────────────────────────────────────────────────────────────────────────────
// Reports Controller
// ─────────────────────────────────────────────────────────────────────────────

export class ReportsController {

  // ── GET /api/v2/reports/daily ────────────────────────────────────────────

  static async daily(req: NextRequest) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist]);
    if (auth instanceof NextResponse) return auth;

    const { from, to } = parseDateRange(req);

    const start = from ?? (() => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      return d;
    })();
    const end = (() => {
      const d = to ? new Date(to) : new Date(start);
      d.setUTCHours(23, 59, 59, 999);
      return d;
    })();

    const dateFilter = { gte: start, lte: end };

    const [
      totalAppointments,
      appointmentsByStatus,
      newPatients,
      invoicesSummary,
    ] = await Promise.all([
      prisma.appointment.count({
        where: { scheduledAt: dateFilter },
      }),
      prisma.appointment.groupBy({
        by:     ["status"],
        where:  { scheduledAt: dateFilter },
        _count: { _all: true },
      }),
      prisma.patient.count({
        where: { createdAt: dateFilter, deletedAt: null },
      }),
      prisma.invoice.aggregate({
        where:  { createdAt: dateFilter },
        _sum:   { paidAmount: true, total: true },
        _count: { _all: true },
      }),
    ]);

    const totalInvoiced  = Number(invoicesSummary._sum.total      ?? 0);
    const totalCollected = Number(invoicesSummary._sum.paidAmount  ?? 0);

    return NextResponse.json({
      success: true,
      data: {
        period: { from: start, to: end },
        appointments: {
          total:    totalAppointments,
          byStatus: Object.fromEntries(
            appointmentsByStatus.map((r) => [r.status, r._count._all]),
          ),
        },
        patients: { new: newPatients },
        revenue: {
          invoiceCount:   invoicesSummary._count._all,
          totalInvoiced,
          totalCollected,
          outstanding:    Math.max(0, totalInvoiced - totalCollected),
        },
      },
    });
  }

  // ── GET /api/v2/reports/monthly ──────────────────────────────────────────

  static async monthly(req: NextRequest) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist]);
    if (auth instanceof NextResponse) return auth;

    const { from, to } = parseDateRange(req);

    const start = from ?? new Date(Date.UTC(new Date().getUTCFullYear(), 0, 1));
    const end   = (() => {
      const d = to
        ? new Date(to)
        : new Date(Date.UTC(new Date().getUTCFullYear(), 11, 31));
      d.setUTCHours(23, 59, 59, 999);
      return d;
    })();

    const dateFilter = { gte: start, lte: end };

    const [appointments, invoices, newPatients] = await Promise.all([
      prisma.appointment.findMany({
        where:  { scheduledAt: dateFilter },
        select: { scheduledAt: true, status: true },
      }),
      prisma.invoice.findMany({
        where:  { createdAt: dateFilter },
        select: { createdAt: true, total: true, paidAmount: true },
      }),
      prisma.patient.findMany({
        where:  { createdAt: dateFilter, deletedAt: null },
        select: { createdAt: true },
      }),
    ]);

    const monthMap: Record<string, {
      appointments: number;
      revenue:      number;
      collected:    number;
      newPatients:  number;
    }> = {};

    const getKey = (d: Date) =>
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;

    const ensure = (key: string) => {
      if (!monthMap[key])
        monthMap[key] = { appointments: 0, revenue: 0, collected: 0, newPatients: 0 };
    };

    for (const a   of appointments) { const k = getKey(a.scheduledAt); ensure(k); monthMap[k].appointments++; }
    for (const inv of invoices)     { const k = getKey(inv.createdAt); ensure(k); monthMap[k].revenue += Number(inv.total); monthMap[k].collected += Number(inv.paidAmount); }
    for (const p   of newPatients)  { const k = getKey(p.createdAt);  ensure(k); monthMap[k].newPatients++; }

    const months = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    return NextResponse.json({
      success: true,
      data: { period: { from: start, to: end }, months },
    });
  }

  // ── GET /api/v2/reports/financial ────────────────────────────────────────

  static async financial(req: NextRequest) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist]);
    if (auth instanceof NextResponse) return auth;

    const { from, to } = parseDateRange(req);
    const dateFilter   = buildDateFilter(from, to);

    const [invoiceSummary, byStatus, payments, outstandingByDoctor] = await Promise.all([
      prisma.invoice.aggregate({
        where:  dateFilter ? { createdAt: dateFilter } : undefined,
        _sum:   { total: true, paidAmount: true, discount: true },
        _count: { _all: true },
      }),
      prisma.invoice.groupBy({
        by:     ["status"],
        where:  dateFilter ? { createdAt: dateFilter } : undefined,
        _count: { _all: true },
        _sum:   { total: true, paidAmount: true },
      }),
      prisma.payment.groupBy({
        by:     ["method"],
        where:  dateFilter ? { paidAt: dateFilter } : undefined,
        _sum:   { amount: true },
        _count: { _all: true },
      }),
      prisma.invoice.groupBy({
        by:    ["doctorId"],
        where: {
          status: { in: [InvoiceStatus.pending, InvoiceStatus.partial] },
          ...(dateFilter && { createdAt: dateFilter }),
        },
        _sum: { total: true, paidAmount: true },
      }),
    ]);

    const doctorIds   = outstandingByDoctor.map((r) => r.doctorId);
    const doctorNames = await prisma.doctor.findMany({
      where:  { id: { in: doctorIds } },
      select: { id: true, user: { select: { name: true } } },
    });
    const nameMap = Object.fromEntries(doctorNames.map((d) => [d.id, d.user.name]));

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        summary: {
          invoiceCount:   invoiceSummary._count._all,
          totalBilled:    Number(invoiceSummary._sum.total      ?? 0),
          totalCollected: Number(invoiceSummary._sum.paidAmount ?? 0),
          totalDiscount:  Number(invoiceSummary._sum.discount   ?? 0),
          outstanding:    Math.max(
            0,
            Number(invoiceSummary._sum.total      ?? 0) -
            Number(invoiceSummary._sum.paidAmount ?? 0),
          ),
        },
        byStatus: byStatus.map((r) => ({
          status:         r.status,
          count:          r._count._all,
          totalBilled:    Number(r._sum.total      ?? 0),
          totalCollected: Number(r._sum.paidAmount ?? 0),
        })),
        paymentMethods: payments.map((r) => ({
          method:      r.method,
          count:       r._count._all,
          totalAmount: Number(r._sum.amount ?? 0),
        })),
        outstandingByDoctor: outstandingByDoctor.map((r) => ({
          doctorId:    r.doctorId,
          doctorName:  nameMap[r.doctorId] ?? "Unknown",
          totalBilled: Number(r._sum.total      ?? 0),
          totalPaid:   Number(r._sum.paidAmount ?? 0),
          outstanding: Math.max(
            0,
            Number(r._sum.total ?? 0) - Number(r._sum.paidAmount ?? 0),
          ),
        })),
      },
    });
  }

  // ── GET /api/v2/reports/patients ─────────────────────────────────────────

  static async patients(req: NextRequest) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist]);
    if (auth instanceof NextResponse) return auth;

    const { from, to } = parseDateRange(req);
    const dateFilter   = buildDateFilter(from, to);

    const [totalPatients, newPatients, genderBreakdown, returningCount] =
      await Promise.all([
        prisma.patient.count({ where: { deletedAt: null } }),
        prisma.patient.count({
          where: { deletedAt: null, ...(dateFilter && { createdAt: dateFilter }) },
        }),
        prisma.patient.groupBy({
          by:     ["gender"],
          where:  { deletedAt: null },
          _count: { _all: true },
        }),
        prisma.appointment.groupBy({
          by:     ["patientId"],
          where:  { ...(dateFilter && { scheduledAt: dateFilter }) },
          _count: { _all: true },
          having: { patientId: { _count: { gt: 1 } } },
        }),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        period:    { from, to },
        total:     totalPatients,
        new:       newPatients,
        returning: returningCount.length,
        gender:    Object.fromEntries(
          genderBreakdown.map((r) => [r.gender ?? "unknown", r._count._all]),
        ),
      },
    });
  }

  // ── GET /api/v2/reports/appointments ────────────────────────────────────

  static async appointments(req: NextRequest) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist]);
    if (auth instanceof NextResponse) return auth;

    const { from, to } = parseDateRange(req);
    const dateFilter   = buildDateFilter(from, to);
    const apptWhere    = { ...(dateFilter && { scheduledAt: dateFilter }) };

    const [total, byStatus, byType, noShows] = await Promise.all([
      prisma.appointment.count({ where: apptWhere }),
      prisma.appointment.groupBy({
        by: ["status"], where: apptWhere, _count: { _all: true },
      }),
      prisma.appointment.groupBy({
        by: ["type"], where: apptWhere, _count: { _all: true },
      }),
      prisma.appointment.count({
        where: { ...apptWhere, status: "no_show" as any },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        period:      { from, to },
        total,
        noShows,
        noShowRate:  total > 0 ? `${((noShows / total) * 100).toFixed(1)}%` : "0.0%",
        byStatus:    Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])),
        byType:      Object.fromEntries(byType.map((r)   => [r.type,   r._count._all])),
      },
    });
  }

  // ── GET /api/v2/reports/doctor/:id/revenue ───────────────────────────────

  static async doctorRevenue(req: NextRequest, doctorId: string) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist, Role.doctor]);
    if (auth instanceof NextResponse) return auth;

    // Doctor can only view their own revenue
    if (auth.user.role === Role.doctor) {
      const own = await prisma.doctor.findFirst({
        where:  { userId: auth.user.id, user: { isActive: true, deletedAt: null } },
        select: { id: true },
      });
      if (!own || own.id !== doctorId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const doctor = await prisma.doctor.findFirst({
      where:  { id: doctorId, user: { isActive: true, deletedAt: null } },
      select: { id: true, specialty: true, user: { select: { name: true } } },
    });
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

    const { from, to } = parseDateRange(req);
    const dateFilter   = buildDateFilter(from, to);
    const invoiceWhere = { doctorId, ...(dateFilter && { createdAt: dateFilter }) };

    const [invoiceSummary, byStatus, paymentMethods, topServices] = await Promise.all([
      prisma.invoice.aggregate({
        where:  invoiceWhere,
        _sum:   { total: true, paidAmount: true, discount: true },
        _count: { _all: true },
      }),
      prisma.invoice.groupBy({
        by:     ["status"],
        where:  invoiceWhere,
        _count: { _all: true },
        _sum:   { total: true, paidAmount: true },
      }),
      prisma.payment.groupBy({
        by:     ["method"],
        where:  { invoice: { doctorId }, ...(dateFilter && { paidAt: dateFilter }) },
        _sum:   { amount: true },
        _count: { _all: true },
      }),
      prisma.invoiceItem.groupBy({
        by:      ["description"],
        where:   { invoice: { doctorId, ...(dateFilter && { createdAt: dateFilter }) } },
        _sum:    { total: true },
        _count:  { _all: true },
        orderBy: { _sum: { total: "desc" } },
        take:    10,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        period: { from, to },
        doctor: { id: doctor.id, name: doctor.user.name, specialty: doctor.specialty },
        summary: {
          invoiceCount:   invoiceSummary._count._all,
          totalBilled:    Number(invoiceSummary._sum.total      ?? 0),
          totalCollected: Number(invoiceSummary._sum.paidAmount ?? 0),
          totalDiscount:  Number(invoiceSummary._sum.discount   ?? 0),
          outstanding:    Math.max(
            0,
            Number(invoiceSummary._sum.total      ?? 0) -
            Number(invoiceSummary._sum.paidAmount ?? 0),
          ),
        },
        byStatus: byStatus.map((r) => ({
          status:         r.status,
          count:          r._count._all,
          totalBilled:    Number(r._sum.total      ?? 0),
          totalCollected: Number(r._sum.paidAmount ?? 0),
        })),
        paymentMethods: paymentMethods.map((r) => ({
          method:      r.method,
          count:       r._count._all,
          totalAmount: Number(r._sum.amount ?? 0),
        })),
        topServices: topServices.map((r) => ({
          description:  r.description,
          count:        r._count._all,
          totalRevenue: Number(r._sum.total ?? 0),
        })),
      },
    });
  }
}