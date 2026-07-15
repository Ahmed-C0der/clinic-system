"use client"
import React from 'react'
import { Input } from '@/components/ui/input'
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
    <main>
      <section>

        <div className="flex flex-row justify-between items-center md:justify-normal md:flex-col  gap-4">
          <div className="title">
            <h1 className="text-2xl font-bold text-on-surface">قائمة المرضى</h1>
            <p className="text-muted-foreground text-sm">عرض شامل لجميع بيانات المرضى</p>
          </div>
          {/* search input */}
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              {/* FIXME: add pagination */}
              <Input
                type="text"
                placeholder="البحث عن طريق الاسم أو رقم المريض"
                value={searchParams.get("search") || ""}
                onChange={(e) => setSearchParams(e.target.value)}
              />

            </div>
            {/* TODO: add button to add a new doctor this is an additional feature depending to a decision of the client and the clinic owner  */}
          </div>

        </div>
      </section>
      <section>
        <div className="state grid-cols-auto-fill gap-4">
          <div className="state total-patient flex justify-between items-center gap-4">
            <div className="info">
              <h1 className='text-2xl font-bold text-on-surface'>اجمالي المرضي</h1>
              {/* FIXME: add patient count after set server action */}
              <p className='text-muted-foreground text-sm'>{patientCount}</p>
            </div>
            <div className="icon">
              <Users className='text-on-surface size-12' />
            </div>
          </div>
          <div className="state active-patient flex justify-between items-center gap-4">
            <div className="info">
              <h1 className='text-2xl font-bold text-on-surface'>حالات نشطة</h1>
              {/* FIXME: add patient count after set server action */}
              <p className='text-muted-foreground text-sm'>{activeCasesCount}</p>
            </div>
            <div className="icon">
              <ActivityIcon className='text-on-surface size-12' />
            </div>
          </div>
          <div className="state new-patient flex justify-between items-center gap-4">
            <div className="info">
              <h1 className='text-2xl font-bold text-on-surface'>مواعيد جديدة</h1>
              {/* FIXME: add patient count after set server action */}
              <p className='text-muted-foreground text-sm'>{appointmentsCount}</p>
            </div>
            <div className="icon">
              <CalendarCheck className='text-on-surface size-12' />
            </div>
          </div>
        </div>
      </section>
      {/* patients data */}
      <section>
        <DataTable columns={columns} data={formattedPatients} />
      </section>
    </main>
  )
}
