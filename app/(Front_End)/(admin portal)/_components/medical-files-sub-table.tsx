"use client"

import { useEffect, useState } from "react"
import { Eye, Download, Loader2 } from "lucide-react"
import { getPatientMedicalFiles } from "@/app/(Front_End)/actions/admin"

type MedicalFileRow = Awaited<ReturnType<typeof getPatientMedicalFiles>>[number]

const fileTypeLabels: Record<string, string> = {
  lab: "تحليل مخبري",
  xray: "أشعة",
  report: "تقرير",
  other: "أخرى",
}

export function MedicalFilesSubTable({ patientId }: { patientId: string }) {
  const [files, setFiles] = useState<MedicalFileRow[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    getPatientMedicalFiles(patientId)
      .then((data) => {
        if (active) setFiles(data)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [patientId])

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
        <Loader2 size={14} className="animate-spin" />
        <span>جاري تحميل الملفات الطبية...</span>
      </div>
    )
  }

  if (!files || files.length === 0) {
    return <div className="py-6 text-center text-xs text-muted-foreground">لا توجد ملفات طبية لهذا المريض</div>
  }

  return (
    <div className="p-4">
      <table className="w-full text-[11px]" dir="rtl">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-right p-2 font-bold">اسم الملف</th>
            <th className="text-right p-2 font-bold">نوعه</th>
            <th className="text-right p-2 font-bold">التاريخ</th>
            <th className="text-right p-2 font-bold">الاجراء</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {files.map((file) => (
            <tr key={file.id}>
              <td className="p-2 font-medium text-on-surface">{file.fileName}</td>
              <td className="p-2 text-muted-foreground">{fileTypeLabels[file.fileType] ?? file.fileType}</td>
              <td className="p-2 text-muted-foreground">
                {new Intl.DateTimeFormat("ar-EG", { day: "2-digit", month: "long", year: "numeric" }).format(
                  new Date(file.uploadedAt)
                )}
              </td>
              <td className="p-2">
                <div className="flex items-center gap-3 text-[#1A6B5A]">
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" title="عرض الملف">
                    <Eye size={14} />
                  </a>
                  <a href={file.fileUrl} download title="تحميل الملف">
                    <Download size={14} />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
