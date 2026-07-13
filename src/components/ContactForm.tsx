"use client";

import { useState, type FormEvent } from "react";
import { SITE } from "@/lib/site";

/**
 * Contact form with no backend: on submit it builds a `mailto:` link with the
 * fields pre-filled and opens the user's email client.
 */
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent(`[PitWall] Message from ${name || "a fan"}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    );
    window.location.href = `mailto:${SITE.contactEmail}?subject=${subject}&body=${body}`;
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-white outline-none transition-colors focus:border-f1";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        aria-label="Name"
        className={inputClass}
      />
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        aria-label="Email"
        className={inputClass}
      />
      <textarea
        required
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message"
        aria-label="Message"
        className={`${inputClass} resize-y`}
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-f1 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-f1-hover sm:w-auto"
      >
        Send
      </button>
    </form>
  );
}
