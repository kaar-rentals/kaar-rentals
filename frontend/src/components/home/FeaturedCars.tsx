import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import FeaturedCarCard from '@/components/cars/FeaturedCarCard';
import { apiService, Car } from '@/services/api';
import { cars as staticCars } from '@/data/cars';
import { apiUrl } from '@/lib/apiBase';

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);
      const url = apiUrl('/api/cars?limit=12');
      console.log('[FeaturedCars] fetching:', url);

      const response = await fetch(url);
      if (!response.ok) {
        console.error('[FeaturedCars] API error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const carsArray: Car[] = data.cars || [];
      console.log('[FeaturedCars] received', carsArray.length, 'cars', data);

      const featuredOnly = carsArray.filter((car: Car) => car.featured === true);
      setFeaturedCars(
        (featuredOnly.length > 0 ? featuredOnly : carsArray).slice(0, 6)
      );
    } catch (error) {
      console.error('[FeaturedCars] Error loading featured cars:', error);
      try {
        const carsData = await apiService.getCars({ limit: 12 });
        const fallback = Array.isArray(carsData) ? carsData : [];
        console.log('[FeaturedCars] fallback via apiService:', fallback.length);
        setFeaturedCars(fallback.slice(0, 6));
      } catch {
        setFeaturedCars([]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured <span className="text-gradient">Vehicles</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked selection of premium vehicles, each offering 
            the perfect blend of luxury, performance, and reliability.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading featured cars...</p>
          </div>
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
            <p className="text-muted-foreground">No cars available at the moment.</p>
            <p className="text-sm text-muted-foreground mt-2">Please try again later.</p>
          </div>
        )}

        <div className="text-center fade-in">
          <Link to="/cars">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
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