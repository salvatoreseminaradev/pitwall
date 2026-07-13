import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-32 text-center">
      <p className="font-mono text-6xl font-black text-f1">404</p>
      <h1 className="mt-4 text-2xl font-bold text-white">Page not found</h1>
      <p className="mt-2 text-neutral-400">Looks like you ran off track.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-f1 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-f1-hover"
      >
        Back to Home
      </Link>
    </div>
  );
}
