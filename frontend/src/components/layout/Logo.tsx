import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

type LogoProps = {
  variant?: 'default' | 'full' | 'footer';
  className?: string;
};

const LogoMark = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-accent p-1.5 sm:p-2 shrink-0',
      className
    )}
  >
    <img
      src="/logo-icon.svg"
      alt=""
      aria-hidden="true"
      className="h-5 w-10 sm:h-6 sm:w-12 [filter:brightness(0)_invert(1)]"
      width={48}
      height={24}
      decoding="async"
    />
  </span>
);

const Logo = ({ variant = 'default', className }: LogoProps) => {
  if (variant === 'full') {
    return (
      <Link
        to="/"
        className={cn('inline-flex shrink-0', className)}
        aria-label="Kaar.Rentals home"
      >
        <img
          src="/logo.png"
          alt="Kaar.Rentals – Reliable rides anytime"
          className="h-10 sm:h-12 md:h-14 w-auto object-contain mx-auto"
          width={160}
          height={48}
          decoding="async"
        />
      </Link>
    );
  }

  const isFooter = variant === 'footer';

  return (
    <Link
      to="/"
      className={cn('inline-flex items-center gap-2 shrink-0', className)}
      aria-label="Kaar.Rentals home"
    >
      <LogoMark />
      <span
        className={cn(
          'text-lg sm:text-xl font-bold whitespace-nowrap',
          isFooter
            ? 'text-primary-foreground dark:text-card-foreground'
            : 'text-accent'
        )}
      >
        Kaar.Rentals
      </span>
    </Link>
  );
};

export default Logo;
