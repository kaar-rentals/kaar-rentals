import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import FeaturedCarCard from '@/components/cars/FeaturedCarCard';
import PageLoader from '@/components/layout/PageLoader';
import { apiService, Car } from '@/services/api';

const FEATURED_CARS_LIMIT = 6;

const isFeaturedCar = (car: Car) => car.featured === true;

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);
      const cars = await apiService.getCars({
        featured: true,
        limit: FEATURED_CARS_LIMIT,
        sortBy: 'createdAt',
        order: 'desc',
      });

      const list = Array.isArray(cars) ? cars : [];
      setFeaturedCars(
        list.filter(isFeaturedCar).slice(0, FEATURED_CARS_LIMIT)
      );
    } catch (error) {
      console.error('[FeaturedCars] Error loading featured cars:', error);
      setFeaturedCars([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 md:py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 md:mb-16 fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured <span className="text-accent">Vehicles</span>
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium vehicles, each offering 
            the perfect blend of luxury, performance, and reliability.
          </p>
        </div>

        {loading ? (
          <PageLoader message="Loading featured cars..." />
        ) : featuredCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 slide-up">
            {featuredCars.map((car, index) => (
              <div key={car._id || car.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <FeaturedCarCard car={car} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No featured cars available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Please check back later.</p>
          </div>
        )}

        <div className="text-center fade-in">
          <Link to="/cars">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-accent dark:text-accent-foreground dark:hover:bg-accent/90"
            >
              View All Cars
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCars;
