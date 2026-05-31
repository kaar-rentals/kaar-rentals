import { apiUrl } from '@/lib/apiBase';

export type CarCategory = 'Sedan' | 'SUV' | 'Hatchback';

export const CATEGORY_SLUG_MAP: Record<string, CarCategory> = {
  sedan: 'Sedan',
  suv: 'SUV',
  hatchback: 'Hatchback',
};

export const CATEGORY_TO_SLUG: Record<CarCategory, string> = {
  Sedan: 'sedan',
  SUV: 'suv',
  Hatchback: 'hatchback',
};

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

export async function fetchCategoryCounts(): Promise<Record<CarCategory, number>> {
  const categories: CarCategory[] = ['Sedan', 'SUV', 'Hatchback'];
  const counts: Record<CarCategory, number> = {
    Sedan: 0,
    SUV: 0,
    Hatchback: 0,
  };

  await Promise.all(
    categories.map(async (category) => {
      try {
        const res = await fetch(
          apiUrl(
            `/api/cars?category=${encodeURIComponent(category)}&limit=1`
          )
        );
        if (!res.ok) return;
        const json = await res.json();
        counts[category] = typeof json.total === 'number' ? json.total : 0;
      } catch {
        /* keep 0 */
      }
    })
  );

  return counts;
}
