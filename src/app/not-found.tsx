import Link from "next/link";
import { Rabbit } from "@/components/Rabbit";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <Rabbit mood="peek" size={140} className="animate-float-slow" />
      <p className="mt-4 font-display text-6xl font-extrabold tracking-tight text-rabbit-primary">404</p>
      <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">This burrow is empty</h1>
      <p className="mt-2 max-w-md text-sm muted">
        The page you were after isn&apos;t here. Nothing is broken on your side — and nothing is lost.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link href="/today" className="btn-primary">
          Go to today
        </Link>
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}
