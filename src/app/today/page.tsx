import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppData } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { TodayBoard } from "@/components/app/TodayBoard";

export const metadata: Metadata = {
  title: "Today",
  description: "Your small wins for today. Check things off when it feels good — never because you have to.",
};

export const dynamic = "force-dynamic";

export default async function TodayPage() {
  const data = await getAppData();
  if (!data) redirect("/sign-in?next=/today");

  const firstName = (data.profile.full_name ?? "friend").split(" ")[0];

  return (
    <>
      <NavBar notifications={data.notifications} role={data.profile.role} />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <TodayBoard habits={data.habits} logs={data.logs} greetingName={firstName} />
      </main>
    </>
  );
}
