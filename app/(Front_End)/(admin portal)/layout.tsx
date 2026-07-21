import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth";
import { AdminSidebar } from "./_components/layout/admin-sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("access_token")?.value;
  if (!accessToken) redirect("/login");
  const payload = verifyAccessToken(accessToken);
  if (!payload || payload.role !== "admin") redirect("/login");

  return (
    <div dir="rtl" className="flex min-h-screen bg-[#fcf8fb]">
      <div className="flex flex-1 flex-row ">
        <AdminSidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
