"use client";

import ErrorState from "@/components/ui/ErrorState";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <ErrorState
      title="Couldn't load the driver"
      message="There was a problem fetching this driver's data from OpenF1."
      reset={reset}
    />
  );
}
