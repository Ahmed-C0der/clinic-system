export interface accessTokenPayload {
  id: string;
  email: string;
  role: 'admin' | 'doctor' | 'receptionist' | 'patient';
  name: string;
}

export interface AuthContext {
  user: accessTokenPayload;
}

export interface refreshTokenPayload {
  id: string;
}

// ============================================================
//  models.ts  –  hand-crafted TypeScript types derived from
//  schema.prisma (Prisma 7.x, PostgreSQL)
//  Import these anywhere instead of leaning on generated types.
// ============================================================

import type { Decimal } from '@prisma/client/runtime/library';


// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role               = 'admin' | 'doctor' | 'receptionist' | 'patient';
export type Gender             = 'male' | 'female' | 'other';
export type AppointmentStatus  = 'scheduled' | 'waiting' | 'in_progress' | 'done' | 'cancelled' | 'no_show';
export type AppointmentType    = 'new' | 'follow_up';
export type InvoiceStatus      = 'pending' | 'partial' | 'paid';
export type PaymentMethod      = 'cash' | 'card' | 'transfer';
export type MedicalFileSource  = 'visit' | 'onboarding' | 'manual';
export type MedicalFileType    = 'lab' | 'xray' | 'report' | 'other';
export type AuditAction        = 'create' | 'update' | 'delete';
export type ReviewType         = 'doctor' | 'center';
export type ReviewSource       = 'website' | 'reception';

// ─── Base models (exact DB columns) ──────────────────────────────────────────

export interface User {
  id           : string;          // uuid
  name         : string;
  email        : string;
  passwordHash : string;
  role         : Role;
  phone        : string | null;
  isActive     : boolean;
  deletedAt    : Date | null;
  createdAt    : Date;
}

export interface Doctor {
  id              : string;
  userId          : string;
  specialty       : string | null;
  licenseNumber   : string | null;
  bio             : string | null;
  consultationFee : Decimal | null;
  createdAt       : Date;
}

export interface DoctorSchedule {
  id        : string;
  doctorId  : string;
  dayOfWeek : number;   // 1 = Monday … 7 = Sunday
  startTime : Date;     // time-only; use .toISOTimeString()
  endTime   : Date;
  isActive  : boolean;
}

export interface DoctorTimeBlock {
  id        : string;
  doctorId  : string;
  startsAt  : Date;
  endsAt    : Date;
  reason    : string | null;
  createdAt : Date;
}

export interface Patient {
  id              : string;
  userId          : string | null;
  patientCode     : string;
  name            : string;
  dateOfBirth     : Date | null;
  gender          : Gender | null;
  phone           : string | null;
  address         : string | null;
  bloodType       : string | null;
  chronicDiseases : string | null;
  allergies       : string | null;
  deletedAt       : Date | null;
  createdAt       : Date;
}

export interface Appointment {
  id           : string;
  patientId    : string;
  doctorId     : string;
  serviceId    : string;
  scheduledAt  : Date;
  status       : AppointmentStatus;
  type         : AppointmentType;
  notes        : string | null;
  reminderSent : boolean;
  createdAt    : Date;
}

export interface Visit {
  id             : string;
  appointmentId  : string;
  chiefComplaint : string | null;
  diagnosis      : string | null;
  notes          : string | null;
  weightKg       : Decimal | null;
  heightCm       : Decimal | null;
  bloodPressure  : string | null;
  temperatureC   : Decimal | null;
  deletedAt      : Date | null;
  visitDate      : Date;
}

export interface Prescription {
  id        : string;
  visitId   : string;
  notes     : string | null;
  deletedAt : Date | null;
  createdAt : Date;
}

export interface PrescriptionItem {
  id             : string;
  prescriptionId : string;
  medicineName   : string;
  dosage         : string | null;
  frequency      : string | null;
  duration       : string | null;
  instructions   : string | null;
}

export interface Invoice {
  id            : string;
  visitId       : string;
  patientId     : string;
  doctorId      : string;
  invoiceNumber : string;
  subtotal      : Decimal;
  discount      : Decimal;
  total         : Decimal;
  paidAmount    : Decimal;
  status        : InvoiceStatus;
  createdAt     : Date;
}

export interface InvoiceItem {
  id          : string;
  invoiceId   : string;
  description : string;
  quantity    : number;
  unitPrice   : Decimal;
  total       : Decimal;
}

export interface Payment {
  id        : string;
  invoiceId : string;
  amount    : Decimal;
  method    : PaymentMethod;
  paidAt    : Date;
  notes     : string | null;
}

export interface MedicalFile {
  id            : string;
  patientId     : string;
  visitId       : string | null;
  sourceType    : MedicalFileSource;
  fileType      : MedicalFileType;
  fileName      : string;
  fileUrl       : string;
  fileSizeBytes : number | null;
  uploadedAt    : Date;
}

export interface Service {
  id          : string;
  name        : string;
  description : string | null;
  basePrice   : Decimal | null;   // reference "starting from" price
  durationMin : number;
  isActive    : boolean;
  createdAt   : Date;
}

export interface DoctorService {
  id        : string;
  doctorId  : string;
  serviceId : string;
  price     : Decimal;
  isActive  : boolean;
}

export interface Review {
  id         : string;
  patientId  : string | null;
  doctorId   : string | null;
  type       : ReviewType;
  rating     : number;
  comment    : string | null;
  source     : ReviewSource;
  isApproved : boolean;
  createdAt  : Date;
}

export interface Center {
  id          : string;
  name        : string;
  description : string | null;
  basePrice   : Decimal;
  duration    : number;
  createdAt   : Date;
  updatedAt   : Date;
  deletedAt   : Date | null;
}

export interface CommonQuestion {
  id        : string;
  question  : string;
  answer    : string;
  createdAt : Date;
  updatedAt : Date;
  deletedAt : Date | null;
}

export interface AuditLog {
  id          : string;
  tableName   : string;
  recordId    : string;
  action      : AuditAction;
  oldValue    : Record<string, unknown> | null;
  newValue    : Record<string, unknown> | null;
  performedBy : string;
  performedAt : Date;
}

export interface PasswordResetToken {
  id        : string;
  userId    : string;
  token     : string;
  expiresAt : Date;
  usedAt    : Date | null;
  createdAt : Date;
}

// ─── Relational / populated types ────────────────────────────────────────────
// Use these when you include related records in a Prisma query.

export interface DoctorWithUser extends Doctor {
  user: User;
}

export interface DoctorWithServices extends Doctor {
  services: (DoctorService & { service: Service })[];
}

export interface DoctorFull extends Doctor {
  user      : User;
  schedules : DoctorSchedule[];
  services  : (DoctorService & { service: Service })[];
}

export interface PatientWithUser extends Patient {
  user: User | null;
}

export interface AppointmentWithRelations extends Appointment {
  patient : Patient;
  doctor  : DoctorWithUser;
  service : Service;
}

export interface VisitWithRelations extends Visit {
  appointment   : AppointmentWithRelations;
  prescriptions : (Prescription & { items: PrescriptionItem[] })[];
  medicalFiles  : MedicalFile[];
}

export interface InvoiceWithRelations extends Invoice {
  items    : InvoiceItem[];
  payments : Payment[];
  patient  : Patient;
  doctor   : DoctorWithUser;
}

export interface ReviewWithPatient extends Review {
  patient: Pick<Patient, 'name'> | null;
}

export interface ServiceWithPriceRange extends Service {
  priceRange: { min: number; max: number } | null;
}

// ─── Request / Response DTOs ──────────────────────────────────────────────────
// Shapes expected in API request bodies or returned in responses.

// Auth
export interface LoginDTO        { email: string; password: string; }
export interface RegisterDTO     { name: string; email: string; password: string; phone?: string; }

// Appointment
export interface CreateAppointmentDTO {
  patientId   : string;
  doctorId    : string;
  serviceId   : string;
  scheduledAt : string;   // ISO string from client
  type        : AppointmentType;
  notes?      : string;
}
export interface UpdateAppointmentStatusDTO {
  appointmentId : string;
  status        : AppointmentStatus;
}

// Visit
export interface CreateVisitDTO {
  appointmentId  : string;
  chiefComplaint?: string;
  diagnosis?     : string;
  notes?         : string;
  weightKg?      : number;
  heightCm?      : number;
  bloodPressure? : string;
  temperatureC?  : number;
}

// Prescription
export interface CreatePrescriptionDTO {
  visitId : string;
  notes?  : string;
  items   : {
    medicineName : string;
    dosage?      : string;
    frequency?   : string;
    duration?    : string;
    instructions?: string;
  }[];
}

// Invoice
export interface CreateInvoiceDTO {
  visitId   : string;
  patientId : string;
  doctorId  : string;
  discount? : number;
  items     : {
    description : string;
    quantity    : number;
    unitPrice   : number;
  }[];
}

export interface AddPaymentDTO {
  invoiceId : string;
  amount    : number;
  method    : PaymentMethod;
  notes?    : string;
}

// Service
export interface CreateServiceDTO {
  name        : string;
  description?: string;
  basePrice?  : number;
  durationMin?: number;
}
export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {
  serviceId : string;
}

// Doctor service assignment
export interface AssignDoctorServiceDTO {
  serviceId : string;
  price     : number;
}
export interface UpdateDoctorServiceDTO {
  doctorServiceId : string;
  price           : number;
}

// Review
export interface CreateReviewDTO {
  comment : string;
  rating  : number;         // 1–5
}
export interface ApproveReviewDTO {
  reviewId   : string;
  isApproved : boolean;
}

// Medical file upload
export interface UploadMedicalFileDTO {
  patientId     : string;
  visitId?      : string;
  sourceType    : MedicalFileSource;
  fileType      : MedicalFileType;
  fileName      : string;
  fileUrl       : string;
  fileSizeBytes?: number;
}