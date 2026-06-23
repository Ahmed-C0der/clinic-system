// get data to fill and generate the pdf depend on pdf/PrescriptionTemplate.tsx as template if success save url in db

import { renderToBuffer } from '@react-pdf/renderer';
import { PrescriptionTemplate } from '@/app/pdf/PrescriptionTemplate';
import { uploadMedicalFile as uploadPDFBuffer } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';

export async function generatePrescriptionPDF(prescriptionId: string) {
  // 1. جيب البيانات
  const prescription = await prisma.prescription.findFirst({
    where: { id: prescriptionId },
    include: {
      items: true,
      visit: {
        select: {
          id: true,           // ✅ أضفنا id هنا
          notes: true,
          diagnosis: true,
          visitDate: true,
          
          appointment: {
            include: {
              patient: {
                select: {
                  id: true,
                  name: true,
                  dateOfBirth: true,
                },
              },
              doctor: {
                select: {
                  specialty: true,
                  user: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!prescription) throw new Error('Prescription not found');

  const { visit } = prescription;

  // 2. ولد الـ PDF — مع حل كل الـ null issues
  const pdfBuffer = await renderToBuffer(
  <PrescriptionTemplate
    patient={{
      name: visit.appointment.patient.name,
      dateOfBirth: visit.appointment.patient.dateOfBirth ?? new Date(),
    }}
    doctor={{
      name: visit.appointment.doctor.user.name,
      specialty: visit.appointment.doctor.specialty ?? 'غير محدد',
    }}
    visit={{
      id: visit.id,
      date: visit.visitDate,
      diagnosis: visit.diagnosis ?? 'غير محدد',
      notes: visit.notes,
    }}
    items={prescription.items.map((item) => ({
      id: item.id,
      medicationName: item.medicineName,
      dosage: item.dosage ?? '',
      frequency: item.frequency ?? '',
      duration: item.duration ?? '',
      instructions: item.instructions,
    }))}
  />
);


  // 3. ارفع على Cloudinary
  const fileName = `prescription_${prescriptionId}_${Date.now()}`;
  
  const uploadResult = await uploadPDFBuffer(       
    Buffer.from(pdfBuffer),
    fileName,
    visit.appointment.patient.id,
  ) as { secure_url: string; bytes: number };  

  // 4. احفظ في MedicalFile
  const medicalFile = await prisma.medicalFile.create({
    data: {
      patientId: visit.appointment.patientId,              
      visitId: visit.id,
      sourceType: 'visit',
      fileType: 'report',
      fileName: `${fileName}.pdf`,
      fileUrl: uploadResult.secure_url,        
      fileSizeBytes: uploadResult.bytes,
    },
  });

  return medicalFile;
}