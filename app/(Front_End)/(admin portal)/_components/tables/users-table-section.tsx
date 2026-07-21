"use client";

import { useState, useTransition } from "react";
import { DataTable } from "./data-table";
import { usersColumns } from "../columns/users-columns";
import { medicalFilesColumns } from "../columns/medical-files-columns";
import { getMedicalFilesByPatient } from "../../_actions/medical-files";
import type { AdminUserRow, MedicalFileRow } from "../../_types";

export function UsersTableSection({ data }: { data: AdminUserRow[] }) {
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const [files, setFiles] = useState<MedicalFileRow[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleRowClick(user: AdminUserRow) {
    setSelectedUser(user);
    if (!user.patientId) {
      setFiles([]);
      return;
    }
    startTransition(async () => {
      const result = await getMedicalFilesByPatient(user.patientId!);
      setFiles(result);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-[8px] border border-[#e0dce5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <h2 className="text-[18px] font-semibold mb-3">المستخدمون</h2>
        <DataTable
          columns={usersColumns}
          data={data}
          searchColumn="name"
          searchPlaceholder="بحث بالاسم..."
          onRowClick={handleRowClick}
        />
      </div>

      {selectedUser && (
        <div className="rounded-[8px] border border-[#e0dce5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <h2 className="text-[18px] font-semibold mb-3">
            الملفات الطبية — {selectedUser.name}
          </h2>
          {isPending ? (
            <p className="text-sm text-[#9e9e9e]">جاري التحميل...</p>
          ) : selectedUser.patientId ? (
            <DataTable columns={medicalFilesColumns} data={files} />
          ) : (
            <p className="text-sm text-[#9e9e9e]">
              هذا المستخدم لا يملك سجل مريض مرتبط.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
