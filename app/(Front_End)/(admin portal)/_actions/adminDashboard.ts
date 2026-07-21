"use server";

import { prisma } from "@/lib/prisma";
import { formatCurrencyAr, formatNumberAr, formatPercentAr, formatChangeAr, formatShortDateAr } from "@/lib/format";
import { resolveDateRange, type DateRangeKey } from "@/lib/date-range";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/auth";

async function validateAdmin(): Promise<{ success: true } | { success: false; message: string }> {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get('access_token')?.value;
  if (!accessToken) return { success: false, message: "Unauthorized: No session token found" };
  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== 'admin') {
    return { success: false, message: "Forbidden: Admin access required" };
  }
  return { success: true };
}

// ─────────────────────────────────────────────────────────────
// 1) KPI CARDS  (إجمالي الإيرادات / مرضى جدد / نسبة الحضور)
// ─────────────────────────────────────────────────────────────
export interface KpiCard {
  label: string;
  value: string;
  change: string;
  up: boolean;
}

export async function getDashboardKpis(rangeKey: DateRangeKey = "month"): Promise<KpiCard[]> {
  await validateAdmin();
  const { start, end, prevStart, prevEnd } = resolveDateRange(rangeKey);

  const [revenueNow, revenuePrev, newPatientsNow, newPatientsPrev, attendanceNow, attendancePrev] =
    await Promise.all([
      // Revenue = actual money collected (Payment.amount), not invoice totals,
      // since partial payments mean Invoice.total != cash received.
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: start, lte: end } },
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: { paidAt: { gte: prevStart, lte: prevEnd } },
      }),

      // New patients = appointments flagged as "new" in this window
      prisma.appointment.count({
        where: { type: "new", scheduledAt: { gte: start, lte: end } },
      }),
      prisma.appointment.count({
        where: { type: "new", scheduledAt: { gte: prevStart, lte: prevEnd } },
      }),

      // Attendance rate = done / (done + no_show + cancelled) — appointments that
      // were actually resolved one way or another (excludes future "scheduled" ones)
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: {
          scheduledAt: { gte: start, lte: end },
          status: { in: ["done", "no_show", "cancelled"] },
        },
      }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { _all: true },
        where: {
          scheduledAt: { gte: prevStart, lte: prevEnd },
          status: { in: ["done", "no_show", "cancelled"] },
        },
      }),
    ]);

  const computeAttendancePct = (rows: { status: string; _count: { _all: number } }[]) => {
    const total = rows.reduce((sum, r) => sum + r._count._all, 0);
    const done = rows.find((r) => r.status === "done")?._count._all ?? 0;
    return total === 0 ? 0 : (done / total) * 100;
  };

  const revenueNowVal = Number(revenueNow._sum.amount ?? 0);
  const revenuePrevVal = Number(revenuePrev._sum.amount ?? 0);
  const attendanceNowPct = computeAttendancePct(attendanceNow);
  const attendancePrevPct = computeAttendancePct(attendancePrev);

  const revenueDelta = formatChangeAr(revenueNowVal, revenuePrevVal);
  const patientsDelta = formatChangeAr(newPatientsNow, newPatientsPrev);
  const attendanceDelta = formatChangeAr(attendanceNowPct, attendancePrevPct);

  return [
    {
      label: "إجمالي الإيرادات",
      value: formatCurrencyAr(revenueNowVal),
      change: revenueDelta.change,
      up: revenueDelta.up,
    },
    {
      label: "مرضى جدد",
      value: formatNumberAr(newPatientsNow),
      change: patientsDelta.change,
      up: patientsDelta.up,
    },
    {
      label: "نسبة الحضور",
      value: formatPercentAr(attendanceNowPct),
      change: attendanceDelta.change,
      up: attendanceDelta.up,
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// 2) BAR CHART — حضور المرضى حسب اليوم (occupancy % per weekday)
// ─────────────────────────────────────────────────────────────
export interface WeekdayOccupancy {
  day: string;
  pct: number;
}

// JS Date.getDay(): 0=Sunday ... 6=Saturday.
// Clinic week runs Sat -> Thu (Friday is the weekend day in KSA), so it's excluded.
const WEEKDAY_ORDER: { jsDay: number; label: string }[] = [
  { jsDay: 6, label: "السبت" },
  { jsDay: 0, label: "الأحد" },
  { jsDay: 1, label: "الإثنين" },
  { jsDay: 2, label: "الثلاثاء" },
  { jsDay: 3, label: "الأربعاء" },
  { jsDay: 4, label: "الخميس" },
];

export async function getWeeklyOccupancy(rangeKey: DateRangeKey = "month"): Promise<WeekdayOccupancy[]> {
  await validateAdmin();
  const { start, end } = resolveDateRange(rangeKey);

  // Booked appointments (excluding cancelled/no_show — those never occupied a real slot)
  const appointments = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: start, lte: end },
      status: { notIn: ["cancelled", "no_show"] },
    },
    select: { scheduledAt: true },
  });

  const bookedByDay = new Map<number, number>();
  for (const appt of appointments) {
    const jsDay = appt.scheduledAt.getDay();
    bookedByDay.set(jsDay, (bookedByDay.get(jsDay) ?? 0) + 1);
  }

  // Capacity per weekday = sum across all active doctors of
  // floor((endTime - startTime) / slotDuration) for that weekday's schedule row.
  const schedules = await prisma.doctorSchedule.findMany({
    where: { isActive: true },
    include: { doctor: { select: { slotDuration: true } } },
  });

  const capacityByDay = new Map<number, number>();
  for (const sched of schedules) {
    const startMs = sched.startTime.getHours() * 60 + sched.startTime.getMinutes();
    const endMs = sched.endTime.getHours() * 60 + sched.endTime.getMinutes();
    const minutes = Math.max(0, endMs - startMs);
    const slots = Math.floor(minutes / (sched.doctor.slotDuration || 30));
    capacityByDay.set(sched.dayOfWeek, (capacityByDay.get(sched.dayOfWeek) ?? 0) + slots);
  }

  // Number of calendar occurrences of each weekday within [start, end],
  // since capacity above is a single day's capacity, not the whole range's.
  const occurrences = new Map<number, number>();
  const cursor = new Date(start);
  while (cursor <= end) {
    const d = cursor.getDay();
    occurrences.set(d, (occurrences.get(d) ?? 0) + 1);
    cursor.setDate(cursor.getDate() + 1);
  }

  return WEEKDAY_ORDER.map(({ jsDay, label }) => {
    const booked = bookedByDay.get(jsDay) ?? 0;
    const dailyCapacity = capacityByDay.get(jsDay) ?? 0;
    const totalCapacity = dailyCapacity * (occurrences.get(jsDay) ?? 0);
    const pct = totalCapacity === 0 ? 0 : Math.min(100, Math.round((booked / totalCapacity) * 100));
    return { day: label, pct };
  });
}

// ─────────────────────────────────────────────────────────────
// 3) PIE CHART — توزيع الخدمات
// ─────────────────────────────────────────────────────────────
export interface ServiceSlice {
  name: string;
  pct: number;
  count: number;
}

export async function getServiceDistribution(rangeKey: DateRangeKey = "month"): Promise<ServiceSlice[]> {
  await validateAdmin();
  const { start, end } = resolveDateRange(rangeKey);

  const grouped = await prisma.appointment.groupBy({
    by: ["serviceId"],
    _count: { _all: true },
    where: { scheduledAt: { gte: start, lte: end } },
    orderBy: { _count: { serviceId: "desc" } },
  });

  const total = grouped.reduce((sum, g) => sum + g._count._all, 0);
  if (total === 0) return [];

  const services = await prisma.service.findMany({
    where: { id: { in: grouped.map((g) => g.serviceId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(services.map((s) => [s.id, s.name]));

  // Keep the top 3 services, bucket the rest as "أخرى" to match the 3-slice UI
  const top = grouped.slice(0, 3).map((g) => ({
    name: nameById.get(g.serviceId) ?? "غير معروف",
    count: g._count._all,
    pct: Math.round((g._count._all / total) * 100),
  }));
  const restCount = grouped.slice(3).reduce((sum, g) => sum + g._count._all, 0);
  if (restCount > 0) {
    top.push({ name: "أخرى", count: restCount, pct: Math.round((restCount / total) * 100) });
  }
  return top;
}

// ─────────────────────────────────────────────────────────────
// 4) RECENT ACTIVITY TABLE — آخر النشاطات
// ─────────────────────────────────────────────────────────────
export interface RecentActivityRow {
  date: string;
  patient: string;
  service: string; // chief complaint, falling back to appointment's service name
  amount: string;
  status: string;
  statusType: "success" | "pending" | "cancelled";
}

function mapInvoiceStatusToBadge(
  invoiceStatus: "pending" | "partial" | "paid" | undefined,
  appointmentStatus: string
): { status: string; statusType: RecentActivityRow["statusType"] } {
  if (appointmentStatus === "cancelled" || appointmentStatus === "no_show") {
    return { status: "ملغي", statusType: "cancelled" };
  }
  if (invoiceStatus === "paid") return { status: "تم التحصيل", statusType: "success" };
  if (invoiceStatus === "partial") return { status: "دفع جزئي", statusType: "pending" };
  return { status: "قيد المراجعة", statusType: "pending" };
}

export async function getRecentActivity(limit = 10): Promise<RecentActivityRow[]> {
  await validateAdmin();
  const visits = await prisma.visit.findMany({
    where: { deletedAt: null },
    orderBy: { visitDate: "desc" },
    take: limit,
    include: {
      appointment: {
        include: {
          patient: { select: { name: true } },
          doctor: { include: { user: { select: { name: true } } } },
          service: { select: { name: true } },
        },
      },
      invoices: {
        select: { total: true, status: true },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return visits.map((visit) => {
    const invoice = visit.invoices[0];
    const { status, statusType } = mapInvoiceStatusToBadge(invoice?.status, visit.appointment.status);
    return {
      date: formatShortDateAr(visit.visitDate),
      patient: visit.appointment.patient.name,
      service: visit.chiefComplaint || visit.appointment.service.name,
      amount: invoice ? formatCurrencyAr(Number(invoice.total)) : "—",
      status,
      statusType,
    };
  });
}

// ─────────────────────────────────────────────────────────────
// 5) LINE CHART — الإيرادات اليومية
// ─────────────────────────────────────────────────────────────
export interface DailyRevenuePoint {
  dateLabel: string;
  amount: number;
}

export async function getDailyRevenue(rangeKey: DateRangeKey = "month"): Promise<DailyRevenuePoint[]> {
  await validateAdmin();
  const { start, end } = resolveDateRange(rangeKey);

  const payments = await prisma.payment.findMany({
    where: { paidAt: { gte: start, lte: end } },
    select: { paidAt: true, amount: true },
  });

  const totalsByDay = new Map<string, number>();
  for (const p of payments) {
    const key = p.paidAt.toISOString().slice(0, 10); // YYYY-MM-DD bucket
    totalsByDay.set(key, (totalsByDay.get(key) ?? 0) + Number(p.amount));
  }

  const points: DailyRevenuePoint[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const key = cursor.toISOString().slice(0, 10);
    points.push({ dateLabel: formatShortDateAr(new Date(cursor)), amount: totalsByDay.get(key) ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return points;
}

// ─────────────────────────────────────────────────────────────
// 6) Combined fetch for the whole dashboard in one call (fewer round-trips)
// ─────────────────────────────────────────────────────────────
export async function getDashboardData(rangeKey: DateRangeKey = "month") {
  const [kpis, barData, pieData, recentActivity, revenueByDay] = await Promise.all([
    getDashboardKpis(rangeKey),
    getWeeklyOccupancy(rangeKey),
    getServiceDistribution(rangeKey),
    getRecentActivity(10),
    getDailyRevenue(rangeKey),
  ]);
  const { label } = resolveDateRange(rangeKey);
  return { kpis, barData, pieData, recentActivity, revenueByDay, rangeLabel: label };
}
