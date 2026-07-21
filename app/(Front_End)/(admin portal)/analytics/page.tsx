// import { getDashboardData } from "./actions";
import { getDashboardData } from "../_actions/adminDashboard";
import DashboardClient from "./dashboard-client";

export default async function AdminDashboardPage() {
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
