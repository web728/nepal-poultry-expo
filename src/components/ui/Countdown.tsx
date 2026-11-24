"use client";

import { useSyncExternalStore } from "react";

/** Re-render once a minute; the server snapshot is null so nothing date-dependent is prerendered. */
function subscribe(cb: () => void) {
  const t = window.setInterval(cb, 60_000);
  return () => window.clearInterval(t);
}
const minuteNow = () => Math.floor(Date.now() / 60_000);

/** "86 days to go" chip, counted to the opening day. Hidden once the expo has started. */
export function Countdown({ startsAt, endsOn, className }: { startsAt: string; endsOn: string; className?: string }) {
  const minute = useSyncExternalStore(subscribe, minuteNow, () => null);
  if (minute === null) return <span className={className} aria-hidden />;

  const now = minute * 60_000;
  const start = Date.parse(startsAt);
  const end = Date.parse(`${endsOn}T23:59:59+05:45`);
  let label: string;
  if (now < start) {
    const days = Math.ceil((start - now) / 86_400_000);
    label = days === 1 ? "Opens tomorrow" : `${days} days to go`;
  } else if (now <= end) {
    label = "Open now";
  } else {
    return <span className={className} aria-hidden />;
  }
  return (
    <span className={className} role="status">
      <span aria-hidden className="relative mr-2 inline-flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-400 opacity-60 motion-reduce:animate-none" />
        <span className="relative inline-flex size-2 rounded-full bg-brand-500" />
      </span>
      {label}
    </span>
  );
}
