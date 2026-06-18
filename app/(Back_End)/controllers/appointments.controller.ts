import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { getPaginationParams } from '@/lib/utils';
import { AppointmentStatus, AppointmentType } from '@/lib/generated/prisma/client';

export class AppointmentsController {
  /**
   * Helper to validate slot availability for a doctor at a given scheduled time.
   */
  public static async validateSlotAvailability(
    doctorId: string,
    scheduledAt: Date,
    excludeAppointmentId?: string
  ): Promise<{ available: boolean; reason?: string }> {
    const dayOfWeek = scheduledAt.getDay(); // 0 = Sunday, ..., 6 = Saturday

    // 1. Check if doctor is active and working on this day of week
    const schedule = await prisma.doctorSchedule.findFirst({
      where: {
        doctorId,
        dayOfWeek,
        isActive: true
      }
    });

    if (!schedule) {
      return { available: false, reason: 'Doctor is not working on this day' };
    }

    // Check if within hours (startTime and endTime are in UTC/Time format)
    const startHour = schedule.startTime.getUTCHours();
    const startMin = schedule.startTime.getUTCMinutes();
    const endHour = schedule.endTime.getUTCHours();
    const endMin = schedule.endTime.getUTCMinutes();

    const checkHour = scheduledAt.getHours();
    const checkMin = scheduledAt.getMinutes();

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const checkMinutes = checkHour * 60 + checkMin;

    if (checkMinutes < startMinutes || checkMinutes >= endMinutes) {
      return { available: false, reason: 'Scheduled time is outside doctor working hours' };
    }

    // 2. Check doctor time blocks (leave / vacation)
    const blocked = await prisma.doctorTimeBlock.findFirst({
      where: {
        doctorId,
        startsAt: { lte: scheduledAt },
        endsAt: { gte: scheduledAt }
      }
    });

    if (blocked) {
      return { available: false, reason: `Doctor is unavailable: ${blocked.reason || 'Vacation/Leave'}` };
    }

    // 3. Check for overlapping appointments (duration assumed 30 minutes)
    const slotDurationMs = 30 * 60 * 1000;
    const slotStart = new Date(scheduledAt.getTime() - slotDurationMs + 1000);
    const slotEnd = new Date(scheduledAt.getTime() + slotDurationMs - 1000);

    const overlap = await prisma.appointment.findFirst({
      where: {
        doctorId,
        id: excludeAppointmentId ? { not: excludeAppointmentId } : undefined,
        scheduledAt: {
          gt: slotStart,
          lt: slotEnd
        },
        status: {
          in: ['scheduled', 'waiting', 'in_progress']
        }
      }
    });

    if (overlap) {
      return { available: false, reason: 'Slot is already booked' };
    }

    return { available: true };
  }

  static async list(req: NextRequest) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { page, limit, skip } = getPaginationParams(req);
      const { searchParams } = new URL(req.url);

      const doctorId = searchParams.get('doctor_id');
      const patientId = searchParams.get('patient_id');
      const status = searchParams.get('status') as AppointmentStatus | null;
      const date = searchParams.get('date'); // YYYY-MM-DD
      const from = searchParams.get('from');
      const to = searchParams.get('to');
      const type = searchParams.get('type') as AppointmentType | null;

      const where: any = {};

      // RBAC scoping
      if (auth.user.role === 'patient') {
        const patient = await prisma.patient.findUnique({
          where: { userId: auth.user.id }
        });
        if (!patient) {
          return NextResponse.json({ data: [], meta: { page, limit, total: 0, total_pages: 0 } });
        }
        where.patientId = patient.id;
      } else if (auth.user.role === 'doctor' && !doctorId) {
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
      if (status) {
        where.status = status;
      }
      if (type) {
        where.type = type;
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
              include: {
                user: { select: { name: true, specialty: true } }
              }
            },
            patient: {
              select: { id: true, name: true, patientCode: true, phone: true }
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async book(req: NextRequest) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'patient']);
      if (auth instanceof NextResponse) return auth;

      const body = await req.json();
      const { doctorId, patientId, scheduledAt, type, notes } = body;

      if (!doctorId || !scheduledAt) {
        return NextResponse.json({ error: 'doctorId and scheduledAt are required' }, { status: 400 });
      }

      let resolvedPatientId = patientId;

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
          patientId: resolvedPatientId,
          doctorId,
          scheduledAt: scheduledDate,
          type: (type as AppointmentType) || 'new',
          notes: notes || null,
          status: 'scheduled'
        }
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async get(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          doctor: {
            include: { user: { select: { name: true, specialty: true } } }
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async update(req: NextRequest, params: { id: string }) {
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async cancel(req: NextRequest, params: { id: string }) {
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async updateStatus(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }
}
