import React from "react";
import { getPatientAppointments } from "@/app/(Front_End)/actions/patient";
import AppointmentsClient from "./AppointmentsClient";

// Force dynamic rendering to ensure fresh appointments on load
export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  let appointmentsData = null;
  try {
    appointmentsData = await getPatientAppointments();
  } catch (error) {
    console.error("Error loading patient appointments page data:", error);
  }

  return <AppointmentsClient initialData={appointmentsData} />;
}
