import { getCurrentUser } from "@/lib/session";
import { isAdminEmail } from "@/lib/admins";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) {
    redirect("/");
  }
  return <div className="mx-auto max-w-4xl px-4 py-10">{children}</div>;
}
