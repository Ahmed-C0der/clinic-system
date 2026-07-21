"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, FileText } from "lucide-react";

export type Patient = {
  id: string;
  patientName: string;
  patientCode: string;
  visitDate: Date;
  notes: string | null;
};

export const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "patientName",
    header: "اسم المريض",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-on-surface">{row.getValue("patientName")}</span>
    ),
  },
  {
    accessorKey: "patientCode",
    header: "رقم الملف",
    cell: ({ row }) => (
      <span className="text-sm text-on-surface/70">{row.getValue("patientCode")}</span>
    ),
  },
  {
    accessorKey: "visitDate",
    header: "آخر زيارة",
    cell: ({ row }) => {
      const date = new Date(row.getValue("visitDate") as Date);
      return <span className="text-sm text-on-surface/70">{date.toLocaleDateString("ar-EG")}</span>;
    },
  },
  {
    id: "actions",
    header: "الإجراءات",
    cell: ({ row }) => {
      const patient = row.original;
      
      return (
        <div className="flex gap-2">
          <Link href={`/doctor-dashboard/patients/${patient.id}`}>
            <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10">
              <Eye className="w-4 h-4 ml-1" />
              عرض السجل
            </Button>
          </Link>
          
          <Link href={`/doctor-dashboard/patients/${patient.id}/prescription`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
              <FileText className="w-4 h-4 ml-1" />
              إضافة وصفة
            </Button>
          </Link>
        </div>
      );
    },
  },
];