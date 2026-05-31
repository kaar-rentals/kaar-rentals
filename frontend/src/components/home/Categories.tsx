import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  type CarCategory,
  fetchCategoryCounts,
  formatCategoryCount,
} from '@/lib/categoryFilters';

type CategoryImage = {
  src: string;
  alt: string;
};

type Category = {
  name: string;
  label: string;
  description: string;
  category: CarCategory;
  href: string;
  images: CategoryImage[];
};

const categories: Category[] = [
  {
    name: 'Sedans',
    label: 'Browse sedan vehicles',
    description: 'Elegant and comfortable for business and leisure',
    category: 'Sedan',
    href: '/cars?category=sedan',
    images: [
      {
        src: '/categories/honda-civic.jpg',
        alt: 'Honda Civic sedan available for rent',
      },
      {
        src: '/categories/toyota-corolla-grande.jpg',
        alt: 'Toyota Corolla Grande sedan available for rent',
      },
    ],
  },
  {
    name: 'SUVs',
    label: 'Browse SUV vehicles',
    description: 'Spacious and powerful for family adventures',
    category: 'SUV',
    href: '/cars?category=suv',
    images: [
      {
        src: '/categories/toyota-fortuner.jpg',
        alt: 'Toyota Fortuner SUV available for rent',
      },
      {
        src: '/categories/toyota-prado.jpg',
        alt: 'Toyota Land Cruiser Prado SUV available for rent',
      },
    ],
  },
  {
    name: 'Hatchbacks',
    label: 'Browse hatchback vehicles',
    description: 'Compact and efficient for city driving',
    category: 'Hatchback',
    href: '/cars?category=hatchback',
    images: [
      {
        src: '/categories/toyota-vitz.jpg',
        alt: 'Toyota Vitz hatchback available for rent',
      },
      {
        src: '/categories/suzuki-alto.jpg',
        alt: 'Suzuki Alto hatchback available for rent',
      },
    ],
  },
];

const Categories = () => {
  const [counts, setCounts] = useState<Record<CarCategory, number> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;

    fetchCategoryCounts().then((data) => {
      if (!cancelled) setCounts(data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Browse by <span className="text-gradient">Category</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find the perfect vehicle for your needs from our diverse collection
            of premium cars across multiple categories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 slide-up">
          {categories.map((category, index) => (
            <Link
              key={category.name}
              to={category.href}
              className="group block"
              style={{ animationDelay: `${index * 0.1}s` }}
              aria-label={category.label}
            >
              <div className="premium-card overflow-hidden p-0 text-center h-full group-hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <div className="grid grid-cols-2 h-full">
                    {category.images.map((image) => (
                      <div key={image.src} className="relative h-full overflow-hidden">
                        <img
                          src={image.src}
                          alt={image.alt}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                          width={400}
                          height={250}
                        />
                      </div>
                    ))}
                  </div>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/80 to-transparent"
                    aria-hidden="true"
                  />
                </div>

                <div className="p-8 pt-6">
                  <h3 className="text-2xl font-bold text-foreground mb-3">
                    {category.name}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {category.description}
                  </p>

                  <div className="text-sm font-semibold text-primary">
                    {counts
                      ? formatCategoryCount(counts[category.category])
                      : 'Loading…'}
                  </div>

                  <div className="mt-6 text-primary group-hover:text-accent transition-colors duration-300">
                    Browse {category.name} →
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
