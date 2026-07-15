"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

// تعريف شكل البيانات كما يظهر في قاعدة بياناتك
export type Patient = {
  id: string;
  patientName: string;
  patientCode: string;
  visitDate: Date;
  // FIXME: before unComment this line create the prisma enum for patient status and for now it's not important so it's and external feature
  // status: "مستقر" | "حرج" | "متابعة";
  notes: string | null;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "patientName",
    header: "اسم المريض",
  },
  {
    accessorKey: "patientCode",
    header: "رقم الملف",
  },
  {
    accessorKey: "visitDate",
    header: "آخر زيارة",
    cell: ({ row }) => {
      const date = new Date(row.getValue("visitDate") as Date);
      return <span>{date.toLocaleDateString("ar-EG")}</span>;
    },
  },
  // {
  //   accessorKey: "status",
  //   header: "الحالة",
  // },
  {
    id: "actions",
    header: "الإجراءات",
    cell: ({ row }) => {
      const patient = row.original; // الوصول لبيانات الصف الحالي
      
      return (
        <div className="flex gap-2">
          {/* رابط عرض السجل باستخدام id المريض */}
          <Link 
            href={`/doctor-dashboard/patients/${patient.id}`} 
            className="text-blue-600 hover:underline"
          >
            عرض السجل
          </Link>
          
          {/* رابط إضافة وصفة */}
          <Link 
            href={`/doctor-dashboard/patients/${patient.id}/prescription`} 
            className="text-green-600 hover:underline"
          >
            إضافة وصفة
          </Link>
        </div>
      );
    },
  },
];