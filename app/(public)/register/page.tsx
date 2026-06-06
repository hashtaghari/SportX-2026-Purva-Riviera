import type { Metadata } from "next";

import { RegistrationForm } from "@/components/sections/registration-form";
import { getTeamRegistrationOptions } from "@/lib/championship-queries";

export const metadata: Metadata = {
  title: "Register",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>;
}) {
  const [{ event }, options] = await Promise.all([
    searchParams,
    getTeamRegistrationOptions(),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Event Registration
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          Register for SportX 2026
        </h1>
      </div>
      <RegistrationForm
        events={options.events}
        blocks={options.blocks}
        initialEvent={event}
      />
    </div>
  );
}
