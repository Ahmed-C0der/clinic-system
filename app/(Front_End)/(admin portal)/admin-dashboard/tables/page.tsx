import { getUsersTableData } from "@/app/(Front_End)/actions/admin"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UsersDataTable } from "../../_components/users-data-table"
import { columns } from "../../_components/columns"

export const dynamic = "force-dynamic"

export default async function AdminTablesPage() {
  const users = await getUsersTableData()

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      <header className="border-b border-border pb-4">
        <h1 className="text-xl md:text-2xl font-bold text-on-surface">الجداول</h1>
        <p className="text-sm text-muted-foreground">
          إدارة بيانات المستخدمين والمرضى، وعرض الملفات الطبية لكل مريض
        </p>
      </header>

      <Tabs defaultValue="users" dir="rtl">
        <TabsList className="bg-white border border-border rounded-xl p-1 h-auto">
          <TabsTrigger
            value="users"
            className="text-xs font-semibold px-4 py-2 rounded-lg data-[state=active]:bg-[#1A6B5A] data-[state=active]:text-white"
          >
            المستخدمون
          </TabsTrigger>
          <TabsTrigger
            value="appointments"
            disabled
            className="text-xs font-semibold px-4 py-2 rounded-lg text-muted-foreground/60"
          >
            المواعيد (قريباً)
          </TabsTrigger>
          <TabsTrigger
            value="invoices"
            disabled
            className="text-xs font-semibold px-4 py-2 rounded-lg text-muted-foreground/60"
          >
            الفواتير (قريباً)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersDataTable columns={columns} data={users} />
        </TabsContent>
      </Tabs>
    </div>
  )
}