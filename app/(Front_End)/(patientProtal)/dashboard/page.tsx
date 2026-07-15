import React from "react";
import { getPatientDashboardData } from "@/app/(Front_End)/actions/patient";
import DashboardHomeClient from "./DashboardHomeClient";

// Force dynamic rendering to ensure fresh database queries on load
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let dashboardData = null;
  try {
    dashboardData = await getPatientDashboardData();
  } catch (error) {
    console.error("Error loading patient dashboard page data:", error);
  }

  return <DashboardHomeClient initialData={dashboardData} />;
}
