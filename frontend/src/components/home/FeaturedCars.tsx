import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import FeaturedCarCard from '@/components/cars/FeaturedCarCard';
import { apiService, Car } from '@/services/api';
import { cars as staticCars } from '@/data/cars';

const FeaturedCars = () => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedCars();
  }, []);

  const loadFeaturedCars = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://kaar-rentals-backend.onrender.com/api';
      
      // Fetch featured listings from API
      const response = await fetch(`${API_BASE_URL}/cars?featured=true&limit=6`);
      if (response.ok) {
        const data = await response.json();
        if (data.cars && Array.isArray(data.cars) && data.cars.length > 0) {
          setFeaturedCars(data.cars.slice(0, 6));
          return;
        }
      }
      
      // Fallback: Try via apiService
      const featuredData = await apiService.getCars({ featured: 'true', limit: 6 });
      if (featuredData && Array.isArray(featuredData) && featuredData.length > 0) {
        setFeaturedCars(featuredData.slice(0, 6));
        return;
      }
      
      // Final fallback: Get all cars and filter for featured
      const carsData = await apiService.getCars();
      if (carsData && Array.isArray(carsData)) {
        const featuredCars = carsData.filter(car => car.featured === true);
        if (featuredCars.length > 0) {
          setFeaturedCars(featuredCars.slice(0, 6));
        } else {
          setFeaturedCars([]);
        }
      } else {
        setFeaturedCars([]);
      }
    } catch (error) {
      console.error('Error loading featured cars:', error);
      setFeaturedCars([]);
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