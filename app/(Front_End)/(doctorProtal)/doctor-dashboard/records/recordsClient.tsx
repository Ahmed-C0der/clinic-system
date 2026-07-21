"use client"
import React, { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Droplet, FileText, Search, User, Eye, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Gender } from '@/lib/generated/prisma/enums'

type PatientRecord = {
    id: string
    patientCode: string
    name: string
    gender: Gender | null
    bloodType: string | null
    dateOfBirth: Date | null
    phone: string | null
    profileImg: string | null
    lastAppointment: Date | null
    lastStatus: string | null
    visitCount: number
}

const statusBadgeStyles: Record<string, string> = {
    scheduled: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
    waiting: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
    in_progress: "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]",
    done: "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]",
    cancelled: "bg-[rgba(192,57,43,0.12)] text-[#c0392b]",
}

const statusTranslations: Record<string, string> = {
    scheduled: "مجدول",
    waiting: "انتظار",
    in_progress: "قيد الكشف",
    done: "مكتمل",
    cancelled: "ملغي",
}

function calculateAge(dateOfBirth: Date): number {
    const today = new Date()
    const birth = new Date(dateOfBirth)
    let age = today.getFullYear() - birth.getFullYear()
    const m = today.getMonth() - birth.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
    return age
}

export default function RecordsClient({ data }: { data: { patients: PatientRecord[], total: number } }) {
    const { patients, total } = data
    const [searchTerm, setSearchTerm] = useState("")

    const filteredPatients = useMemo(() => {
        if (!searchTerm.trim()) return patients
        const lower = searchTerm.toLowerCase()
        return patients.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.patientCode.toLowerCase().includes(lower) ||
            p.phone?.toLowerCase().includes(lower)
        )
    }, [patients, searchTerm])

    const genderLabel = (g: Gender | null) => {
        if (!g) return "—"
        return g === "male" ? "ذكر" : g === "female" ? "أنثى" : "آخر"
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-[28px] font-bold text-on-surface">سجلات المرضى</h1>
                    <p className="text-sm text-on-surface/60">عرض جميع سجلات المرضى المسجلين لدى العيادة</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface/40" />
                    <Input
                        placeholder="بحث بالاسم أو رقم الملف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-9 rounded-[8px] border-border text-right"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-white border border-border shadow-sm">
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-on-surface/60">إجمالي المرضى</p>
                            <p className="text-[22px] font-bold text-on-surface">{total}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                            <User className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-border shadow-sm">
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-on-surface/60">إجمالي السجلات المعروضة</p>
                            <p className="text-[22px] font-bold text-on-surface">{patients.length}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-border shadow-sm">
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <p className="text-sm text-on-surface/60">متوسط عدد الزيارات</p>
                            <p className="text-[22px] font-bold text-on-surface">
                                {patients.length > 0 ? (patients.reduce((a, b) => a + b.visitCount, 0) / patients.length).toFixed(1) : "0"}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {filteredPatients.length === 0 ? (
                <div className="text-center py-16">
                    <User className="w-12 h-12 mx-auto text-on-surface/20 mb-4" />
                    <p className="text-on-surface/60">لا توجد سجلات متطابقة</p>
                </div>
            ) : (
                <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-[#f4f1f7] border-b border-border">
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">المريض</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">رقم الملف</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">الجنس</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">العمر</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">فصيلة الدم</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">آخر زيارة</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">الحالة</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface">عدد الزيارات</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="border-b border-border hover:bg-[rgba(45,191,160,0.06)] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="w-8 h-8">
                                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                        {patient.name.slice(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium text-on-surface">{patient.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-on-surface/70">{patient.patientCode}</td>
                                        <td className="px-4 py-3 text-sm text-on-surface/70">{genderLabel(patient.gender)}</td>
                                        <td className="px-4 py-3 text-sm text-on-surface/70">
                                            {patient.dateOfBirth ? `${calculateAge(patient.dateOfBirth)} سنة` : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {patient.bloodType ? (
                                                <span className="inline-flex items-center gap-1 text-sm">
                                                    <Droplet className="w-3.5 h-3.5 text-red-500" />
                                                    {patient.bloodType}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-on-surface/40">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-on-surface/70">
                                            {patient.lastAppointment
                                                ? new Date(patient.lastAppointment).toLocaleDateString("ar-EG")
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {patient.lastStatus ? (
                                                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[patient.lastStatus] || "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]"}`}>
                                                    {statusTranslations[patient.lastStatus] || patient.lastStatus}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-on-surface/40">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[rgba(45,191,160,0.15)] text-primary text-sm font-semibold">
                                                {patient.visitCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link href={`/doctor-dashboard/patients/${patient.id}`}>
                                                <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80 hover:bg-accent/10">
                                                    <Eye className="w-4 h-4 ml-1" />
                                                    عرض
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
