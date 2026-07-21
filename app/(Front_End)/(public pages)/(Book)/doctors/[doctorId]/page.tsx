'use client'
import Step1 from '@/app/MyComponents/book/step1'
import Step2, { type Slot } from '@/app/MyComponents/book/step2'
import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Step3, { type AppointmentType } from '@/app/MyComponents/book/step3'
import Step4 from '@/app/MyComponents/book/step4'
import { Decimal } from '@prisma/client/runtime/client'
import { Gender, Role } from '@/lib/generated/prisma/enums'
import { toast } from 'sonner'
import Loading from '@/app/MyComponents/Loding'

export type Doctor = {
    id: string;
    licenseNumber: string | null;
    specialty: string | null;
    bio: string | null;
    consultationFee: Decimal | null;
    slotDuration: number;
    user: {
        id: string;
        name: string;
        email: string;
        role: Role;
        phone: string | null;
        isActive: boolean;
        profileImg: string | null;
        gender: Gender;
    };
    services: {
        service: {
            id: string;
            name: string;
            description: string | null;
            basePrice: Decimal | null;
            durationMin: number;
        };
    }[];
}

type SelectedService = Doctor['services'][number]['service']

const STEP_LABELS = ['الطبيب والخدمة', 'التاريخ والوقت', 'التفاصيل', 'التأكيد']
const TOTAL_STEPS = STEP_LABELS.length

export default function Page() {
    const [step, setStep] = useState<number>(1)
    const params = useParams()
    const doctorId = params?.doctorId as string | undefined

    const [doctor, setDoctor] = useState<Doctor | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Booking state — accumulated across steps 1-3, submitted in step 4
    const [selectedService, setSelectedService] = useState<SelectedService | null>(null)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
    const [appointmentType, setAppointmentType] = useState<AppointmentType>('new')
    const [notes, setNotes] = useState<string>('')

    useEffect(() => {
        console.log("Hello before check doctor ID")

        if (!doctorId) {
            router.push('/doctors')
            return
        }
        console.log("Hello after check doctor ID")

        let cancelled = false

        const fetchDoctor = async () => {
            console.log("Hello")
            setLoading(true)
            setError(null)
            try {
                console.log("Hello from try block")
                const res = await fetch(`/api/doctors/${doctorId}`)
                if (!res.ok) {
                    console.log(res)
                    if (res.status == 401) {
                        toast.error("يجب عليك تسجيل الدخول لحجز موعد")
                        router.push('/login')
                        return
                    }
                    throw new Error(`Failed to load doctor (${res.status})`)
                }
                const body: { success: boolean; data: Doctor } = await res.json()
                if (!body.success) {
                    throw new Error('Doctor not found')
                }
                if (!cancelled) {
                    setDoctor(body.data)
                }
            } catch (err) {
                console.error('Error fetching doctor:', err)
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : 'Something went wrong')
                }
            } finally {
                // if (!cancelled) setLoading(false)
                    setLoading(false)
                console.log(loading)
            }
        }

        fetchDoctor()

        // return () => {
        //     cancelled = true
        // }
    }, [doctorId])

    // Picking a new date invalidates any previously chosen slot for the old date
    const handleSelectDate = (date: Date) => {
        setSelectedDate(date)
        setSelectedSlot(null)
    }

    // Different services can have different durations, so a previously chosen
    // slot may no longer be valid once the service changes
    const handleSelectService = (service: SelectedService) => {
        setSelectedService(service)
        setSelectedSlot(null)
    }

    const canGoNext = (): boolean => {
        if (step === 1) return selectedService !== null
        if (step === 2) return selectedSlot !== null
        return true
    }

    const goNext = () => {
        if (!canGoNext()) {
            toast.error('يرجى إكمال هذه الخطوة قبل المتابعة')
            return
        }
        setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    }
    const goBack = () => setStep((s) => Math.max(s - 1, 1))

    if (loading) {
        return (
            <div className="container mx-auto flex items-center justify-center py-24">
                {/* <p className="text-muted-foreground">جاري تحميل بيانات الطبيب...</p> */}
                <Loading/>
            </div>
        )
    }

    if (error || !doctor) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-24">
                <p className="text-destructive">{error ?? 'لم يتم العثور على الطبيب'}</p>
                <button
                    onClick={() => router.push('/doctors')}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                    العودة لقائمة الأطباء
                </button>
            </div>
        )
    }

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <Step1
                        gender={doctor.user.gender}
                        services={doctor.services}
                        doctorName={doctor.user.name}
                        bio={doctor.bio}
                        specialty={doctor.specialty}
                        DoctorImg={doctor.user.profileImg}
                        selectedServiceId={selectedService?.id ?? null}
                        onSelectService={handleSelectService}
                    />
                )
            case 2:
                return (
                    <Step2
                        doctorId={doctor.id}
                        durationMin={selectedService?.durationMin ?? doctor.slotDuration}
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                        selectedSlot={selectedSlot}
                        onSelectSlot={setSelectedSlot}
                    />
                )
            case 3:
                return (
                    <Step3
                        notes={notes}
                        onNotesChange={setNotes}
                        type={appointmentType}
                        onTypeChange={setAppointmentType}
                    />
                )
            default:
                return (
                    <Step4
                        doctorId={doctor.id}
                        doctorName={doctor.user.name}
                        doctorImg={doctor.user.profileImg}
                        specialty={doctor.specialty}
                        gender={doctor.user.gender}
                        service={selectedService}
                        slot={selectedSlot}
                        type={appointmentType}
                        notes={notes}
                        onBack={goBack}
                    />
                )
        }
    }

    return (
        <div className="container mx-auto">
            {/* progress bar */}
            <BookingProgressBar currentStep={step} labels={STEP_LABELS} />

            {/* Book */}
            {renderStep()}

            {/* footer — Step4 has its own Back/Confirm buttons, so it's hidden there */}
            {step < TOTAL_STEPS && (
                <div className="flex justify-between py-6">
                    <button
                        onClick={goBack}
                        disabled={step === 1}
                        className="rounded-md border px-4 py-2 disabled:opacity-40"
                    >
                        رجوع
                    </button>
                    <button
                        onClick={goNext}
                        disabled={!canGoNext()}
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-40"
                    >
                        التالي
                    </button>
                </div>
            )}
        </div>
    )
}

function BookingProgressBar({
    currentStep,
    labels,
}: {
    currentStep: number
    labels: string[]
}) {
    return (
        <div className="flex items-center py-8">
            {labels.map((label, idx) => {
                const stepNum = idx + 1
                const isActive = stepNum === currentStep
                const isCompleted = stepNum < currentStep
                const isLast = idx === labels.length - 1

                return (
                    <React.Fragment key={label}>
                        <div className="flex flex-col items-center gap-2">
                            <div
                                className={[
                                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                                    isCompleted
                                        ? 'bg-primary text-primary-foreground'
                                        : isActive
                                        ? 'border-2 border-primary text-primary'
                                        : 'border-2 border-muted text-muted-foreground',
                                ].join(' ')}
                            >
                                {isCompleted ? '✓' : stepNum}
                            </div>
                            <span
                                className={[
                                    'text-xs whitespace-nowrap',
                                    isActive ? 'font-semibold text-foreground' : 'text-muted-foreground',
                                ].join(' ')}
                            >
                                {label}
                            </span>
                        </div>
                        {!isLast && (
                            <div
                                className={[
                                    'mx-2 h-0.5 flex-1 transition-colors',
                                    isCompleted ? 'bg-primary' : 'bg-muted',
                                ].join(' ')}
                            />
                        )}
                    </React.Fragment>
                )
            })}
        </div>
    )
}
