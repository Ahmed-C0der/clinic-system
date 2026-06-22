import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { AppointmentStatus, Role } from "@/lib/generated/prisma/enums";
import { authenticate } from "@/lib/auth";
import { getPaginationParams } from '@/lib/utils';
import { AppointmentsController } from './appointments.controller';


export class visitsController {
    // get all visits for a doctor with the ability to filter by date and status 
    static async list(request: NextRequest, doctorId: string, status?: AppointmentStatus, from?: Date | string, to?: Date | string) {
        try {
            // fisrt authanticate user to get sure his role not patient
            const auth = await authenticate(request, [Role.admin, Role.doctor, Role.receptionist]);
            if (auth instanceof NextResponse) return auth;
            const { page, limit, skip } = getPaginationParams(request);

            const where: any = {
                deletedAt: null,
                appointment: {
                    doctorId: doctorId,
                    status: status && status,
                    scheduledAt: {
                        gte: from && from,
                        lte: to && to,
                    }
                }
            }
            const [total, data] = await Promise.all([
                prisma.visit.count({ where }),
                prisma.visit.findMany({ // get all visits for a doctor with the ability to filter by date and status including just basic info like pateint name , code , servicename , doctor name
                    where,
                    skip,
                    take: limit,
                    orderBy: { visitDate: 'desc' },
                    include: { // get just basic info from included tables
                        appointment: {
                            include: {
                                patient: {
                                    select: { name: true, patientCode: true, id: true }
                                },
                                service: {
                                    select: { name: true, id: true }
                                }
                                , doctor: {
                                    select: {
                                        id: true,
                                        user: {
                                            select: {
                                                name: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }),

            ])
            const totalPages = Math.ceil(total / limit);

            return NextResponse.json({
                data,
                meta: {
                    page,
                    limit,
                    total,
                    total_pages: totalPages
                }
            });
        } catch (error: any) {
            return AppointmentsController.catchError(error)
        }
    }
    static async postVisit(request: NextRequest) {
        try {
            
            const auth = await authenticate(request, [Role.admin, Role.doctor, Role.receptionist]);
            if (auth instanceof NextResponse) return auth;
            const body = await request.json();
            const { appointmentId, chiefComplaint, diagnosis, notes, weightKg, heightCm, bloodPressure, temperatureC } = body;
            const appointment = await prisma.appointment.findUnique({
                where: { id: appointmentId }
            })
            if (!appointment) {
                return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
            }
            const visit = await prisma.visit.create({
                data: {
                    appointmentId,
                    chiefComplaint,
                    diagnosis,
                    notes,
                    weightKg,
                    heightCm,
                    bloodPressure,
                    temperatureC,
                },
            });
            return NextResponse.json(visit);
        } catch (error: any) {
            return AppointmentsController.catchError(error)
        }
    }
    
    // get detail about specific visit 
    static async getVisitDetail(request: NextRequest, id: string) {
        try {
            const auth = await authenticate(request, [Role.admin, Role.doctor, Role.receptionist]);
            if (auth instanceof NextResponse) return auth;
            const visit = await prisma.visit.findFirst({
                where: { deletedAt: null, id },
                select: {
                    chiefComplaint: true,
                    diagnosis: true,
                    notes: true,
                    weightKg: true,
                    heightCm: true,
                    bloodPressure: true,
                    temperatureC: true,
                    visitDate: true,
                    appointment: {
                        include: {
                            patient: {
                                select: { name: true, patientCode: true, id: true }
                            },
                            service: {
                                select: { name: true, id: true, description: true, basePrice: true }
                            }
                            , doctor: {
                                select: {
                                    id: true,
                                    specialty: true,
                                    user: {
                                        select: {
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
            if (!visit) {
                return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
            }
            return NextResponse.json(visit);
        } catch (error: any) {
            return AppointmentsController.catchError(error)
        }
    }
    // patch vital ((weight, height, blood_pressure, temperature)) for receptionst 
    static async patchVital(request: NextRequest, id: string) {
        try {
            const auth = await authenticate(request, [Role.admin, Role.doctor, Role.receptionist]);
            if (auth instanceof NextResponse) return auth;
            const body = await request.json();
            const { weightKg, heightCm, bloodPressure, temperatureC , chiefComplaint} = body;
            const visit = await prisma.visit.update({
                where: { deletedAt: null, id },
                data: {
                    weightKg,
                    heightCm,
                    bloodPressure,
                    temperatureC,
                    chiefComplaint
                },
            });
            return NextResponse.json(visit);
        } catch (error: any) {
            return AppointmentsController.catchError(error)
        }
    }
    // patch diagnosis for doctor 
    static async patchDiagnosis(request: NextRequest, id: string) {
        try {
            const auth = await authenticate(request, [Role.doctor]);
            if (auth instanceof NextResponse) return auth;
            const body = await request.json();
            const { diagnosis, notes } = body;
            const visit = await prisma.visit.update({
                where: { deletedAt: null, id, appointment: { doctorId: auth.user.id } },
                data: {
                    diagnosis,
                    notes,
                },
            });
            return NextResponse.json(visit);
        } catch (error: any) {
            return AppointmentsController.catchError(error)
        }
    }
}