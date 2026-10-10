type Props = {
  className?: string;
  /** colour for the wordmark strokes */
  ink?: string;
  /** show the "BRASIL" sub-line */
  sub?: boolean;
  /** show the verified badge */
  badge?: boolean;
};

/**
 * Vector recreation of the iHub Brasil wordmark (Instagram profile picture):
 * rounded heavy strokes, connector-node crossbar on the H, gold ring hugging the "b".
 */
export default function Logo({ className, ink = "currentColor", sub = true, badge = true }: Props) {
  return (
    <svg className={className} viewBox="0 0 300 160" fill="none" role="img" aria-label="iHub Brasil">
      <g stroke={ink} strokeWidth={17} strokeLinecap="round" strokeLinejoin="round">
        {/* i */}
        <path d="M22 50 V118" />
        {/* H left stem */}
        <path d="M56 22 V118" />
        {/* u (its left stem is the H right stem) */}
        <path d="M108 22 V92 a24 24 0 0 0 48 0 V52" />
        {/* b */}
        <path d="M184 22 V118" />
        <circle cx="214" cy="90" r="27" />
      </g>
      <circle cx="22" cy="24" r="10" fill={ink} />
      {/* connector crossbar */}
      <path d="M56 74 H86" stroke={ink} strokeWidth={9} strokeLinecap="round" />
      <circle cx="92" cy="74" r="7.5" fill={ink} />
      {/* gold ring */}
      <path d="M182 64 A44 44 0 1 1 214 134" stroke="#E0A04A" strokeWidth={3.2} strokeLinecap="round" />
      {badge && (
        <g transform="translate(262 26)">
          <path
            d="M0 -17 l5 4 6.4-.6 1.6 6.2 5.6 3.2-2.4 6 2.4 6-5.6 3.2-1.6 6.2-6.4-.6-5 4-5-4-6.4.6-1.6-6.2-5.6-3.2 2.4-6-2.4-6 5.6-3.2 1.6-6.2 6.4.6z"
            fill="#2F80ED"
          />
          <path d="M-6.5 0.5 l4.2 4.2 8.5-8.8" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      {sub && (
        <text
          x="292"
          y="156"
          textAnchor="end"
          fill={ink}
          opacity={0.85}
          style={{ font: "700 22px var(--font-sans), sans-serif", letterSpacing: "0.12em" }}
        >
          BRASIL
        </text>
      )}
    </svg>
  );
}
