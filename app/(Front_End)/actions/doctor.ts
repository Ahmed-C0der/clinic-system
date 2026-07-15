"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth"
import { Gender } from "@/lib/generated/prisma/client"

const validateUser = async (
    role: string = 'doctor',
    include = {
        user: {
            select: {
                name: true,
                profileImg: true
            }
        }
    }
) => {


    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get('access_token')?.value;
    if (!accessToken) {
        return {
            message: "Unauthorized: No session token found",
            doctor: null,
            success: false
        }
    }
    const payload = verifyAccessToken(accessToken);
    if (!payload || payload.role !== role) {
        return {
            message: "Forbidden: Invalid user session",
            doctor: null,
            success: false
        }
    }
    const doctor = await prisma.doctor.findFirst({
        where: { userId: payload.id },
        include
    });
    if (!doctor) {
        return {
            message: "Doctor profile not found for this user",
            doctor: null,
            success: false
        }
    };
    return { doctor, success: true };
}

export async function getDoctorDashboardData() {
    // git patient for this today 
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return {
            message: validateUserData.message,
            user: null,
            success: false
        }
    }
    const doctor = validateUserData.doctor;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const [appointments, appointmentsCount] = await Promise.all([
        await prisma.appointment.findMany({
            where: {
                doctorId: doctor!.id,
                status: {
                    in: ['scheduled', 'waiting', 'in_progress', "done"]
                },
                scheduledAt: {
                    gte: today
                }
            },
            include: {
                patient: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                profileImg: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                scheduledAt: 'asc'
            },
        }),
        await prisma.appointment.count({
            where: {
                doctorId: doctor!.id,
                status: {
                    in: ['scheduled', 'waiting', 'in_progress']
                },
                scheduledAt: {
                    gte: today
                }
            }
        })
    ])
    // get all prescription this doctor
    const prescriptionsCount = await prisma.prescription.count({
        where: {
            visit: {
                appointment: {
                    doctorId: doctor!.id,
                    status: {
                        in: ['scheduled', 'waiting', 'in_progress']
                    },
                    scheduledAt: {
                        gte: today
                    }
                }
            }
        }
    });
    // get all appointments follow-up this doctor
    const appointmentsFollowUpCount = await prisma.appointment.count({
        where: {
            doctorId: doctor!.id,
            type: "follow_up",
            scheduledAt: {
                gte: today
            }
        }
    });
    return {
        appointments, // list of appointment
        appointmentsCount,// number of appointment,
        prescriptionsCount,// number of prescription,
        appointmentsFollowUpCount, // number of follow up
        doctor
    }
}



export async function GetDoctorId() {
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return null;
    }
    return validateUserData.doctor?.id;
}


// Start Get doctor day scheduel

export async function getDoctorDaySchedule({ date = new Date() }: { date?: Date }) {
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return {
            success: false,
            message: validateUserData.message,
            appointments: []
        };
    }
    const doctor = validateUserData.doctor;
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    const appointments = await prisma.appointment.findMany({
        where: {
            doctorId: doctor!.id,
            status: {
                in: ['scheduled', 'waiting', 'in_progress', "done"]
            },
            scheduledAt: {
                gte: dayStart,
                lte: dayEnd
            }
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            name: true,
                            profileImg: true
                        }
                    }
                }
            }
        },
        orderBy: {
            scheduledAt: 'asc'
        }
    });
    return {
        success: true,
        message: "تم جلب البيانات بنجاح",
        appointments: appointments
    };
}
// start Get Patient Data


export async function getDoctorPatients({ take = 10, skip = 0, page = 1 }: { take?: number, skip?: number, page?: number }) {
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return {
            message: validateUserData.message,
            data: null,
            success: false
        }
    }
    const doctor = validateUserData.doctor;
    // get pateint data and count
    const [patientCount, patientsData] = await Promise.all([
        prisma.visit.count({
            where: {
                appointment: {
                    doctorId: doctor!.id,
                    status: {
                        in: ['scheduled', 'waiting', 'in_progress', "done"]
                    }
                }
            }
        }),

        prisma.visit.findMany({
            where: {
                appointment: {
                    doctorId: doctor!.id,
                    status: {
                        in: ['scheduled', 'waiting', 'in_progress', "done"]
                    }
                }
            },
            select: {
                id: true,
                notes: true,
                visitDate: true,
                appointment: {
                    include: {
                        patient: {
                            select: {
                                patientCode: true,
                                id: true,
                                gender: true,
                                user: {
                                    select: {
                                        name: true,
                                        profileImg: true
                                    }
                                }
                            }
                        }
                    }
                    ,
                }
            },
            orderBy: {
                appointment: {
                    scheduledAt: 'asc'
                }
            },
            take,
            skip
        })
    ])

    //    get appointment count for day
    const now = new Date()
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const appointmentsCount = await prisma.appointment.count({
        where: {
            doctorId: doctor!.id,
            status: {
                in: ['scheduled', 'waiting', 'in_progress']
            },
            scheduledAt: {
                gte: dayStart,
                lte: dayEnd
            }
        }
    })
    const activeCasesCount = await prisma.visit.count({
        where: {
            appointment: {
                doctorId: doctor!.id,
                status: {
                    in: ['scheduled', 'waiting', 'in_progress'] // من غير 'done'
                }
            }
        }
    })
    return {
        success: true,
        data: { patientCount, patientsData, appointmentsCount, activeCasesCount },
        message: "success"
    };
}

// get all visits for specific patient 
export async function allPatientVisit(patientId: string, { take = 10, skip = 0 }: { take?: number; skip?: number } = {}) {
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return {
            success: false,
            message: validateUserData.message,
            data: null
        };
    }
    const doctor = validateUserData.doctor;
    const [total, visits] = await Promise.all([
        prisma.visit.count({
            where: {
                appointment: {
                    patientId: patientId,
                    doctorId: doctor!.id
                }
            }
        }),
        prisma.visit.findMany({
            where: {
                appointment: {
                    patientId: patientId,
                    doctorId: doctor!.id
                }
            },
            skip,
            take,
            select: {
                id: true,
                notes: true,
                visitDate: true,
                diagnosis: true,
                chiefComplaint: true,
                appointment: {
                    select: {
                        id: true,
                        scheduledAt: true,
                        status: true,
                        type: true,
                    }
                }
            },
            orderBy: {
                appointment: {
                    scheduledAt: 'desc'
                }
            }
        })
    ]);
    return {
        success: true,
        message: "تم جلب البيانات بنجاح",
        visits,
        total
    };
}

export async function getPatientPrescriptions(patientId: string, { take = 10, skip = 0 }: { take?: number; skip?: number } = {}) {
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return { success: false, message: validateUserData.message, data: null };
    }
    const doctor = validateUserData.doctor;
    const [total, prescriptions] = await Promise.all([
        prisma.prescription.count({
            where: {
                deletedAt: null,
                visit: {
                    appointment: {
                        patientId,
                        doctorId: doctor!.id
                    }
                }
            }
        }),
        prisma.prescription.findMany({
            where: {
                deletedAt: null,
                visit: {
                    appointment: {
                        patientId,
                        doctorId: doctor!.id
                    }
                }
            },
            skip,
            take,
            include: { items: true },
            orderBy: { createdAt: 'desc' }
        })
    ]);
    return { success: true, prescriptions, total };
}

export async function getPatientMedicalFiles(patientId: string, { take = 10, skip = 0 }: { take?: number; skip?: number } = {}) {
    const validateUserData = await validateUser();
    if (!validateUserData.success) {
        return { success: false, message: validateUserData.message, data: null };
    }
    const [total, medicalFiles] = await Promise.all([
        prisma.medicalFile.count({ where: { patientId } }),
        prisma.medicalFile.findMany({
            where: { patientId },
            skip,
            take,
            orderBy: { uploadedAt: 'desc' }
        })
    ]);
    return { success: true, medicalFiles, total };
}