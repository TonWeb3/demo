import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { aed } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { createBooking } from "../../actions";
import BookingForm from "./BookingForm";

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { serviceId } = await params;
  const { error } = await searchParams;
  const user = await requireUser();

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: { venue: true },
  });
  if (!service) notFound();

  const credits = user.membership?.creditsRemaining ?? 0;
  const active = user.membership?.status === "ACTIVE";
  const canAfford = active && credits >= service.creditCost;

  return (
    <div className="px-5 py-5">
      <Link href={`/app/venues/${service.venue.slug}`} className="text-sm text-champagne-deep">
        ← {service.venue.name}
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={service.imageUrl ?? service.venue.imageUrl} alt={service.name} className="h-40 w-full object-cover" />
        <div className="p-4">
          <h1 className="font-serif text-2xl text-espresso">{service.name}</h1>
          <p className="mt-1 text-sm text-espresso-soft">
            {service.venue.name} · {service.venue.neighbourhood}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{service.durationMin} min</Badge>
            <Badge>{service.therapistLevel} therapist</Badge>
            <Badge tone="sage">Included in plan</Badge>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-cream px-4 py-3 text-sm">
            <span className="text-espresso-soft">Retail {aed(service.retailPrice)}</span>
            <span className="font-medium text-champagne-deep">
              {service.creditCost} credit{service.creditCost === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {!active ? (
        <div className="mt-5 rounded-2xl border border-line bg-white p-5 text-center">
          <p className="text-sm text-espresso-soft">Activate a membership to book this treatment.</p>
          <Link href="/pricing?welcome=1" className="mt-3 inline-block rounded-full bg-champagne px-5 py-2.5 text-sm font-medium text-espresso">
            Choose a plan
          </Link>
        </div>
      ) : !canAfford ? (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
          You have {credits} credits — this treatment needs {service.creditCost}. Your credits refresh on renewal.
        </div>
      ) : (
        <>
          {error === "credits" && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">
              Not enough credits for this treatment.
            </p>
          )}
          <BookingForm
            serviceId={service.id}
            creditCost={service.creditCost}
            creditsRemaining={credits}
            action={createBooking}
          />
        </>
      )}
    </div>
  );
}
