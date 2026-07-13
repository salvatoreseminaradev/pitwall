"use client";

/** Shared error UI for route-level error.tsx boundaries. */
export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load data from OpenF1. Please try again shortly.",
  reset,
}: {
  title?: string;
  message?: string;
  reset?: () => void;
}) {
  return (
    <div className="container-page flex flex-col items-center justify-center py-24 text-center">
      <span className="text-4xl">🏳️</span>
      <h2 className="mt-4 text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-md text-neutral-400">{message}</p>
      {reset && (
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-lg bg-f1 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-f1-hover"
        >
          Try again
        </button>
      )}
    </div>
  );
}
