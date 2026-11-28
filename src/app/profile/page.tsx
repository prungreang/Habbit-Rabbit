import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAppData } from "@/lib/data";
import { NavBar } from "@/components/NavBar";
import { ProfileForm } from "@/components/app/ProfileForm";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your name, your time zone, your choices. Nothing here is shared without you.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const data = await getAppData();
  if (!data) redirect("/sign-in?next=/profile");

  return (
    <>
      <NavBar notifications={data.notifications} role={data.profile.role} />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Your space</h1>
        <p className="mt-1.5 max-w-xl text-sm muted">
          A safe space means you decide what exists. Nothing is shared, ranked, or compared — not even to you.
        </p>
        <div className="mt-6">
          <ProfileForm profile={data.profile} mode={data.mode} />
        </div>
      </main>
    </>
  );
}
