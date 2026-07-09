"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import React, { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Heart, Layers, ShieldCheck } from 'lucide-react'

const ICONS = [
  <Heart size={20} />,
  <Layers size={20} />,
  <ShieldCheck size={20} />,
]

const ICON_COLORS = [
  'bg-[#2dbfa0]/10 text-[#1a6b5a]',
  'bg-[#2dbfa0]/10 text-[#1a6b5a]',
  'bg-[#2dbfa0]/10 text-[#1a6b5a]',
]

export default function TopServices() {
  const [topServices, setTopServices] = useState<{
    id: string
    name: string
    description: string
    durationMin: number
    priceRange: { min: number; max: number }
  }[]>([])

  useEffect(() => {
    const fetchTopServices = async () => {
      const response = await fetch('/api/clinic/topServices?limit=3')
      if (response.ok) {
        const data = await response.json()
        setTopServices(data)
      } else {
        toast.error('تعذّر تحميل الخدمات')
      }
    }
    fetchTopServices()
  }, [])

  return (
    <div dir="rtl" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {topServices.map((service, idx) => (
          <Card
            key={service.id}
            className="
              bg-white border border-[#e0dce5] rounded-[8px]
              shadow-[0_1px_3px_rgba(0,0,0,0.08)]
              hover:shadow-[0_4px_12px_rgba(0,0,0,0.10)]
              transition-shadow duration-200
              flex flex-col text-right
            "
          >
            {/* Header */}
            <CardHeader className="flex flex-row-reverse items-center gap-3 px-6 pt-6 pb-3">
              {/* Icon badge */}
              <span className={`flex items-center justify-center w-10 h-10 rounded-[8px] shrink-0 ${ICON_COLORS[idx]}`}>
                {ICONS[idx]}
              </span>
              <h3 className="text-[#1c1c1e] text-[18px] font-semibold leading-snug">
                {service.name}
              </h3>
            </CardHeader>

            {/* Body */}
            <CardContent className="px-6 pb-4 flex-1">
              <p className="text-[14px] text-[#6b6b6b] leading-relaxed">
                {service.description}
              </p>
            </CardContent>

            {/* Footer */}
            <CardFooter className="px-6 py-4 border-t border-[#e0dce5] flex flex-row-reverse justify-between items-center">
              {/* Duration */}
              <span className="text-[12px] font-medium text-[#1a6b5a] bg-[#2dbfa0]/10 px-3 py-1 rounded-full">
                {service.durationMin} دقيقة
              </span>

              {/* Price */}
              <span className="text-[14px] font-semibold text-[#1c1c1e]">
                {service.priceRange.min === service.priceRange.max
                  ? service.priceRange.min
                  : `${service.priceRange.min} – ${service.priceRange.max}`}{' '}
                <span className="text-[12px] font-normal text-[#6b6b6b]">ج.م</span>
              </span>
            </CardFooter>
          </Card>
        ))}
    </div>
  )
}

