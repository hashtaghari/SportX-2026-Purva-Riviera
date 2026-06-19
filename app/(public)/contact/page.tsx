import type { Metadata } from "next";
import { Phone, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { CONTACT_DETAILS } from "@/data/contact-details";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "SportX 2026 coordinator contact details.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Contact Us
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-normal">
          SportX Help Desk
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Reach out to the SportX coordination team for event, registration, and
          championship queries.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CONTACT_DETAILS.map((contact) => (
          <Card key={contact.phone} className="overflow-hidden">
            <CardContent className="grid gap-5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                  <Users className="h-5 w-5" />
                </div>
                <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
                  Coordinator
                </span>
              </div>
              <div>
                <p className="text-xl font-semibold">{contact.name}</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="mt-3 flex items-center gap-2 text-sm font-medium text-accent transition hover:text-accent/80"
                >
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
