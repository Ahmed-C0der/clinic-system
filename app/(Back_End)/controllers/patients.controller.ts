import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { authenticate } from '../../../lib/auth';
import { logAction } from '../../../lib/audit';
import { getPaginationParams } from '../../../lib/utils';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Gender, MedicalFileType, MedicalFileSource } from '../../../lib/generated/prisma/client';

export class PatientsController {
  private static async checkPatientAccess(authUser: any, patientId: string): Promise<boolean> { //  prevent pateint to acces another patient
    if (authUser.role === 'admin' || authUser.role === 'doctor' || authUser.role === 'receptionist') {
      return true;
    }
    if (authUser.role === 'patient') {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId }
      });
      return !!(patient && patient.userId === authUser.id);
    }
    return false;
  }

  static async list(req: NextRequest) {
    try {
      const auth = await authenticate(req, ['admin', 'doctor', 'receptionist']);
      if (auth instanceof NextResponse) return auth;

      const { page, limit, skip } = getPaginationParams(req);
      const { searchParams } = new URL(req.url);

      const search = searchParams.get('search');
      const gender = searchParams.get('gender') as Gender | null;
      const bloodType = searchParams.get('blood_type');
      const createdFrom = searchParams.get('created_from');
      const createdTo = searchParams.get('created_to');

      // Build filters
      const where: any = { deletedAt: null };

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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async create(req: NextRequest) {
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async get(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async update(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor', 'patient']);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async delete(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist']);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async listVisits(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
          include: {
            appointment: {
              include: {
                doctor: {
                  include: {
                    user: {
                      select: { name: true, specialty: true }
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async listPrescriptions(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async listInvoices(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'patient', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const { id } = params;
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
            items: true,
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async listFiles(req: NextRequest, params: { id: string }) {
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async uploadFile(req: NextRequest, params: { id: string }) {
    try {
      const auth = await authenticate(req, ['admin', 'receptionist', 'doctor']);
      if (auth instanceof NextResponse) return auth;

      const { id: patientId } = params;

      // Parse multipart form data
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      const fileType = formData.get('file_type') as MedicalFileType | null;
      const visitId = formData.get('visit_id') as string | null;
      const sourceType = (formData.get('source_type') as MedicalFileSource | null) || 'manual';

      if (!file || !fileType) {
        return NextResponse.json({ error: 'File and file_type are required' }, { status: 400 });
      }

      // Check file size (max 20MB)
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const maxSize = 20 * 1024 * 1024; // 20 MB
      if (buffer.length > maxSize) {
        return NextResponse.json({ error: 'File size exceeds maximum 20MB limit' }, { status: 400 });
      }

      // Save file locally in public/uploads
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {}

      const uniqueName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
      const filePath = join(uploadDir, uniqueName);
      await writeFile(filePath, buffer);

      const fileUrl = `/uploads/${uniqueName}`;

      const medicalFile = await prisma.medicalFile.create({
        data: {
          patientId,
          visitId: visitId || null,
          sourceType,
          fileType,
          fileName: file.name,
          fileUrl,
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }

  static async deleteFile(req: NextRequest, params: { id: string; fileId: string }) {
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
      return NextResponse.json({ error: e.message || 'Server error' }, { status: 500 });
    }
  }
}
