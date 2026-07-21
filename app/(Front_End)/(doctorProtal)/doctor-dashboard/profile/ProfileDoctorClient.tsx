"use client"
import { Gender, Role } from '@/lib/generated/prisma/enums';
import { Decimal } from '@prisma/client/runtime/client';
import React, { useActionState } from 'react'
import EditableAvatar from '@/app/MyComponents/editableAvatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { updateDoctorProfile, type DoctorProfileActionState } from './actions';

type Doctor = {
    id: string;
    user: {
        name: string;
        id: string;
        email: string;
        phone: string | null;
        gender: Gender;
        profileImg: string | null;
        role: Role;
        isActive: boolean;
    };
    licenseNumber: string | null;
    specialty: string | null;
    bio: string | null;
    consultationFee: Decimal | null;
    slotDuration: number;
    services: {
        service: {
            name: string;
            id: string;
            description: string | null;
            basePrice: Decimal | null;
            durationMin: number;
        };
    }[];
}

const initialState: DoctorProfileActionState = { status: "idle" };

function SubmitButton() {
    const { pending } = useActionState(updateDoctorProfile, initialState);
    return (
        <Button
            type="submit"
            disabled={pending}
            className="rounded-[8px] bg-primary text-white hover:bg-primary/90 h-10 px-4 text-sm font-semibold"
        >
            {pending && <Loader2 className="ms-2 h-4 w-4 animate-spin" />}
            حفظ التغييرات
        </Button>
    );
}

export default function ProfileDoctorClient({ doctor }: { doctor: Doctor }) {
    const [state, formAction] = useActionState(updateDoctorProfile, initialState);

    return (
        <div dir="rtl" className="flex flex-col gap-6 w-full p-6">
            <h1 className="text-[28px] font-bold text-on-surface">الملف الشخصي</h1>

            <Card>
                <CardHeader>
                    <h2 className="text-[18px] font-semibold text-on-surface">الصورة الشخصية</h2>
                </CardHeader>
                <CardContent>
                    <EditableAvatar src={doctor.user.profileImg || undefined} name={doctor.user.name.slice(0, 2)} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h2 className="text-[18px] font-semibold text-on-surface">البيانات الشخصية</h2>
                </CardHeader>
                <CardContent>
                    <form action={formAction} className="flex flex-col gap-5">
                        <input type="hidden" name="doctorId" value={doctor.id} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="name" className="text-[12px] font-medium text-on-surface/70">الاسم الكامل</Label>
                                <Input id="name" name="name" defaultValue={doctor.user.name} required className="rounded-[8px] border-border text-right mt-1 h-11" />
                            </div>
                            <div>
                                <Label htmlFor="email" className="text-[12px] font-medium text-on-surface/70">البريد الإلكتروني</Label>
                                <Input id="email" defaultValue={doctor.user.email} disabled className="rounded-[8px] border-border text-right mt-1 h-11 bg-[#f4f1f7] text-on-surface/40" />
                            </div>
                            <div>
                                <Label htmlFor="phone" className="text-[12px] font-medium text-on-surface/70">الهاتف</Label>
                                <Input id="phone" name="phone" defaultValue={doctor.user.phone ?? ""} className="rounded-[8px] border-border text-right mt-1 h-11" />
                            </div>
                            <div>
                                <Label htmlFor="licenseNumber" className="text-[12px] font-medium text-on-surface/70">رقم الترخيص</Label>
                                <Input id="licenseNumber" name="licenseNumber" defaultValue={doctor.licenseNumber ?? ""} className="rounded-[8px] border-border text-right mt-1 h-11" />
                            </div>
                            <div>
                                <Label htmlFor="specialty" className="text-[12px] font-medium text-on-surface/70">التخصص</Label>
                                <Input id="specialty" name="specialty" defaultValue={doctor.specialty ?? ""} className="rounded-[8px] border-border text-right mt-1 h-11" />
                            </div>
                            <div>
                                <Label htmlFor="consultationFee" className="text-[12px] font-medium text-on-surface/70">رسوم الكشف (ج.م)</Label>
                                <Input id="consultationFee" name="consultationFee" type="number" defaultValue={doctor.consultationFee?.toString() ?? ""} className="rounded-[8px] border-border text-right mt-1 h-11" />
                            </div>
                            <div>
                                <Label htmlFor="slotDuration" className="text-[12px] font-medium text-on-surface/70">مدة الموعد (دقيقة)</Label>
                                <Input id="slotDuration" name="slotDuration" type="number" defaultValue={doctor.slotDuration} className="rounded-[8px] border-border text-right mt-1 h-11" />
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="bio" className="text-[12px] font-medium text-on-surface/70">السيرة الذاتية</Label>
                            <Textarea id="bio" name="bio" defaultValue={doctor.bio ?? ""} className="rounded-[8px] border-border text-right mt-1" rows={4} />
                        </div>
                        {state.status !== "idle" && (
                            <p className={`text-[13px] font-medium ${state.status === "success" ? "text-primary" : "text-destructive"}`}>
                                {state.message}
                            </p>
                        )}
                        <div>
                            <SubmitButton />
                        </div>
                    </form>
                </CardContent>
            </Card>

            {doctor.services.length > 0 && (
                <Card>
                    <CardHeader>
                        <h2 className="text-[18px] font-semibold text-on-surface">الخدمات المقدمة</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {doctor.services.map((s) => (
                                <div key={s.service.id} className="border border-border rounded-[8px] p-4 bg-white shadow-sm">
                                    <p className="font-semibold text-[14px] text-on-surface">{s.service.name}</p>
                                    {s.service.description && <p className="text-[12px] text-on-surface/60 mt-1">{s.service.description}</p>}
                                    <div className="flex justify-between mt-3 text-[12px] text-on-surface/70">
                                        {s.service.basePrice && <span>السعر: <span className="font-semibold text-primary">{Number(s.service.basePrice)} ج.م</span></span>}
                                        <span>المدة: <span className="font-semibold">{s.service.durationMin} دقيقة</span></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
