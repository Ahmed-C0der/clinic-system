import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Gender } from '@/lib/generated/prisma/enums'
import { MessageCircleWarning } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function BookinSummary({
    impgProfile,
    doctorName,
    gender,
    date,
    time
}:{
    impgProfile:string|null
    doctorName:string|null
    gender:string|null
    date:string|null
    time:string|null
}) {
    // TODO : add useState to sort data and use create Context to export value,SetValue
  return (
    <Card>
        <div className="relative">

        <Image src={impgProfile ? impgProfile:
            gender ? gender === Gender.female ? "/doctor_female.png" : "/doctor_male.png" :"/doctor_male.png"
        } alt={doctorName || "h"} fill />
        {/* Book Summary */}
        </div>
        <CardContent>
            <h1>ملخص الحجز</h1>
            <br />
            {/* services */}
            <div>
                <div></div>
                <div></div>
            </div>
            {/* Date */}
            <div>
                <div></div>
                <div></div>
            </div>
            {/* Price */}
            <div>

            </div>
        </CardContent>
        <CardFooter>
            {/* تنويه */}
            <MessageCircleWarning/>
            <p>
            سيتم تاكيد الموعدفور اتمام الخطوة التالية . يمكنك الالغاء قبل الموعد ب 24 ساعة
            </p>
        </CardFooter>
    </Card>
  )
}
