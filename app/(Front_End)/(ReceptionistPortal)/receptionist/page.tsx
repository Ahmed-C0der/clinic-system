import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth";
import { getDashboardData } from "./actions";
import DashboardClient from "./dashboard-client";

export default async function AdminDashboardPage() {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("access_token")?.value;
  if (!accessToken) redirect("/login");
  const payload = verifyAccessToken(accessToken);
  if (!payload || (payload.role !== "receptionist" && payload.role !== "admin")) redirect("/login");

  const data = await getDashboardData("month");

  return (
    <DashboardClient
      initialKpis={data.kpis}
      initialBarData={data.barData}
      initialPieData={data.pieData}
      initialRecentActivity={data.recentActivity}
      initialRevenueByDay={data.revenueByDay}
      initialRangeLabel={data.rangeLabel}
    />
  );
}
