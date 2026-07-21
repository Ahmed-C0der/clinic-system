// import React from 'react'
// import BookinSummary from './bookingSummary'

// export default function Step4() {
//   return (
//     <>
//     <section>
//         <BookinSummary/>
//         {/* مراجعة البيانات و عرض معلومات المريض و الدكتور و الخدمات و السعر و الموعدو زرار اوافق علي الشروط و الاحكام */}
//     </section>
//     </>
//   )
// }

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Gender } from '@/lib/generated/prisma/enums'
import { Decimal } from '@prisma/client/runtime/client'
import { CheckCircle2 } from 'lucide-react'
import type { AppointmentType } from './step3'
import type { Slot } from './step2'

type ServiceSummary = {
    id: string
    name: string
    basePrice: Decimal | null
    durationMin: number
}

interface Step4Props {
    doctorId: string
    doctorName: string
    doctorImg: string | null
    specialty: string | null
    gender: Gender
    service: ServiceSummary | null
    slot: Slot | null
    type: AppointmentType
    notes: string
    onBack: () => void
}

export default function Step4({
    doctorId,
    doctorName,
    doctorImg,
    specialty,
    gender,
    service,
    slot,
    type,
    notes,
    onBack,
}: Step4Props) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [bookedAppointment, setBookedAppointment] = useState<{ id: string } | null>(null)
    const router = useRouter()

    const handleConfirm = async () => {
        if (!service || !slot) {
            toast.error('يرجى إكمال الخطوات السابقة أولاً')
            return
        }

        setIsSubmitting(true)
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' ,
                    
                },
                credentials:"include",
                body: JSON.stringify({
                    doctorId,
                    serviceId: service.id,
                    scheduledAt: slot.start.toISOString(),
                    type,
                    notes: notes || undefined,
                }),
            })

            if (res.status === 401) {
                toast.error('يجب عليك تسجيل الدخول لحجز موعد')
                router.push('/login')
                return
            }
            if (res.status === 409) {
                const body = await res.json().catch(() => null)
                toast.error(body?.error || 'هذا الموعد لم يعد متاحًا، يرجى اختيار وقت آخر')
                return
            }
            if (!res.ok) {
                const body = await res.json().catch(() => null)
                throw new Error(body?.error || `فشل الحجز (${res.status})`)
            }

            const appointment = await res.json()
            setBookedAppointment(appointment)
            toast.success('تم تأكيد حجز موعدك بنجاح')
        } catch (err) {
            console.error('Error booking appointment:', err)
            toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع، حاول مرة أخرى')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (bookedAppointment) {
        return (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
                <h2 className="text-xl font-semibold text-on-surface">تم تأكيد حجزك بنجاح</h2>
                <p className="max-w-md text-sm text-on-surface/60">
                    سيصلك تذكير عبر رسالة نصية أو واتساب قبل موعدك. رقم الحجز: {bookedAppointment.id}
                </p>
                <Button onClick={() => router.push('/dashboard/appointments')} className="rounded-lg">
                    عرض مواعيدي
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-6 text-right">
            <h3 className="text-lg font-semibold text-on-surface">تأكيد الحجز</h3>

            <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4 border-b border-border pb-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full">
                        <Image
                            src={doctorImg || (gender === Gender.female ? '/doctor_female.png' : '/doctor_male.png')}
                            alt={doctorName}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h4 className="font-semibold text-on-surface">{doctorName}</h4>
                        {specialty && <p className="text-sm text-on-surface/60">{specialty}</p>}
                    </div>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-on-surface/60">الخدمة</dt>
                        <dd className="font-medium text-on-surface">{service?.name ?? '—'}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-on-surface/60">التاريخ والوقت</dt>
                        <dd className="font-medium text-on-surface">
                            {slot
                                ? `${slot.start.toLocaleDateString('ar-EG', {
                                      day: 'numeric',
                                      month: 'long',
                                  })} — ${slot.start.toLocaleTimeString('ar-EG', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                  })}`
                                : '—'}
                        </dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-on-surface/60">نوع الزيارة</dt>
                        <dd className="font-medium text-on-surface">{type === 'new' ? 'زيارة جديدة' : 'متابعة'}</dd>
                    </div>
                    {service?.basePrice != null && (
                        <div className="flex justify-between">
                            <dt className="text-on-surface/60">التكلفة التقديرية</dt>
                            <dd className="font-semibold text-[#1a6b5a]">{Number(service.basePrice)} ر.س</dd>
                        </div>
                    )}
                    {notes && (
                        <div className="flex flex-col gap-1 border-t border-border pt-3">
                            <dt className="text-on-surface/60">ملاحظات</dt>
                            <dd className="font-medium text-on-surface">{notes}</dd>
                        </div>
                    )}
                </dl>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={onBack} disabled={isSubmitting} className="rounded-lg">
                    رجوع
                </Button>
                <Button onClick={handleConfirm} disabled={isSubmitting} className="rounded-lg">
                    {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الحجز'}
                </Button>
            </div>
        </div>
    )
}
