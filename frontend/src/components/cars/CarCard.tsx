import { Heart, Star, User, Fuel, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Car } from '@/services/api';
import { Link } from 'react-router-dom';

interface CarCardProps {
  car: Car;
}

const CarCard = ({ car }: CarCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      {/* Image Section */}
      <div className="relative">
        <img 
          src={car.images?.[0] || car.image || '/placeholder-car.jpg'} 
          alt={`${car.brand} ${car.model}`}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Brand Badge - Top Left */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-gray-900 text-white px-3 py-1 text-sm font-medium">
            {car.brand}
          </Badge>
        </div>

        {/* Category Badge - Top Right */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-gray-900 text-white px-3 py-1 text-sm font-medium">
            {car.category}
          </Badge>
        </div>

        {/* Heart Icon - Top Right inside image */}
        <button className="absolute top-4 right-16 bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
          <Heart className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              {car.brand} {car.model}
            </h3>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 font-medium">4.8</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">{car.year || 'N/A'} • {car.engineCapacity || 'N/A'}</p>
        </div>

        {/* Specifications */}
        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4" />
            <span>{car.seating || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Fuel className="h-4 w-4" />
            <span>{car.mileage || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>{(car.transmission || 'N/A').slice(0, 4)}</span>
          </div>
        </div>

        {/* Key Features */}
        <div className="flex flex-wrap gap-2">
          {(car.features || []).slice(0, 3).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
              {feature}
            </Badge>
          ))}
          {car.features && car.features.length > 3 && (
            <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100">
              +{car.features.length - 3} more
            </Badge>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              PKR {(car.pricePerDay || car.price || 0).toLocaleString()}
              <span className="text-sm text-gray-600 font-normal">/day</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link to={`/car/${car._id || car.id}/details`}>
              <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                Details
              </Button>
            </Link>
            <Link to={`/car/${car._id || car.id}/book`}>
              <Button 
                size="sm" 
                className="bg-gray-900 text-white hover:bg-gray-800"
                disabled={car.isRented}
              >
                {car.isRented ? 'Rented' : 'Book Now'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarCard;