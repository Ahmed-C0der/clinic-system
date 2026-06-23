import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction,  AuditAction } from "@/lib/audit";
import { getPaginationParams } from "@/lib/utils";
import { NextRequest } from "next/server";
import { AppointmentStatus } from "@/lib/generated/prisma/enums";

/*
// TODO : review this controller

*/

// ============================================================
// NOTE ON ASSUMPTIONS
// Your message didn't include the Prisma models for
// `doctor_schedules` / `doctor_time_blocks`, so this file assumes
// the shapes below. Adjust field names to match your real schema —
// everything else (slot math, audit calls) is independent of that.
//
//   model DoctorSchedule {
//     id        String   @id @default(uuid()) @db.Uuid
//     doctorId  String   @map("doctor_id") @db.Uuid
//     dayOfWeek Int      @map("day_of_week") // 0 = Sunday ... 6 = Saturday
//     startTime DateTime @map("start_time") @db.Time
//     endTime   DateTime @map("end_time") @db.Time
//     isActive  Boolean  @default(true) @map("is_active")
//     @@unique([doctorId, dayOfWeek])
//     @@map("doctor_schedules")
//   }
//
//   model DoctorTimeBlock {
//     id        String   @id @default(uuid()) @db.Uuid
//     doctorId  String   @map("doctor_id") @db.Uuid
//     startAt   DateTime @map("start_at") @db.Timestamptz
//     endAt     DateTime @map("end_at") @db.Timestamptz
//     reason    String?  @db.VarChar(255)
//     @@map("doctor_time_blocks")
//   }
//
// Also assumed: `Service.durationMinutes` exists so an appointment's
// occupied window can be computed (Appointment itself has no duration
// column). If that's not the real field name, swap it in `getSlots`.
// ============================================================

const DEFAULT_SLOT_MINUTES = 30;
const BLOCKING_STATUSES = ["scheduled", "waiting", "in_progress"] as const;

// ---------------- Validation schemas ----------------

const listDoctorsSchema = z.object({
  search: z.string().trim().min(1).optional(),
  specialty: z.string().trim().min(1).optional(),
  available: z.coerce.date().optional(),
});
// TODO : make sure you provide doctor services
const updateDoctorSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(), // exist in user model not doctor
    phone: z.string().trim().max(30).optional(), // exist in user model not doctor
    isActive: z.boolean().optional(), // exist in user model not doctor
    // doctor model
    licenseNumber: z.string().trim().max(100).optional(),
    specialty: z.string().trim().min(1).max(100).optional(),
    bio: z.string().trim().max(2000).optional(),
    consultationFee: z.coerce.number().optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, "No fields provided to update");

const scheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:mm"),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:mm"),
  isActive: z.boolean().optional().default(true),
});

const replaceScheduleSchema = z.object({
  days: z.array(scheduleDaySchema).min(1, "Provide at least one day"),
});

const updateScheduleDaySchema = scheduleDaySchema
  .partial()
  .refine((obj) => Object.keys(obj).length > 0, "No fields provided to update");

const timeBlockSchema = z
  .object({
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    reason: z.string().trim().max(255).optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

const slotsQuerySchema = z.object({
  date: z.coerce.date(),
  duration: z.coerce
    .number()
    .int()
    .positive()
    .max(480)
    .optional()
    .default(DEFAULT_SLOT_MINUTES), // if not have been received it will be 30 minute
});

export type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
export type ReplaceScheduleInput = z.infer<typeof replaceScheduleSchema>;
export type TimeBlockInput = z.infer<typeof timeBlockSchema>;

// ---------------- Errors ----------------

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

// ============================================================
// Service
// ============================================================
export class Doctor {
  // ---------------- List / Get ----------------

  static async list(
    req: NextRequest,
    query: unknown,
    slotDuration: number = DEFAULT_SLOT_MINUTES,
  ) {
    const { search, specialty, available } = listDoctorsSchema.parse(query);
    const { page, limit: take, skip } = getPaginationParams(req);
    // building filters
    const where: Record<string, unknown> = { deletedAt: null };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { specialty: { contains: search, mode: "insensitive" } },
      ];
    }
    if (specialty) where.specialty = specialty;
    const [total, doctors] = await Promise.all([
      prisma.doctor.count({ where }),
      prisma.doctor.findMany({
        where,
        orderBy: { user: { name: "asc" } },
        take,
        skip,
      }),
    ]);
    if (!available) return { data: doctors, meta: { page, limit: take, total, totalPages: Math.ceil(total / take) } };

    // Filter to doctors with at least one open slot on the given date.
    // Done sequentially per-doctor since slot math needs per-doctor data;
    // fine for clinic-scale doctor counts, revisit if this list grows large.
    const filtered = await Promise.all(
      doctors.map(async (doctor) => {
        const slots = await this.getSlots(doctor.id, {
          date: available,
          duration: slotDuration,
        });
        return slots.length > 0 ? doctor : null;
      }),
    );
    const totalPages = Math.ceil(total / take);

    return {
      data: filtered.filter((d): d is NonNullable<typeof d> => d !== null),
      meta: {
        page,
        limit: take,
        total,
        totalPages,
      },
    };
  }

  static async getById(id: string) {
    const doctor = await prisma.doctor.findFirst({
      where: { id, user: { deletedAt: null, isActive: true, } },
    });
    if (!doctor) throw new NotFoundError("Doctor not found");
    return doctor;
  }

  // ---------------- Profile update (admin only — enforce role in the route handler) ----------------

  static async update(id: string, input: unknown, performedBy: string) {
    const data = updateDoctorSchema.parse(input);
    const before = await this.getById(id);

    const updated = await prisma.doctor.update({ where: { id }, data });

    await logAction({
      tableName: "doctors",
      recordId: id,
      action: "update",
      oldValue: before,
      newValue: updated,
      performedBy,
    });

    return updated;
  }

  // ---------------- Schedule ----------------

  static async getSchedule(doctorId: string) {
    await this.assertExists(doctorId);
    return prisma.doctorSchedule.findMany({
      where: { doctorId },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  /** Full replace — wipes the week and rewrites it. Audited as one UPDATE with before/after arrays. */
  static async replaceSchedule(
    doctorId: string,
    input: unknown,
    performedBy: string,
  ) {
    const { days } = replaceScheduleSchema.parse(input);
    await this.assertExists(doctorId);

    const dayNumbers = days.map((d) => d.dayOfWeek);
    if (new Set(dayNumbers).size !== dayNumbers.length) {
      throw new ValidationError(
        "Duplicate dayOfWeek entries in schedule payload",
      );
    }

    const before = await prisma.doctorSchedule.findMany({
      where: { doctorId },
    });

    const after = await prisma.$transaction(async (tx) => {
      await tx.doctorSchedule.deleteMany({ where: { doctorId } });
      await tx.doctorSchedule.createMany({
        data: days.map((d) => ({
          doctorId,
          dayOfWeek: d.dayOfWeek,
          startTime: this.timeStringToDate(d.startTime),
          endTime: this.timeStringToDate(d.endTime),
          isActive: d.isActive,
        })),
      });
      return tx.doctorSchedule.findMany({
        where: { doctorId },
        orderBy: { dayOfWeek: "asc" },
      });
    });

    await logAction({
      tableName: "doctor_schedules",
      recordId: doctorId,
      action: "update",
      oldValue: before,
      newValue: after,
      performedBy,
    });

    return after;
  }

  static async updateScheduleDay(
    doctorId: string,
    dayId: string,
    input: unknown,
    performedBy: string,
  ) {
    const data = updateScheduleDaySchema.parse(input);
    const before = await this.assertScheduleDayBelongsTo(doctorId, dayId);

    const updated = await prisma.doctorSchedule.update({
      where: { id: dayId },
      data: {
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
        ...(data.startTime !== undefined && {
          startTime: this.timeStringToDate(data.startTime),
        }),
        ...(data.endTime !== undefined && {
          endTime: this.timeStringToDate(data.endTime),
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    await logAction({
      tableName: "doctor_schedules",
      recordId: dayId,
      action: "update",
      oldValue: before,
      newValue: updated,
      performedBy,
    });

    return updated;
  }

  // ---------------- Time blocks (vacation / leave) ----------------

  static async listTimeBlocks(doctorId: string) {
    await this.assertExists(doctorId);
    return prisma.doctorTimeBlock.findMany({
      where: { doctorId },
      orderBy: { startsAt: "asc" },
    });
  }

  static async addTimeBlock(
    doctorId: string,
    input: unknown,
    performedBy: string,
  ) {
    const data = timeBlockSchema.parse(input);
    await this.assertExists(doctorId);

    const overlapping = await prisma.doctorTimeBlock.findFirst({
      where: {
        doctorId,
        startsAt: { lt: data.endAt },
        endsAt: { gt: data.startAt },
      },
    });
    if (overlapping)
      throw new ConflictError("Time block overlaps an existing one");

    const created = await prisma.doctorTimeBlock.create({
      data: {
        doctorId,
        startsAt: data.startAt,
        endsAt: data.endAt,
        reason: data.reason
      },
    });

    await logAction({
      tableName: "doctor_time_blocks",
      recordId: created.id,
      action: "create",
      newValue: created,
      performedBy,
    });

    return created;
  }

  static async removeTimeBlock(
    doctorId: string,
    blockId: string,
    performedBy: string,
  ) {
    const block = await prisma.doctorTimeBlock.findFirst({
      where: { id: blockId, doctorId },
    });
    if (!block) throw new NotFoundError("Time block not found");

    await prisma.doctorTimeBlock.delete({ where: { id: blockId } });

    await logAction({
      tableName: "doctor_time_blocks",
      recordId: blockId,
      action: "delete",
      oldValue: block,
      performedBy,
    });

    return { success: true as const };
  }

  // ---------------- Available slots ----------------

  static async getSlots(doctorId: string, query: unknown) {
    const { date, duration } = slotsQuerySchema.parse(query);
    await this.assertExists(doctorId); // search if doctor is active and not deleted , return his id , name , speciallity

    const dayOfWeek = date.getUTCDay();
    const schedule = await prisma.doctorSchedule.findFirst({
      where: { doctorId, dayOfWeek, isActive: true },
    });
    if (!schedule) return []; // doctor doesn't work that day

    const dayStart = this.combineDateAndTime(date, schedule.startTime);
    const dayEnd = this.combineDateAndTime(date, schedule.endTime);

    const [timeBlocks, appointments] = await Promise.all([
      prisma.doctorTimeBlock.findMany({
        where: { doctorId, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
      }),
      prisma.appointment.findMany({
        where: {
          doctorId,
          status: { in: BLOCKING_STATUSES as unknown as AppointmentStatus[] },
          scheduledAt: { gte: dayStart, lt: dayEnd },
        },
        include: { service: { select: { durationMin: true } } },
      }),
    ]);

    const busyRanges = [
      ...timeBlocks.map((b) => ({ start: b.startsAt, end: b.endsAt })),
      ...appointments.map((a) => {
        const apptDuration = a.service?.durationMin ?? duration;
        return {
          start: a.scheduledAt,
          end: new Date(a.scheduledAt.getTime() + apptDuration * 60_000),
        };
      }),
    ];

    const slots: { start: Date; end: Date }[] = [];
    for (
      let cursor = new Date(dayStart);
      cursor.getTime() + duration * 60_000 <= dayEnd.getTime();
      cursor = new Date(cursor.getTime() + duration * 60_000)
    ) {
      const slotEnd = new Date(cursor.getTime() + duration * 60_000);
      const overlaps = busyRanges.some(
        (r) => cursor < r.end && slotEnd > r.start,
      );
      if (!overlaps) slots.push({ start: new Date(cursor), end: slotEnd });
    }

    return slots;
  }

  // ---------------- internal helpers ----------------

  private static async assertExists(doctorId: string) {
    const exists = await prisma.doctor.findFirst({
      where: { id: doctorId, user:{
        isActive:true,
        deletedAt:null
      } },
      select: { id: true,specialty:true ,user:{
        select:{
          name:true,

        }
      }},
    });
    if (!exists) throw new NotFoundError("Doctor not found");
  }

  private static async assertScheduleDayBelongsTo(
    doctorId: string,
    dayId: string,
  ) {
    const row = await prisma.doctorSchedule.findFirst({
      where: { id: dayId, doctorId },
    });
    if (!row) throw new NotFoundError("Schedule day not found");
    return row;
  }

  /** "09:00" -> Date with that time-of-day (Prisma @db.Time ignores the date part). */
  private static timeStringToDate(time: string): Date {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
  }

  /** Combine a calendar date with a @db.Time column's time-of-day. */
  private static combineDateAndTime(date: Date, time: Date): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        time.getUTCHours(),
        time.getUTCMinutes(),
        0,
      ),
    );
  }
}
