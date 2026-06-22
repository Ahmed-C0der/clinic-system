import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { getPaginationParams } from '@/lib/utils';

import { Gender, MedicalFileType, MedicalFileSource } from '../../../lib/generated/prisma/client';
import { AppointmentsController } from './appointments.controller';
import { uploadMedicalFile } from '@/lib/cloudinary';

export class PatientsController {

  private static async checkPatientAccess(authUser: any, patientId: string): Promise<boolean> { //  prevent pateint to acces another patient
    if (authUser.role === 'admin' || authUser.role === 'doctor' || authUser.role === 'receptionist') {
      return true;
    }
    if (authUser.role === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId } // patient id not userid
      });
      return !!(patient && patient.userId === authUser.id);
    }
    return false;
  }

  static async list(req: NextRequest ,search:string/*search value will contain name of pateint or its code or his phone*/ , gender ?:Gender , bloodType?:string , createdFrom?:string , createdTo?:string) {
    try {
      const auth = await authenticate(req, ['admin', 'doctor', 'receptionist']);
      if (auth instanceof NextResponse) return auth;

      const { page, limit, skip } = getPaginationParams(req);


      // Build filters
      const where: any = { deletedAt: null };
      /*
      we ues it to put our info for  search

      where:{
      deletedAT:null
        OR:[
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { patientCode: { contains: search, mode: 'insensitive' } }
        ],
        gender?,
        bloodType,
        createdAt{
        gte:
        lte:

        }
      }
      */
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { patientCode: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (gender) {
        where.gender = gender;
      }

      if (bloodType) {
        where.bloodType = bloodType;
      }

      if (createdFrom || createdTo) {
        where.createdAt = {};
        if (createdFrom) {
          where.createdAt.gte = new Date(createdFrom);
        }
        if (createdTo) {
          where.createdAt.lte = new Date(createdTo);
        }
      }

      const [total, data] = await Promise.all([
        prisma.patient.count({ where }),
        prisma.patient.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true
              }
            }
          }
        })
      ]);

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
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }

  static async create(req: NextRequest) { // at first user have patient role but without any info about him , so we use it to create a real patient profile with his info
    try {
      const auth = await authenticate(req, ['admin', 'receptionist']);
      if (auth instanceof NextResponse) return auth;

      const body = await req.json();
      const {
        userId,
        name,
        dateOfBirth,
        gender,
        phone,
        address,
        bloodType,
        chronicDiseases,
        allergies
      } = body;

      if (!name) {
        return NextResponse.json({ error: 'Patient name is required' }, { status: 400 });
      }

      // Check if userId is already linked to another patient
      if (userId) {
        const existing = await prisma.patient.findUnique({
          where: { userId }
        });
        if (existing) {
          return NextResponse.json({ error: 'User is already linked to a patient' }, { status: 400 });
        }
      }

      // Auto-generate patient code (P-XXXXX)
      const count = await prisma.patient.count();
      const patientCode = `P-${String(count + 1).padStart(5, '0')}`;

      const patient = await prisma.patient.create({
        data: {
          userId: userId || null,
          patientCode,
          name,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender as Gender || null,
          phone: phone || null,
          address: address || null,
          bloodType: bloodType || null,
          chronicDiseases: chronicDiseases || null,
          allergies: allergies || null
        }
      });

      await logAction({
        tableName: 'patients',
        recordId: patient.id,
        action: 'create',
        newValue: patient,
        performedBy: auth.user.id
      });

      return NextResponse.json(patient, { status: 201 });
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }

  static async get(req: NextRequest, id: string) { // get patient by id including his info without his medical files
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;
      const allowed = await this.checkPatientAccess(auth.user, id);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      const patient = await prisma.patient.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              isActive: true
            }
          }
        }
      });

      if (!patient || patient.deletedAt) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json(patient);
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }

  static async update(req: NextRequest, id: string) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor', 'patient']);
      if (auth instanceof NextResponse) return auth;
      const allowed = await this.checkPatientAccess(auth.user, id);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      const oldPatient = await prisma.patient.findUnique({
        where: { id }
      });

      if (!oldPatient || oldPatient.deletedAt) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      const body = await req.json();
      const {
        name,
        dateOfBirth,
        gender,
        phone,
        address,
        bloodType,
        chronicDiseases,
        allergies
      } = body;

      const updated = await prisma.patient.update({
        where: { id },
        data: {
          name: name ?? oldPatient.name,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : oldPatient.dateOfBirth,
          gender: gender ? (gender as Gender) : oldPatient.gender,
          phone: phone ?? oldPatient.phone,
          address: address ?? oldPatient.address,
          bloodType: bloodType ?? oldPatient.bloodType,
          chronicDiseases: chronicDiseases ?? oldPatient.chronicDiseases,
          allergies: allergies ?? oldPatient.allergies
        }
      });

      await logAction({
        tableName: 'patients',
        recordId: id,
        action: 'update',
        oldValue: oldPatient,
        newValue: updated,
        performedBy: auth.user.id
      });

      return NextResponse.json(updated);
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }

  static async delete(req: NextRequest, id:string) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist']);
      if (auth instanceof NextResponse) return auth;
      const patient = await prisma.patient.findUnique({
        where: { id }
      });

      if (!patient || patient.deletedAt) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      const softDeleted = await prisma.patient.update({
        where: { id },
        data: { deletedAt: new Date() }
      });

      await logAction({
        tableName: 'patients',
        recordId: id,
        action: 'delete',
        oldValue: patient,
        newValue: softDeleted,
        performedBy: auth.user.id
      });

      return NextResponse.json({ success: true, message: 'Patient soft deleted successfully' });
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }

  static async listVisits(req: NextRequest, id:string) { // get visits of specific patient
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;
      const allowed = await this.checkPatientAccess(auth.user, id);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      const { page, limit, skip } = getPaginationParams(req);

      const [total, data] = await Promise.all([
        prisma.visit.count({
          where: {
            deletedAt: null,
            appointment: { patientId: id }
          }
        }),
        prisma.visit.findMany({
          where: {
            deletedAt: null,
            appointment: { patientId: id }
          },
          skip,
          take: limit,
          orderBy: { visitDate: 'desc' },
          include: { // get doctor id , specially , pateint name 
            appointment: {
              include: {
                doctor: {
                  select:{
                    id:true,
                    specialty:true,
                    user:{
                      select:{
                        name:true
                      }
                    }
                  }
                }
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
      return AppointmentsController.catchError(e)
    }
  }

  static async listPrescriptions(req: NextRequest, id: string) { // get prescriptions of specific patient and include items and doctor name
    try {
      const auth = await authenticate(req, ["receptionist","admin","doctor","patient"]);
      if (auth instanceof NextResponse) return auth;
      const allowed = await this.checkPatientAccess(auth.user, id);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      const { page, limit, skip } = getPaginationParams(req);

      const [total, data] = await Promise.all([
        prisma.prescription.count({
          where: {
            deletedAt: null,
            visit: { appointment: { patientId: id } }
          }
        }),
        prisma.prescription.findMany({
          where: {
            deletedAt: null,
            visit: { appointment: { patientId: id } }
          },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            visit: {
              include: {
                appointment: {
                  include: {
                    doctor: {
                      include: {
                        user: {
                          select: { name: true }
                        }
                      }
                    }
                  }
                }
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
      return AppointmentsController.catchError(e)
    }
  }

  static async listInvoices(req: NextRequest, params: { patientId: string }) { // get all invoices of specific patient with items (more detail about each invoice like price qty total) and patient name 
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'patient', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const { patientId:id } = params;
      const allowed = await this.checkPatientAccess(auth.user, id);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      const { page, limit, skip } = getPaginationParams(req);

      const [total, data] = await Promise.all([
        prisma.invoice.count({
          where: { patientId: id }
        }),
        prisma.invoice.findMany({
          where: { patientId: id },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: true, // price, qty, total, 
            doctor: {
              include: {
                user: { select: { name: true } }
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
      return AppointmentsController.catchError(e)
    }
  }

  static async listFiles(req: NextRequest, params: { patientId: string }) { // list all medical files of specific patient with visit and doctor name  
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
      const allowed = await this.checkPatientAccess(auth.user, id);
      if (!allowed) {
        return NextResponse.json({ error: 'Forbidden: Insufficient permissions' }, { status: 403 });
      }

      const { searchParams } = new URL(req.url);
      const fileType = searchParams.get('file_type') as MedicalFileType | null;
      const visitId = searchParams.get('visit_id');
      const from = searchParams.get('from');
      const to = searchParams.get('to');

      const where: any = { patientId: id };

      if (fileType) {
        where.fileType = fileType;
      }
      if (visitId) {
        where.visitId = visitId;
      }
      if (from || to) {
        where.uploadedAt = {};
        if (from) where.uploadedAt.gte = new Date(from);
        if (to) where.uploadedAt.lte = new Date(to);
      }

      const { page, limit, skip } = getPaginationParams(req);

      const [total, data] = await Promise.all([
        prisma.medicalFile.count({ where }),
        prisma.medicalFile.findMany({
          where,
          skip,
          take: limit,
          orderBy: { uploadedAt: 'desc' }
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
      return AppointmentsController.catchError(e)
    }
  }

  static async uploadFile(req: NextRequest, params: { patientId: string }) { // 
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const { patientId } = params;

      // Parse multipart form data
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const fileType = formData.get('file_type') as MedicalFileType | null;
      const visitId = formData.get('visit_id') as string | null;
      const sourceType = (formData.get('source_type') as MedicalFileSource | null) || 'manual';

      if (!file || !fileType) {
        return NextResponse.json({ error: 'File and file_type are required' }, { status: 400 });
      }

      // const allowedFileExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'tiff', 'bmp', 'webp', 'heic', 'heif'];
      // const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      // if (!allowedFileExtensions.includes(fileExtension)) {
      //   return NextResponse.json({ error: 'Invalid file extension' }, { status: 400 });
      // }
      // const allowedTypes = ['report', 'image', 'document', 'other'];
      // if (!allowedTypes.includes(fileType)) {
      //   return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      // }

      // Check file size (max 20MB)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const maxSize = 20 * 1024 * 1024; // 20 MB
      if (buffer.length > maxSize) {
        return NextResponse.json({ error: 'File size exceeds maximum 20MB limit' }, { status: 400 });
      }

      // Save file locally in public/uploads
      
      const result = await uploadMedicalFile(
        buffer,
        file.name,
        patientId
      ) as any

      const medicalFile = await prisma.medicalFile.create({
        data: {
          patientId,
          visitId: visitId || null,
          sourceType,
          fileType,
          fileName: file.name,
          fileUrl:      result.secure_url,
          fileSizeBytes: buffer.length
        }
      });

      await logAction({
        tableName: 'medical_files',
        recordId: medicalFile.id,
        action: 'create',
        newValue: medicalFile,
        performedBy: auth.user.id
      });

      return NextResponse.json(medicalFile, { status: 201 });
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }

  static async deleteFile(req: NextRequest, params: { patientId: string; fileId: string }) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const { fileId } = params;

      const fileRecord = await prisma.medicalFile.findUnique({
        where: { id: fileId }
      });

      if (!fileRecord) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }

      await prisma.medicalFile.delete({
        where: { id: fileId }
      });

      await logAction({
        tableName: 'medical_files',
        recordId: fileId,
        action: 'delete',
        oldValue: fileRecord,
        performedBy: auth.user.id
      });

      return NextResponse.json({ success: true, message: 'File deleted successfully' });
    } catch (e: any) {
      return AppointmentsController.catchError(e)
    }
  }
}
