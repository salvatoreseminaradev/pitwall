"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load races"
      message="There was a problem fetching the calendar from OpenF1."
      reset={reset}
    />
  );
}
