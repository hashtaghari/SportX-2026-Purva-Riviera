import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ClipboardPenLine, HandHeart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PARTICIPANT_REGISTRATION_URL,
  VOLUNTEER_REGISTRATION_URL,
} from "@/lib/registration-links";
import { PARTICIPANT_REGISTRATION_QR } from "@/lib/brand-assets";

export const metadata: Metadata = {
  title: "Registration",
};

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          SportX 2026 Registration
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
          Choose your registration form
        </h1>
        <p className="mt-4 text-muted-foreground">
          Registrations are collected through the official SportX Google Forms.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <RegistrationCard
          icon={ClipboardPenLine}
          title="Participant Registration"
          description="Register to participate in SportX events. Event preferences and participant details are collected in this form."
          href={PARTICIPANT_REGISTRATION_URL}
          buttonLabel="Open Participant Form"
        />
        <RegistrationCard
          icon={HandHeart}
          title="Volunteer Registration"
          description="Join the SportX volunteer team and help coordinate events, venues, participants, and championship operations."
          href={VOLUNTEER_REGISTRATION_URL}
          buttonLabel="Open Volunteer Form"
        />
      </div>

      <section className="mt-8 grid items-center gap-6 rounded-lg border bg-card p-5 sm:p-7 md:grid-cols-[0.72fr_1.28fr]">
        <Image
          src={PARTICIPANT_REGISTRATION_QR}
          alt="SportX 2026 participant registration QR code"
          width={580}
          height={820}
          className="mx-auto h-auto w-full max-w-[320px] rounded-md border object-cover"
        />
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Participant Registration
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-normal">
            Scan and register from any device
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            Share this official SportX QR poster or open the participant form directly.
          </p>
          <Button asChild className="mt-6">
            <Link href={PARTICIPANT_REGISTRATION_URL} target="_blank" rel="noreferrer">
              Open Participant Form
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function RegistrationCard({
  icon: Icon,
  title,
  description,
  href,
  buttonLabel,
}: {
  icon: typeof ClipboardPenLine;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
}) {
  return (
    <Card>
      <CardHeader>
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-muted">
          <Icon className="h-5 w-5" />
        </span>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="min-h-20 text-sm leading-6 text-muted-foreground">{description}</p>
        <Button asChild className="mt-6 w-full">
          <Link href={href} target="_blank" rel="noreferrer">
            {buttonLabel}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
