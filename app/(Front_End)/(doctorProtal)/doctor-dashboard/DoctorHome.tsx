"use client"
import React, { useEffect, useState } from 'react'
import { Calendar, FileText, Repeat, User } from 'lucide-react';
import { AppointmentStatus, AppointmentType, Gender } from '@/lib/generated/prisma/enums';
import { Decimal } from '@prisma/client/runtime/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

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
export type Doctor = {
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
        doctor: Doctor
    };
}

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

export default function DoctorHome({ dashboardData }: DoctorDashboardProps) {
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
    const [appointmentDone, setAppointmentDone] = useState<TypeAppointments>([]);
    const [appointment, setappointment] = useState<TypeAppointments>([]);

    useEffect(() => {
        const filterAppointment = () => {
            let doneAppointments: TypeAppointments = []
            let Appointments: TypeAppointments = []
            dashboardData.appointments.forEach((appointment) => {
                if (appointment.status === AppointmentStatus.done) {
                    doneAppointments.push(appointment)
                } else {
                    Appointments.push(appointment)
                }
            })
            setAppointmentDone(doneAppointments)
            setappointment(Appointments)
        }
        filterAppointment()
    }, [dashboardData.appointments])

    return (
        <main className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-[28px] font-bold text-on-surface">{greetingText + " ," + dashboardData.doctor.user.name}</h1>
                <p className="flex items-center gap-2 text-sm text-on-surface/60"><Calendar className='w-5 h-5' /> {formatArabicDate(new Date())}</p>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <Card className="bg-white border border-border shadow-sm">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-on-surface/60">إجمالي المواعيد</p>
                            <p className="text-[22px] font-bold text-on-surface">{dashboardData.appointmentsCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-border shadow-sm">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-on-surface/60">إجمالي الوصفات</p>
                            <p className="text-[22px] font-bold text-on-surface">{dashboardData.prescriptionsCount}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border border-border shadow-sm">
                    <CardContent className="flex items-center justify-between p-6">
                        <div className="p-3 rounded-lg bg-[rgba(45,191,160,0.15)] text-primary">
                            <Repeat className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-on-surface/60">إجمالي المتابعات</p>
                            <p className="text-[22px] font-bold text-on-surface">{dashboardData.appointmentsFollowUpCount}</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* appointment list */}
            <section>
                <div className="mt-10">
                    <h2 className="text-[22px] font-bold text-on-surface mb-4">جدول المواعيد اليوم</h2>
                    {appointment.length === 0 ? (
                        <Card className="bg-white border border-border shadow-sm">
                            <CardContent className="flex items-center justify-center p-10">
                                <p className="text-on-surface/50">لا توجد مواعيد حالية</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {appointment.map((appt) => (
                                <Card
                                    key={appt.id}
                                    className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                    {appt.patient.name.slice(0, 2)}
                                                </AvatarFallback>
                                                {appt.patient.user?.profileImg && (
                                                    <AvatarImage src={appt.patient.user.profileImg} />
                                                )}
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-on-surface">
                                                    {appt.patient.name}
                                                </p>
                                                <p className="text-xs text-on-surface/60">
                                                    {`${appt.scheduledAt.getHours().toString().padStart(2, "0")}:${appt.scheduledAt.getMinutes().toString().padStart(2, "0")}`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${typeBadgeStyles[appt.type] || "bg-[rgba(45,191,160,0.15)] text-[#1a6b5a]"}`}>
                                                {appt.type === "checkup" ? "كشف" :
                                                 appt.type === "follow_up" ? "متابعة" :
                                                 appt.type === "emergency" ? "طوارئ" : appt.type}
                                            </span>

                                            <span
                                                className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${statusBadgeStyles[appt.status] ||
                                                    "bg-orange-100 text-orange-700"
                                                    }`}
                                            >
                                                {appt.status === "scheduled"
                                                    ? "مجدول"
                                                    : appt.status === "waiting"
                                                        ? "انتظار"
                                                        : appt.status === "in_progress"
                                                            ? "قيد الكشف"
                                                            : appt.status === "done"
                                                                ? "مكتمل"
                                                                : appt.status === "cancelled"
                                                                    ? "ملغي"
                                                                    : appt.status}
                                            </span>

                                            <Link href={`/doctor-dashboard/appointments/${appt.id}`}>
                                                <Button className="bg-accent text-white hover:bg-[#26a88d] cursor-pointer rounded-lg px-4 h-10 text-sm font-semibold">
                                                    بدأ الحجز
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
                <div className="mt-10">
                    <h2 className="text-[22px] font-bold text-on-surface mb-4">المواعيد المكتملة</h2>
                    {appointmentDone.length === 0 ? (
                        <Card className="bg-white border border-border shadow-sm">
                            <CardContent className="flex items-center justify-center p-10">
                                <p className="text-on-surface/50">لا توجد مواعيد مكتملة</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {appointmentDone.map((appt) => (
                                <Card key={appt.id} className="bg-white border border-border shadow-sm">
                                    <CardContent className="flex items-center justify-between p-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{appt.patient.name.slice(0, 2)}</AvatarFallback>
                                                {appt.patient.user?.profileImg && <AvatarImage src={appt.patient.user.profileImg} />}
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-on-surface">{appt.patient.name}</p>
                                                <p className="text-xs text-on-surface/60">{formatArabicDate(appt.scheduledAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeStyles[appt.status] || "bg-[rgba(26,107,90,0.10)] text-[#1a6b5a]"}`}>
                                                {appt.status === "done" ? "مكتمل" : appt.status}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
