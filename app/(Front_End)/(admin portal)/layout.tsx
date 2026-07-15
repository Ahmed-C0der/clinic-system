import { SidebarProvider } from "@/components/ui/sidebar"
import AdminSidebar from "./_components/AdminSidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <main dir="rtl" className="bg-surface min-h-screen">
      <SidebarProvider>
        <AdminSidebar />
        <div className="w-full">
          <div className="container mx-auto p-6 md:p-8 lg:p-10">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </main>
  )
}
