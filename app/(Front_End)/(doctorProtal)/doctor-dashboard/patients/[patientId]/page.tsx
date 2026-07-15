import { GetDoctorId, getPatientMedicalFiles, getPatientPrescriptions } from '@/app/(Front_End)/actions/doctor';
import { redirect } from 'next/navigation';
import React from 'react'
import { toast } from 'sonner';
import PatientDetailClient from './PatientDetailClient';
import { cookies } from 'next/headers';

export default async function PatientPage({ params }: { params: Promise<{ patientId: string }> }) {
    const { patientId } = await params;
    let patientdate;
    let visits: any[] = [];
    let prescriptions: any[] = [];
    let medicalFiles: any[] = [];
    const cookieStore = await cookies()
    const access_token = cookieStore.get("access_token")?.value;
    try {

    const res = await fetch(`http://localhost:3000/api/patients/${patientId}`,{
      headers: {
    "Cookie": `access_token=${access_token}`, 
  }
    });
    if(!res.ok){
      return <div>Patient not found</div>
    }
    const patientData = await res.json();
    if(patientData.success){
      patientdate = patientData.patient;
    }
    const doctorId = await GetDoctorId()
    if(!doctorId){  toast.error("You are not authorized to perform this action");redirect("/login") ;}
      
    const visistRes = await fetch(`http://localhost:3000/api/visits?patientId=${patientId}&doctorId=${doctorId}`,{
      headers: {
    "Cookie": `access_token=${access_token}`, 
  }
    });
    if(visistRes.ok){
      const visitData = await visistRes.json();
      visits = visitData.data;
    }

    const [prescriptionsRes, medicalFilesRes] = await Promise.all([
        getPatientPrescriptions(patientId),
        getPatientMedicalFiles(patientId)
    ]);
    if (prescriptionsRes.success) {
        prescriptions = prescriptionsRes.prescriptions!;
    }
    if (medicalFilesRes.success) {
        medicalFiles = medicalFilesRes.medicalFiles!;
    }
    } catch (error) {
      console.log(error);
      return <div>Something went wrong</div>;
    }

    return (
        <div>
          <PatientDetailClient
            patientData={patientdate}
            visits={visits}
            prescriptions={prescriptions}
            medicalFiles={medicalFiles}
          />
        </div>
    )
}