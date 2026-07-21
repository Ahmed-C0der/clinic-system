"use client";
//FIXME: understand the flow of rednring this parallel routes then fix why profle give us 404
import React, { useState, useRef, useActionState } from "react";
import { User, Calendar, Phone, Mail, Droplet, Heart, ShieldAlert, Check, RefreshCw } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updatePatientProfile } from "@/app/(Front_End)/actions/patient";
import { Gender } from "@/lib/generated/prisma/client";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { UploadImg } from "@/app/(Front_End)/actions/imgProfile";
import EditableAvatar from "@/app/MyComponents/editableAvatar";

interface ProfileClientProps {
  initialData: any;
}

export default function ProfileClient({ initialData }: ProfileClientProps) {
  const [state , actionImg , isPendingImg]=useActionState(
    UploadImg,
    null
  )
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPending, setIsPending] = useState(false);

  // Form states
  const [name, setName] = useState(initialData?.name || "");
  const [email, setEmail] = useState(initialData?.email || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [gender, setGender] = useState<Gender>(initialData?.gender || "other");
  const [bloodType, setBloodType] = useState(initialData?.bloodType || "");
  const [chronicDiseases, setChronicDiseases] = useState(initialData?.chronicDiseases || "");
  const [allergies, setAllergies] = useState(initialData?.allergies || "");

  // Format birthday to YYYY-MM-DD
  const formatBirthDateInput = (dateString: Date | string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [dateOfBirth, setDateOfBirth] = useState(formatBirthDateInput(initialData?.dateOfBirth));

  useGSAP(() => {
    gsap.from(".animate-profile-card", {
      opacity: 0,
      y: 35,
      duration: 0.65,
      stagger: 0.12,
      ease: "power2.out"
    });
  }, { scope: containerRef });

  if (!initialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" dir="rtl">
        <ShieldAlert className="w-12 h-12 text-[#e67e22] mb-4" />
        <h3 className="font-cairo text-lg font-bold text-[#1C1C1E]">حدث خطأ في تحميل الملف الشخصي</h3>
        <p className="font-sans text-slate-500 text-sm mt-1">يرجى إعادة تحميل الصفحة والمحاولة مرة أخرى.</p>
      </div>
    );
  }

  const { stats, patientCode, profileImg } = initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);

    try {
      const response = await updatePatientProfile(initialData.id, {
        name,
        email,
        phone: phone || null,
        address: address || null,
        gender: gender as Gender,
        bloodType: bloodType || null,
        chronicDiseases: chronicDiseases || null,
        allergies: allergies || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null
      });

      if (response && response.success) {
        toast.success("تم تحديث ملفك الشخصي بنجاح", {
          position: "top-center"
        });
      } else {
        toast.error("حدث خطأ أثناء تحديث البيانات.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-8" dir="rtl">
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4">
        <h1 className="font-cairo text-2xl font-bold text-[#1C1C1E]">الملف الشخصي</h1>
        <p className="font-sans text-slate-400 text-xs md:text-sm mt-1">
          إدارة بياناتك الشخصية، معلومات الاتصال، والسيرة الطبية الخاصة بك.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Profile Form (Takes 2 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <Card className="animate-profile-card border-none shadow-sm bg-white rounded-lg">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="font-cairo text-[#1C1C1E] text-base font-bold">البيانات الشخصية</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

              {/* Name & Birthday Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="font-cairo text-xs font-semibold text-slate-600">الاسم الكامل</Label>
                  <div className="relative">
                    <Input
                      id="fullName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="font-sans text-sm rounded-lg pr-10 border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0]"
                    />
                    <User className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob" className="font-cairo text-xs font-semibold text-slate-600">تاريخ الميلاد</Label>
                  <div className="relative">
                    <Input
                      id="dob"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="font-sans text-sm rounded-lg pr-10 border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0]"
                    />
                    <Calendar className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Phone & Email Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-cairo text-xs font-semibold text-slate-600">رقم الهاتف</Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="font-sans text-sm rounded-lg pr-10 border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0]"
                    />
                    <Phone className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-cairo text-xs font-semibold text-slate-600">البريد الإلكتروني</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="font-sans text-sm rounded-lg pr-10 border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0]"
                    />
                    <Mail className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Gender & Blood Type Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
                <div className="space-y-3">
                  <Label className="font-cairo text-xs font-semibold text-slate-600">الجنس</Label>
                  <RadioGroup
                    value={gender}
                    onValueChange={(val) => setGender(val as Gender)}
                    className="flex items-center gap-6"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-cairo text-xs font-medium text-slate-700 cursor-pointer">ذكر</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-cairo text-xs font-medium text-slate-700 cursor-pointer">أنثى</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType" className="font-cairo text-xs font-semibold text-slate-600">فصيلة الدم</Label>
                  <Select value={bloodType} onValueChange={(val) => setBloodType(val)}>
                    <SelectTrigger id="bloodType" className="font-sans text-sm rounded-lg border-slate-200">
                      <SelectValue placeholder="اختر فصيلة الدم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="font-cairo text-xs font-semibold text-slate-600">العنوان بالتفصيل</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="font-sans text-sm rounded-lg border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0]"
                />
              </div>

            </CardContent>
          </Card>

          {/* Medical Info Card */}
          <Card className="animate-profile-card border-none shadow-sm bg-white rounded-lg">
            <CardHeader className="pb-4 border-b border-slate-50">
              <CardTitle className="font-cairo text-[#1C1C1E] text-base font-bold">المعلومات الطبية</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">

              <div className="space-y-2">
                <Label htmlFor="chronic" className="font-cairo text-xs font-semibold text-[#1A6B5A] flex items-center gap-1.5">
                  <Heart className="w-4 h-4" />
                  الأمراض المزمنة (إن وجدت)
                </Label>
                <Textarea
                  id="chronic"
                  value={chronicDiseases}
                  onChange={(e) => setChronicDiseases(e.target.value)}
                  placeholder="مثال: ضغط الدم المرتفع، السكري..."
                  className="font-sans text-sm rounded-lg border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0] min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies" className="font-cairo text-xs font-semibold text-red-500 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  الحساسية من الأدوية (إن وجدت)
                </Label>
                <Textarea
                  id="allergies"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="مثال: البنسلين، أدوية السلفا..."
                  className="font-sans text-sm rounded-lg border-slate-200 focus:border-[#2dbfa0] focus:ring-1 focus:ring-[#2dbfa0] min-h-[80px]"
                />
              </div>

            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="animate-profile-card flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo font-bold rounded-lg px-8 py-3 transition-transform duration-300 hover:scale-105"
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  جاري الحفظ...
                </span>
              ) : (
                <span>حفظ التغييرات</span>
              )}
            </Button>
          </div>
        </form>

        {/* Sidebar Info Card (Takes 1 col) */}
        <div className="space-y-6">
          <Card className="animate-profile-card border-none shadow-sm bg-white rounded-lg overflow-hidden text-center">
            {/* Colored background banner */}
            <div className="h-24 bg-gradient-to-l from-[#1A6B5A]/80 to-[#1A6B5A]" />
            <CardContent className="relative pt-0 pb-6 px-6">

              {/* Profile Avatar absolute overlay */}
              <div className="flex justify-center -mt-12 mb-4">
                {/* <form action={actionImg}>

                <Field>
                  <FieldLabel htmlFor="picture">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                  {profileImg || state?.userImg ? (
                    <AvatarImage src={profileImg||state?.userImg} alt={name} className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-[#1A6B5A] text-white text-2xl font-bold font-cairo">
                    {name?.slice(0, 2) || "مر"}
                  </AvatarFallback>
                </Avatar>
                
                  </FieldLabel>
                  <Input name="image" id="picture" type="file" />
                  <FieldDescription>Select a picture to upload.</FieldDescription>
                </Field>
                <Button
                  type="submit"
                  disabled={isPendingImg}
                  className="bg-[#1A6B5A] hover:bg-[#1A6B5A]/90 text-white font-cairo font-bold rounded-lg px-8 py-3 transition-transform duration-300 hover:scale-105"
                >
                  {isPendingImg ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      جاري الحفظ...
                    </span>
                  ) : (
                    <span>حفظ التغييرات</span>
                  )}
                </Button>
                </form> */}
              <EditableAvatar src={profileImg} name={name} />
              </div>

              <div className="space-y-1">
                <h3 className="font-cairo font-bold text-[#1C1C1E] text-base">{name}</h3>
                <span className="font-sans font-medium text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 inline-block">
                  مريض رقم {patientCode}
                </span>
              </div>

              {/* Profile Mini Stats */}
              <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-50 py-4 mt-6">
                <div className="space-y-1 text-center border-l border-slate-50">
                  <span className="font-sans text-[10px] text-slate-400 block">عدد الزيارات</span>
                  <span className="font-cairo font-bold text-sm text-[#1C1C1E]">{stats.totalVisits}</span>
                </div>
                <div className="space-y-1 text-center border-l border-slate-50">
                  <span className="font-sans text-[10px] text-slate-400 block">آخر زيارة</span>
                  <span className="font-cairo font-bold text-xs text-[#1C1C1E] truncate block max-w-[70px] mx-auto" title={stats.lastVisitDate ? new Date(stats.lastVisitDate).toLocaleDateString("ar-EG") : "لا يوجد"}>
                    {stats.lastVisitDate ? new Date(stats.lastVisitDate).toLocaleDateString("ar-EG", { month: 'numeric', day: 'numeric' }) : "لا يوجد"}
                  </span>
                </div>
                <div className="space-y-1 text-center">
                  <span className="font-sans text-[10px] text-slate-400 block">الوصفات النشطة</span>
                  <span className="font-cairo font-bold text-sm text-[#1C1C1E]">{stats.activePrescriptionsCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
