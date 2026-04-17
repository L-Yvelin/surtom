import { JSX } from 'react';

const PLACEHOLDER = '\u2060';
const PLACEHOLDER_RE = new RegExp(`${'\u2060'}(\\d+)`, 'g');

type Rule = {
  pattern: RegExp;
  wrap: (children: JSX.Element, key: number, spoilerClass?: string) => JSX.Element;
};

const RULES: Rule[] = [
  {
    pattern: /\*\*\*(.+?)\*\*\*(?!\*)/,
    wrap: (c, k) => (
      <strong key={k}>
        <em>{c}</em>
      </strong>
    ),
  },
  { pattern: /\*\*(.+?)\*\*(?!\*)/, wrap: (c, k) => <strong key={k}>{c}</strong> },
  {
    pattern: /\|\|(.+?)\|\|/,
    wrap: (c, k, sc) => (
      <span key={k} className={sc}>
        {c}
      </span>
    ),
  },
  { pattern: /__(.+?)__/, wrap: (c, k) => <u key={k}>{c}</u> },
  { pattern: /~~(.+?)~~/, wrap: (c, k) => <s key={k}>{c}</s> },
  { pattern: /\*(.+?)\*(?!\*)/, wrap: (c, k) => <em key={k}>{c}</em> },
  { pattern: /_(.+?)_(?!_)/, wrap: (c, k) => <em key={k}>{c}</em> },
];

export function formatMarkdown(text: string, spoilerClass?: string): JSX.Element {
  const escaped: string[] = [];
  const safe = text.replace(/\\([*_~|])/g, (_, char) => {
    escaped.push(char);
    return `${PLACEHOLDER}${escaped.length - 1}`;
  });

  return parse(safe, escaped, spoilerClass);
}

function restore(text: string, escaped: string[]): string {
  return text.replace(PLACEHOLDER_RE, (_, idx) => escaped[Number(idx)]);
}

function parse(text: string, escaped: string[], spoilerClass?: string): JSX.Element {
  let best: { rule: Rule; match: RegExpExecArray } | null = null;

  for (const rule of RULES) {
    const match = rule.pattern.exec(text);
    if (match && (!best || match.index < best.match.index)) {
      best = { rule, match };
    }
  }

  if (best) {
    const { rule, match } = best;
    const before = restore(text.slice(0, match.index), escaped);
    const inner = restore(match[1], escaped);
    const after = text.slice(match.index + match[0].length);
    return (
      <>
        {before}
        {rule.wrap(formatMarkdown(inner, spoilerClass), match.index, spoilerClass)}
        {parse(after, escaped, spoilerClass)}
      </>
    );
  }

  return <>{restore(text, escaped)}</>;
}
