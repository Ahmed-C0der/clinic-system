import React from "react";
import { getPatientMedicalHistory } from "@/app/(Front_End)/actions/patient";
import RecordsClient from "./RecordsClient";

// Force dynamic rendering to ensure fresh records on load
export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  let recordsData = null;
  try {
    recordsData = await getPatientMedicalHistory();
  } catch (error) {
    console.error("Error loading patient medical history page data:", error);
  }

  return <RecordsClient initialData={recordsData} />;
}
