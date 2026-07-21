import { getAdminUsers } from "../_actions/users";
import { UsersTableSection } from "../_components/tables/users-table-section";

export default async function AdminTablesPage() {
  const users = await getAdminUsers();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[28px] font-bold text-[#1c1c1e]">جداول</h1>
      <UsersTableSection data={users} />
    </div>
  );
}
