import { CardContent, Card, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import React, { useRef, useState } from 'react'
import { Tractor, AmbulanceIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import CalendarRtl from '../arabicCalender'
import { doctor } from '@/app/(Front_End)/(puplic pages)/(Book)/doctors/[doctorId]/page'
import Image from 'next/image'
import { Gender } from '@/lib/generated/prisma/enums'
export default function Step1({
    services,
    doctorName,
    bio,
    specialty
    , DoctorImg,
    setStep,
    gender,
    step }: {
        services: doctor['services'],
        doctorName: doctor['user']['name'],
        bio: doctor['bio'],
        specialty: doctor['specialty'],
        DoctorImg: doctor['user']['profileImg'],
        setStep: (step: number) => void,
        step: number,
        gender: doctor['user']['gender']
    }) {
    const [checked, setChecked] = useState(false)
    const selectedServices = useRef([])
    return (
        <main>
            <section className='flex '>
                <div className='grid-cols-auto-fill'>

                    {/* services */}
                    {services?.map((service) => (
                        <Card key={service.service.id}>
                            <CardContent>
                                {service.service.name}
                                {service.service.description}
                            </CardContent>
                            <CardFooter>
                                <p className='text-green-500 font-bold'>

                                    {service.service.basePrice || "Free"}
                                </p>
                                <Checkbox checked={checked} onCheckedChange={(e) => {
                                    setChecked(!checked);
                                    // selectedServices.current.push(service.service)
                                    console.log("services :", selectedServices.current);

                                }} />

                            </CardFooter>
                        </Card>
                    ))}
                </div>

                <div>


                    {/* Doctor */}
                    <Card>
                        <div className='relative'>

                            <Image src={DoctorImg || gender === Gender.female ? "/doctor_female.png" 
                                : "/doctor_male.png"} 
                                alt={doctorName} fill />
                        </div>
                        <CardContent>
                            {doctorName}
                            {bio}
                        </CardContent>
                        <CardFooter>
                            {specialty}
                        </CardFooter>
                    </Card>
                    <Card>
                        <Badge><AmbulanceIcon /></Badge>
                        عيادة معتمدة
                    </Card>
                </div>

            </section>

            {/* Callenderd Disabled */}
            <section className='disabled'>
                <h1>اختر الوقت و التاريخ</h1>
                <CalendarRtl />
            </section>
            <Button onClick={() => setStep(step + 1)}>
                الخطوة التالية
            </Button>
        </main>
    )
}
