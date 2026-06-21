import { requireAdmin, listUsersAction } from "@/app/actions/admin";
import AdminClient from "./AdminClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { isSuperAdmin } = await requireAdmin();
  const users = await listUsersAction();

  return <AdminClient users={users} isSuperAdmin={isSuperAdmin} />;
}
