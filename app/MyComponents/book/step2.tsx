// import React from 'react'
// import CalendarRtl from '../arabicCalender'
// import BookinSummary from './bookingSummary'
// import { Button } from '@/components/ui/button'

// export default function step2({setStep,
// step}) {
//   return (
//     <section>
//         {/* booking summary with doctor img*/}
//         <BookinSummary/>

//         {/* Arabic Callender with availabe times */}
//         <div>
//             <CalendarRtl/>
//             {/* available times */}
//         </div>
//          <Button onClick={()=>setStep(step + 1)}>
//                 الخطوة التالية
//             </Button>
//          <Button onClick={()=>setStep(step - 1)}>
//              السابق
//             </Button>
//     </section>
//   )
// }

'use client'

import { useEffect, useState } from 'react'
import { DatePickerRtl } from '../datePicker'
import { toast } from 'sonner'

export type Slot = {
    start: Date
    end: Date
}

type RawSlot = {
    start: string
    end: string
}

interface Step2Props {
    doctorId: string
    durationMin: number
    selectedDate: Date
    onSelectDate: (date: Date) => void
    selectedSlot: Slot | null
    onSelectSlot: (slot: Slot) => void
}

export default function Step2({
    doctorId,
    durationMin,
    selectedDate,
    onSelectDate,
    selectedSlot,
    onSelectSlot,
}: Step2Props) {
    const [slots, setSlots] = useState<Slot[]>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
        const [daysOff, setDaysOff] = useState<number[]>([]);

    useEffect(() => {
        let cancelled = false
        const fetchSlots = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const query = new URLSearchParams({
                    date: selectedDate.toISOString(),
                    duration: String(durationMin),
                })
                const doctorSchedulres = await fetch(`/api/doctors/${doctorId}/schedule`,{
                    method:'GET'
                    ,
                    credentials:'include',

                })
                if(!doctorSchedulres){
                    // TODO: add guard 
                    return toast("فشل في جلب جدول الطبيب يرجي المحاولة لاخقا او اختيار طبيب اخر")
                }
                if(doctorSchedulres.status === 404){
                    return toast("الطبيب غير موجود")
                }
                const doctorData = await doctorSchedulres.json()
                if(!doctorData.success){
                    return toast("لا توجد مواعيد متاحة في هذا اليوم")
                }
                // الطريقة الصحيحة لاستخراج أيام العمل
                    const workingDays = new Set(doctorData.data.map(item => item.dayOfWeek));
                    
                    const ourDays=[0,1,2,3,4,5,6]
                    const days=[...ourDays].filter(d => !workingDays.has(d))
                    setDaysOff(days)
                const res = await fetch(`/api/doctors/${doctorId}/slots?${query.toString()}`,{
                    method:'GET',
                    credentials:'include',
                })

                if (!res.ok) throw new Error(`Failed to load slots (${res.status})`)
                const body: { slots: RawSlot[] } = await res.json()
                if (!cancelled) {
                    setSlots(body.slots.map((s) => ({ start: new Date(s.start), end: new Date(s.end) })))
                }
            } catch (err) {
                console.error('Error fetching slots:', err)
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب المواعيد المتاحة')
                }
            } finally {
                if (!cancelled) setIsLoading(false)
            }
        }

        fetchSlots()
        return () => {
            cancelled = true
        }
    }, [doctorId, durationMin, selectedDate])
    const now = new Date()
    const today =new Date(now.getFullYear(),now.getMonth(),now.getDate())
    return (
        <div className="space-y-6 text-right">
            <div>
                <h3 className="mb-4 text-lg font-semibold text-on-surface">اختر التاريخ</h3>
                <DatePickerRtl disabled={[{before:today},daysOff.length > 0 && {dayOfWeek:daysOff}]} date={selectedDate} setDate={onSelectDate} />
            </div>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-on-surface">اختر الوقت</h3>

                {isLoading ? (
                    <p className="text-sm text-on-surface/60">جاري تحميل المواعيد المتاحة...</p>
                ) : error ? (
                    <p className="text-sm text-destructive">{error}</p>
                ) : slots.length === 0 ? (
                    <p className="text-sm text-on-surface/60">
                        لا توجد مواعيد متاحة في هذا اليوم، الرجاء اختيار يوم آخر
                    </p>
                ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                        {slots.map((slot, i) => {
                            const isSelected = selectedSlot?.start.getTime() === slot.start.getTime()
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => onSelectSlot(slot)}
                                    aria-pressed={isSelected}
                                    className={[
                                        'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                                        isSelected
                                            ? 'border-primary bg-primary text-primary-foreground'
                                            : 'border-border bg-white text-on-surface hover:border-primary/50',
                                    ].join(' ')}
                                >
                                    {slot.start.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
