"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../admin-dashboard/tables/data-table"
import { MedicalFilesSubTable } from "./medical-files-sub-table"
import { AdminUserRow } from "./columns"

// Thin client wrapper so the server component (page.tsx) doesn't need to
// author the renderSubComponent closure itself.
export function UsersDataTable({
  columns,
  data,
}: {
  columns: ColumnDef<AdminUserRow, unknown>[]
  data: AdminUserRow[]
}) {
  return (
    <DataTable
      columns={columns}
      data={data}
      getRowCanExpand={(row) => !!row.original.patientId}
      renderSubComponent={(row) => <MedicalFilesSubTable patientId={row.original.patientId as string} />}
      emptyMessage="لا يوجد مستخدمون لعرضهم"
    />
  )
}
