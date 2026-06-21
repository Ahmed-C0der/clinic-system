import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAction } from '@/lib/audit';
import { authenticate } from '@/lib/auth';

export class Clinic {
    // ─── Testimonials ──────────────────────────────────────────────────────────

    static async GetTestimonials(_req: NextRequest) {
        try {
            const testimonials = await prisma.review.findMany({
                where: { type: 'center', isApproved: true },
                include: { patient: { select: { name: true } } },
            });
            return NextResponse.json(testimonials ?? [], { status: 200 });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async PostTestimonials(req: NextRequest) {k
        const auth = await authenticate(req, ['patient']);
        if (auth instanceof NextResponse) return auth;

        const { comment, rating } = await req.json();

        if (!comment || !rating) {
            return NextResponse.json(
                { message: 'comment and rating are required' },
                { status: 400 }
            );
        }

        const patient = await prisma.patient.findUnique({
            where: { userId: auth.user.id },
        });
        if (!patient) {
            return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
        }

        const review = await prisma.review.create({
            data: { comment, rating, patientId: patient.id, type: 'center', isApproved: false },
        });

        await logAction({
            tableName: 'review',
            recordId: review.id,
            action: 'create',
            oldValue: null,
            newValue: { comment, rating, patientId: patient.id, type: 'center', isApproved: false },
            performedBy: auth.user.id,
        });

        return NextResponse.json(review, { status: 201 });
    }

    static async ApproveTestimonials(req: NextRequest) {
        const auth = await authenticate(req, ['admin', 'doctor']);
        if (auth instanceof NextResponse) return auth;

        const { reviewId, isApproved } = await req.json();

        if (!reviewId || typeof isApproved !== 'boolean') {
            return NextResponse.json(
                { message: 'reviewId and isApproved are required' },
                { status: 400 }
            );
        }

        const existing = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing) {
            return NextResponse.json({ message: 'Review not found' }, { status: 404 });
        }

        // doctor → approves only doctor reviews | admin → approves only center reviews
        const expectedType = auth.user.role === 'doctor' ? 'doctor' : 'center';
        if (existing.type !== expectedType) {
            return NextResponse.json(
                { message: 'Unauthorized to approve this review type' },
                { status: 403 }
            );
        }

        const review = await prisma.review.update({
            where: { id: reviewId },
            data: { isApproved },
        });

        await logAction({
            tableName: 'review',
            recordId: review.id,
            action: 'update',
            oldValue: { isApproved: existing.isApproved },
            newValue: { isApproved },
            performedBy: auth.user.id,
        });

        return NextResponse.json(review);
    }

    // ─── Services (catalog) ────────────────────────────────────────────────────
    //
    // Service  = the global catalog entry  (name, description, basePrice, durationMin)
    // basePrice is optional; it is a reference / "starting from" price shown on the
    // website.  The actual charged price lives in DoctorService.price.
    //
    // GET  /api/services?limit=4          → top services by appointment count (public)
    // POST /api/services                  → create service (admin)
    // PUT  /api/services                  → update service (admin)
    // DELETE /api/services                → soft-delete service (admin)

    static async GettopServices(req: NextRequest) {
        try {
            const url = new URL(req.url);
            const limit = Math.max(1, parseInt(url.searchParams.get('limit') ?? '4'));

            const services = await prisma.service.findMany({
                where: { isActive: true },
                orderBy: { appointments: { _count: 'desc' } },
                take: limit,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    basePrice: true,
                    durationMin: true,
                    // min & max price across all active doctors for this service
                    doctorServices: {
                        where: { isActive: true },
                        select: { price: true },
                    },
                },
            });

            // Attach priceRange so the frontend can show "from $X"
            const result = services.map((s) => {
                const prices = s.doctorServices.map((ds) => Number(ds.price));
                return {
                    id: s.id,
                    name: s.name,
                    description: s.description,
                    basePrice: s.basePrice,
                    durationMin: s.durationMin,
                    priceRange:
                        prices.length > 0
                            ? { min: Math.min(...prices), max: Math.max(...prices) }
                            : null,
                };
            });

            return NextResponse.json(result);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async PosttopServices(req: NextRequest) {
        const auth = await authenticate(req, ['admin']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { name, description, basePrice, durationMin } = await req.json();

            if (!name) {
                return NextResponse.json({ message: 'name is required' }, { status: 400 });
            }

            const service = await prisma.service.create({
                data: {
                    name,
                    description: description ?? null,
                    basePrice: basePrice ?? null,
                    durationMin: durationMin ?? 30,
                    isActive: true,
                },
            });

            await logAction({
                tableName: 'service',
                recordId: service.id,
                action: 'create',
                oldValue: null,
                newValue: { name, description, basePrice, durationMin, isActive: true },
                performedBy: auth.user.id,
            });

            return NextResponse.json(service, { status: 201 });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async PuttopServices(req: NextRequest) {
        const auth = await authenticate(req, ['admin']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { serviceId, name, description, basePrice, durationMin } = await req.json();

            if (!serviceId) {
                return NextResponse.json({ message: 'serviceId is required' }, { status: 400 });
            }

            const existing = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!existing) {
                return NextResponse.json({ message: 'Service not found' }, { status: 404 });
            }

            const service = await prisma.service.update({
                where: { id: serviceId },
                data: {
                    ...(name !== undefined && { name }),
                    ...(description !== undefined && { description }),
                    ...(basePrice !== undefined && { basePrice }),
                    ...(durationMin !== undefined && { durationMin }),
                },
            });

            await logAction({
                tableName: 'service',
                recordId: service.id,
                action: 'update',
                oldValue: {
                    name: existing.name,
                    description: existing.description,
                    basePrice: existing.basePrice,
                    durationMin: existing.durationMin,
                },
                newValue: { name, description, basePrice, durationMin },
                performedBy: auth.user.id,
            });

            return NextResponse.json(service);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async DeletetopServices(req: NextRequest) {
        const auth = await authenticate(req, ['admin']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { serviceId } = await req.json();

            if (!serviceId) {
                return NextResponse.json({ message: 'serviceId is required' }, { status: 400 });
            }

            const existing = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!existing) {
                return NextResponse.json({ message: 'Service not found' }, { status: 404 });
            }

            if (!existing.isActive) {
                return NextResponse.json({ message: 'Service already deactivated' }, { status: 409 });
            }

            // Soft-delete service + cascade soft-delete its DoctorService rows
            await prisma.$transaction([
                prisma.doctorService.updateMany({
                    where: { serviceId, isActive: true },
                    data: { isActive: false },
                }),
                prisma.service.update({
                    where: { id: serviceId },
                    data: { isActive: false },
                }),
            ]);

            await logAction({
                tableName: 'service',
                recordId: serviceId,
                action: 'update',
                oldValue: { isActive: true },
                newValue: { isActive: false },
                performedBy: auth.user.id,
            });

            return NextResponse.json({ message: 'Service deactivated successfully' });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    // ─── Doctor Services ────────────────────────────────────────────────────────
    //
    // GET    /api/doctor-services?doctorId=X   → list active services for a doctor (public)
    // POST   /api/doctor-services              → assign a service + set price (doctor)
    // PUT    /api/doctor-services              → update price (doctor)
    // DELETE /api/doctor-services              → soft-delete assignment (doctor)

    static async GetDoctorServices(req: NextRequest) {
        try {
            const url = new URL(req.url);
            const doctorId = url.searchParams.get('doctorId');

            if (!doctorId) {
                return NextResponse.json({ message: 'doctorId is required' }, { status: 400 });
            }

            const doctorServices = await prisma.doctorService.findMany({
                where: { isActive: true, doctorId },
                include: {
                    service: {
                        select: { id: true, name: true, description: true, durationMin: true },
                    },
                },
            });

            return NextResponse.json(doctorServices);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async PostDoctorServices(req: NextRequest) {
        const auth = await authenticate(req, ['doctor']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { serviceId, price } = await req.json();

            if (!serviceId || price == null) {
                return NextResponse.json(
                    { message: 'serviceId and price are required' },
                    { status: 400 }
                );
            }

            // Doctor has no @@unique on userId → findFirst
            const doctor = await prisma.doctor.findFirst({ where: { userId: auth.user.id } });
            if (!doctor) {
                return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
            }

            const service = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!service || !service.isActive) {
                return NextResponse.json({ message: 'Service not found or inactive' }, { status: 404 });
            }

            // @@unique([doctorId, serviceId]) → upsert instead of create to handle
            // the case where a soft-deleted record already exists
            const existing = await prisma.doctorService.findUnique({
                where: { doctorId_serviceId: { doctorId: doctor.id, serviceId } },
            });

            if (existing?.isActive) {
                return NextResponse.json(
                    { message: 'Service already assigned to this doctor' },
                    { status: 409 }
                );
            }

            if (existing) {
                // Reactivate the soft-deleted record with the new price
                const doctorService = await prisma.doctorService.update({
                    where: { doctorId_serviceId: { doctorId: doctor.id, serviceId } },
                    data: { price, isActive: true },
                });

                await logAction({
                    tableName: 'doctorService',
                    recordId: doctorService.id,
                    action: 'update',
                    oldValue: { isActive: false, price: existing.price },
                    newValue: { isActive: true, price },
                    performedBy: auth.user.id,
                });

                return NextResponse.json(doctorService, { status: 200 });
            }

            const doctorService = await prisma.doctorService.create({
                data: { doctorId: doctor.id, serviceId, price, isActive: true },
            });

            await logAction({
                tableName: 'doctorService',
                recordId: doctorService.id,
                action: 'create',
                oldValue: null,
                newValue: { doctorId: doctor.id, serviceId, price, isActive: true },
                performedBy: auth.user.id,
            });

            return NextResponse.json(doctorService, { status: 201 });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async PutDoctorServices(req: NextRequest) {
        const auth = await authenticate(req, ['doctor']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { doctorServiceId, price } = await req.json();

            if (!doctorServiceId || price == null) {
                return NextResponse.json(
                    { message: 'doctorServiceId and price are required' },
                    { status: 400 }
                );
            }

            const doctor = await prisma.doctor.findFirst({ where: { userId: auth.user.id } });
            if (!doctor) {
                return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
            }

            const existing = await prisma.doctorService.findUnique({
                where: { id: doctorServiceId },
            });

            if (!existing || existing.doctorId !== doctor.id) {
                return NextResponse.json({ message: 'Doctor service not found' }, { status: 404 });
            }

            if (!existing.isActive) {
                return NextResponse.json({ message: 'Cannot update a deactivated service' }, { status: 409 });
            }

            const doctorService = await prisma.doctorService.update({
                where: { id: doctorServiceId },
                data: { price },
            });

            await logAction({
                tableName: 'doctorService',
                recordId: doctorService.id,
                action: 'update',
                oldValue: { price: existing.price },
                newValue: { price },
                performedBy: auth.user.id,
            });

            return NextResponse.json(doctorService);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async DeleteDoctorServices(req: NextRequest) {
        const auth = await authenticate(req, ['doctor']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { doctorServiceId } = await req.json();

            if (!doctorServiceId) {
                return NextResponse.json({ message: 'doctorServiceId is required' }, { status: 400 });
            }

            const doctor = await prisma.doctor.findFirst({ where: { userId: auth.user.id } });
            if (!doctor) {
                return NextResponse.json({ message: 'Doctor not found' }, { status: 404 });
            }

            const existing = await prisma.doctorService.findUnique({
                where: { id: doctorServiceId },
            });

            if (!existing || existing.doctorId !== doctor.id) {
                return NextResponse.json({ message: 'Doctor service not found' }, { status: 404 });
            }

            if (!existing.isActive) {
                return NextResponse.json({ message: 'Service already deactivated' }, { status: 409 });
            }

            const doctorService = await prisma.doctorService.update({
                where: { id: doctorServiceId },
                data: { isActive: false },
            });

            await logAction({
                tableName: 'doctorService',
                recordId: doctorService.id,
                action: 'update',
                oldValue: { isActive: true },
                newValue: { isActive: false },
                performedBy: auth.user.id,
            });

            return NextResponse.json({ message: 'Doctor service deactivated successfully', doctorService });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    // common question endpoints


    // ── common question endpoints ─────────────────────────────────────────────────────────────────────
    // ==================================================================================================

    static async GetCommonQuestions(req: NextRequest) {
        try {
            const commonQuestions = await prisma.commonQuestion.findMany();
            return NextResponse.json(commonQuestions);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async GetCommonQuestionById(req: NextRequest, id: string) {
        const auth = await authenticate(req);
        if (auth instanceof NextResponse) return auth;

        try {
            const commonQuestion = await prisma.commonQuestion.findUnique({ where: { id } });
            if (!commonQuestion) {
                return NextResponse.json({ message: 'Common question not found' }, { status: 404 });
            }
            return NextResponse.json(commonQuestion);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async CreateCommonQuestion(req: NextRequest) {
        const auth = await authenticate(req, ['admin']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { question, answer } = await req.json();

            if (!question || !answer) {
                return NextResponse.json(
                    { message: 'question and answer are required' },
                    { status: 400 }
                );
            }

            const commonQuestion = await prisma.commonQuestion.create({
                data: { question, answer },
            });

            await logAction({
                tableName: 'commonQuestion',
                recordId: commonQuestion.id,
                action: 'create',
                oldValue: null,
                newValue: { question, answer },
                performedBy: auth.user.id,
            });

            return NextResponse.json(commonQuestion, { status: 201 });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async UpdateCommonQuestion(req: NextRequest, id: string) {
        const auth = await authenticate(req, ['admin']);
        if (auth instanceof NextResponse) return auth;

        try {
            const { question, answer } = await req.json();

            if (!question && !answer) {
                return NextResponse.json(
                    { message: 'At least one of question or answer is required' },
                    { status: 400 }
                );
            }

            const existing = await prisma.commonQuestion.findUnique({ where: { id } });
            if (!existing) {
                return NextResponse.json({ message: 'Common question not found' }, { status: 404 });
            }

            const commonQuestion = await prisma.commonQuestion.update({
                where: { id },
                data: { question: question ?? existing.question, answer: answer ?? existing.answer },
            });

            await logAction({
                tableName: 'commonQuestion',
                recordId: commonQuestion.id,
                action: 'update',
                oldValue: { question: existing.question, answer: existing.answer },
                newValue: { question: commonQuestion.question, answer: commonQuestion.answer },
                performedBy: auth.user.id,
            });

            return NextResponse.json(commonQuestion);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }

    static async DeleteCommonQuestion(req: NextRequest, id: string) {
        const auth = await authenticate(req, ['admin']);
        if (auth instanceof NextResponse) return auth;

        try {
            const existing = await prisma.commonQuestion.findUnique({ where: { id } });
            if (!existing) {
                return NextResponse.json({ message: 'Common question not found' }, { status: 404 });
            }

            await prisma.commonQuestion.delete({ where: { id } });

            await logAction({
                tableName: 'commonQuestion',
                recordId: id,
                action: 'delete',
                oldValue: { question: existing.question, answer: existing.answer },
                newValue: null,
                performedBy: auth.user.id,
            });

            return NextResponse.json({ message: 'Common question deleted successfully' });
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Server error';
            return NextResponse.json({ error: message }, { status: 500 });
        }
    }
}