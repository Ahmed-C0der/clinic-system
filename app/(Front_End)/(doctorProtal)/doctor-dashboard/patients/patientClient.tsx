"use client"
import React from 'react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ActivityIcon, CalendarCheck, Users } from 'lucide-react'
import { Prisma } from '@/lib/generated/prisma/client';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import {
  Patient,
  columns
} from "./column"
import { DataTable } from '@/app/MyComponents/dataTable';

export type PatientData = Prisma.VisitGetPayload<{
  select: {
    id: true;
    notes: true;
    visitDate: true;
    appointment: {
      include: {
        patient: {
          select: {
            patientCode: true;
            id: true;
            gender: true;
            user: {
              select: {
                name: true;
                profileImg: true;
              };
            };
          };
        };
      };
    };
  };
}>;

// نوع المصفوفة المسترجعة من الاستعلام
export type PatientsDataArray = PatientData[];

export default function PatientClient({ data }: { data: { patientsData: PatientsDataArray, patientCount: number, appointmentsCount: number, activeCasesCount: number } }) {
  const { patientsData, patientCount, appointmentsCount, activeCasesCount } = data
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()
  const setSearchParams = (searchValue: string) => {
    const query = new URLSearchParams(searchParams.toString())
    query.set("search", searchValue)
    router.push(`${pathName}?${query.toString()}`)

  }
  const formattedPatients = patientsData.map((item) => ({
    id: item.appointment.patient.id,
    patientName: item.appointment.patient.user?.name || "غير معروف",
    patientCode: item.appointment.patient.patientCode,
    visitDate: item.visitDate,
    //   status: "مستقر", // حدد المنطق الخاص بك هنا
    notes: item.notes,
  }));
  return (
    <main className="p-6 space-y-6">
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-on-surface">قائمة المرضى</h1>
          <p className="text-sm text-on-surface/60">عرض شامل لجميع بيانات المرضى</p>
        </div>
        <div className="relative w-full md:w-72">
          <Input
            type="text"
            placeholder="البحث عن طريق الاسم أو رقم المريض"
            value={searchParams.get("search") || ""}
            onChange={(e) => setSearchParams(e.target.value)}
            className="pr-4 rounded-[8px] border-border text-right"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h1 className="text-sm text-on-surface/60">إجمالي المرضى</h1>
              <p className="text-[22px] font-bold text-on-surface">{patientCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
              <Users className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h1 className="text-sm text-on-surface/60">حالات نشطة</h1>
              <p className="text-[22px] font-bold text-on-surface">{activeCasesCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
              <ActivityIcon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <h1 className="text-sm text-on-surface/60">مواعيد جديدة</h1>
              <p className="text-[22px] font-bold text-on-surface">{appointmentsCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </section>

      <section>
        <DataTable columns={columns} data={formattedPatients} />
      </section>
    </main>
  )
}
