import { SITE } from "@/lib/site";

/** Small print shown near F1 data on race and driver pages. */
export default function DataDisclaimer() {
  return (
    <p className="mt-12 border-t border-border pt-4 text-xs leading-relaxed text-neutral-600">
      {SITE.disclaimer}
    </p>
  );
}
