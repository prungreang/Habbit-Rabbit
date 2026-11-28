import type { SVGProps } from "react";

type RabbitProps = SVGProps<SVGSVGElement> & {
  mood?: "happy" | "sleepy" | "cheer" | "peek";
  size?: number;
};

/**
 * The mascot. Pure inline SVG so it themes with CSS variables, scales crisply,
 * and never costs a network request. `mood` only moves the ears/eyes.
 */
export function Rabbit({ mood = "happy", size = 96, className, ...rest }: RabbitProps) {
  const earTilt = mood === "cheer" ? -10 : mood === "sleepy" ? 6 : 0;
  const eyesClosed = mood === "sleepy";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label={`Rabbit mascot, ${mood}`}
      className={className}
      {...rest}
    >
      <defs>
        <linearGradient id="rb-fur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#FDE7FB" />
        </linearGradient>
        <linearGradient id="rb-ear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9A8D4" />
          <stop offset="100%" stopColor="#E879F9" />
        </linearGradient>
        <radialGradient id="rb-blush" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F9A8D4" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#F9A8D4" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* ears */}
      <g transform={`rotate(${earTilt} 60 60)`}>
        <ellipse cx="44" cy="30" rx="9" ry="22" fill="url(#rb-fur)" stroke="#1E1B4B" strokeOpacity=".12" strokeWidth="1.5" />
        <ellipse cx="44" cy="31" rx="4.5" ry="15" fill="url(#rb-ear)" opacity=".85" />
        <ellipse cx="76" cy="30" rx="9" ry="22" fill="url(#rb-fur)" stroke="#1E1B4B" strokeOpacity=".12" strokeWidth="1.5" />
        <ellipse cx="76" cy="31" rx="4.5" ry="15" fill="url(#rb-ear)" opacity=".85" />
      </g>

      {/* head */}
      <ellipse cx="60" cy="68" rx="32" ry="29" fill="url(#rb-fur)" stroke="#1E1B4B" strokeOpacity=".12" strokeWidth="1.5" />

      {/* blush */}
      <circle cx="40" cy="76" r="8" fill="url(#rb-blush)" />
      <circle cx="80" cy="76" r="8" fill="url(#rb-blush)" />

      {/* eyes */}
      {eyesClosed ? (
        <>
          <path d="M44 66q4 5 8 0" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M68 66q4 5 8 0" stroke="#1E1B4B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="48" cy="66" rx="4" ry="5" fill="#1E1B4B" />
          <ellipse cx="72" cy="66" rx="4" ry="5" fill="#1E1B4B" />
          <circle cx="49.4" cy="64.2" r="1.5" fill="#fff" />
          <circle cx="73.4" cy="64.2" r="1.5" fill="#fff" />
        </>
      )}

      {/* nose + mouth */}
      <path d="M60 73l-3 3.5h6z" fill="#E879F9" />
      <path
        d={mood === "cheer" ? "M54 79q6 7 12 0" : "M60 76.5v3M56.5 81q3.5 3 7 0"}
        stroke="#1E1B4B"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity=".75"
      />

      {/* little carrot the cheer rabbit holds */}
      {mood === "cheer" && (
        <g>
          <path d="M92 88l10 8-4 3-9-9z" fill="#FBBF24" stroke="#1E1B4B" strokeOpacity=".15" />
          <path d="M101 87l5-4M102 90l6-1" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}

      {/* sparkles for cheer */}
      {mood === "cheer" && (
        <g fill="#FBBF24">
          <path d="M22 44l1.8 4.2L28 50l-4.2 1.8L22 56l-1.8-4.2L16 50l4.2-1.8z" />
          <path d="M98 52l1.2 2.8L102 56l-2.8 1.2L98 60l-1.2-2.8L94 56l2.8-1.2z" opacity=".8" />
        </g>
      )}
    </svg>
  );
}

/** Small carrot bullet used in lists and the logo lockup. */
export function Carrot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M4 20l7-7" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 12c2-4 6-6 9-6-1 4-4 8-8 9z" fill="#FBBF24" />
      <path d="M17 4c1 1 2 2 2 3" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
