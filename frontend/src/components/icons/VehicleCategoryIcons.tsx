import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const STROKE = 1.6;

const sharedProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 80 36',
  fill: 'none',
} as const;

function Wheel({ cx }: { cx: number }) {
  return (
    <>
      <circle cx={cx} cy={25.5} r={4.2} stroke="currentColor" strokeWidth={STROKE} />
      <circle cx={cx} cy={25.5} r={1.6} fill="currentColor" stroke="none" />
    </>
  );
}

/** Sleek executive sedan — long hood, flowing roofline, defined trunk */
export function SedanIcon({ className, ...props }: IconProps) {
  return (
    <svg {...sharedProps} className={className} aria-hidden="true" {...props}>
      <path
        d="M7 25.5c0-1.1.9-2 2-2h3.8l2.8-5.6a2.8 2.8 0 0 1 2.5-1.5h30.2a2.8 2.8 0 0 1 2.5 1.5l2.6 4.8h4.4a2 2 0 0 1 2 2v1.2a2 2 0 0 1-2 2h-2.2a4.8 4.8 0 0 1-9.2 0H22.4a4.8 4.8 0 0 1-9.2 0H9a2 2 0 0 1-2-2v-1.2Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M14 16.5 18.5 10.2a2.8 2.8 0 0 1 2.5-1.2h27.4a2.8 2.8 0 0 1 2.5 1.2L55 16.5"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 16.5h36"
        stroke="currentColor"
        strokeWidth={STROKE * 0.75}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path
        d="M55 16.5 60.5 13.2a2 2 0 0 1 1.2-.4"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <Wheel cx={22} />
      <Wheel cx={58} />
    </svg>
  );
}

/** Bold premium SUV — tall stance, upright glasshouse, roof rails */
export function SuvIcon({ className, ...props }: IconProps) {
  return (
    <svg {...sharedProps} className={className} aria-hidden="true" {...props}>
      <path
        d="M6 25.5c0-1.1.9-2 2-2h4.5l3.4-7.8a3.2 3.2 0 0 1 2.9-1.9h32.4a3.2 3.2 0 0 1 2.9 1.9l3.2 6.5h4.6a2 2 0 0 1 2 2v1.2a2 2 0 0 1-2 2h-2.4a5 5 0 0 1-9.6 0H21.6a5 5 0 0 1-9.6 0H8a2 2 0 0 1-2-2v-1.2Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M12 17.5 17.8 9.2a3.2 3.2 0 0 1 2.9-1.4h28.6a3.2 3.2 0 0 1 2.9 1.4L58 17.5"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 17.5h40M24 12.8h32"
        stroke="currentColor"
        strokeWidth={STROKE * 0.75}
        strokeLinecap="round"
        opacity={0.55}
      />
      <path
        d="M24 10.8h32"
        stroke="currentColor"
        strokeWidth={STROKE * 0.65}
        strokeLinecap="round"
        opacity={0.4}
      />
      <Wheel cx={21} />
      <Wheel cx={59} />
    </svg>
  );
}

/** Compact hatchback — short wheelbase, upright rear hatch */
export function HatchbackIcon({ className, ...props }: IconProps) {
  return (
    <svg {...sharedProps} className={className} aria-hidden="true" {...props}>
      <path
        d="M9 25.5c0-1.1.9-2 2-2h3.4l2.6-5.2a2.6 2.6 0 0 1 2.3-1.3h22.8a2.6 2.6 0 0 1 2.3 1.3l2.4 4.5h3.8a2 2 0 0 1 2 2v1.2a2 2 0 0 1-2 2h-2a4.6 4.6 0 0 1-8.8 0H23.8a4.6 4.6 0 0 1-8.8 0H11a2 2 0 0 1-2-2v-1.2Z"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinejoin="round"
      />
      <path
        d="M15 17.5 18.8 11.4a2.6 2.6 0 0 1 2.3-1.1h18.2a2.6 2.6 0 0 1 2.3 1.1L46 17.5"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M46 17.5 51.2 12.8a2.2 2.2 0 0 1 1.4-.6"
        stroke="currentColor"
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      <path
        d="M21 17.5h22"
        stroke="currentColor"
        strokeWidth={STROKE * 0.75}
        strokeLinecap="round"
        opacity={0.55}
      />
      <Wheel cx={20} />
      <Wheel cx={50} />
    </svg>
  );
}
