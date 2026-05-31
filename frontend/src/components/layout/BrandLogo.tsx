import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Official Kaar.Rentals branding — full image, no crop, object-contain only */
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
      className={cn(
        'inline-flex items-center shrink-0',
        isFooter && 'justify-center md:justify-start',
        className
      )}
      aria-label="Kaar.Rentals home"
    >
      <img
        src={BRAND_LOGO_SRC}
        alt="Kaar.Rentals – Reliable rides anytime"
        className={cn(
          'block w-auto object-contain',
          isFooter
            ? 'h-12 sm:h-14 md:h-16'
            : 'h-14 sm:h-16 md:h-[4.5rem]'
        )}
        decoding="async"
        fetchPriority={isFooter ? 'auto' : 'high'}
      />
    </Link>
  );
};

export default BrandLogoLink;
