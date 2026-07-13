"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/drivers", label: "Drivers" },
  { href: "/races", label: "Races" },
  { href: "/compare", label: "Compare" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar({
  email,
  isPro,
}: {
  email: string | null;
  isPro: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  async function handleLogout() {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    }
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-tight"
          onClick={() => setOpen(false)}
        >
          <span className="inline-block h-6 w-1.5 rounded-full bg-f1 shadow-glow" />
          <span className="text-lg">
            Pit<span className="text-f1">Wall</span>
          </span>
          {isPro && (
            <span className="ml-1 rounded bg-f1/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-f1">
              Pro
            </span>
          )}
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-white"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-2 flex items-center gap-2 border-l border-border pl-3">
            {email ? (
              <>
                <Link
                  href="/account"
                  className="max-w-[160px] truncate text-sm text-neutral-400 transition-colors hover:text-white"
                >
                  {email}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-neutral-400 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="rounded-lg bg-f1 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-f1-hover"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Apri menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-300 hover:bg-surface md:hidden"
        >
          <div className="flex flex-col gap-1.5">
            <span
              className={`h-0.5 w-6 bg-current transition-transform ${
                open ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-current transition-opacity ${
                open ? "opacity-0" : ""
              }`}
            />
            <span
              className={`h-0.5 w-6 bg-current transition-transform ${
                open ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </div>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-border md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col px-4 py-2 sm:px-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-md px-3 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-surface text-white"
                      : "text-neutral-400 hover:bg-surface hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            <li className="mt-2 border-t border-border pt-2">
              {email ? (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="truncate rounded-md px-3 py-3 text-sm font-medium text-neutral-400 hover:bg-surface hover:text-white"
                  >
                    {email}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md px-3 py-3 text-left text-sm font-medium text-neutral-400 hover:bg-surface hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-3 text-sm font-medium text-neutral-400 hover:bg-surface hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="rounded-md bg-f1 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-f1-hover"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
