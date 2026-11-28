import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppData } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { InsightsBoard } from "@/components/app/InsightsBoard";

export const metadata: Metadata = {
  title: "Insights",
  description: "Gentle charts of your last few weeks, plus a weekly report you choose to generate.",
};

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const data = await getAppData();
  if (!data) redirect("/sign-in?next=/insights");

  return (
    <>
      <NavBar notifications={data.notifications} role={data.profile.role} />
      <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <InsightsBoard habits={data.habits} logs={data.logs} profile={data.profile} />
      </main>
    </>
  );
}
