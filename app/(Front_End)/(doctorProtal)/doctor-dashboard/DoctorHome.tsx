"use client"
import React, { useEffect, useState } from 'react'
import { Calendar, FileText, Repeat, User } from 'lucide-react';
import { AppointmentStatus, AppointmentType, Gender } from '@/lib/generated/prisma/enums';
import { Decimal } from '@prisma/client/runtime/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export type TypeAppointments = ({
  id: string;
  createdAt: Date;
  patientId: string;
  doctorId: string;
  serviceId: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  type: AppointmentType;
  notes: string | null;
  reminderSent: boolean;
  patient: {
    id: string;
    name: string;
    userId: string | null;
    createdAt: Date;
    gender: Gender | null;
    phone: string | null;
    deletedAt: Date | null;
    address: string | null;
    patientCode: string;
    dateOfBirth: Date | null;
    bloodType: string | null;
    chronicDiseases: string | null;
    allergies: string | null;
    user: {
      name: string;
      profileImg: string | null;
    } | null;
  };
})[];
export type Doctor ={
    id: string;
    createdAt: Date;
    userId: string;
    licenseNumber: string | null;
    specialty: string | null;
    bio: string | null;
    consultationFee: number | null;
    slotDuration: number;
     user: {
        name: string;
        profileImg: string | null;
    }
}


interface DoctorDashboardProps {
    dashboardData: {
        appointments: TypeAppointments;
        appointmentsCount: number;
        prescriptionsCount: number;
        appointmentsFollowUpCount: number;
        doctor:Doctor
    };
}

const statusBadgeStyles: Record<string, string> = {
  scheduled: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
  waiting: "bg-[rgba(230,126,34,0.15)] text-[#c05a00]",
  in_progress: "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]",
  done: "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]",
  cancelled: "bg-[rgba(192,57,43,0.12)] text-[#c0392b]",
};

export default function DoctorHome({dashboardData }: DoctorDashboardProps) {
  const hour = new Date().getHours();
  let greetingText = "مرحباً بك";
  if (hour < 12) {
    greetingText = "صباح الخير";
  } else {
    greetingText = "مساء الخير";
  }
  const formatArabicDate = (dateString: Date) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).replace("م", "مساءً").replace("ص", "صباحاً");
  };
  const [appointmentDone , setAppointmentDone] = useState<TypeAppointments>([]);
  const [appointment , setappointment] = useState<TypeAppointments>([]);

  useEffect(()=>{
   const filterAppointment = ()=>{
    let doneAppointments : TypeAppointments = []
    let Appointments : TypeAppointments = []
    dashboardData.appointments.forEach((appointment) => {
        if(appointment.status === AppointmentStatus.done){
            doneAppointments.push(appointment)
        }else{
            Appointments.push(appointment)
        }
    })
    setAppointmentDone(doneAppointments)
    setappointment(Appointments)
   }
   filterAppointment()
  },[dashboardData.appointments])

    return (
        <main className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-bold text-on-surface">{greetingText + " ," + dashboardData.doctor.user.name}</h1>
                <p className="flex items-center gap-2 text-sm text-on-surface/60"><Calendar className='w-5 h-5' /> { formatArabicDate(new Date())}</p>
            </div>

            <section className="grid-cols-auto-fill gap-5">
                <div className="bg-white border border-border rounded-lg shadow-sm p-6 flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                        <User className="w-6 h-6"/>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-on-surface/60">إجمالي المواعيد</p>
                        <p className="text-[22px] font-bold text-on-surface">{dashboardData.appointmentsCount}</p>
                    </div>
                </div>
                <div className="bg-white border border-border rounded-lg shadow-sm p-6 flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                        <FileText className="w-6 h-6"/>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-on-surface/60">إجمالي الوصفات</p>
                        <p className="text-[22px] font-bold text-on-surface">{dashboardData.prescriptionsCount}</p>
                    </div>
                </div>
                <div className="bg-white border border-border rounded-lg shadow-sm p-6 flex items-center justify-between">
                    <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                        <Repeat className="w-6 h-6"/>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-on-surface/60">إجمالي المتابعات</p>
                        <p className="text-[22px] font-bold text-on-surface">{dashboardData.appointmentsFollowUpCount}</p>
                    </div>
                </div>
            </section>

            {/* appointment list */}
            <section>
            {/* AppointmentStatus : scheduled , waiting , in_progress */}
            <div className="mt-10">
               <h2 className="text-[22px] font-bold text-on-surface mb-4">جدول المواعيد اليوم</h2>
                {appointment.length === 0 ? (
                    <p className="text-center text-on-surface/50">لا توجد مواعيد حالية</p>
                ) : (
                    <div className="grid-cols-auto-fill gap-4">
                        {appointment.map((appointment) => (
                            <div key={appointment.id} className="bg-white border border-border rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{appointment.patient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            {appointment.patient.user?.profileImg && <AvatarImage src={appointment.patient.user.profileImg} />}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-on-surface">{appointment.patient.name}</p>
                                            <p className="text-sm text-on-surface/60">{formatArabicDate(appointment.scheduledAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-on-surface/50">{appointment.type}</span>
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[appointment.status] || "bg-[rgba(230,126,34,0.15)] text-[#c05a00]"}`}>
                                            {appointment.status === "scheduled" ? "مجدول" :
                                             appointment.status === "waiting" ? "انتظار" :
                                             appointment.status === "in_progress" ? "قيد الكشف" :
                                             appointment.status === "done" ? "مكتمل" :
                                             appointment.status === "cancelled" ? "ملغي" : appointment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* AppointmentStatus :  done */}
            <div className="mt-10">
               <h2 className="text-[22px] font-bold text-on-surface mb-4">المواعيد المكتملة</h2>
                {appointmentDone.length === 0 ? (
                    <p className="text-center text-on-surface/50">لا توجد مواعيد مكتملة</p>
                ) : (
                    <div className="grid-cols-auto-fill gap-4">
                        {appointmentDone.map((appointment) => (
                            <div key={appointment.id} className="bg-white border border-border rounded-lg shadow-sm p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">{appointment.patient.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            {appointment.patient.user?.profileImg && <AvatarImage src={appointment.patient.user.profileImg} />}
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-semibold text-on-surface">{appointment.patient.name}</p>
                                            <p className="text-sm text-on-surface/60">{formatArabicDate(appointment.scheduledAt)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-on-surface/50">{appointment.type}</span>
                                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[appointment.status] || "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]"}`}>
                                            {appointment.status === "done" ? "مكتمل" : appointment.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            </section>
        </main>
    )
}
