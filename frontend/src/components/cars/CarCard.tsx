import { Heart, Star, User, Fuel, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/types/car';
import { Link } from 'react-router-dom';

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <div className="premium-card p-0 overflow-hidden car-card-hover group">
      {/* Image Section */}
      <div className="relative">
        <img 
          src={car.image} 
          alt={`${car.brand} ${car.model}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Brand Logo Overlay */}
        <div className="absolute top-4 left-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
            <img 
              src={car.logo} 
              alt={car.brand}
              className="h-6 w-6 object-contain"
            />
          </div>
        </div>

        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-primary text-primary-foreground">
            {car.category}
          </Badge>
        </div>

        {/* Heart Icon */}
        <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500 transition-colors" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-foreground">
              {car.brand} {car.model}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-muted-foreground">4.8</span>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{car.year} • {car.engineCapacity}</p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{car.seating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4" />
            <span>{car.mileage}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>{car.transmission.slice(0, 4)}</span>
          </div>
        </div>

        {/* Key Features */}
        <div className="flex flex-wrap gap-1">
          {car.features.slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
          {car.features.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{car.features.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              ${car.price}
              <span className="text-sm text-muted-foreground font-normal">/day</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link to={`/car/${car.id}/details`}>
              <Button variant="outline" size="sm">
                Details
              </Button>
            </Link>
            <Link to={`/car/${car.id}/book`}>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary"
              >
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;