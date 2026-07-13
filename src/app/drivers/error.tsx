"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load drivers"
      message="There was a problem fetching the standings from OpenF1."
      reset={reset}
    />
  );
}
