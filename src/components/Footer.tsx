import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

const links = [
  { href: "/", label: "Home" },
  { href: "/drivers", label: "Drivers" },
  { href: "/races", label: "Races" },
  { href: "/races", label: "Telemetry" },
  { href: "/privacy", label: "Privacy Policy" },
];

export default function Footer() {
  return (
    <footer className="border-t-2 border-f1 bg-[#111111]">
      <div className="container-page grid gap-10 py-12 md:grid-cols-3">
        {/* Column 1 — Brand */}
        <div>
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <span className="inline-block h-6 w-1.5 rounded-full bg-f1 shadow-glow" />
            <span className="text-lg">
              Pit<span className="text-f1">Wall</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-neutral-400">{SITE.tagline}</p>
          <p className="mt-4 max-w-sm text-xs leading-relaxed text-neutral-600">
            {SITE.disclaimer}
          </p>
        </div>

        {/* Column 2 — Useful links */}
        <div className="md:justify-self-center">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
            Useful links
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-neutral-400 transition-colors hover:text-f1"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 — Contact */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-300">
            Contact us
          </h3>
          <p className="mb-4 mt-4 text-sm text-neutral-400">
            Found a bug? Want to suggest a feature? Drop us a line.
          </p>
          <ContactForm />

          <div className="mt-5 flex items-center gap-3">
            <SocialLink href={SITE.social.x} label="PitWall on X">
              <XIcon />
            </SocialLink>
            <SocialLink href={SITE.social.reddit} label="PitWall on Reddit">
              <RedditIcon />
            </SocialLink>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-neutral-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} PitWall · Data by OpenF1
          </p>
          <Link href="/privacy" className="hover:text-neutral-300">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-neutral-400 transition-colors hover:border-f1/50 hover:text-white"
    >
      {children}
    </a>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function RedditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12c-.688 0-1.25.562-1.25 1.25 0 .687.562 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.248-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  );
}
