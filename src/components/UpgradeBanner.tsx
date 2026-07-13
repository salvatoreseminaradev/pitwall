import Link from "next/link";

/** Inline "locked content" prompt shown to FREE users where PRO data is hidden. */
export default function UpgradeBanner({
  title = "PitWall PRO content",
  description,
}: {
  title?: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-f1/40 bg-f1/5 p-6 text-center">
      <p className="text-sm font-semibold text-white">🔒 {title}</p>
      <p className="mx-auto mt-1 max-w-md text-sm text-neutral-400">
        {description}
      </p>
      <Link
        href="/pricing"
        className="mt-4 inline-block rounded-lg bg-f1 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-f1-hover"
      >
        Go PRO
      </Link>
    </div>
  );
}
