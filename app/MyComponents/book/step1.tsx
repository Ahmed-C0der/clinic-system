// import { CardContent, Card, CardFooter } from '@/components/ui/card'
// import { Checkbox } from '@/components/ui/checkbox'
// import React, { useRef, useState } from 'react'
// import { Tractor, AmbulanceIcon } from 'lucide-react'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
// import CalendarRtl from '../arabicCalender'
// import { doctor } from '@/app/(Front_End)/(puplic pages)/(Book)/doctors/[doctorId]/page'
// import Image from 'next/image'
// import { Gender } from '@/lib/generated/prisma/enums'
// export default function Step1({
//     services,
//     doctorName,
//     bio,
//     specialty
//     , DoctorImg,
//     setStep,
//     gender,
//     step }: {
//         services: doctor['services'],
//         doctorName: doctor['user']['name'],
//         bio: doctor['bio'],
//         specialty: doctor['specialty'],
//         DoctorImg: doctor['user']['profileImg'],
//         setStep: (step: number) => void,
//         step: number,
//         gender: doctor['user']['gender']
//     }) {
//     const [checked, setChecked] = useState(false)
//     const selectedServices = useRef([])
//     return (
//         <main>
//             <section className='flex '>
//                 <div className='grid-cols-auto-fill'>

//                     {/* services */}
//                     {services?.map((service) => (
//                         <Card key={service.service.id}>
//                             <CardContent>
//                                 {service.service.name}
//                                 {service.service.description}
//                             </CardContent>
//                             <CardFooter>
//                                 <p className='text-green-500 font-bold'>

//                                     {service.service.basePrice || "Free"}
//                                 </p>
//                                 <Checkbox checked={checked} onCheckedChange={(e) => {
//                                     setChecked(!checked);
//                                     // selectedServices.current.push(service.service)
//                                     console.log("services :", selectedServices.current);

//                                 }} />

//                             </CardFooter>
//                         </Card>
//                     ))}
//                 </div>

//                 <div>


//                     {/* Doctor */}
//                     <Card>
//                         <div className='relative'>

//                             <Image src={DoctorImg || gender === Gender.female ? "/doctor_female.png" 
//                                 : "/doctor_male.png"} 
//                                 alt={doctorName} fill />
//                         </div>
//                         <CardContent>
//                             {doctorName}
//                             {bio}
//                         </CardContent>
//                         <CardFooter>
//                             {specialty}
//                         </CardFooter>
//                     </Card>
//                     <Card>
//                         <Badge><AmbulanceIcon /></Badge>
//                         عيادة معتمدة
//                     </Card>
//                 </div>

//             </section>

//             {/* Callenderd Disabled */}
//             <section className='disabled'>
//                 <h1>اختر الوقت و التاريخ</h1>
//                 <CalendarRtl />
//             </section>
//             <Button onClick={() => setStep(step + 1)}>
//                 الخطوة التالية
//             </Button>
//         </main>
//     )
// }

'use client'

import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'
import { Gender } from '@/lib/generated/prisma/enums'
import { Decimal } from '@prisma/client/runtime/client'

export type ServiceEntry = {
    service: {
        id: string
        name: string
        description: string | null
        basePrice: Decimal | null
        durationMin: number
    }
}

interface Step1Props {
    services: ServiceEntry[]
    doctorName: string
    bio: string | null
    specialty: string | null
    DoctorImg: string | null
    gender: Gender
    selectedServiceId: string | null
    onSelectService: (service: ServiceEntry['service']) => void
}

export default function Step1({
    services,
    doctorName,
    bio,
    specialty,
    DoctorImg,
    gender,
    selectedServiceId,
    onSelectService,
}: Step1Props) {
    return (
        <div className="space-y-6 text-right">
            <Card className="border-border bg-white shadow-sm">
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-full sm:mx-0">
                        <Image
                            src={DoctorImg || (gender === Gender.female ? '/doctor_female.png' : '/doctor_male.png')}
                            alt={doctorName}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        {specialty && (
                            <p className="inline-block rounded-full bg-[rgba(45,191,160,0.15)] px-3 py-1 text-xs font-semibold text-[#1a6b5a]">
                                {specialty}
                            </p>
                        )}
                        <h2 className="font-heading mt-2 text-xl font-semibold text-on-surface">{doctorName}</h2>
                        {bio && <p className="mt-1 text-sm leading-relaxed text-on-surface/60">{bio}</p>}
                    </div>
                </CardContent>
            </Card>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-on-surface">اختر الخدمة</h3>

                {services.length === 0 ? (
                    <p className="text-sm text-on-surface/60">لا توجد خدمات متاحة لهذا الطبيب حالياً</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {services.map(({ service }) => {
                            const isSelected = selectedServiceId === service.id
                            return (
                                <button
                                    key={service.id}
                                    type="button"
                                    onClick={() => onSelectService(service)}
                                    aria-pressed={isSelected}
                                    className={[
                                        'rounded-lg border p-4 text-right transition-colors',
                                        isSelected
                                            ? 'border-primary bg-[rgba(45,191,160,0.08)] ring-1 ring-primary'
                                            : 'border-border bg-white hover:border-primary/50',
                                    ].join(' ')}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-on-surface">{service.name}</h4>
                                        {service.basePrice != null && (
                                            <span className="whitespace-nowrap text-sm font-semibold text-[#1a6b5a]">
                                                {Number(service.basePrice)} ر.س
                                            </span>
                                        )}
                                    </div>
                                    {service.description && (
                                        <p className="mt-1 text-sm text-on-surface/60">{service.description}</p>
                                    )}
                                    <p className="mt-2 text-xs text-on-surface/50">المدة: {service.durationMin} دقيقة</p>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

