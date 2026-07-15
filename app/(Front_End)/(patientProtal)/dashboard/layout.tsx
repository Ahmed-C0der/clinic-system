import { getPatientProfile } from "@/app/(Front_End)/actions/patient";
import  AppSidebar from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar"
export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
  appointments: React.ReactNode;
  records: React.ReactNode;
  profile: React.ReactNode;
  prescriptions: React.ReactNode;
}) {
  let patient = null;
  try {
    patient = await getPatientProfile();
  } catch (err) {
    console.error("Failed to fetch patient profile in layout:", err);
  }

  return (
    <div className="flex min-h-screen bg-[#fcf8fb] text-[#1c1c1e] antialiased" dir="rtl">
      <SidebarProvider>
        <AppSidebar patient={patient} />
        <main className="flex-grow flex flex-col h-screen overflow-y-auto">
          <div className="p-8 max-w-7xl w-full mx-auto">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
}

