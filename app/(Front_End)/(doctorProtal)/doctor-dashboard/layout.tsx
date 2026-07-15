import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DoctorDashboardSidebar from "./sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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
