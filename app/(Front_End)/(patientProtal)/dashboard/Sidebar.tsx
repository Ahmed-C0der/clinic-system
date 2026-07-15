"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, ClipboardList, User, LogOut, SidebarClose } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"


interface SidebarProps {
  patient: {
    name: string;
    patientCode: string;
    profileImg: string | null;
  } | null;
}

export default function MySidebar({ patient }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    {
      name: "الرئيسية",
      href: "/dashboard",
      icon: Home,
      isActive: pathname === "/dashboard",
    },
    {
      name: "مواعيدي",
      href: "/dashboard/appointments",
      icon: Calendar,
      isActive: pathname === "/dashboard/appointments",
    },
    {
      name: "السجلات الطبية",
      href: "/dashboard/records",
      icon: ClipboardList,
      isActive: pathname === "/dashboard/records",
    },
    {
      name: "الملف الشخصي",
      href: "/dashboard/profile",
      icon: User,
      isActive: pathname === "/dashboard/profile",
    },
  ];

  return (
    <>

      <Sidebar dir="rtl" side="right" className="relative" collapsible="icon">
        {/* <SidebarTrigger className="absolute top-4 left-4" /> */}

        {/* Patient Profile Card Header */}
        <SidebarHeader className="p-6 border-b border-slate-50 flex flex-col items-center text-center">
          <Avatar className="w-20 h-20 border-2 border-[#2DBFA0]/30 shadow-md transition-transform duration-300 hover:scale-105">
            {patient?.profileImg ? (
              <AvatarImage src={patient.profileImg} alt={patient.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="bg-[#1A6B5A] text-white text-xl font-bold font-cairo">
              {patient?.name?.slice(0, 2) || "مر"}
            </AvatarFallback>
          </Avatar>

          <h3 className="font-cairo font-bold text-lg mt-4 text-white tracking-wide">
            {patient?.name || "تحميل..."}
          </h3>
          <span className="font-sans font-medium text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 mt-2">
            {patient?.patientCode ? `مريض رقم ${patient.patientCode}` : "P-xxxxx"}
          </span>
        </SidebarHeader>

        {/* Nav Navigation Links */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu className="flex-1 p-4 space-y-1.5 mt-4">
              {navItems.map((item) => {
  const Icon = item.icon;
  return (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={item.isActive}
        className={`w-full font-sans text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${
          item.isActive
            ? "bg-[#2DBFA0]/20 text-white hover:bg-[#2DBFA0]/30"
            : "text-slate-300 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Link href={item.href} className="flex items-center w-full gap-2">
          {item.isActive && (
            <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#2DBFA0] rounded-l-full" />
          )}

          <Icon
            className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
              item.isActive ? "text-[#2DBFA0]" : "text-slate-400 group-hover:text-white"
            }`}
          />
          <span className="font-cairo text-sm font-medium">{item.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
})}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-slate-50">
          {/* Footer / Log out */}
          <form action="/api/auth/logout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 px-4 py-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all duration-300 font-cairo text-sm font-semibold"
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
    </>

  );
}
