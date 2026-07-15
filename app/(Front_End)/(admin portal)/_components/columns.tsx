"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

// Shape of one row in the admin users table.
// Mirrors the `User` + (optional) `Patient` relation from schema.prisma.
export type AdminUserRow = {
  id: string
  patientId: string | null // null when the user has no linked patient record (admin/doctor/receptionist)
  name: string
  email: string
  phone: string | null
  gender: "male" | "female" | "other"
  role: "admin" | "doctor" | "receptionist" | "patient"
  visitsCount: number
}

const roleLabels: Record<AdminUserRow["role"], string> = {
  admin: "مدير",
  doctor: "طبيب",
  receptionist: "موظف استقبال",
  patient: "مريض",
}

const roleBadgeClass: Record<AdminUserRow["role"], string> = {
  admin: "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]",
  doctor: "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]",
  receptionist: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
  patient: "bg-[rgba(45,191,160,0.10)] text-[#1a6b5a]",
}

const genderLabels: Record<AdminUserRow["gender"], string> = {
  male: "ذكر",
  female: "أنثى",
  other: "آخر",
}

// Column order below follows the RTL reading order from the wireframe:
// الاسم -> الجنس -> البريد الإلكتروني -> الهاتف -> الدور -> عدد الزيارات
export const columns: ColumnDef<AdminUserRow>[] = [
  {
    id: "expander",
    header: () => null,
    enableSorting: false,
    cell: ({ row }) =>
      row.original.patientId ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={() => row.toggleExpanded()}
          aria-label="عرض الملفات الطبية"
        >
          {row.getIsExpanded() ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
      ) : null,
  },
  {
    accessorKey: "name",
    header: "الاسم",
    cell: ({ row }) => <span className="font-semibold text-on-surface">{row.original.name}</span>,
  },
  {
    accessorKey: "gender",
    header: "الجنس",
    cell: ({ row }) => genderLabels[row.original.gender],
  },
  {
    accessorKey: "email",
    header: "البريد الإلكتروني",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.email}</span>,
  },
  {
    accessorKey: "phone",
    header: "الهاتف",
    cell: ({ row }) => row.original.phone ?? "—",
  },
  {
    accessorKey: "role",
    header: "الدور",
    cell: ({ row }) => (
      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${roleBadgeClass[row.original.role]}`}>
        {roleLabels[row.original.role]}
      </span>
    ),
  },
  {
    accessorKey: "visitsCount",
    header: "عدد الزيارات",
    cell: ({ row }) =>
      row.original.patientId ? (
        <span className="font-bold text-[#1A6B5A]">{row.original.visitsCount}</span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
]