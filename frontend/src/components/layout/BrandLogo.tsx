import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BRAND_LOGO_SRC = '/kaar-rentals-logo.png';

type BrandLogoLinkProps = {
  variant?: 'header' | 'footer';
  className?: string;
};

const BrandLogoLink = ({ variant = 'header', className }: BrandLogoLinkProps) => {
  const isFooter = variant === 'footer';

  return (
    <Link
      to="/"
      className={cn('inline-flex items-center gap-2 sm:gap-3 shrink-0', className)}
      aria-label="Kaar.Rentals home"
    >
      <img
        src={BRAND_LOGO_SRC}
        alt=""
        aria-hidden="true"
        className={cn(
          'object-contain shrink-0',
          isFooter ? 'h-12 w-12 sm:h-14 sm:w-14' : 'h-9 w-9 sm:h-10 sm:w-10'
        )}
        width={isFooter ? 56 : 40}
        height={isFooter ? 56 : 40}
        decoding="async"
      />
      <span
        className={cn(
          'text-lg sm:text-xl font-bold whitespace-nowrap',
          isFooter
            ? 'text-primary-foreground dark:text-card-foreground'
            : 'text-gradient'
        )}
      >
        Kaar.Rentals
      </span>
    </Link>
  );
};

export default BrandLogoLink;
