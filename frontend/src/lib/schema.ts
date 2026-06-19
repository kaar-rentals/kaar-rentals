import { contactConfig } from '@/config/contact';
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/seo';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    email: contactConfig.email,
    telephone: contactConfig.phone,
    areaServed: { '@type': 'Country', name: 'Pakistan' },
    sameAs: [
      'https://www.facebook.com/share/16sg1pXed3/?mibextid=wwXIfr',
      'https://www.instagram.com/kaar.rentals/',
      'https://www.tiktok.com/@kaar.rentals',
    ],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'en-PK',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/cars?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function carProductSchema(car: {
  brand: string;
  model: string;
  year: number;
  description?: string;
  images?: string[];
  city?: string;
  location?: string;
  pricePerDay?: number;
  price?: number;
  priceType?: string;
  status?: string;
  category?: string;
  url: string;
  ownerName?: string;
  ownerPhone?: string;
}) {
  const city = car.city || car.location?.split(',')[0]?.trim() || 'Pakistan';
  const price = car.pricePerDay || car.price || 0;
  const unit = car.priceType === 'monthly' ? 'MON' : 'DAY';

  const seller = car.ownerName
    ? {
        '@type': 'Person',
        name: car.ownerName,
        ...(car.ownerPhone
          ? {
              telephone: car.ownerPhone,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: car.ownerPhone,
                contactType: 'customer service',
                availableLanguage: ['en', 'ur'],
                areaServed: 'PK',
              },
            }
          : {}),
      }
    : {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        telephone: contactConfig.phone,
      };

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${car.brand} ${car.model} ${car.year}`,
    description:
      car.description ||
      `${car.brand} ${car.model} for rent in ${city}, Pakistan — contact owner via WhatsApp`,
    image: car.images?.[0],
    brand: { '@type': 'Brand', name: car.brand },
    category: car.category || 'Vehicle',
    url: car.url,
    sku: car.url,
    areaServed: {
      '@type': 'City',
      name: city,
      containedInPlace: { '@type': 'Country', name: 'Pakistan' },
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'PKR',
      price,
      url: car.url,
      availability:
        car.status === 'rented'
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
      areaServed: city,
      eligibleRegion: 'PK',
      seller,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'PKR',
        unitText: unit,
      },
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function cityWebPageSchema(
  city: string,
  url: string,
  description: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Rent a Car in ${city}`,
    description,
    url,
    inLanguage: 'en-PK',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}

export function faqPageSchema(
  items: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
