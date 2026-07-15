import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Gender } from '@/lib/generated/prisma/enums'
import { MessageCircleWarning } from 'lucide-react'
import Image from 'next/image'
import React, { createContext, useContext, useState } from 'react'

type BookingData = {
    impgProfile: string | null
    doctorName: string | null
    doctorId: string | null
    gender: string | null
    date: string | null
    time: string | null
    serviceId: string | null
    price: number | null
}

type BookingContextType = {
    booking: BookingData
    setBooking: React.Dispatch<React.SetStateAction<BookingData>>
}

const defaultBooking: BookingData = {
    impgProfile: null,
    doctorName: null,
    doctorId: null,
    gender: null,
    date: null,
    time: null,
    serviceId: null,
    price: null,
}

const BookingContext = createContext<BookingContextType | undefined>(undefined)

export const useBooking = () => {
    const ctx = useContext(BookingContext)
    if (!ctx) throw new Error("useBooking must be used within BookingProvider")
    return ctx
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
    const [booking, setBooking] = useState<BookingData>(defaultBooking)
    return (
        <BookingContext.Provider value={{ booking, setBooking }}>
            {children}
        </BookingContext.Provider>
    )
}

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
