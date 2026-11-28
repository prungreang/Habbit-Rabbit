import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { canManage, getAppData, getStaffOverview } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { AdminDashboard } from "@/components/app/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const data = await getAppData();
  if (!data) redirect("/sign-in?next=/admin");
  if (!canManage({ mode: data.mode, userId: data.profile.id, profile: data.profile })) {
    redirect("/today");
  }

  const overview = await getStaffOverview();

  return (
    <>
      <NavBar notifications={data.notifications} role={data.profile.role} />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <AdminDashboard
          rows={overview.rows}
          messages={overview.messages}
          totals={overview.totals}
          viewerRole={data.profile.role}
        />
      </main>
    </>
  );
}
