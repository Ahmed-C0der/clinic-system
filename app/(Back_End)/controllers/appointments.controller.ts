
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { getPaginationParams } from '@/lib/utils';
import { AppointmentStatus, AppointmentType, Prisma, PrismaClient } from '@/lib/generated/prisma/client';

export class AppointmentsController {

  /**
   * Helper to validate slot availability for a doctor at a given scheduled time.
   */
  public static async validateSlotAvailability(
    doctorId: string,
    scheduledAt: Date,
    excludeAppointmentId?: string,
    slotDurationMs: number = 1000 * 60 * 30, // 30 min default
    db: Prisma.TransactionClient | PrismaClient = prisma // pass a tx client to make check+create atomic
  ): Promise<{ available: boolean; reason?: string }> {
    if (!Number.isFinite(slotDurationMs) || slotDurationMs <= 0) {
      throw new Error('slotDurationMs must be a positive number');
    }

    // All Date reads below use UTC accessors to match how schedule/time-block
    // timestamps are stored. Do not mix in local-time getters anywhere else
    // in this function — that was the root cause of most of the original bugs.
    const dayOfWeek = scheduledAt.getUTCDay(); // 0 = Sunday, ..., 6 = Saturday

    // 1. Check if doctor is active and working on this day of week
    const schedule = await db.doctorSchedule.findFirst({
      where: { doctorId, dayOfWeek, isActive: true }
    });

    if (!schedule) {
      return { available: false, reason: 'Doctor is not working on this day' };
    }

    // Working hours, in UTC minutes-since-midnight
    const startMinutes = schedule.startTime.getUTCHours() * 60 + schedule.startTime.getUTCMinutes();
    const endMinutes = schedule.endTime.getUTCHours() * 60 + schedule.endTime.getUTCMinutes();

    const slotStartMinutes = scheduledAt.getUTCHours() * 60 + scheduledAt.getUTCMinutes();
    const slotEndMinutes = slotStartMinutes + slotDurationMs / 60000;

    // Validate BOTH the start and the end of the requested slot fall within hours
    if (slotStartMinutes < startMinutes || slotEndMinutes > endMinutes) {
      return { available: false, reason: 'Scheduled time is outside doctor working hours' };
    }

    const slotStart = scheduledAt;
    const slotEnd = new Date(scheduledAt.getTime() + slotDurationMs);

    // 2. Check doctor time blocks (leave / vacation) — overlap against the
    // FULL requested slot, not just its start instant
    const blocked = await db.doctorTimeBlock.findFirst({
      where: {
        doctorId,
        startsAt: { lt: slotEnd },
        endsAt: { gt: slotStart }
      }
    });

    if (blocked) {
      return { available: false, reason: `Doctor is unavailable: ${blocked.reason || 'Vacation/Leave'}` };
    }

    // 3. Check for overlapping appointments.
    // NOTE: this still assumes every existing appointment occupies
    // [scheduledAt, scheduledAt + slotDurationMs). If appointments can have
    // different durations, store a duration on Appointment and compare against
    // each row's own duration instead of slotDurationMs — that's a schema
    // change, not something fixable here.
    const overlapWindowStart = new Date(scheduledAt.getTime() - slotDurationMs);
    const overlapWindowEnd = new Date(scheduledAt.getTime() + slotDurationMs);

    const overlap = await db.appointment.findFirst({
      where: {
        doctorId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        scheduledAt: { gt: overlapWindowStart, lt: overlapWindowEnd },
        status: { in: ['scheduled', 'waiting', 'in_progress'] }
      }
    });

    if (overlap) {
      return { available: false, reason: 'Slot is already booked' };
    }

    return { available: true };
  }
  public static catchError(e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known database errors (e.g., unique constraint violations)
      if (e.code === 'P2002') {
        return NextResponse.json({ error: 'A record with this combination already exists' }, { status: 400 });
      }
    }
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    // Log the full error for debugging
    console.error('Error handling appointment: ', e);
    // Return a generic 500 error for unexpected issues
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
  static async list(
    req: NextRequest, doctorId: string, patientId: string, status?: AppointmentStatus,
    date?: string // dd/mm/yy 
    , from?: string,
    to?: string,
    type?: AppointmentType

  ) {
    try {
      // ** TODO : add logic to extract it form params as you have writtent down 
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { page, limit, skip } = getPaginationParams(req);
      const where: any = {};
      if (status) {
        where.status = status;
      }
      if (type) {
        where.type = type;
      }

      /*
      IF ROLE PATIENT
      where={
      pateintId : patient.id ? that exist in tokens not that got as arg for security
      status ,
      type,
      scheduledAt = {
          gte
          lte
        };
      }
      IF ROLE NOT PATIENT
      where={
      doctorId : doctor.id ? that exist in tokens not that got as arg for security
      
      }
      
      */
      // RBAC scoping
      if (auth.user.role === 'patient') {
        const patient = await prisma.patient.findUnique({
          where: { userId: auth.user.id }
        });
        if (!patient) {
          return NextResponse.json({ data: [], meta: { page, limit, total: 0, total_pages: 0 } });
        }
        where.patientId = patient.id;
      }

      else if (auth.user.role === 'doctor' && !doctorId) {
        // Enforce doctor to only see their own appointments by default
        const doctor = await prisma.doctor.findFirst({
          where: { userId: auth.user.id }
        });
        if (doctor) {
          where.doctorId = doctor.id;
        }
      }

      // Add request filters

      if (doctorId && auth.user.role !== 'patient') {
        where.doctorId = doctorId;
      }
      if (patientId && auth.user.role !== 'patient') {
        where.patientId = patientId;
      }


      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        where.scheduledAt = {
          gte: startOfDay,
          lte: endOfDay
        };
      } else if (from || to) {
        where.scheduledAt = {};
        if (from) where.scheduledAt.gte = new Date(from);
        if (to) where.scheduledAt.lte = new Date(to);
      }

      const [total, data] = await Promise.all([
        prisma.appointment.count({ where }),
        prisma.appointment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { scheduledAt: 'asc' },
          include: {
            doctor: {
              select: {
                specialty: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            patient: {
              select: {
                id: true,
                name: true,
                patientCode: true,
                phone: true
              }
            }
          }
        })
      ]);

      return NextResponse.json({
        data,
        meta: {
          page,
          limit,
          total,
          total_pages: Math.ceil(total / limit)
        }
      });
    } catch (e: any) {
      if (e instanceof Error) {

        return NextResponse.json({ error: e.message }, { status: 500 });
      }
      return NextResponse.json({ error: e, Message: 'Server error' }, { status: 500 });
    }
  }

  static async book(req: NextRequest) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'patient']);
      if (auth instanceof NextResponse) return auth;

      const body = await req.json();
      const { doctorId, patientId, scheduledAt, type, notes, serviceId } = body;

      if (!doctorId || !scheduledAt) {
        return NextResponse.json({ error: 'doctorId and scheduledAt are required' }, { status: 400 });
      }

      let resolvedPatientId
      if (patientId) resolvedPatientId = patientId;

      // If user is a patient, they can only book for themselves
      if (auth.user.role === 'patient') {
        const patient = await prisma.patient.findUnique({
          where: { userId: auth.user.id }
        });
        if (!patient) {
          return NextResponse.json({ error: 'Patient profile not found for this user account' }, { status: 404 });
        }
        resolvedPatientId = patient.id;
      } else if (!resolvedPatientId) {
        return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
      }

      const scheduledDate = new Date(scheduledAt);

      // Validate slot availability
      const check = await this.validateSlotAvailability(doctorId, scheduledDate);
      if (!check.available) {
        return NextResponse.json({ error: check.reason || 'Slot unavailable' }, { status: 409 });
      }


      const appointment = await prisma.appointment.create({
        data: {
          scheduledAt: new Date(),
          type: (type as AppointmentType) || 'new',
          notes: notes,
          status: "scheduled",
          patient: {
            connect: { id: resolvedPatientId }
          },
          doctor: {
            connect: { id: doctorId }
          },
          service: {
            connect: { id: serviceId }
          }
        },
      });

      await logAction({
        tableName: 'appointments',
        recordId: appointment.id,
        action: 'create',
        newValue: appointment,
        performedBy: auth.user.id
      });

      // Simulation of twilio whatsapp/sms reminder
      console.log(`[NOTIFICATION SIMULATED] Appointment scheduled for patient ${resolvedPatientId} with doctor ${doctorId} at ${scheduledDate.toISOString()}`);

      return NextResponse.json(appointment, { status: 201 });
    } catch (e: any) {
      return this.catchError(e);
    }
  }

  static async get(req: NextRequest, id:string) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          doctor: {
            select: {
              specialty: true,
              user: {
                select: {
                  name: true
                }
              }
            }
          },
          patient: true
        }
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      // RBAC check
      if (auth.user.role === 'patient' && appointment.patient.userId !== auth.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      return NextResponse.json(appointment);
    } catch (e: any) {
      return this.catchError(e)
    }
  }

  static async update(req: NextRequest, id:string) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'patient']);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { patient: true }
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      // Check access
      if (auth.user.role === 'patient' && appointment.patient.userId !== auth.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const body = await req.json();
      const { doctorId, scheduledAt, type, notes, status } = body;

      const targetDoctorId = doctorId || appointment.doctorId;
      const targetScheduledAt = scheduledAt ? new Date(scheduledAt) : appointment.scheduledAt;

      // Validate availability if time/doctor changed
      if (doctorId || scheduledAt) {
        const check = await this.validateSlotAvailability(targetDoctorId, targetScheduledAt, id);
        if (!check.available) {
          return NextResponse.json({ error: check.reason || 'Slot unavailable' }, { status: 409 });
        }
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: {
          doctorId: targetDoctorId,
          scheduledAt: targetScheduledAt,
          type: type ? (type as AppointmentType) : appointment.type,
          notes: notes !== undefined ? notes : appointment.notes,
          status: status ? (status as AppointmentStatus) : appointment.status
        }
      });

      await logAction({
        tableName: 'appointments',
        recordId: id,
        action: 'update',
        oldValue: appointment,
        newValue: updated,
        performedBy: auth.user.id
      });

      return NextResponse.json(updated);
    } catch (e: any) {
      return this.catchError(e)
    }
  }

  static async cancel(req: NextRequest, id:string) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'patient']);
      if (auth instanceof NextResponse) return auth;

      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: { patient: true }
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      // Check access
      if (auth.user.role === 'patient' && appointment.patient.userId !== auth.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      await logAction({
        tableName: 'appointments',
        recordId: id,
        action: 'update',
        oldValue: appointment,
        newValue: updated,
        performedBy: auth.user.id
      });

      return NextResponse.json({ success: true, message: 'Appointment cancelled successfully' });
    } catch (e: any) {
      return this.catchError(e)
    }
  }

  static async updateStatus(req: NextRequest,id:string) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const appointment = await prisma.appointment.findUnique({
        where: { id }
      });

      if (!appointment) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      const body = await req.json();
      const { status } = body;

      if (!status) {
        return NextResponse.json({ error: 'status is required' }, { status: 400 });
      }

      const updated = await prisma.appointment.update({
        where: { id },
        data: { status: status as AppointmentStatus }
      });

      await logAction({
        tableName: 'appointments',
        recordId: id,
        action: 'update',
        oldValue: appointment,
        newValue: updated,
        performedBy: auth.user.id
      });

      return NextResponse.json(updated);
    } catch (e: any) {
      return this.catchError(e)
    }
  }
}

