"use client";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { Star } from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner';



export default function TestimonialsCard() {
    interface Testimonial {
        id: string;
        patientId: string;
        doctorId: string | null;
        type: string;
        rating: number;
        comment: string;
        source: string;
        isApproved: boolean;
        createdAt: string;
        patient: {
            name: string;
        };
    }

    const [testimonial, setTestimonials] = useState<Testimonial[]>([
        {
            id: "099ce864-9484-467c-b7b0-fba03f1ce59d",
            patientId: "5b9ec519-e1cb-4e74-a624-7732dfac2c69",
            doctorId: null,
            type: "center",
            rating: 5,
            comment: "العيادة نظيفة ومرتبة والموظفون متعاونون جدًا. تجربة ممتازة.",
            source: "reception",
            isApproved: true,
            createdAt: "2026-07-07T01:18:51.608Z",
            patient: {
                name: "ريم المنصور",
            },
        },
        {
            id: "d3e833ae-350e-43e3-8dac-740bff6add80",
            patientId: "94b4b0b8-ad87-48dc-b715-b0afb4d4dcf7",
            doctorId: "4974449c-95cb-48df-9453-52c6409a1613",
            type: "center",
            rating: 4,
            comment: "د. نورة ذات خبرة عالية وتشرح الحالة بوضوح. شكرًا جزيلًا.",
            source: "website",
            isApproved: true,
            createdAt: "2026-07-07T01:18:51.608Z",
            patient: {
                name: "محمد علي",
            },
        },
    ]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            const response = await fetch('/api/clinic/views')
            if (response.ok) {
                const data: Testimonial[] = await response.json()
                data.length > 0 && setTestimonials(data)
                console.log(testimonial);
                

            }
            else {
                toast.error("Failed to fetch testimonials")
            }
        }
        fetchTestimonials()
    }, [])
    return (
        <>
            <Carousel>
                <CarouselContent className="-ml-2 md:-ml-4">
                    {testimonial.map((testimonial, idx) => (
                        <CarouselItem key={idx} className="pl-2 md:pl-4">
                            <Card className='hover:shadow-md transition-all text-right border-gray-100'>
                                <CardContent className="p-6 space-y-4">

                                    <div className="flex items-center gap-3 ">
                                        <Avatar className="w-12 h-12 bg-emerald-100">
                                            <AvatarFallback className="bg-emerald-100 text-emerald-800 font-heading text-xs font-bold">
                                                {testimonial.patient.name[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-800">{testimonial.patient.name}</h4>
                                            <p className="text-[10px] text-gray-400">مريض تمت معالجته بالمركز</p>
                                        </div>
                                    </div>
                                    <Separator className="bg-gray-50" />
                                    <div className="flex justify-between items-center">
                                        
                                        <div className="flex text-amber-400">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <Star key={i} size={14} fill="currentColor" />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm italic font-body leading-relaxed">
                                        &ldquo;{testimonial.comment}&rdquo;
                                    </p>

                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}

                </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
            </Carousel>

        </>
    )
}
