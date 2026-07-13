import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy — PitWall",
  description: "How PitWall handles your data.",
};

export default function PrivacyPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-neutral-500">Last updated: July 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-neutral-300">
          <p>
            PitWall is a hobby project that displays Formula 1 statistics. This
            page explains what data we collect and how we use it. We keep it
            minimal on purpose.
          </p>

          <Section title="Data we collect">
            <p>
              If you create an account, we store the{" "}
              <strong className="text-white">email address</strong> you sign up
              with, handled by our authentication provider (Supabase). We do not
              collect names, addresses or any other personal profile data.
            </p>
            <p className="mt-3">
              If you upgrade to PRO, payments are processed by Lemon Squeezy. We
              never see or store your card details — we only keep a flag
              indicating your subscription status.
            </p>
            <p className="mt-3">
              If you contact us through the form in the footer, your email
              client sends us the message directly; we receive only what you
              choose to write.
            </p>
          </Section>

          <Section title="Cookies">
            <p>
              We use only <strong className="text-white">essential cookies</strong>{" "}
              needed to keep you signed in (session cookies set by Supabase). We
              do not use advertising or third-party tracking cookies. Browsing
              PitWall without an account sets no identifying cookies.
            </p>
          </Section>

          <Section title="F1 data source">
            <p>{SITE.disclaimer}</p>
          </Section>

          <Section title="Data retention & your rights">
            <p>
              You can stop using PitWall at any time. To delete your account and
              associated email, or to request a copy of your data, just email us
              at the address below and we&apos;ll take care of it.
            </p>
          </Section>

          <Section title="Contact">
            <p>
              Questions about this policy? Email{" "}
              <a
                href={`mailto:${SITE.contactEmail}`}
                className="text-f1 hover:underline"
              >
                {SITE.contactEmail}
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
