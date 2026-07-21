// get data to fill and generate the pdf depend on pdf/PrescriptionTemplate.tsx as template if success save url in db

import { DocumentProps, renderToBuffer } from '@react-pdf/renderer';
import { PrescriptionTemplate } from '@/app/pdf/PrescriptionTemplate';
import { uploadMedicalFile, uploadMedicalFile as uploadPDFBuffer } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { InvoiceTemplate } from '../pdf/InvoiceTemplate';

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
// this services do every thing to generate PDF just receive fileUrl and render it
export async function generateInvoicePDF(invoiceId: string) {
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId },
    include: {
      items: true,
      visit: {
        select: {
          
          id: true,
          // patientId: true,
          appointment: {
            select: {
              patientId:true,
              doctorId:true,
              patient: { select: { name: true, phone: true } },
              doctor:  { select: { specialty: true, user: { select: { name: true } } } },
            },
          },
        },
      },
    },
  });

  if (!invoice) throw new Error('Invoice not found');
  const { visit } = invoice;

  const pdfBuffer = await renderToBuffer(
    <InvoiceTemplate
      invoiceNo={invoice.id.slice(0, 8).toUpperCase()}
      date={invoice.createdAt}
      patient={{ name: visit.appointment.patient.name, phone: visit.appointment.patient.phone }}
      doctor={{ name: visit.appointment.doctor.user.name, specialty: visit.appointment.doctor.specialty ?? 'غير محدد' }}
      items={invoice.items.map((item) => ({
        id:          item.id,
        description: item.description,
        quantity:    Number(item.quantity),
        unitPrice:   Number(item.unitPrice),
      }))}
      discount={Number(invoice.discount ?? 0)}
      tax={ 0}
      status={invoice.status as 'paid' | 'pending' | 'cancelled'}
    /> as React.ReactElement<DocumentProps>
  );

  const fileName = `invoice_${invoiceId}_${Date.now()}`;
  const result   = await uploadMedicalFile(Buffer.from(pdfBuffer), fileName, visit.appointment.patientId) as { secure_url: string; bytes: number };

   const medicalFile = await prisma.medicalFile.create({
    data: {
      patientId:     visit.appointment.patientId,
      visitId:       visit.id,
      sourceType:    'visit',
      fileType:      'report',
      fileName:      `${fileName}.pdf`,
      fileUrl:       result.secure_url,
      fileSizeBytes: result.bytes,
    },
  });
  return medicalFile
}