/**
 * Neutral language marker.
 *
 * Languages do not map one-to-one to countries. A compact BCP-47 language
 * code stays recognizable without assigning a nationality, and avoids
 * bundling a country SVG for every supported language.
 */
export default function LanguageCode({ code, className = '' }) {
  const label = String(code || '')
    .split('-')[0]
    .slice(0, 3)
    .toUpperCase();

  return (
    <span
      aria-hidden="true"
      translate="no"
      className={`inline-flex h-[16px] min-w-[24px] shrink-0 items-center justify-center rounded-[3px] bg-[var(--chrome-hover-bg)] px-[4px] [font-family:var(--font-mono)] text-[0.55rem] font-semibold uppercase tracking-[0.04em] text-[var(--chrome-fg-muted)] ${className}`}
      data-language-code={code}
      data-testid={`language-code-${code}`}
    >
      {label}
    </span>
  );
}
