"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load the race"
      message="There was a problem fetching the results and lap times from OpenF1."
      reset={reset}
    />
  );
}
