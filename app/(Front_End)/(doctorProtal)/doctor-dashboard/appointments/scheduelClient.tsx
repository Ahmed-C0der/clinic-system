"use client"
import CalendarRtl from '@/app/MyComponents/arabicCalender';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import React from 'react'

type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  type: string;
  patient: {
    patientCode: string;
    user: {
      name: string;
      profileImg: string | null;
    } | null;
  };
};

const statusBadgeStyles: Record<string, string> = {
  scheduled: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
  waiting: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
  in_progress: "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]",
  done: "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]",
  cancelled: "bg-[rgba(192,57,43,0.12)] text-[#c0392b]",
};

const typeBadgeStyles: Record<string, string> = {
  checkup: "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]",
  follow_up: "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]",
  emergency: "bg-[rgba(192,57,43,0.12)] text-[#c0392b]",
};

export default function ScheduelClient({ appointments }: { appointments: Appointment[] }) {
  return (
    <section className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-on-surface mb-2">جدول اليوم</h1>
        <p className="text-on-surface/60">لديك <span className="font-semibold text-accent">{appointments.length}</span> مواعيد اليوم</p>
      </div>

      <CalendarRtl/>

      <Separator className="my-6" />

      <section className="space-y-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="border border-border shadow-sm">
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">{appointment.patient.user?.name?.slice(0, 2)}</AvatarFallback>
                  <AvatarImage src={appointment.patient.user?.profileImg ?? ''}/>
                </Avatar>
                <div>
                  <h1 className="text-sm font-semibold text-on-surface">{appointment.patient.user?.name}</h1>
                  <p className="text-xs text-on-surface/60">{appointment.patient.patientCode}</p>
                </div>
              </div>

              <p className="text-sm text-on-surface/60">{new Date(appointment.scheduledAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</p>

              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${typeBadgeStyles[appointment.type] || "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]"}`}>
                {appointment.type === "checkup" ? "كشف" :
                 appointment.type === "follow_up" ? "متابعة" :
                 appointment.type === "emergency" ? "طوارئ" : appointment.type}
              </span>

              <div className='flex items-center gap-2'>
                <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[appointment.status] || "bg-[rgba(230,126,34,0.15)] text-[#c05a00]"}`}>
                  {appointment.status === "scheduled" ? "مجدول" :
                   appointment.status === "waiting" ? "انتظار" :
                   appointment.status === "in_progress" ? "قيد الكشف" :
                   appointment.status === "done" ? "مكتمل" :
                   appointment.status === "cancelled" ? "ملغي" : appointment.status}
                </span>
                <Link href={`/doctor-dashboard/patients/${appointment.id}`}>
                    <Button className="bg-accent text-white hover:bg-[#26a88d] cursor-pointer rounded-lg px-4 h-10 text-sm font-semibold">
                    بدأ الكشف
                    </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </section>
  )
}
