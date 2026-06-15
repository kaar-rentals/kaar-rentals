import { useState, useEffect, useLayoutEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, LayoutGrid, List } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FeaturedCarCard from '@/components/cars/FeaturedCarCard';
import FilterBar from '@/components/FilterBar';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import PageLoader from '@/components/layout/PageLoader';
import { Car } from '@/services/api';
import { apiUrl } from '@/lib/apiBase';
import { normalizeCar } from '@/lib/normalizeCar';
import { getCarsBrowseShuffleSeed, shuffleCars } from '@/lib/shuffleCars';
import {
  parseCarFiltersFromSearchParams,
  carFiltersToSearchParams,
  filterCarsByCategorySlug,
  normalizeCategory,
  buildCarsApiQuery,
} from '@/lib/categoryFilters';

const PAGE_SIZE = 12;
const FETCH_LIMIT = 1000;
const LAYOUT_STORAGE_KEY = 'cars-view-layout';

type ViewLayout = 'grid' | 'list';

const readStoredLayout = (): ViewLayout => {
  const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
  return stored === 'list' ? 'list' : 'grid';
};

const Cars = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [viewLayout, setViewLayout] = useState<ViewLayout>(readStoredLayout);
  const token = localStorage.getItem('token');

  const categorySlug = searchParams.get('category');
  const activeCategory = normalizeCategory(categorySlug);

  const filters = useMemo(
    () => parseCarFiltersFromSearchParams(searchParams),
    [searchParams]
  );

  const initialFilters = filters;

  const filterKey = useMemo(
    () =>
      [
        categorySlug ?? '',
        filters.search ?? '',
        filters.city ?? '',
        filters.minPrice ?? '',
        filters.maxPrice ?? '',
        filters.category ?? '',
      ].join('|'),
    [categorySlug, filters]
  );

  const shuffleSeed = useMemo(
    () => getCarsBrowseShuffleSeed(filterKey),
    [filterKey]
  );

  const shuffledCars = useMemo(
    () => shuffleCars(allCars, shuffleSeed),
    [allCars, shuffleSeed]
  );

  const displayedCars = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return shuffledCars.slice(start, start + PAGE_SIZE);
  }, [shuffledCars, page]);

  const handleLayoutChange = (value: string) => {
    if (value !== 'grid' && value !== 'list') return;
    setViewLayout(value);
    localStorage.setItem(LAYOUT_STORAGE_KEY, value);
  };

  useLayoutEffect(() => {
    setPage(1);
  }, [categorySlug, filters.search, filters.city, filters.minPrice, filters.maxPrice]);

  const handleApplyFilters = (q: Record<string, string>) => {
    setPage(1);
    setSearchParams(carFiltersToSearchParams(q), { replace: true });
  };

  const loadCars = useCallback(async () => {
    try {
      setLoading(true);
      const qs = buildCarsApiQuery(filters, 1, FETCH_LIMIT);
      const url = apiUrl(`/api/cars?${qs}`);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(url, { headers });

      if (!res.ok) {
        setAllCars([]);
        return;
      }

      const json = await res.json();
      let list: Car[] = (json.cars || []).map((raw: Record<string, unknown>) =>
        normalizeCar(raw)
      );

      if (categorySlug) {
        list = filterCarsByCategorySlug(list, categorySlug);
      }

      setAllCars(list);
    } catch (error) {
      console.error('[Cars] Error loading cars:', error);
      setAllCars([]);
    } finally {
      setLoading(false);
    }
  }, [filters, token, categorySlug]);

  useEffect(() => {
    document.title = 'Browse cars for rent – Kaar.Rentals';
    const desc =
      'Search and filter cars for rent by city, price, body type, transmission and more. Verified listings from real owners across Pakistan.';
    let meta = document.querySelector("meta[name='description']");
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    loadCars();
  }, [loadCars]);

  const totalPages = Math.max(1, Math.ceil(shuffledCars.length / PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const resultCount = shuffledCars.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="relative py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-zinc-800 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))] -z-10 opacity-60 dark:opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 dark:bg-primary/15 dark:text-primary text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-blue-500 dark:bg-primary rounded-full mr-2 animate-pulse" />
                Premium Fleet Collection
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-foreground mb-6 leading-tight">
              Discover Your
              <span className="block text-accent">
                Perfect Ride
              </span>
            </h1>

            <p className="text-xl text-slate-600 dark:text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Handpicked premium vehicles from verified owners. Each car is
              carefully selected for quality, performance, and reliability to
              ensure an exceptional rental experience.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-slate-500 dark:text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-950/60 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
                <span>Verified Owners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-950/60 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full" />
                </div>
                <span>Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-accent-light dark:bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="w-2 h-2 bg-accent rounded-full" />
                </div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {activeCategory && (
              <p className="mb-3 text-sm font-medium text-primary">
                Showing {activeCategory} vehicles
              </p>
            )}
            <FilterBar
              key={searchParams.toString()}
              initialFilters={initialFilters}
              activeCategory={activeCategory}
              onApply={handleApplyFilters}
            />
          </div>
        </section>

        <section className="py-16 bg-gradient-to-b from-white to-slate-50/50 dark:from-zinc-950 dark:to-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-12">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {loading
                    ? 'Discovering Premium Vehicles...'
                    : `${resultCount} Premium Vehicle${resultCount !== 1 ? 's' : ''}`}
                </h2>
                <p className="text-muted-foreground">
                  {loading
                    ? 'Please wait while we load our curated collection'
                    : activeCategory
                      ? `Filtered by ${activeCategory}`
                      : 'Shuffled for variety — explore our full collection'}
                </p>
              </div>

              <ToggleGroup
                type="single"
                value={viewLayout}
                onValueChange={handleLayoutChange}
                aria-label="Choose layout"
                className="self-start sm:self-auto border border-border rounded-lg p-1 bg-muted/40 dark:bg-zinc-900/60"
              >
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="data-[state=on]:bg-background data-[state=on]:text-foreground dark:data-[state=on]:bg-zinc-800"
                >
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  className="data-[state=on]:bg-background data-[state=on]:text-foreground dark:data-[state=on]:bg-zinc-800"
                >
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {loading ? (
              <PageLoader message="Loading cars..." />
            ) : displayedCars.length === 0 ? (
              <div className="text-center py-20 rounded-xl border border-dashed border-border bg-muted/30 dark:bg-zinc-900/50">
                <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  No vehicles found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {activeCategory
                    ? `No ${activeCategory} listings match your filters`
                    : 'Try adjusting your search criteria or filters'}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={
                    viewLayout === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12'
                      : 'flex flex-col gap-4 mb-12'
                  }
                >
                  {displayedCars.map((car) => (
                    <FeaturedCarCard
                      key={car._id}
                      car={car}
                      variant={viewLayout}
                    />
                  ))}
                </div>

                <div className="flex justify-center items-center gap-4">
                  <Button
                    disabled={page === 1 || loading}
                    onClick={() => setPage((p) => p - 1)}
                    variant="outline"
                    className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-foreground dark:hover:bg-zinc-800"
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    disabled={!hasNextPage || loading}
                    onClick={() => setPage((p) => p + 1)}
                    className="dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Cars;
