import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const iconDefaults = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 64 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SedanIcon({ className, ...props }: IconProps) {
  return (
    <svg {...iconDefaults} className={className} aria-hidden="true" {...props}>
      <path d="M4 22.5c0-1.1.9-2 2-2h3.2l2.4-5.2A3 3 0 0 1 14.3 14h35.4a3 3 0 0 1 2.7 1.8l2.4 4.7H58a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-2.1a5 5 0 0 1-9.8 0H19.9a5 5 0 0 1-9.8 0H8a2 2 0 0 1-2-2V22.5Z" />
      <path d="M12 14 16.5 8.5A3 3 0 0 1 19.1 7h25.8a3 3 0 0 1 2.6 1.5L52 14" />
      <circle cx="17" cy="22.5" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="47" cy="22.5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function SuvIcon({ className, ...props }: IconProps) {
  return (
    <svg {...iconDefaults} className={className} aria-hidden="true" {...props}>
      <path d="M3 23.5c0-1.1.9-2 2-2h4.1l3-6.8A3.5 3.5 0 0 1 12.4 13h39.2a3.5 3.5 0 0 1 3.2 2.2l3 5.3H59a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-2.3a5.5 5.5 0 0 1-10.8 0H19.1a5.5 5.5 0 0 1-10.8 0H5a2 2 0 0 1-2-2V23.5Z" />
      <path d="M10 15 15 7.8A3.5 3.5 0 0 1 18.1 6h27.8a3.5 3.5 0 0 1 3.1 1.8L54 15" />
      <path d="M22 15V11.5M42 15V11.5" />
      <circle cx="16.5" cy="23.5" r="2.75" fill="currentColor" stroke="none" />
      <circle cx="47.5" cy="23.5" r="2.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HatchbackIcon({ className, ...props }: IconProps) {
  return (
    <svg {...iconDefaults} className={className} aria-hidden="true" {...props}>
      <path d="M5 22.5c0-1.1.9-2 2-2h3.5l2.8-5.6A3 3 0 0 1 15.8 14h28.4a3 3 0 0 1 2.7 1.8l2.4 4.7H57a2 2 0 0 1 2 2v1.5a2 2 0 0 1-2 2h-2.1a5 5 0 0 1-9.8 0H20.9a5 5 0 0 1-9.8 0H7a2 2 0 0 1-2-2V22.5Z" />
      <path d="M13 14 17.2 8.8A3 3 0 0 1 19.8 7.5h18.4a3 3 0 0 1 2.6 1.3L46 14" />
      <path d="M46 14 50.5 10.5A2.5 2.5 0 0 0 52.5 9.5" />
      <circle cx="18" cy="22.5" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="46" cy="22.5" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
