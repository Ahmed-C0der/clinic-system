import { Role, Gender, MedicalFileType, MedicalFileSource } from "@prisma/client";

// Row shape for the main "Users" admin table (top table in the wireframe:
// name | gender | email | phone | role | visitsCount)
export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: Gender;
  role: Role;
  isActive: boolean;
  profileImg: string | null;
  patientId: string | null; // null when the user isn't linked to a Patient record
  visitsCount: number; // total appointments for the linked patient (0 if none)
};

// Row shape for the "Medical Files" table shown under the selected
// patient/user (bottom table in the wireframe: اسم الملف | نوعه | التاريخ | الاجراء)
export type MedicalFileRow = {
  id: string;
  fileName: string;
  fileType: MedicalFileType;
  sourceType: MedicalFileSource;
  fileUrl: string;
  uploadedAt: Date;
};
