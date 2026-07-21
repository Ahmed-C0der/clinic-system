import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DoctorDashboardSidebar from "./sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const cookiesStore = await cookies();
    const accessToken = cookiesStore.get("access_token")?.value;
    if (!accessToken) redirect("/login");
    const payload = verifyAccessToken(accessToken);
    if (!payload || payload.role !== "doctor") redirect("/login");

    return (
        <main dir="rtl" className="bg-surface min-h-screen">
            <SidebarProvider>
                <DoctorDashboardSidebar />
                <SidebarTrigger/>

                <div className="w-full">
                    <div className="container mx-auto">
                        {children}
                    </div>
                </div>
            </SidebarProvider>
        </main>
    )
}
