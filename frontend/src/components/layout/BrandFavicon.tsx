import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const FAVICON_SRC = '/favicon-32.png';
const FAVICON_SRC_SET = '/favicon-32.png 1x, /favicon-32.png 2x';

type BrandFaviconProps = {
  className?: string;
  iconClassName?: string;
};

export const BrandFavicon = ({ className, iconClassName }: BrandFaviconProps) => (
  <img
    src={FAVICON_SRC}
    srcSet={FAVICON_SRC_SET}
    alt="Kaar.Rentals"
    className={cn(
      'h-7 w-7 sm:h-8 sm:w-8 object-contain shrink-0',
      iconClassName
    )}
    width={32}
    height={32}
    decoding="async"
  />
);

type BrandFaviconLinkProps = BrandFaviconProps;

const BrandFaviconLink = ({ className, iconClassName }: BrandFaviconLinkProps) => (
  <Link
    to="/"
    className={cn('inline-flex items-center shrink-0', className)}
    aria-label="Kaar.Rentals home"
  >
    <BrandFavicon iconClassName={iconClassName} />
  </Link>
);

export default BrandFaviconLink;
