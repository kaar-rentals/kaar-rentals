import { apiUrl } from '@/lib/apiBase';
import type { Car } from '@/services/api';

export type CarCategory = 'Sedan' | 'SUV' | 'Hatchback';

export const CATEGORY_SLUG_MAP: Record<string, CarCategory> = {
  sedan: 'Sedan',
  sedans: 'Sedan',
  suv: 'SUV',
  suvs: 'SUV',
  hatchback: 'Hatchback',
  hatchbacks: 'Hatchback',
};

export const CATEGORY_TO_SLUG: Record<CarCategory, string> = {
  Sedan: 'sedan',
  SUV: 'suv',
  Hatchback: 'hatchback',
};

/** Read category from API car object (field is `category` in MongoDB). */
export function getCarCategory(car: { category?: string | null }): string {
  return String(car?.category ?? '').trim();
}

export function normalizeCategory(
  value: string | null | undefined
): CarCategory | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed === 'Sedan' || trimmed === 'SUV' || trimmed === 'Hatchback') {
    return trimmed;
  }
  return CATEGORY_SLUG_MAP[trimmed.toLowerCase()];
}

export function categoryToSlug(
  value: string | null | undefined
): string | undefined {
  const normalized = normalizeCategory(value);
  return normalized ? CATEGORY_TO_SLUG[normalized] : undefined;
}

export function carMatchesCategorySlug(
  car: { category?: string | null },
  slug: string | null | undefined
): boolean {
  if (!slug) return true;
  const normalizedSlug = slug.trim().toLowerCase();
  const carCat = getCarCategory(car).toLowerCase();
  const canonical = CATEGORY_SLUG_MAP[normalizedSlug];
  if (canonical) {
    return carCat === canonical.toLowerCase();
  }
  return carCat === normalizedSlug;
}

export function filterCarsByCategorySlug<T extends { category?: string | null }>(
  cars: T[],
  slug: string | null | undefined
): T[] {
  if (!slug) return cars;
  return cars.filter((car) => carMatchesCategorySlug(car, slug));
}

export function parseCarFiltersFromSearchParams(
  params: URLSearchParams
): Record<string, string> {
  const q: Record<string, string> = {};
  const search = params.get('search');
  if (search) q.search = search;
  const city = params.get('city');
  if (city) q.city = city;
  const category = normalizeCategory(params.get('category'));
  if (category) q.category = category;
  const minPrice = params.get('minPrice');
  if (minPrice) q.minPrice = minPrice;
  const maxPrice = params.get('maxPrice');
  if (maxPrice) q.maxPrice = maxPrice;
  return q;
}

export function carFiltersToSearchParams(
  filters: Record<string, string>
): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.city) params.set('city', filters.city);
  if (filters.category) {
    const slug =
      CATEGORY_TO_SLUG[filters.category as CarCategory] ??
      filters.category.toLowerCase();
    params.set('category', slug);
  }
  if (filters.minPrice) params.set('minPrice', filters.minPrice);
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
  return params;
}

export function formatCategoryCount(count: number): string {
  if (count === 0) return 'No vehicles yet';
  return `${count} vehicle${count === 1 ? '' : 's'}`;
}

/** Count vehicles per category from live API data (case-insensitive match). */
export async function fetchCategoryCounts(): Promise<Record<CarCategory, number>> {
  const counts: Record<CarCategory, number> = {
    Sedan: 0,
    SUV: 0,
    Hatchback: 0,
  };

  try {
    const res = await fetch(apiUrl('/api/cars?limit=500'));
    if (!res.ok) return counts;
    const json = await res.json();
    const cars: Array<{ category?: string }> = json.cars || [];

    counts.Sedan = cars.filter((c) => carMatchesCategorySlug(c, 'sedan')).length;
    counts.SUV = cars.filter((c) => carMatchesCategorySlug(c, 'suv')).length;
    counts.Hatchback = cars.filter((c) =>
      carMatchesCategorySlug(c, 'hatchback')
    ).length;
  } catch {
    /* keep zeros */
  }

  return counts;
}

export function buildCarsApiQuery(
  filters: Record<string, string>,
  page: number,
  limit = 12
): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set('page', String(page));
  params.set('limit', String(limit));
  return params.toString();
}
