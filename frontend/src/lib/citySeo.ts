import { SITE_NAME } from '@/lib/seo';

export type CityLanding = {
  slug: string;
  cityName: string;
  title: string;
  description: string;
  keywords: string;
  badge: string;
  h1Line1: string;
  h1Line2: string;
  intro: string;
  trustPills: [string, string, string];
};

function buildCityLanding(cityName: string, slug: string): CityLanding {
  return {
    slug,
    cityName,
    title: `Rent a Car in ${cityName} | Self Drive Car Rental | ${SITE_NAME}`,
    description: `Browse self drive car rentals in ${cityName}. Sedans, SUVs & hatchbacks from local owners. Contact via WhatsApp — no platform booking on ${SITE_NAME}.`,
    keywords: `rent a car ${cityName}, self drive car rental ${cityName}, car hire ${cityName}, list car for rent ${cityName}`,
    badge: `${cityName} Car Listings`,
    h1Line1: 'Rent a Car in',
    h1Line2: cityName,
    intro: `Self drive car listings in ${cityName} from verified owners. Compare daily rates, filter by body type, and contact owners directly on WhatsApp to arrange rental.`,
    trustPills: ['Verified Owners', 'WhatsApp Contact', 'Self Drive Rentals'],
  };
}

export const CITY_LANDINGS: CityLanding[] = [
  buildCityLanding('Lahore', 'lahore'),
  buildCityLanding('Karachi', 'karachi'),
  buildCityLanding('Islamabad', 'islamabad'),
  buildCityLanding('Rawalpindi', 'rawalpindi'),
  buildCityLanding('Faisalabad', 'faisalabad'),
  buildCityLanding('Peshawar', 'peshawar'),
  buildCityLanding('Multan', 'multan'),
];

export function getCityLandingBySlug(
  slug: string | undefined
): CityLanding | null {
  if (!slug) return null;
  return CITY_LANDINGS.find((c) => c.slug === slug.toLowerCase()) ?? null;
}

export function cityLandingPath(slug: string): string {
  return `/rent-car-${slug}`;
}

export const CITY_SITEMAP_PATHS = CITY_LANDINGS.map((c) =>
  cityLandingPath(c.slug)
);
