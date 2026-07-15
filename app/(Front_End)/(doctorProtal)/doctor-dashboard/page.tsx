import { getDoctorDashboardData } from '@/app/(Front_End)/actions/doctor';
import React from 'react'
import DoctorHome from './DoctorHome';
export const dynamic = "force-dynamic";

export default async function DoctorDashboard() {
  let dashboardData
  let sanitizedData
  try{
    dashboardData = await getDoctorDashboardData();
    if (dashboardData) {
    sanitizedData = {
      ...dashboardData,
      doctor: {
        ...dashboardData.doctor,
        consultationFee: Number(dashboardData.doctor.consultationFee)
      }
    };
  } 
  }catch(error){
    console.log(error);
  }

  return (
    <>
    {sanitizedData && <DoctorHome dashboardData={sanitizedData as any}/>}
    </>
  )
}
// TODO: build doctor ui dashboard