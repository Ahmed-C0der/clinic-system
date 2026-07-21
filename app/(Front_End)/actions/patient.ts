"use server"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { verifyAccessToken } from "@/lib/auth"
import { Gender } from "@/lib/generated/prisma/client"
// Start Helper function //

// Helper function to resolve patient ID from token if not provided directly
async function resolvePatientId(providedPatientId?: string): Promise<string> {
  if (providedPatientId) return providedPatientId;
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get('access_token')?.value;
  if (!accessToken) throw new Error("Unauthorized: No session token found");
  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== 'patient') throw new Error("Forbidden: Invalid user session");
  
  const patient = await prisma.patient.findUnique({
    where: { userId: payload.id }
  });
  if (!patient) throw new Error("Patient profile not found for this user");
  return patient.id;
}

// Helper function to calculate relative time in Arabic
function getArabicTimeAgo(date: Date): string {
  const now = new Date(); // store hour , minute , second , millisecond
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // don't store so use it to compare days not hours
  const visit = new Date(date.getFullYear(), date.getMonth(), date.getDate()); // don't store so use it to compare days not hours
  
  const diffTime = today.getTime() - visit.getTime(); // diffTime is in milliseconds
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // convert milliseconds to days
  
  if (diffDays < 0) {
    return "في المستقبل";
  }
  if (diffDays === 0) {
    return "اليوم";
  }
  if (diffDays === 1) {
    return "أمس";
  }
  if (diffDays === 2) {
    return "منذ يومين";
  }
  if (diffDays >= 3 && diffDays <= 10) {
    return `منذ ${diffDays} أيام`;
  }
  
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks === 1) {
    return "منذ أسبوع";
  }
  if (diffWeeks === 2) {
    return "منذ أسبوعين";
  }
  if (diffWeeks >= 3 && diffWeeks <= 4) {
    return `منذ ${diffWeeks} أسابيع`;
  }
  
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) {
    return "منذ شهر";
  }
  if (diffMonths === 2) {
    return "منذ شهرين";
  }
  if (diffMonths >= 3 && diffMonths <= 10) {
    return `منذ ${diffMonths} أشهر`;
  }
  if (diffMonths > 10) {
    return `منذ ${diffMonths} شهراً`;
  }
  
  return `منذ أكثر من سنة`;
}

// Helper function to calculate remaining days in Arabic
function getArabicDaysRemaining(date: Date): { text: string; days: number } {
  const now = new Date();
  const scheduled = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffTime = scheduled.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { text: "فائت", days: diffDays };
  }
  if (diffDays === 0) {
    return { text: "اليوم", days: 0 };
  }
  if (diffDays === 1) {
    return { text: "غداً", days: 1 };
  }
  if (diffDays === 2) {
    return { text: "باقي يومان", days: 2 };
  }
  if (diffDays >= 3 && diffDays <= 10) {
    return { text: `باقي ${diffDays} أيام`, days: diffDays };
  }
  return { text: `باقي ${diffDays} يوماً`, days: diffDays };
}
// End Helper function //


// 1. Get Patient Dashboard Data
export async function getPatientDashboardData(patientId?: string) {
  try {
    const resolvedId = await resolvePatientId(patientId);

    // A. Fetch Patient info (with profileImg from User)
    const patient = await prisma.patient.findUnique({
      where: {
        id: resolvedId,
        deletedAt: null
      },
      include: {
        user: {
          select: {
            profileImg: true
          }
        }
      }
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // B. Stats
    // Total visits count
    const totalVisits = await prisma.visit.count({
      where: {
        appointment: {
          patientId: resolvedId
        },
        deletedAt: null
      }
    });

    // Last visit details
    const lastVisitRecord = await prisma.visit.findFirst({
      where: {
        appointment: {
          patientId: resolvedId
        },
        deletedAt: null
      },
      orderBy: {
        visitDate: 'desc'
      },
      take: 1 // you can delete it if using findFirst or let it for more efficiency :)
    });

    const lastVisitDate = lastVisitRecord ? lastVisitRecord.visitDate : null;
    const lastVisitTimeAgo = lastVisitDate ? getArabicTimeAgo(lastVisitDate) : "لا توجد زيارات سابقة";

    // Active prescriptions count (non-deleted prescriptions)
    const activePrescriptionsCount = await prisma.prescription.count({
      where: {
        visit: {
          appointment: {
            patientId: resolvedId
          }
        },
        deletedAt: null
      }
    });

    // C. Next scheduled appointment
    const nextAppointmentRecord = await prisma.appointment.findFirst({
      where: {
        patientId: resolvedId,
        status: {
          in: ['scheduled', 'waiting', 'in_progress']
        },
        scheduledAt: {
          gte: new Date()
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                profileImg: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    let nextAppointment = null;
    if (nextAppointmentRecord) {
      const countdown = getArabicDaysRemaining(nextAppointmentRecord.scheduledAt);
      nextAppointment = {
        id: nextAppointmentRecord.id,
        doctorName: nextAppointmentRecord.doctor.user.name,
        doctorSpecialty: nextAppointmentRecord.doctor.specialty,
        doctorProfileImg: nextAppointmentRecord.doctor.user.profileImg,
        scheduledAt: nextAppointmentRecord.scheduledAt,
        serviceName: nextAppointmentRecord.service.name,
        status: nextAppointmentRecord.status,
        notes: nextAppointmentRecord.notes,
        daysRemainingText: countdown.text,
        daysRemainingValue: countdown.days
      };
    }

    // D. Latest Visit Details
    const latestVisitRecord = await prisma.visit.findFirst({
      where: {
        appointment: {
          patientId: resolvedId
        },
        deletedAt: null
      },
      orderBy: {
        visitDate: 'desc'
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                    profileImg: true
                  }
                }
              }
            }
          }
        },
        prescriptions: {
          where: {
            deletedAt: null
          },
          include: {
            items: true
          }
        }
      }
    });

    let latestVisit = null;
    if (latestVisitRecord) {
      // Gather all prescription items from this visit
      const prescriptionItems = latestVisitRecord.prescriptions.flatMap(p => p.items.map(item => ({
        id: item.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions
      })));

      latestVisit = {
        id: latestVisitRecord.id,
        visitDate: latestVisitRecord.visitDate,
        chiefComplaint: latestVisitRecord.chiefComplaint,
        diagnosis: latestVisitRecord.diagnosis,
        notes: latestVisitRecord.notes,
        weightKg: latestVisitRecord.weightKg ? Number(latestVisitRecord.weightKg) : null,
        heightCm: latestVisitRecord.heightCm ? Number(latestVisitRecord.heightCm) : null,
        bloodPressure: latestVisitRecord.bloodPressure,
        temperatureC: latestVisitRecord.temperatureC ? Number(latestVisitRecord.temperatureC) : null,
        doctorName: latestVisitRecord.appointment.doctor.user.name,
        doctorSpecialty: latestVisitRecord.appointment.doctor.specialty,
        prescriptionItems
      };
    }

    return {
      patient: {
        id: patient.id,
        patientCode: patient.patientCode,
        name: patient.name,
        profileImg: patient.user?.profileImg || null
      },
      stats: {
        totalVisits,
        lastVisitDate,
        lastVisitTimeAgo,
        activePrescriptionsCount
      },
      nextAppointment,
      latestVisit
    };
  } catch (error) {
    console.error("Error in getPatientDashboardData:", error);
    throw new Error("حدث خطأ أثناء تحميل بيانات لوحة التحكم.");
  }
}

// 2. Get Patient Appointments
export async function getPatientAppointments(patientId?: string) {
  try {
    const resolvedId = await resolvePatientId(patientId);

    const appointments = await prisma.appointment.findMany({
      where: {
        patientId: resolvedId
      },
      orderBy: {
        scheduledAt: 'desc'
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                name: true,
                profileImg: true
              }
            }
          }
        },
        service: {
          select: {
            name: true
          }
        }
      }
    });

    const now = new Date();

    const formattedAppointments = appointments.map(app => {
      const countdown = getArabicDaysRemaining(app.scheduledAt);
      return {
        id: app.id,
        doctorName: app.doctor.user.name,
        doctorSpecialty: app.doctor.specialty,
        doctorProfileImg: app.doctor.user.profileImg,
        scheduledAt: app.scheduledAt,
        serviceName: app.service.name,
        status: app.status,
        notes: app.notes,
        daysRemainingText: countdown.text,
        daysRemainingValue: countdown.days
      };
    });

    // Split into upcoming and past
    const upcoming = formattedAppointments.filter(
      app => ['scheduled', 'waiting', 'in_progress'].includes(app.status) && app.scheduledAt >= now
    ).sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime()); // Ascending for upcoming

    const past = formattedAppointments.filter(
      app => (['done'].includes(app.status) && app.scheduledAt >= now)
    ); // Descending for past (as queried)

    return {
      upcoming,
      past
    };
  } catch (error) {
    console.error("Error in getPatientAppointments:", error);
    throw new Error("حدث خطأ أثناء تحميل المواعيد.");
  }
}

// 3. Get Patient Medical History
export async function getPatientMedicalHistory(patientId?: string) {
  try {
    const resolvedId = await resolvePatientId(patientId);

    // Fetch visits
    const visitsRecord = await prisma.visit.findMany({
      where: {
        appointment: {
          patientId: resolvedId
        },
        deletedAt: null
      },
      orderBy: {
        visitDate: 'desc'
      },
      include: {
        appointment: {
          include: {
            doctor: {
              include: {
                user: {
                  select: {
                    name: true,
                    profileImg: true
                  }
                }
              }
            }
          }
        },
        prescriptions: {
          where: {
            deletedAt: null
          },
          include: {
            items: true
          }
        }
      }
    });

    const visits = visitsRecord.map(visit => {
      const prescriptionItems = visit.prescriptions.flatMap(p => p.items.map(item => ({
        id: item.id,
        medicineName: item.medicineName,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions
      })));

      return {
        id: visit.id,
        visitDate: visit.visitDate,
        chiefComplaint: visit.chiefComplaint,
        diagnosis: visit.diagnosis,
        notes: visit.notes,
        weightKg: visit.weightKg ? Number(visit.weightKg) : null,
        heightCm: visit.heightCm ? Number(visit.heightCm) : null,
        bloodPressure: visit.bloodPressure,
        temperatureC: visit.temperatureC ? Number(visit.temperatureC) : null,
        doctorName: visit.appointment.doctor.user.name,
        doctorSpecialty: visit.appointment.doctor.specialty,
        prescriptionItems
      };
    });

    // Fetch medical files
    const medicalFilesRecord = await prisma.medicalFile.findMany({
      where: {
        patientId: resolvedId
      },
      orderBy: {
        uploadedAt: 'desc'
      }
    });

    const medicalFiles = medicalFilesRecord.map(file => ({
      id: file.id,
      fileName: file.fileName,
      fileUrl: file.fileUrl,
      fileSizeBytes: file.fileSizeBytes,
      fileType: file.fileType,
      uploadedAt: file.uploadedAt
    }));

    return {
      visits,
      medicalFiles
    };
  } catch (error) {
    console.error("Error in getPatientMedicalHistory:", error);
    throw new Error("حدث خطأ أثناء تحميل السجل الطبي.");
  }
}

// 4. Get Patient Profile
export async function getPatientProfile(patientId?: string) {
  try {
    const resolvedId = await resolvePatientId(patientId);

    const patient = await prisma.patient.findUnique({
      where: {
        id: resolvedId,
        deletedAt: null
      },
      include: {
        user: true
      }
    });

    if (!patient) {
      throw new Error("Patient not found");
    }

    // Stats for profile sidebar card
    const totalVisits = await prisma.visit.count({
      where: {
        appointment: {
          patientId: resolvedId
        },
        deletedAt: null
      }
    });

    const lastVisitRecord = await prisma.visit.findFirst({
      where: {
        appointment: {
          patientId: resolvedId
        },
        deletedAt: null
      },
      orderBy: {
        visitDate: 'desc'
      }
    });

    const lastVisitDate = lastVisitRecord ? lastVisitRecord.visitDate : null;

    const activePrescriptionsCount = await prisma.prescription.count({
      where: {
        visit: {
          appointment: {
            patientId: resolvedId
          }
        },
        deletedAt: null
      }
    });

    return {
      id: patient.id,
      patientCode: patient.patientCode,
      name: patient.name,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      phone: patient.phone,
      address: patient.address,
      bloodType: patient.bloodType,
      chronicDiseases: patient.chronicDiseases,
      allergies: patient.allergies,
      email: patient.user?.email || null,
      profileImg: patient.user?.profileImg || null,
      createdAt: patient.createdAt,
      stats: {
        totalVisits,
        lastVisitDate,
        activePrescriptionsCount
      }
    };
  } catch (error) {
    console.error("Error in getPatientProfile:", error);
    throw new Error("حدث خطأ أثناء تحميل الملف الشخصي.");
  }
}

// 5. Update Patient Profile
export async function updatePatientProfile(
  patientId: string | undefined,
  data: {
    name?: string;
    dateOfBirth?: Date | null;
    gender?: Gender;
    phone?: string | null;
    address?: string | null;
    bloodType?: string | null;
    chronicDiseases?: string | null;
    allergies?: string | null;
    email?: string;
  }
) {
  try {
    const resolvedId = await resolvePatientId(patientId);

    // Get patient to find associated userId
    const patientRecord = await prisma.patient.findUnique({
      where: { id: resolvedId },
      select: { userId: true }
    });

    if (!patientRecord) {
      throw new Error("Patient not found");
    }

    // Prepare patient update fields
    const patientUpdate: any = {};
    if (data.name !== undefined) patientUpdate.name = data.name;
    if (data.dateOfBirth !== undefined) patientUpdate.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) patientUpdate.gender = data.gender;
    if (data.phone !== undefined) patientUpdate.phone = data.phone;
    if (data.address !== undefined) patientUpdate.address = data.address;
    if (data.bloodType !== undefined) patientUpdate.bloodType = data.bloodType;
    if (data.chronicDiseases !== undefined) patientUpdate.chronicDiseases = data.chronicDiseases;
    if (data.allergies !== undefined) patientUpdate.allergies = data.allergies;

    // Use transaction to update both Patient and User models
    await prisma.$transaction(async (tx) => {
      // Update patient table
      await tx.patient.update({
        where: { id: resolvedId },
        data: patientUpdate
      });

      // Update user table if userId exists
      if (patientRecord.userId) {
        const userUpdate: any = {};
        if (data.name !== undefined) userUpdate.name = data.name;
        if (data.email !== undefined) userUpdate.email = data.email;
        if (data.gender !== undefined) userUpdate.gender = data.gender;
        if (data.phone !== undefined) userUpdate.phone = data.phone;

        await tx.user.update({
          where: { id: patientRecord.userId },
          data: userUpdate
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/patient/profile");
    revalidatePath("/patient/dashboard");

    return { success: true };
  } catch (error) {
    console.error("Error in updatePatientProfile:", error);
    throw new Error("حدث خطأ أثناء تحديث الملف الشخصي.");
  }
}