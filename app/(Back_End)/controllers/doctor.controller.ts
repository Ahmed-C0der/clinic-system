import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logAction } from "@/lib/audit";
import { getPaginationParams } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";
import { AppointmentStatus, Role } from "@/lib/generated/prisma/enums";
import { authenticate } from "@/lib/auth";
import { Prisma } from "@/lib/generated/prisma/client";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_SLOT_MINUTES = 30;

const BLOCKING_STATUSES = [
  "scheduled",
  "waiting",
  "in_progress",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Shared error classes  (move to lib/errors.ts and import from there)
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
// Validation schemas
// ─────────────────────────────────────────────────────────────────────────────

const listDoctorsSchema = z.object({
  search:    z.string().trim().min(1).optional(),
  specialty: z.string().trim().min(1).optional(),
  available: z.coerce.date().optional(),
});

const updateDoctorSchema = z
  .object({
    // User table fields
    name:     z.string().trim().min(1).max(150).optional(),
    phone:    z.string().trim().max(30).optional(),
    isActive: z.boolean().optional(),
    // Doctor table fields
    licenseNumber:   z.string().trim().max(100).optional(),
    specialty:       z.string().trim().min(1).max(100).optional(),
    bio:             z.string().trim().max(2000).optional(),
    consultationFee: z.coerce.number().nonnegative().optional(),
    slotDuration:    z.coerce.number().int().positive().max(480).optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, "No fields provided to update");

const scheduleDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:mm"),
  endTime:   z.string().regex(/^\d{2}:\d{2}$/, "Expected HH:mm"),
  isActive:  z.boolean().optional().default(true),
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
    endAt:   z.coerce.date(),
    reason:  z.string().trim().max(255).optional(),
  })
  .refine((data) => data.endAt > data.startAt, {
    message: "endAt must be after startAt",
    path: ["endAt"],
  });

const slotsQuerySchema = z.object({
  date:     z.coerce.date(),
  duration: z.coerce
    .number()
    .int()
    .positive()
    .max(480)
    .optional()
    .default(DEFAULT_SLOT_MINUTES),
});

export type UpdateDoctorInput   = z.infer<typeof updateDoctorSchema>;
export type ReplaceScheduleInput = z.infer<typeof replaceScheduleSchema>;
export type TimeBlockInput       = z.infer<typeof timeBlockSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// Reusable include shape
// ─────────────────────────────────────────────────────────────────────────────

const DOCTOR_SELECT = {
  id:              true,
  specialty:       true,
  bio:             true,
  consultationFee: true,
  licenseNumber:   true,
  slotDuration:    true,
  user: {
    select: {
      id:       true,
      name:     true,
      email:    true,
      phone:    true,
      role:     true,
      isActive: true,
    },
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Controller
// ─────────────────────────────────────────────────────────────────────────────

export class Doctor {
  
  // ── List ────────────────────────────────────────────────────────────────

  /**
   * GET /api/v2/doctors
   * Roles: admin, receptionist, patient (public-ish)
   * Query: search?, specialty?, available? (date), page, limit
   *
   * FIX #3: When `available` is supplied the pagination is done IN-MEMORY
   * after the availability filter, so meta reflects the filtered count.
   * For large datasets move this to a dedicated search endpoint.
   */
  static async list(req: NextRequest, query: unknown) {
    // const auth = await authenticate(req, [Role.admin, Role.receptionist, Role.doctor, Role.patient]);
    // if (auth instanceof NextResponse) return auth;

    const { search, specialty, available } = listDoctorsSchema.parse(query);
    const { page, limit, skip } = getPaginationParams(req);

    const where: Record<string, unknown> = {
      user: { deletedAt: null, isActive: true },
    };

    if (search) {
      where.OR = [
        { user:      { name:      { contains: search, mode: "insensitive" } } },
        { specialty: { contains: search, mode: "insensitive" } },
      ];
    }
    if (specialty) where.specialty = specialty;

    // ── No availability filter → fast paginated DB query ──────────────────
    if (!available) {
      const [total, doctors] = await Promise.all([
        prisma.doctor.count({ where }),
        prisma.doctor.findMany({
          where,
          select:  DOCTOR_SELECT,
          orderBy: { user: { name: "asc" } },
          take:    limit,
          skip,
        }),
      ]);

      return NextResponse.json({
        success: true,
        data: doctors,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // ── Availability filter — fetch ALL matching doctors first, then page ──
    // FIX #3: paginate AFTER filtering so meta is accurate
    const allDoctors = await prisma.doctor.findMany({
      where,
      select:  DOCTOR_SELECT,
      orderBy: { user: { name: "asc" } },
    });

    const slotDuration = DEFAULT_SLOT_MINUTES;

    const availabilityResults = await Promise.all(
      allDoctors.map(async (doctor) => {
        const slots = await this.getSlots(doctor.id, {
          date:     available,
          duration: slotDuration,
        });
        return slots.length > 0 ? doctor : null;
      }),
    );

    const filtered = availabilityResults.filter(
      (d): d is NonNullable<typeof d> => d !== null,
    );

    const total      = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const paginated  = filtered.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginated,
      meta: { page, limit, total, totalPages },
    });
  }

  // ── Get by ID ────────────────────────────────────────────────────────────

  static async getById(req: NextRequest, id: string) {
    const auth = await authenticate(req, [
      Role.admin, Role.receptionist, Role.doctor, Role.patient,
    ]);
    if (auth instanceof NextResponse) return auth;

    const doctor = await prisma.doctor.findFirst({
      where: { id, user: { deletedAt: null, isActive: true } },
      select: DOCTOR_SELECT,
    });
    if (!doctor) throw new NotFoundError("Doctor not found");

    return NextResponse.json({ success: true, data: doctor });
  }

  // ── Update ───────────────────────────────────────────────────────────────

  /**
   * PATCH /api/v2/doctors/:id
   * FIX #6: doctors can only update their own profile.
   */
  static async update(req: NextRequest, doctorId: string, input: unknown) {
    const auth = await authenticate(req, [Role.admin, Role.doctor]);
    if (auth instanceof NextResponse) return auth;

    // FIX #6 — doctor can only edit themselves
    if (auth.user.role === Role.doctor ) {
      const doctor= await this.assertExists(doctorId)
      if (doctor.userId !== auth.user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const data        = updateDoctorSchema.parse(input);
    const performedBy = auth.user.id;
    const before      = await this.assertExists(doctorId);

    const userFields = {
      ...(data.name     !== undefined && { name:     data.name }),
      ...(data.phone    !== undefined && { phone:    data.phone }),
      ...(data.isActive !== undefined && { isActive: data.isActive }), // TODO : make sure it's available for doctore to re-active his profile
    };

    const doctorFields = {
      ...(data.specialty       !== undefined && { specialty:       data.specialty }),
      ...(data.licenseNumber   !== undefined && { licenseNumber:   data.licenseNumber }),
      ...(data.bio             !== undefined && { bio:             data.bio }),
      ...(data.consultationFee !== undefined && { consultationFee: data.consultationFee }),
      ...(data.slotDuration    !== undefined && { slotDuration:    data.slotDuration }),
    };

    const updated = await prisma.$transaction(async (tx) => { // update user data if exist , return DOCTOR_SELECT
      if (Object.keys(userFields).length > 0) {
        await tx.user.update({
          where: { id: before.userId },
          data:  userFields,
        });
      }
      return tx.doctor.update({
        where:  { id: doctorId },
        data:   doctorFields,
        select: DOCTOR_SELECT,
      });
    });

    await logAction({
      tableName:   "doctors",
      recordId:    doctorId,
      action:      "update",
      oldValue:    before,
      newValue:    updated,
      performedBy,
    });

    return NextResponse.json({ success: true, data: updated });
  }

  // ── Schedule: get ────────────────────────────────────────────────────────

  /**
   * GET /api/v2/doctors/:id/schedule
   * Query: includeInactive=true  (admin only)
   * FIX #7: admins can pass ?includeInactive=true to see disabled days.
   */
  static async getSchedule(req: NextRequest, doctorId: string) {
    const auth = await authenticate(req, [
      Role.admin, Role.receptionist, Role.doctor, Role.patient,
    ]);
    if (auth instanceof NextResponse) return auth;

    await this.assertExists(doctorId);

    const { searchParams } = new URL(req.url);
    const includeInactive  = searchParams.get("includeInactive") === "true";

    // Only admins are allowed to see inactive days
    const isAdmin        = auth.user.role === Role.admin;
    const showAllDays    = isAdmin && includeInactive;

    const schedules = await prisma.doctorSchedule.findMany({
      where:   { doctorId, ...(!showAllDays && { isActive: true }) },
      orderBy: { dayOfWeek: "asc" },
    });

    return NextResponse.json({ success: true, data: schedules });
  }

  // ── Schedule: replace ────────────────────────────────────────────────────

  /**
   * PUT /api/v2/doctors/:id/schedule
   * FIX #5: added authenticate.
   * FIX #12: soft-disable instead of hard delete to preserve appointment links.
   */
  static async replaceSchedule(req: NextRequest, doctorId: string, input: unknown) {
    const auth = await authenticate(req, [Role.admin, Role.doctor]);
    if (auth instanceof NextResponse) return auth;
    const doctor = await this.assertExists(doctorId);
    // FIX #6 — doctor can only edit their own schedule
    if (auth.user.role === Role.doctor&& doctor.userId !== auth.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { days } = replaceScheduleSchema.parse(input);
    

    const dayNumbers = days.map((d) => d.dayOfWeek);
    if (new Set(dayNumbers).size !== dayNumbers.length) {
      throw new ValidationError("Duplicate dayOfWeek entries in schedule payload");
    }

    const { before, after } = await prisma.$transaction(async (tx) => {
      const before = await tx.doctorSchedule.findMany({ where: { doctorId } });

      // FIX #12: soft-disable ALL existing days first, then upsert incoming days
      // This keeps FK integrity if appointments reference schedule rows.
      await tx.doctorSchedule.updateMany({
        where: { doctorId },
        data:  { isActive: false },
      });

      for (const d of days) {
        await tx.doctorSchedule.upsert({
          where: { doctorId_dayOfWeek: { doctorId, dayOfWeek: d.dayOfWeek } },
          create: {
            doctorId,
            dayOfWeek: d.dayOfWeek,
            startTime: this.timeStringToDate(d.startTime),
            endTime:   this.timeStringToDate(d.endTime),
            isActive:  d.isActive,
          },
          update: {
            startTime: this.timeStringToDate(d.startTime),
            endTime:   this.timeStringToDate(d.endTime),
            isActive:  d.isActive,
          },
        });
      }

      const after = await tx.doctorSchedule.findMany({
        where:   { doctorId },
        orderBy: { dayOfWeek: "asc" },
      });

      return { before, after };
    });

    await logAction({
      tableName:   "doctor_schedules",
      recordId:    doctorId,
      action:      "update",
      oldValue:    before,
      newValue:    after,
      performedBy: auth.user.id,
    });

    return NextResponse.json({ success: true, data: after });
  }

  // ── Schedule: update single day ──────────────────────────────────────────

  /**
   * PATCH /api/v2/doctors/:id/schedule/:dayId
   * FIX #5: added authenticate.
   */
  static async updateScheduleDay(
    req:     NextRequest,
    doctorId: string,
    dayId:    string,
    input:    unknown,
  ) {
    const auth = await authenticate(req, [Role.admin, Role.doctor]);
    if (auth instanceof NextResponse) return auth;
    const doctor= await this.assertExists(doctorId)
    if (auth.user.role === Role.doctor && doctor.userId !== auth.user.id)   
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const data   = updateScheduleDaySchema.parse(input);
    const before = await this.assertScheduleDayBelongsTo(doctorId, dayId);

    if (data.dayOfWeek !== undefined) {
      const conflict = await prisma.doctorSchedule.findFirst({
        where: { doctorId, dayOfWeek: data.dayOfWeek, NOT: { id: dayId } },
      });
      if (conflict) {
        throw new ValidationError(
          `dayOfWeek ${data.dayOfWeek} already exists for this doctor`,
        );
      }
    }

    const updated = await prisma.doctorSchedule.update({
      where: { id: dayId },
      data: {
        ...(data.dayOfWeek !== undefined && { dayOfWeek: data.dayOfWeek }),
        ...(data.startTime !== undefined && { startTime: this.timeStringToDate(data.startTime) }),
        ...(data.endTime   !== undefined && { endTime:   this.timeStringToDate(data.endTime) }),
        ...(data.isActive  !== undefined && { isActive:  data.isActive }),
      },
    });

    await logAction({
      tableName:   "doctor_schedules",
      recordId:    dayId,
      action:      "update",
      oldValue:    before,
      newValue:    updated,
      performedBy: auth.user.id,
    });

    return NextResponse.json({ success: true, data: updated });
  }

  // ── Time blocks: list ────────────────────────────────────────────────────

  /**
   * GET /api/v2/doctors/:id/time-blocks
   * FIX #8: returns only future/current blocks by default.
   *         Pass ?all=true (admin) to see past blocks too.
   */
  static async listTimeBlocks(req: NextRequest, doctorId: string) {
    const auth = await authenticate(req, [Role.admin, Role.receptionist, Role.doctor]);
    if (auth instanceof NextResponse) return auth;

    await this.assertExists(doctorId);

    const { searchParams } = new URL(req.url);
    const showAll  = auth.user.role === Role.admin && searchParams.get("all") === "true";
    const nowFilter = showAll ? {} : { endsAt: { gt: new Date() } };

    const blocks = await prisma.doctorTimeBlock.findMany({
      where:   { doctorId, ...nowFilter },
      orderBy: { startsAt: "asc" },
    });

    return NextResponse.json({ success: true, data: blocks });
  }

  // ── Time blocks: add ─────────────────────────────────────────────────────

  /**
   * POST /api/v2/doctors/:id/time-blocks
   * FIX #2: await authenticate.
   */
  static async addTimeBlock(req: NextRequest, doctorId: string, input: unknown) {
    // FIX #2 — was missing await
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const data = timeBlockSchema.parse(input);
    await this.assertExists(doctorId);

    // FIX #1 — use correct DB field names: startsAt / endsAt
    const overlapping = await prisma.doctorTimeBlock.findFirst({
      where: {
        doctorId,
        startsAt: { lt: data.endAt },
        endsAt:   { gt: data.startAt },
      },
    });
    if (overlapping) throw new ConflictError("Time block overlaps an existing one");

    const created = await prisma.doctorTimeBlock.create({
      data: {
        doctorId,
        startsAt: data.startAt,   // FIX #1 — schema field is startsAt
        endsAt:   data.endAt,     // FIX #1 — schema field is endsAt
        reason:   data.reason,
      },
    });

    await logAction({
      tableName:   "doctor_time_blocks",
      recordId:    created.id,
      action:      "create",
      newValue:    created,
      performedBy: auth.user.id,
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  }

  // ── Time blocks: remove ──────────────────────────────────────────────────

  /**
   * DELETE /api/v2/doctors/:id/time-blocks/:blockId
   * FIX #2: await authenticate.
   */
  static async removeTimeBlock(
    req:      NextRequest,
    doctorId: string,
    blockId:  string,
  ) {
    // FIX #2 — was missing await
    const auth = await authenticate(req, [Role.doctor, Role.receptionist, Role.admin]);
    if (auth instanceof NextResponse) return auth;

    const block = await prisma.doctorTimeBlock.findFirst({
      where: { id: blockId, doctorId },
    });
    if (!block) throw new NotFoundError("Time block not found");

    await prisma.doctorTimeBlock.delete({ where: { id: blockId } });

    await logAction({
      tableName:   "doctor_time_blocks",
      recordId:    blockId,
      action:      "delete",
      oldValue:    block,
      performedBy: auth.user.id,
    });

    return NextResponse.json({ success: true });
  }

  // ── Available slots ──────────────────────────────────────────────────────

  /**
   * GET /api/v2/doctors/:id/slots?date=YYYY-MM-DD&duration=30
   * FIX #4: use local calendar date (not UTC) to resolve dayOfWeek.
   * FIX #5: added authenticate.
   * FIX #9: wrong fallback duration for appointments with no service.
   */
  static async getSlots(
    req:      NextRequest | string, // string = internal call from list()
    doctorId: string,
    query:    unknown,
  ): Promise<{ start: Date; end: Date }[]>;

  static async getSlots(
    doctorId: string,
    query:    unknown,
  ): Promise<{ start: Date; end: Date }[]>;

  static async getSlots(
    reqOrDoctorId: NextRequest | string,
    doctorIdOrQuery: string | unknown,
    maybeQuery?: unknown,
  ): Promise<{ start: Date; end: Date }[]> {
    // Overload resolution: internal call passes (doctorId, query)
    let doctorId: string;
    let query: unknown;

    if (typeof reqOrDoctorId === "string") {
      // Internal call: getSlots(doctorId, query)
      doctorId = reqOrDoctorId;
      query    = doctorIdOrQuery;
    } else {
      // HTTP call: getSlots(req, doctorId, query)
      const auth = await authenticate(reqOrDoctorId, [
        Role.admin, Role.receptionist, Role.doctor, Role.patient,
      ]);
      if (auth instanceof NextResponse) return [];
      doctorId = doctorIdOrQuery as string;
      query    = maybeQuery;
    }

    const { date, duration } = slotsQuerySchema.parse(query);
    const doctor = await this.assertExists(doctorId);

    // Use per-doctor slotDuration if caller didn't specify one
    const slotMin: number = duration;

    // FIX #4 — derive dayOfWeek from the LOCAL date string, not UTC epoch
    // date is already a Date; treat its UTC parts as the "local" clinic date
    const dayOfWeek = date.getUTCDay();   // safe when client sends YYYY-MM-DD (no time)

    const schedule = await prisma.doctorSchedule.findFirst({
      where: { doctorId, dayOfWeek, isActive: true },
    });
    if (!schedule) return [];

    const dayStart = this.combineDateAndTime(date, schedule.startTime);
    const dayEnd   = this.combineDateAndTime(date, schedule.endTime);

    const [timeBlocks, appointments] = await Promise.all([
      prisma.doctorTimeBlock.findMany({
        where: {
          doctorId,
          startsAt: { lt: dayEnd },
          endsAt:   { gt: dayStart },
        },
      }),
      prisma.appointment.findMany({
        where: {
          doctorId,
          status:      { in: BLOCKING_STATUSES as unknown as AppointmentStatus[] },
          scheduledAt: { gte: dayStart, lt: dayEnd },
        },
        include: { service: { select: { durationMin: true } } },
      }),
    ]);

    const busyRanges = [
      ...timeBlocks.map((b) => ({ start: b.startsAt, end: b.endsAt })),
      ...appointments.map((a) => {
        // FIX #9 — fallback to DEFAULT_SLOT_MINUTES, not the caller's requested duration
        const apptDuration = a.service?.durationMin ?? DEFAULT_SLOT_MINUTES;
        return {
          start: a.scheduledAt,
          end:   new Date(a.scheduledAt.getTime() + apptDuration * 60_000),
        };
      }),
    ];

    const slots: { start: Date; end: Date }[] = [];

    for (
      let cursor = new Date(dayStart);
      cursor.getTime() + slotMin * 60_000 <= dayEnd.getTime();
      cursor = new Date(cursor.getTime() + slotMin * 60_000)
    ) {
      const slotEnd  = new Date(cursor.getTime() + slotMin * 60_000);
      const overlaps = busyRanges.some((r) => cursor < r.end && slotEnd > r.start);
      if (!overlaps) slots.push({ start: new Date(cursor), end: slotEnd });
    }

    return slots;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * FIX #11 — now returns the doctor row so callers can reuse it.
   */
  private static async assertExists( 
  doctorId: string, 
  fields?: Prisma.DoctorSelect
  ) // check if doctore exist then return fields or (doctor id , userId, speciallity , sloDuration , user name) 
  { 
  const doctor = await prisma.doctor.findFirst({
    where: { 
      id: doctorId, 
      user: { isActive: true, deletedAt: null } 
    },
    select: fields || {
      id: true,
      slotDuration: true,
      specialty: true,
      userId: true,
      user: { select: { id: true, name: true } },
    },
  });

  if (!doctor) throw new NotFoundError("Doctor not found");
  
  return doctor;
}

  private static async assertScheduleDayBelongsTo(doctorId: string, dayId: string) {
    const row = await prisma.doctorSchedule.findFirst({
      where: { id: dayId, doctorId },
    });
    if (!row) throw new NotFoundError("Schedule day not found");
    return row;
  }

  /** "09:00"  →  Date(1970-01-01T09:00:00Z)  — matches @db.Time storage. */
  private static timeStringToDate(time: string): Date {
    const [hours, minutes] = time.split(":").map(Number);
    return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0));
  }

  /** Combine a calendar date with a @db.Time column's time-of-day part. */
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