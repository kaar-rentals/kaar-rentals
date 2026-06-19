export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/+$/, '') ||
  'https://kaar.rentals';

export const SITE_NAME = 'Kaar.Rentals';

export const DEFAULT_TITLE =
  'Rent a Car in Pakistan | Car Rental Marketplace | Kaar.Rentals';

export const DEFAULT_DESCRIPTION =
  "Pakistan's peer-to-peer car listing marketplace. Browse self-drive rentals in Lahore, Karachi, Islamabad & all cities. List your car for rent and earn.";

export const DEFAULT_KEYWORDS =
  'rent a car Pakistan, car rental Pakistan, self drive car rental, list car for rent Pakistan, monthly car rental Pakistan, car hire Lahore, car hire Karachi';

export const PRIVATE_PATH_PREFIXES = [
  '/auth',
  '/admin',
  '/profile',
  '/owner-profile',
  '/payments',
] as const;

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function isPrivatePath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function getCarCityLabel(car: {
  city?: string;
  location?: string;
}): string {
  const raw = car.city || car.location?.split(',')[0]?.trim();
  return raw || 'Pakistan';
}

export function buildCarListingTitle(car: {
  brand: string;
  model: string;
  year: number;
  city?: string;
  location?: string;
}): string {
  const city = getCarCityLabel(car);
  const base = `${car.brand} ${car.model} ${car.year} for Rent in ${city}`;
  const title = `${base} | Self Drive | ${SITE_NAME}`;
  return title.length <= 60 ? title : `${base} | ${SITE_NAME}`;
}

export function buildCarListingDescription(car: {
  brand: string;
  model: string;
  year: number;
  city?: string;
  location?: string;
  pricePerDay?: number;
  price?: number;
  priceType?: string;
}): string {
  const city = getCarCityLabel(car);
  const price = car.pricePerDay || car.price || 0;
  const unit = car.priceType === 'monthly' ? 'month' : 'day';
  return `Rent a ${car.year} ${car.brand} ${car.model} in ${city}, Pakistan from PKR ${price.toLocaleString()}/${unit}. Self drive listing — contact the owner directly via WhatsApp on ${SITE_NAME}.`;
}

export function buildCarImageAlt(car: {
  brand: string;
  model: string;
  year: number;
  category?: string;
  city?: string;
  location?: string;
}): string {
  const city = getCarCityLabel(car);
  const category = car.category ? `${car.category} ` : '';
  return `${car.brand} ${car.model} ${car.year} ${category}self drive car for rent in ${city}, Pakistan`;
}
