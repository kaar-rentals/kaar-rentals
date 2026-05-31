import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

/** Official Kaar.Rentals branding asset — use as-is, no crop or recreation */
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
      className={cn('inline-flex items-center shrink-0', className)}
      aria-label="Kaar.Rentals home"
    >
      <img
        src={BRAND_LOGO_SRC}
        srcSet={`${BRAND_LOGO_SRC} 1x, ${BRAND_LOGO_SRC} 2x`}
        alt="Kaar.Rentals – Reliable rides anytime"
        className={cn(
          'w-auto object-contain object-left',
          isFooter
            ? 'h-16 max-h-20 sm:h-20 sm:max-h-24 md:h-24 max-w-[min(100%,14rem)]'
            : 'h-11 max-h-14 sm:h-14 max-w-[min(100%,10.5rem)] sm:max-w-[11.5rem]'
        )}
        width={1024}
        height={1024}
        decoding="async"
        fetchPriority={isFooter ? 'auto' : 'high'}
      />
    </Link>
  );
};

export default BrandLogoLink;
