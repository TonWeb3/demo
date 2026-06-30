export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-porcelain px-6 text-center">
      <p className="font-serif text-3xl text-espresso">You&apos;re offline</p>
      <p className="mt-3 max-w-xs text-sm text-espresso-soft">
        Licensed to Glow needs a connection to load your bookings and venues.
        Check your network and try again.
      </p>
    </div>
  );
}
