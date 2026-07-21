"use client"
import { getImgProfile } from "@/app/(Front_End)/actions/imgProfile"
import { useUserStore } from "@/app/(Front_End)/sotres/userStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { CalendarClock, FolderHeart, LayoutDashboard, ScrollText, UserCircle, Users } from "lucide-react"
import { usePathname } from "next/navigation"
import MyAvater from "@/app/MyComponents/myAvater"
import Link from "next/link"

export default function DoctorDashboardSidebar() {
    const { user } = useUserStore(state => state)
    const [profileImg, setProfileImg] = useState<string | undefined>(undefined)
    const pathname = usePathname();
    const navItem = [
        {
            title: "لوحتي",
            href: "/doctor-dashboard",
            icon: LayoutDashboard,
            isActive: pathname === "/doctor-dashboard"
        },
        {
            title: "المرضى",
            href: "/doctor-dashboard/patients",
            icon: Users,
            isActive: pathname === "/doctor-dashboard/patients"
        },
        {
            title: "المواعيد",
            href: "/doctor-dashboard/appointments",
            icon: CalendarClock,
            isActive: pathname === "/doctor-dashboard/appointments"
        },
        {
            title: "السجلات",
            href: "/doctor-dashboard/records",
            icon: ScrollText,
            isActive: pathname === "/doctor-dashboard/records"
        },
        {
            title: "الملف الشخصي",
            href: "/doctor-dashboard/profile",
            icon: UserCircle,
            isActive: pathname === "/doctor-dashboard/profile"
        },
    ]
    useEffect(() => {
        async function getProfileImg() {
            const res = await getImgProfile();
            if (res.success) {
                if (!res.userImg) {
                    setProfileImg(res.gender == "male" ? "/doctor_male.png" : "/doctor_female.png")
                } else {
                    setProfileImg(res.userImg)
                }
            }
        }
        getProfileImg()
    }, [user])
    return (
        <>
            <Sidebar side="right">
                <SidebarHeader className="flex items-center justify-center gap-2 py-6">
                    <MyAvater src={profileImg} fallback={user?.name?.slice(0, 2)} className="w-12 h-12"/>
                    <p className="text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarMenu className="flex-1 p-4 space-y-1.5 mt-4">
                            {navItem.map((item) => {
                               const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={item.isActive}
                      className={`w-full font-sans text-sm font-semibold transition-all duration-300 relative group overflow-hidden ${item.isActive
                          ? "bg-[#2DBFA0]/20 text-white hover:bg-[#2DBFA0]/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                    >
                      <Link href={item.href} className="flex items-center w-full gap-2">
                        {item.isActive && (
                          <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#2DBFA0] rounded-l-full" />
                        )}

                        <Icon
                          className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${item.isActive ? "text-[#2DBFA0]" : "text-slate-400 group-hover:text-white"
                            }`}
                        />
                        <span className="font-cairo text-sm font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>
        </>
    )
}
