// 'use client'
// import Step1 from '@/app/MyComponents/book/step1'
// import Step2 from '@/app/MyComponents/book/step2'
// import React, { useEffect, useState } from 'react'
// import { redirect, useParams } from 'next/navigation'
// import Step3 from '@/app/MyComponents/book/step3'
// import Step4 from '@/app/MyComponents/book/step4'
// import { Decimal } from '@prisma/client/runtime/client'
// import { Gender, Role } from '@/lib/generated/prisma/enums'
// export type doctor = {
//     id: string;
//     licenseNumber: string | null;
//     specialty: string | null;
//     bio: string | null;
//     consultationFee: Decimal | null;
//     slotDuration: number;
//     user: {
//         id: string;
//         name: string;
//         email: string;
//         role: Role;
//         phone: string | null;
//         isActive: boolean;
//         profileImg: string | null;
//         gender: Gender;
//     };
//     services: {
//         service: {
//             id: string;
//             name: string;
//             description: string | null;
//             basePrice: Decimal | null;
//             durationMin: number;
//         };
//     }[];
// }

// export default function page() {
//     const [step, setStep] = useState<number>(1)
//     const params = useParams()
//     const [doctor, setDoctor] = useState<doctor | null>(null)
//     console.log(params)
//     // if (!params.doctorId) redirect('/doctors')
//     useEffect(() => {
//         try {
//             const fetchDoctor = async () => {
//                 const res = await fetch(`/api/doctors/${params.doctorId}`)
//                 // if (!res.ok) return redirect('/doctors')
//                 console.log("Err")
//                 const body: {
//                     success: true,
//                     data: doctor
//                 } = await res.json()
//                 // if (!body.success) return redirect('/doctors')
//                 setDoctor(body.data)
//             }
//             fetchDoctor();

//         } catch (error) {
//             console.log("error in fetching doctor : ", error)
//             // redirect("/doctors")
//         }
//     }, [])
//     // TODO : build functions that transform steps component use Gsap and returns steps tsx el depend on step number 

//     const renderStep1 = () => {
//         // TODO  : add gsap animation
//         return <Step1 gender={doctor?.user?.gender} step={step} setStep={setStep} services={doctor?.services} doctorName={doctor?.user?.name} bio={doctor?.bio} specialty={doctor?.specialty} DoctorImg={doctor?.user?.profileImg} />

//     }
//     const renderStep2 = () => {
//         // TODO  : add gsap animation
//         return <Step2 step={step} setStep={setStep} />

//     }
//     const renderStep3 = () => {
//         // TODO  : add gsap animation
//         return <Step3 step={step} setStep={setStep} />

//     }
//     const renderStep4 = () => {
//         // TODO  : add gsap animation
//         return <Step4 />

//     }

//     return (
//         <div className='container mx-auto'>
//             {/* progress bar */}

//             {/* Book */}
//             {step === 1 ? renderStep1() :
//                 step === 2 ? renderStep2() :
//                     step === 3 ? renderStep3() :
//                         renderStep4()
//             }
//             {/* footer */}
//         </div>
//     )
// }

'use client'
import Step1 from '@/app/MyComponents/book/step1'
import Step2 from '@/app/MyComponents/book/step2'
import React, { useEffect, useState } from 'react'
import { redirect, useParams } from 'next/navigation'
import Step3 from '@/app/MyComponents/book/step3'
import Step4 from '@/app/MyComponents/book/step4'
import { Decimal } from '@prisma/client/runtime/client'
import { Gender, Role } from '@/lib/generated/prisma/enums'

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

const STEP_LABELS = ['Doctor & Service', 'Date & Time', 'Details', 'Confirmation']
const TOTAL_STEPS = STEP_LABELS.length

export default function Page() {
    const [step, setStep] = useState<number>(1)
    const params = useParams()
    const doctorId = params?.doctorId as string | undefined

    const [doctor, setDoctor] = useState<Doctor | null>(null)
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!doctorId) {
            redirect('/doctors')
        }

        let cancelled = false

        const fetchDoctor = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`/api/doctors/${doctorId}`)
                if (!res.ok) {
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
                if (!cancelled) setLoading(false)
            }
        }

        fetchDoctor()

        return () => {
            cancelled = true
        }
    }, [doctorId])

    const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
    const goBack = () => setStep((s) => Math.max(s - 1, 1))

    if (loading) {
        return (
            <div className="container mx-auto flex items-center justify-center py-24">
                <p className="text-muted-foreground">Loading doctor details...</p>
            </div>
        )
    }

    if (error || !doctor) {
        return (
            <div className="container mx-auto flex flex-col items-center justify-center gap-4 py-24">
                <p className="text-destructive">{error ?? 'Doctor not found'}</p>
                <button
                    onClick={() => redirect('/doctors')}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                    Back to doctors
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
                        step={step}
                        setStep={setStep}
                        services={doctor.services}
                        doctorName={doctor.user.name}
                        bio={doctor.bio}
                        specialty={doctor.specialty}
                        DoctorImg={doctor.user.profileImg}
                    />
                )
            case 2:
                return <Step2 step={step} setStep={setStep} />
            case 3:
                return <Step3 step={step} setStep={setStep} />
            default:
                return <Step4 />
        }
    }

    return (
        <div className="container mx-auto">
            {/* progress bar */}
            <BookingProgressBar currentStep={step} labels={STEP_LABELS} />

            {/* Book */}
            {renderStep()}

            {/* footer */}
            <div className="flex justify-between py-6">
                <button
                    onClick={goBack}
                    disabled={step === 1}
                    className="rounded-md border px-4 py-2 disabled:opacity-40"
                >
                    Back
                </button>
                {step < TOTAL_STEPS && (
                    <button
                        onClick={goNext}
                        className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                    >
                        Next
                    </button>
                )}
            </div>
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