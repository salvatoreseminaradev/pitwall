"use client";

export function TabLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-neutral-400">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-f1" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function TabError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <span className="text-3xl">🏳️</span>
      <p className="text-sm text-neutral-400">
        Couldn&apos;t load this data from OpenF1.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-f1 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-f1-hover"
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function TabEmpty({ message }: { message: string }) {
  return (
    <p className="py-16 text-center text-sm text-neutral-500">{message}</p>
  );
}
