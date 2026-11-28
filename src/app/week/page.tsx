import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppData } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { WeekBoard } from "@/components/app/WeekBoard";

export const metadata: Metadata = {
  title: "Week",
  description: "See the week at a glance. Change any day, past or present — nothing is locked.",
};

export const dynamic = "force-dynamic";

export default async function WeekPage() {
  const data = await getAppData();
  if (!data) redirect("/sign-in?next=/week");

  return (
    <>
      <NavBar notifications={data.notifications} role={data.profile.role} />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <WeekBoard habits={data.habits} logs={data.logs} />
      </main>
    </>
  );
}
