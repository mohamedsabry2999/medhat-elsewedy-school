import type { ReactNode } from "react";

export const SCHOOL_NAME = "مدرسة مدحت السويدي للتكنولوجيا التطبيقية";
const HIGHLIGHT_PHRASE = "مدحت السويدي";
const HIGHLIGHT_CLASS = "medhat-elsewedy-highlight";

type Props = {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  children?: ReactNode;
};

/**
 * Renders text (defaults to the official school name) with the phrase
 * "مدحت السويدي" wrapped in a highlight span.
 */
export function SchoolName({ as: Tag = "span", className = "", children }: Props) {
  const text = typeof children === "string" ? children : SCHOOL_NAME;
  return <Tag className={className || undefined}>{highlightString(text)}</Tag>;
}

/**
 * Scans a string (or ReactNode) and wraps every occurrence of
 * "مدحت السويدي" in the highlight span. Use for CMS / dynamic text.
 *
 * SEO-safe: never call this inside meta/title/description/alt/JSON-LD.
 */
export function hl(input: ReactNode): ReactNode {
  if (input == null || input === false) return input;
  if (typeof input === "number" || typeof input === "boolean") return input;
  if (typeof input === "string") return highlightString(input);
  if (Array.isArray(input)) return input.map((n, i) => <span key={i}>{hl(n)}</span>);
  return input;
}

function highlightString(text: string): ReactNode {
  if (!text.includes(HIGHLIGHT_PHRASE)) return text;
  const parts = text.split(HIGHLIGHT_PHRASE);
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) out.push(<span key={`t-${i}`}>{part}</span>);
    if (i < parts.length - 1) {
      out.push(
        <span key={`h-${i}`} className={HIGHLIGHT_CLASS}>
          {HIGHLIGHT_PHRASE}
        </span>,
      );
    }
  });
  return <>{out}</>;
}
