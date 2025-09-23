import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import CarCard from '@/components/cars/CarCard';
import { cars } from '@/data/cars';

const FeaturedCars = () => {
  const featuredCars = cars.slice(0, 3);

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 slide-up">
          {featuredCars.map((car, index) => (
            <div key={car.id} style={{ animationDelay: `${index * 0.1}s` }}>
              <CarCard car={car} />
            </div>
          ))}
        </div>

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