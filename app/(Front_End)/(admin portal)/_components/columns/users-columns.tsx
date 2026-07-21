"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, Ban, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import type { AdminUserRow } from "../../_types";
import { toggleUserActive } from "../../_actions/users";

const roleLabel: Record<AdminUserRow["role"], string> = {
  admin: "مسؤول",
  doctor: "طبيب",
  receptionist: "استقبال",
  patient: "مريض",
};

const genderLabel: Record<AdminUserRow["gender"], string> = {
  male: "ذكر",
  female: "أنثى",
  other: "آخر",
};

export const usersColumns: ColumnDef<AdminUserRow>[] = [
  {
    accessorKey: "name",
    header: "الاسم",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2 justify-end">
          <span className="font-medium">{user.name}</span>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImg ?? undefined} />
            <AvatarFallback className="bg-[rgba(45,191,160,0.15)] text-[#1a6b5a] text-xs">
              {user.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
      );
    },
  },
  {
    accessorKey: "gender",
    header: "الجنس",
    cell: ({ row }) => genderLabel[row.original.gender],
  },
  {
    accessorKey: "email",
    header: "البريد الإلكتروني",
    cell: ({ row }) => (
      <span className="text-[#1c1c1e]/80 direction-ltr inline-block">
        {row.original.email}
      </span>
    ),
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
      <Badge
        variant="outline"
        className="rounded-full border-none bg-[rgba(26,107,90,0.10)] text-[#1a6b5a] font-semibold text-[12px]"
      >
        {roleLabel[row.original.role]}
      </Badge>
    ),
  },
  {
    accessorKey: "visitsCount",
    header: "عدد الزيارات",
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.visitsCount}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Eye className="ms-2 h-4 w-4" /> عرض الملف
            </DropdownMenuItem>
            {user.isActive ? (
              <DropdownMenuItem
                onClick={() => toggleUserActive(user.id, false)}
                className="text-[#c0392b]"
              >
                <Ban className="ms-2 h-4 w-4" /> إيقاف الحساب
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => toggleUserActive(user.id, true)}>
                <CheckCircle2 className="ms-2 h-4 w-4" /> تفعيل الحساب
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
