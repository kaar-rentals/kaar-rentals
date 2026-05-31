import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const BRAND_LOGO_SRC = '/kaar-rentals-logo.png';

/** HTML wordmark extracted from brand logo — same markup in header and footer */
export function BrandWordmark({ className }: { className?: string }) {
  return (
    <span className={cn('brand-wordmark text-lg sm:text-xl whitespace-nowrap', className)}>
      Kaar<span className="mx-0.5">.</span>Rentals
    </span>
  );
}

/** Car mark from top of brand logo (icon only, no embedded text) */
function BrandCarMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-sm',
        'h-9 w-10 sm:h-10 sm:w-11',
        className
      )}
      aria-hidden="true"
    >
      <img
        src={BRAND_LOGO_SRC}
        alt=""
        className="absolute left-1/2 top-0 w-[220%] max-w-none -translate-x-1/2 object-cover object-top"
        width={88}
        height={44}
        decoding="async"
      />
    </div>
  );
}

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
      <BrandCarMark
        className={isFooter ? 'h-11 w-12 sm:h-12 sm:w-[3.25rem]' : undefined}
      />
      <BrandWordmark
        className={cn(isFooter && '!text-[#e4b23d]')}
      />
    </Link>
  );
};

export default BrandLogoLink;
