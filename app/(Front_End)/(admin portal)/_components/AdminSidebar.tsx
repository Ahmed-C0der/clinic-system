"use client"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { BarChart3, Table2, Settings, Sliders, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

// Nav renamed per spec: تحليلات / جداول / الاعدادات
const navItems = [
  { title: "تحليلات", href: "/admin-dashboard", icon: BarChart3 },
  { title: "جداول", href: "/admin-dashboard/tables", icon: Table2 },
  { title: "الاعدادات", href: "/admin-dashboard/setting", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <Sidebar side="right">
      <SidebarHeader className="flex items-center justify-center gap-2 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary border border-sidebar-border shrink-0">
            <Sliders size={20} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-sidebar-foreground">لوحة تحكم المدير</h3>
            <p className="text-[10px] text-sidebar-foreground/60">العيادة الطبية المتكاملة</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={active} className="h-12">
                    <Link href={item.href} className="flex items-center w-full gap-2 relative">
                      {active && (
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-sidebar-primary rounded-r-full" />
                      )}
                      <Icon className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="px-4 py-4 space-y-2">
          <div className="flex items-center gap-2 text-[10px] text-sidebar-foreground/70">
            <ShieldCheck size={12} className="text-sidebar-primary shrink-0" />
            <span>مدير النظام</span>
          </div>
          <p className="text-[9px] text-sidebar-foreground/50 bg-sidebar-accent p-2 rounded-lg leading-relaxed">
            يُسمح بتعديل الرسوم وقاعدة بيانات المرضى والجدولة
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}