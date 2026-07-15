"use client"
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Gender, Role } from '@/lib/generated/prisma/enums';
import { Download, Droplet, EditIcon, Eye, Printer, X, Save } from 'lucide-react';
import MyAvater from '@/app/MyComponents/myAvater'
import React, { useRef, useState } from 'react'
import { calculateAge } from '@/lib/additional';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Patient = {
    user: {
        id: string;
        name: string;
        role: Role;
        email: string;
        isActive: boolean;
        profileImg?: string | null;
    } | null;
    id: string;
    name: string;
    userId: string | null;
    createdAt: Date;
    gender: Gender | null;
    phone: string | null;
    deletedAt: Date | null;
    patientCode: string;
    dateOfBirth: Date | null;
    address: string | null;
    bloodType: string | null;
    chronicDiseases: string | null;
    allergies: string | null;
}

type Visit = {
    id: string;
    chiefComplaint: string | null;
    notes: string | null;
    bloodPressure: string | null;
    diagnosis: string | null;
    visitDate: Date;
}

type PrescriptionItem = {
    id: string;
    medicineName: string;
    dosage: string | null;
    frequency: string | null;
    duration: string | null;
    instructions: string | null;
}

type Prescription = {
    id: string;
    visitId: string;
    notes: string | null;
    deletedAt: Date | null;
    createdAt: Date;
    items: PrescriptionItem[];
}

type MedicalFile = {
    id: string;
    patientId: string;
    visitId: string | null;
    fileName: string;
    fileType: string;
    fileUrl: string;
    fileSizeBytes: number | null;
    uploadedAt: Date;
}

type NavLinks = "medical-history" | "visits" | "prescriptions" | "medical-files";

const NAV_ITEMS: { key: NavLinks; label: string }[] = [
    { key: "medical-history", label: "الأمراض المزمنة" },
    { key: "visits", label: "الزيارات" },
    { key: "prescriptions", label: "الوصفات الطبية" },
    { key: "medical-files", label: "الملفات الطبية" },
];

export default function PatientDetailClient({
    patientData,
    visits = [],
    prescriptions = [],
    medicalFiles = [],
}: {
    patientData: Patient;
    visits?: Visit[];
    prescriptions?: Prescription[];
    medicalFiles?: MedicalFile[];
}) {
    const [navLinks, setNavLinks] = useState<NavLinks>("medical-history")
    const [showEditModal, setShowEditModal] = useState(false)
    const [editChronicDiseases, setEditChronicDiseases] = useState(patientData.chronicDiseases || "")
    const [editAllergies, setEditAllergies] = useState(patientData.allergies || "")
    // مرجع لكل قسم عشان نقدر نعمل scroll ليه من الـ sidebar
    const medicalHistoryRef = useRef<HTMLDivElement>(null);
    const visitsRef = useRef<HTMLDivElement>(null);
    const prescriptionsRef = useRef<HTMLDivElement>(null);
    const medicalFilesRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => window.print()

    const openEditModal = () => {
        setEditChronicDiseases(patientData.chronicDiseases || "")
        setEditAllergies(patientData.allergies || "")
        setShowEditModal(true)
    }

    const sectionRefs: Record<NavLinks, React.RefObject<HTMLDivElement>> = {
        "medical-history": medicalHistoryRef,
        "visits": visitsRef,
        "prescriptions": prescriptionsRef,
        "medical-files": medicalFilesRef,
    };

    const switchNavLinksHandler = (link: NavLinks) => {
        setNavLinks(link);
        sectionRefs[link].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const age = calculateAge(patientData.dateOfBirth as Date)

    const formatDate = (date: Date) =>
        new Date(date).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" });

    const activePrescriptionsCount = prescriptions.filter((p) => !p.deletedAt).length;
    console.log("visits are: ",visits)
    return (
        <main>
            
            <section className='flex flex-row md:flex-col sm:flex-col'>
                <div className="content flex flex-col flex-1">
                    {/* User Card */}
                    <div className="userCard" ref={medicalHistoryRef}>
                        <Card>
                            <CardContent className='flex flex-row items-center justify-between'>
                                <div className="personal-info">
                                    <MyAvater src={patientData.user?.profileImg||undefined} fallback={patientData.user?.name?.slice(0, 2)} />
                                    <div className="info">
                                        <h1>{patientData.name}</h1>
                                        <span>{patientData.patientCode}</span>
                                        <span>{age} سنة </span>
                                        <span>{patientData.gender}</span>
                                        <span>{patientData.bloodType} <Droplet size={16} /></span>
                                    </div>
                                </div>
                                <div className="action">
                                    <Button onClick={handlePrint}>
                                        <Printer />
                                        طباعة السجل
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Medical History / Diagnosis */}
                    <Card className='diagnosis'>
                        <CardHeader>
                            <h2>الامراض المزمنة</h2>
                            <Button variant="outline" size="sm" onClick={openEditModal}>
                                <EditIcon />
                                تعديل
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div>
                                <p>الامراض المزمنة: {patientData.chronicDiseases || "لا يوجد"}</p>
                                <p>الحساسية: {patientData.allergies || "لا يوجد"}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visits Table */}
                    <Card className="visits" ref={visitsRef}>
                        <CardHeader>
                            <h2>سجل الزيارات</h2>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>الشكوى الرئيسية</TableHead>
                                        <TableHead>ملاحظات</TableHead>
                                        <TableHead>ضغط الدم</TableHead>
                                        <TableHead>التشخيص</TableHead>
                                        <TableHead>تاريخ الزيارة</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visits.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center">
                                                لا توجد زيارات مسجلة
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        visits.map((visit) => (
                                            <TableRow key={visit.id}>
                                                <TableCell>{visit.chiefComplaint || "-"}</TableCell>
                                                <TableCell>{visit.notes || "-"}</TableCell>
                                                <TableCell>{visit.bloodPressure || "-"}</TableCell>
                                                <TableCell>{visit.diagnosis || "-"}</TableCell>
                                                <TableCell>{formatDate(visit.visitDate)}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Prescriptions */}
                    <Card className="prescriptions" ref={prescriptionsRef}>
                        <CardHeader>
                            <h2>عدد الوصفات النشطة: {activePrescriptionsCount}</h2>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2">
                            {prescriptions.length === 0 ? (
                                <p className="text-center">لا توجد وصفات مسجلة</p>
                            ) : (
                                prescriptions.map((prescription) => (
                                    <div key={prescription.id} className="prescriptionCard border rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant={prescription.deletedAt ? "secondary" : "default"}>
                                                {prescription.deletedAt ? "غير نشطة" : "نشطة"}
                                            </Badge>
                                            <span className="text-xs text-muted-foreground">
                                                تاريخ الإنشاء: {formatDate(prescription.createdAt)}
                                            </span>
                                        </div>
                                        {prescription.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                                                <div className="flex items-center gap-2">
                                                    <Avatar>
                                                        <Droplet size={20} />
                                                    </Avatar>
                                                    <div className="flex flex-col text-sm">
                                                        <span className="font-medium">{item.medicineName}</span>
                                                        <div className="flex gap-3 text-muted-foreground">
                                                            <span>الجرعة: {item.dosage || "-"}</span>
                                                            <span>التكرار: {item.frequency || "-"}</span>
                                                            {item.duration && <span>المدة: {item.duration}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                                {item.instructions && (
                                                    <span className="text-xs text-muted-foreground max-w-[200px] truncate" title={item.instructions}>
                                                        {item.instructions}
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {prescription.notes && (
                                            <p className="text-xs text-muted-foreground mt-2">{prescription.notes}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Medical Files */}
                    <Card className="medicalFiles" ref={medicalFilesRef}>
                        <CardHeader>
                            <h2>الملفات الطبية</h2>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>اسم الملف</TableHead>
                                        <TableHead>نوعه</TableHead>
                                        <TableHead>التاريخ</TableHead>
                                        <TableHead>الإجراء</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {medicalFiles.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">
                                                لا توجد ملفات مرفوعة
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        medicalFiles.map((file) => (
                                            <TableRow key={file.id}>
                                                <TableCell>{file.fileName}</TableCell>
                                                <TableCell>{file.fileType}</TableCell>
                                                <TableCell>{formatDate(file.uploadedAt)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="icon" asChild>
                                                            <a href={file.fileUrl} download>
                                                                <Download size={16} />
                                                            </a>
                                                        </Button>
                                                        <Button variant="outline" size="icon" asChild>
                                                            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                                                <Eye size={16} />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="sidebar">
                    <nav className="flex flex-col gap-2">
                        {NAV_ITEMS.map((item) => (
                            <Button
                                key={item.key}
                                variant={navLinks === item.key ? "default" : "ghost"}
                                onClick={() => switchNavLinksHandler(item.key)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </nav>
                </aside>
            </section>
            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <h2>تعديل الأمراض المزمنة والحساسية</h2>
                            <Button variant="ghost" size="icon" onClick={() => setShowEditModal(false)}>
                                <X size={20} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="chronicDiseases">الأمراض المزمنة</Label>
                                <Input
                                    id="chronicDiseases"
                                    value={editChronicDiseases}
                                    onChange={(e) => setEditChronicDiseases(e.target.value)}
                                    placeholder="أدخل الأمراض المزمنة"
                                />
                            </div>
                            <div>
                                <Label htmlFor="allergies">الحساسية</Label>
                                <Input
                                    id="allergies"
                                    value={editAllergies}
                                    onChange={(e) => setEditAllergies(e.target.value)}
                                    placeholder="أدخل الحساسية"
                                />
                            </div>
                        </CardContent>
                        <div className="flex justify-end gap-2 p-4 pt-0">
                            <Button variant="outline" onClick={() => setShowEditModal(false)}>إلغاء</Button>
                            <Button onClick={async () => {
                                // TODO: call API to update patient chronicDiseases/allergies
                                setShowEditModal(false)
                            }}>
                                <Save size={16} /> حفظ
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </main>
    )
}