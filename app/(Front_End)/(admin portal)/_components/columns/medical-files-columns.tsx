"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye, Download, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { MedicalFileRow } from "../../_types";
import { deleteMedicalFile } from "../../_actions/medical-files";

const fileTypeLabel: Record<MedicalFileRow["fileType"], string> = {
  lab: "تحليل",
  xray: "أشعة",
  report: "تقرير",
  other: "أخرى",
};

export const medicalFilesColumns: ColumnDef<MedicalFileRow>[] = [
  {
    accessorKey: "fileName",
    header: "اسم الملف",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.fileName}</span>
    ),
  },
  {
    accessorKey: "fileType",
    header: "نوعه",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="rounded-full border-none bg-[rgba(45,191,160,0.15)] text-[#1a6b5a] text-[12px] font-semibold"
      >
        {fileTypeLabel[row.original.fileType]}
      </Badge>
    ),
  },
  {
    accessorKey: "uploadedAt",
    header: "التاريخ",
    cell: ({ row }) =>
      new Date(row.original.uploadedAt).toLocaleDateString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
  },
  {
    id: "actions",
    header: "الاجراء",
    cell: ({ row }) => {
      const file = row.original;
      return (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="عرض"
            asChild
          >
            <a href={file.fileUrl} target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="تحميل"
            asChild
          >
            <a href={file.fileUrl} download>
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-[#c0392b]"
            title="حذف"
            onClick={() => deleteMedicalFile(file.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
