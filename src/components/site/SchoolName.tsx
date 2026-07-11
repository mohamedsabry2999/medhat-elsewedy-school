import type { ReactNode } from "react";

export const SCHOOL_NAME = "مدرسة مدحت السويدي للتكنولوجيا التطبيقية";

type Props = {
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
};

/**
 * Renders the official school name with the unified highlight style.
 * Use this when you write the name directly in JSX.
 */
export function SchoolName({ as: Tag = "span", className = "" }: Props) {
  return (
    <Tag className={`school-name-hl ${className}`.trim()}>{SCHOOL_NAME}</Tag>
  );
}

/**
 * Scans a string (or ReactNode) and wraps every occurrence of the school
 * name in the highlight span. Use this when the text comes from the CMS
 * (useContent), site-data, or any dynamic source.
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
  if (!text.includes(SCHOOL_NAME)) return text;
  const parts = text.split(SCHOOL_NAME);
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (part) out.push(<span key={`t-${i}`}>{part}</span>);
    if (i < parts.length - 1) {
      out.push(
        <span key={`h-${i}`} className="school-name-hl">
          {SCHOOL_NAME}
        </span>,
      );
    }
  });
  return <>{out}</>;
}
